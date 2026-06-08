/* insight Analytics Prop — Map Studio (PoC / M0)
 * MapLibre GL JS 기반 입지 지도. 현 단계: OSM 배경 타일 + 단지 핀 + 반경(2/3/5km) 동심원.
 * 다음 단계(M1): Overpass로 철도·도로 추출 → 레이어 렌더. 자세한 계획은 docs/MAP_FEATURE_PLAN.md
 */
(function () {
  const { useStore } = window.Store;
  const Icon = window.Icon;

  // 반경 원 폴리곤 생성 (turf 없이 PoC용 자체 구현). center=[lng,lat], radiusKm
  function circleGeoJSON(center, radiusKm, steps) {
    steps = steps || 96;
    const [lng, lat] = center;
    const coords = [];
    const latR = radiusKm / 110.574;                                  // 위도 1도 ≈ 110.574km
    const lngR = radiusKm / (111.320 * Math.cos((lat * Math.PI) / 180)); // 경도 보정
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 2 * Math.PI;
      coords.push([lng + lngR * Math.cos(t), lat + latR * Math.sin(t)]);
    }
    return { type: "Feature", geometry: { type: "Polygon", coordinates: [coords] }, properties: {} };
  }

  const RADII = [
    { km: 2, color: "#98da6a" },
    { km: 3, color: "#7ba1fc" },
    { km: 5, color: "#fb8a44" },
  ];

  // 레이어 패널 정의 (선=막대, 점=동그라미)
  const LAYER_DEFS = [
    { key: "rail",    label: "철도·지하철", color: "#c98bf0", colorable: true },
    { key: "road",    label: "주요도로",   color: "#fb8a44", isRoad: true },
    { key: "school",  label: "학교",       color: "#79e0a8", dot: true, colorable: true },
    { key: "medical", label: "병원·의원",  color: "#f08e86", dot: true, colorable: true },
    { key: "station", label: "역·승강장",  color: "#7ba1fc", dot: true, colorable: true },
  ];

  const ROAD_CLASSES = [
    { key: "motorway",  label: "고속도로", color: "#f08e86" },
    { key: "trunk",     label: "자동차전용", color: "#fb8a44" },
    { key: "primary",   label: "주간선",   color: "#e6b35a" },
    { key: "secondary", label: "보조간선", color: "#c9cf60" },
  ];

  // 로컬 시크릿 로더 — keys.local.env (KEY=VALUE 형식, .gitignore 처리됨)
  let _keysCache = null;
  function loadKeys() {
    if (_keysCache) return Promise.resolve(_keysCache);
    return fetch("keys.local.env", { cache: "no-store" })
      .then((r) => (r.ok ? r.text() : ""))
      .then((txt) => {
        const out = {};
        (txt || "").split(/\r?\n/).forEach((line) => {
          const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/);
          if (m) out[m[1]] = m[2];
        });
        _keysCache = out;
        return out;
      })
      .catch(() => ({}));
  }

  // 컨테이너가 실제 크기를 가질 때까지 대기 (탭/지연 레이아웃에서 0-size로 맵이 생성돼 load가 안 끝나는 문제 방지)
  function whenSized(el) {
    return new Promise((resolve) => {
      if (el.clientWidth > 0 && el.clientHeight > 0) return resolve();
      if (!window.ResizeObserver) { setTimeout(resolve, 60); return; }
      const ro = new ResizeObserver(() => {
        if (el.clientWidth > 0 && el.clientHeight > 0) { ro.disconnect(); resolve(); }
      });
      ro.observe(el);
    });
  }

  // 키 유무에 따라 MapTiler(벡터) ↔ OSM(래스터) 스타일 선택
  function buildStyle(keys) {
    const k = keys && keys.MAPTILER_KEY;
    if (k) return { style: "https://api.maptiler.com/maps/streets-v2/style.json?key=" + k, mode: "maptiler" };
    return {
      style: {
        version: 8,
        sources: {
          osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© OpenStreetMap contributors" },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      mode: "osm",
    };
  }

  function MapStudio() {
    const project = useStore((s) => s.projects.find((p) => p.id === s.activeProjectId) || s.projects[0]);
    const containerRef = React.useRef(null);
    const mapRef = React.useRef(null);
    const initLockRef = React.useRef(false);
    const radiusMkRef = React.useRef([]);
    const [ready, setReady] = React.useState(false);
    const [err, setErr] = React.useState(null);
    const [shownRadii, setShownRadii] = React.useState({ 2: true, 3: true, 5: true });
    const [tileMode, setTileMode] = React.useState("osm");
    const [osm, setOsm] = React.useState(null);        // { rail, road, counts }
    const [osmLoading, setOsmLoading] = React.useState(false);
    const [osmErr, setOsmErr] = React.useState(null);
    const [layerVis, setLayerVis] = React.useState({ rail: true, road: true, school: true, medical: true, station: true });
    const [colors, setColors] = React.useState({ rail: "#c98bf0", school: "#79e0a8", medical: "#f08e86", station: "#7ba1fc" });
    const [clip, setClip] = React.useState(false);            // 반경 밖 포인트 숨김
    const [stationLabels, setStationLabels] = React.useState(false); // 역 이름 상시 표시
    const [roadSplit, setRoadSplit] = React.useState(false);  // 도로 클래스별 세분화
    const [roadClasses, setRoadClasses] = React.useState({ motorway: true, trunk: true, primary: true, secondary: true });

    const coord = (project && project.coord) || { lat: 36.8389, lng: 127.1278 };
    const center = [coord.lng, coord.lat];

    // 지도 초기화 (1회) — 로컬 키 로드 후 빌드
    React.useEffect(() => {
      if (!window.maplibregl) { setErr("MapLibre GL 라이브러리가 로드되지 않았습니다."); return; }
      if (mapRef.current || initLockRef.current || !containerRef.current) return;
      initLockRef.current = true; // 비동기 생성 중 이중 마운트 방지 (동기 잠금)

      let cancelled = false, map, ro;

      Promise.all([loadKeys(), whenSized(containerRef.current)]).then((res) => {
        const keys = res[0];
        if (cancelled || !containerRef.current || mapRef.current) return;
        const built = buildStyle(keys);
        setTileMode(built.mode);

        try {
          map = new window.maplibregl.Map({
            container: containerRef.current,
            style: built.style,
            center,
            zoom: 12.5,
            attributionControl: true,
          });
        } catch (e) { setErr(String(e)); return; }

        mapRef.current = map;

        // 이후 컨테이너 크기 변경 시 캔버스 리사이즈
        if (window.ResizeObserver) {
          ro = new ResizeObserver(() => { try { map.resize(); } catch (_) {} });
          ro.observe(containerRef.current);
        }

        map.addControl(new window.maplibregl.NavigationControl({ showCompass: false }), "top-right");
        map.addControl(new window.maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-left");

        const radiusMarkers = radiusMkRef.current = [];

        const setup = () => {
          if (cancelled || setup._done) return;
          try { map.addSource("__probe__", { type: "geojson", data: { type: "FeatureCollection", features: [] } }); map.removeSource("__probe__"); }
          catch (_) { setTimeout(setup, 150); return; } // 아직 스타일 미준비 → 재시도
          setup._done = true;
          // 반경 동심원 (line) — 라벨은 글리프 폰트 의존이라 HTML 마커로 대체
          RADII.forEach((r) => {
            const srcId = "radius-" + r.km;
            if (!map.getSource(srcId)) {
              map.addSource(srcId, { type: "geojson", data: circleGeoJSON(center, r.km) });
              map.addLayer({
                id: srcId + "-line", type: "line", source: srcId,
                paint: { "line-color": r.color, "line-width": 2.4, "line-dasharray": [2, 1.4], "line-opacity": 1 },
              });
            }
            const labelEl = document.createElement("div");
            labelEl.className = "ms-radlabel";
            labelEl.textContent = r.km + "km";
            labelEl.style.color = r.color;
            const labelMk = new window.maplibregl.Marker({ element: labelEl, anchor: "bottom" })
              .setLngLat([center[0], center[1] + r.km / 110.574])
              .addTo(map);
            radiusMarkers.push({ km: r.km, marker: labelMk });
          });

          // 단지 핀
          const el = document.createElement("div");
          el.className = "ms-pin";
          el.innerHTML = '<div class="ms-pin-dot"></div><div class="ms-pin-pulse"></div>';
          new window.maplibregl.Marker({ element: el, anchor: "center" })
            .setLngLat(center)
            .setPopup(new window.maplibregl.Popup({ offset: 16 }).setHTML(
              '<b>' + (project ? project.siteName || project.name : "단지") + '</b><br/>' +
              (project ? project.address || "" : "")
            ))
            .addTo(map);

          map.resize();
          setReady(true);
        };

        // isStyleLoaded()는 타일 로드 후에도 false를 반환하는 경우가 있어 신뢰 불가 →
        // load/idle 이벤트로 setup 실행 + 안전망 타임아웃 (멱등 setup)
        if (map.loaded()) setup();
        else { map.on("load", setup); map.once("idle", setup); }
        setTimeout(setup, 2500); // 이벤트 누락 안전망

        map.on("error", (e) => { if (e && e.error) console.warn("[MapStudio]", e.error); });
      });

      return () => {
        cancelled = true;
        try { if (ro) ro.disconnect(); } catch (_) {}
        try { if (map) map.remove(); } catch (_) {}
        mapRef.current = null;
        initLockRef.current = false;
      };
    }, [coord.lat, coord.lng]);

    // 반경 토글 반영
    React.useEffect(() => {
      const map = mapRef.current;
      if (!map || !ready) return;
      RADII.forEach((r) => {
        const on = !!shownRadii[r.km];
        const lineId = "radius-" + r.km + "-line";
        if (map.getLayer(lineId)) map.setLayoutProperty(lineId, "visibility", on ? "visible" : "none");
      });
      radiusMkRef.current.forEach((rm) => {
        const el = rm.marker.getElement();
        if (el) el.style.display = shownRadii[rm.km] ? "" : "none";
      });
    }, [shownRadii, ready]);

    function recenter() {
      const map = mapRef.current;
      if (map) map.flyTo({ center, zoom: 12.5 });
    }

    // M1+M2: Overpass로 반경 내 철도·도로(선) + 학교·병원·역(점) 추출
    function loadOSM() {
      setOsmLoading(true); setOsmErr(null);
      const km = 5;
      const latR = km / 110.574;
      const lngR = km / (111.320 * Math.cos((coord.lat * Math.PI) / 180));
      const s = coord.lat - latR, n = coord.lat + latR, w = coord.lng - lngR, e = coord.lng + lngR;
      const bbox = s + "," + w + "," + n + "," + e;
      // 무거운 조합 쿼리는 504를 유발 → 선/점 두 요청으로 분리 (각각 가벼움)
      const qLines =
        "[out:json][timeout:25];(" +
        'way["railway"~"^(subway|rail|light_rail|tram)$"](' + bbox + ");" +
        'way["highway"~"^(motorway|trunk|primary|secondary)$"](' + bbox + ");" +
        ");out geom;";
      const qPoints =
        "[out:json][timeout:25];(" +
        'nwr["amenity"="school"](' + bbox + ");" +
        'nwr["amenity"~"^(hospital|clinic)$"](' + bbox + ");" +
        'node["railway"="station"](' + bbox + ");" +
        'node["station"="subway"](' + bbox + ");" +
        'node["railway"="subway_entrance"](' + bbox + ");" +
        ");out center tags;";
      // 공개 인스턴스 과부하(504) 대비: 엔드포인트 순차 폴백
      const ENDPOINTS = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.private.coffee/api/interpreter",
        "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
      ];
      const fetchT = (url, body, ms) => {
        const ac = new AbortController();
        const t = setTimeout(() => ac.abort(), ms);
        return fetch(url, { method: "POST", body, signal: ac.signal }).finally(() => clearTimeout(t));
      };
      const ovp = (q) => {
        let i = 0;
        const tryNext = () =>
          fetchT(ENDPOINTS[i], "data=" + encodeURIComponent(q), 20000)
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Overpass " + r.status))))
            .catch((err) => { i += 1; if (i < ENDPOINTS.length) return tryNext(); throw err; });
        return tryNext();
      };

      Promise.all([ovp(qLines), ovp(qPoints)])
        .then((jsons) => {
          const elements = [].concat(jsons[0].elements || [], jsons[1].elements || []);
          const fc = () => ({ type: "FeatureCollection", features: [] });
          const rail = fc(), road = fc(), school = fc(), medical = fc(), station = fc();
          const ptLngLat = (el) =>
            el.lat != null ? [el.lon, el.lat] : (el.center ? [el.center.lon, el.center.lat] : null);
          const distKm = (lng, lat) => {
            const dy = (lat - coord.lat) * 110.574;
            const dx = (lng - coord.lng) * 111.320 * Math.cos((coord.lat * Math.PI) / 180);
            return Math.sqrt(dx * dx + dy * dy);
          };
          elements.forEach((el) => {
            const t = el.tags || {};
            // 선
            if (el.geometry && (t.railway && /^(subway|rail|light_rail|tram)$/.test(t.railway) || t.highway)) {
              const f = { type: "Feature", geometry: { type: "LineString", coordinates: el.geometry.map((g) => [g.lon, g.lat]) }, properties: t };
              if (t.railway) rail.features.push(f);
              else if (t.highway) road.features.push(f);
              return;
            }
            // 점
            const ll = ptLngLat(el);
            if (!ll) return;
            const f = { type: "Feature", geometry: { type: "Point", coordinates: ll }, properties: { name: t.name || t["name:ko"] || "", _d: distKm(ll[0], ll[1]) } };
            if (t.amenity === "school") school.features.push(f);
            else if (t.amenity === "hospital" || t.amenity === "clinic") medical.features.push(f);
            else if (t.railway === "station" || t.station === "subway" || t.railway === "subway_entrance") station.features.push(f);
          });
          setOsm({
            rail, road, school, medical, station,
            counts: {
              rail: rail.features.length, road: road.features.length,
              school: school.features.length, medical: medical.features.length, station: station.features.length,
            },
          });
          setOsmLoading(false);
        })
        .catch((err) => { setOsmErr(String(err.message || err)); setOsmLoading(false); });
    }

    // 추출된 OSM 데이터를 지도 레이어로 반영
    React.useEffect(() => {
      const map = mapRef.current;
      if (!map || !ready || !osm) return;
      const apply = () => {
        // 도로 먼저 (철도가 위로 오도록)
        if (map.getSource("osm-road")) map.getSource("osm-road").setData(osm.road);
        else {
          map.addSource("osm-road", { type: "geojson", data: osm.road });
          map.addLayer({
            id: "osm-road-line", type: "line", source: "osm-road",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-color": ["match", ["get", "highway"], "motorway", "#f08e86", "trunk", "#fb8a44", "primary", "#e6b35a", "secondary", "#c9cf60", "#9aa0ab"],
              "line-width": ["match", ["get", "highway"], "motorway", 3.4, "trunk", 2.8, "primary", 2.2, "secondary", 1.5, 1.2],
              "line-opacity": 0.85,
            },
          });
        }
        if (map.getSource("osm-rail")) map.getSource("osm-rail").setData(osm.rail);
        else {
          map.addSource("osm-rail", { type: "geojson", data: osm.rail });
          map.addLayer({
            id: "osm-rail-line", type: "line", source: "osm-rail",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: { "line-color": colors.rail, "line-width": 2.4 },
          });
        }

        // M2: 포인트 레이어 (학교·병원·역)
        const pt = (id, data, color, radius) => {
          if (map.getSource(id)) { map.getSource(id).setData(data); return; }
          map.addSource(id, { type: "geojson", data });
          map.addLayer({
            id: id + "-circle", type: "circle", source: id,
            paint: {
              "circle-radius": radius, "circle-color": color,
              "circle-stroke-width": 1.4, "circle-stroke-color": "#12151c", "circle-opacity": 0.95,
            },
          });
          // 클릭 팝업 (이름)
          map.on("click", id + "-circle", (ev) => {
            const f = ev.features && ev.features[0];
            const nm = f && f.properties && f.properties.name;
            if (nm) new window.maplibregl.Popup({ offset: 10 }).setLngLat(ev.lngLat).setHTML("<b>" + nm + "</b>").addTo(map);
          });
          map.on("mouseenter", id + "-circle", () => { map.getCanvas().style.cursor = "pointer"; });
          map.on("mouseleave", id + "-circle", () => { map.getCanvas().style.cursor = ""; });
        };
        pt("osm-school", osm.school, colors.school, 4);
        pt("osm-medical", osm.medical, colors.medical, 4);
        pt("osm-station", osm.station, colors.station, 5.5);

        // 역 이름 라벨 (MapTiler 글리프 필요 → 키 있을 때만)
        if (tileMode === "maptiler" && !map.getLayer("osm-station-label")) {
          map.addLayer({
            id: "osm-station-label", type: "symbol", source: "osm-station",
            layout: {
              "text-field": ["get", "name"], "text-size": 11, "text-font": ["Noto Sans Regular"],
              "text-offset": [0, 1.1], "text-anchor": "top", "text-optional": true,
              "visibility": stationLabels ? "visible" : "none",
            },
            paint: { "text-color": colors.station, "text-halo-color": "#12151c", "text-halo-width": 1.4 },
          });
        }
      };
      let alive = true;
      const run = () => {
        if (!alive) return;
        try { apply(); } catch (_) { setTimeout(run, 150); } // 스타일 미준비 시 재시도
      };
      run();
      return () => { alive = false; };
    }, [osm, ready]);

    // OSM 레이어 표시/숨김
    React.useEffect(() => {
      const map = mapRef.current;
      if (!map || !ready) return;
      const vis = (layerId, on) => { if (map.getLayer(layerId)) map.setLayoutProperty(layerId, "visibility", on ? "visible" : "none"); };
      vis("osm-rail-line", layerVis.rail);
      vis("osm-road-line", layerVis.road);
      vis("osm-school-circle", layerVis.school);
      vis("osm-medical-circle", layerVis.medical);
      vis("osm-station-circle", layerVis.station);
      vis("osm-station-label", layerVis.station && stationLabels);
    }, [layerVis, ready, osm, stationLabels]);

    // 색상 변경 반영
    React.useEffect(() => {
      const map = mapRef.current;
      if (!map || !ready) return;
      const setC = (layerId, prop, c) => { if (map.getLayer(layerId)) map.setPaintProperty(layerId, prop, c); };
      setC("osm-rail-line", "line-color", colors.rail);
      setC("osm-school-circle", "circle-color", colors.school);
      setC("osm-medical-circle", "circle-color", colors.medical);
      setC("osm-station-circle", "circle-color", colors.station);
      setC("osm-station-label", "text-color", colors.station);
    }, [colors, ready, osm]);

    // 반경(5km) 밖 포인트 클리핑
    React.useEffect(() => {
      const map = mapRef.current;
      if (!map || !ready) return;
      const flt = clip ? ["<=", ["get", "_d"], 5] : null;
      ["osm-school-circle", "osm-medical-circle", "osm-station-circle", "osm-station-label"].forEach((id) => {
        if (map.getLayer(id)) map.setFilter(id, flt);
      });
    }, [clip, ready, osm]);

    // 도로 클래스별 필터
    React.useEffect(() => {
      const map = mapRef.current;
      if (!map || !ready || !map.getLayer("osm-road-line")) return;
      if (!roadSplit) { map.setFilter("osm-road-line", null); return; }
      const active = Object.keys(roadClasses).filter((k) => roadClasses[k]);
      map.setFilter("osm-road-line", ["in", ["get", "highway"], ["literal", active]]);
    }, [roadSplit, roadClasses, ready, osm]);

    return (
      <div className="ms-root">
        <div className="ms-toolbar">
          <div className="ms-tb-title">
            <Icon name="map" size={16} />
            <span>{project ? project.siteName || project.name : "Map Studio"}</span>
            <span className="ms-tb-badge">M2</span>
          </div>
          <div className="ms-tb-actions">
            {RADII.map((r) => (
              <button
                key={r.km}
                className={"ms-radbtn" + (shownRadii[r.km] ? " on" : "")}
                style={{ "--rc": r.color }}
                onClick={() => setShownRadii((s) => ({ ...s, [r.km]: !s[r.km] }))}
              >
                <span className="ms-radbtn-swatch" />{r.km}km
              </button>
            ))}
            <button className="ms-tb-btn" onClick={recenter}>단지로</button>
          </div>
        </div>
        <div className="ms-canvas-wrap">
          <div ref={containerRef} className="ms-canvas" />
          {err && <div className="ms-overlay ms-err">⚠ {err}</div>}
          {!ready && !err && <div className="ms-overlay">지도 로딩 중…</div>}

          {/* M1·M2 레이어 패널 */}
          <div className="ms-layers">
            <button className="ms-load" onClick={loadOSM} disabled={osmLoading}>
              {osmLoading ? "불러오는 중…" : (osm ? "↻ 다시 불러오기" : "주변 시설 불러오기 (5km)")}
            </button>
            {osm && (
              <div className="ms-lyr-list">
                {LAYER_DEFS.map((ld) => (
                  <div key={ld.key}>
                    <div className="ms-lyr-row">
                      <label className="ms-lyr">
                        <input type="checkbox" checked={layerVis[ld.key]} onChange={() => setLayerVis((v) => ({ ...v, [ld.key]: !v[ld.key] }))} />
                        <span className={"ms-lyr-sw" + (ld.dot ? " dot" : "")} style={{ background: ld.colorable ? colors[ld.key] : ld.color }} />{ld.label} <em>{osm.counts[ld.key]}</em>
                      </label>
                      {ld.colorable && (
                        <input type="color" className="ms-color" value={colors[ld.key]} title="색 변경"
                          onChange={(e) => setColors((c) => ({ ...c, [ld.key]: e.target.value }))} />
                      )}
                      {ld.isRoad && (
                        <button className={"ms-mini" + (roadSplit ? " on" : "")} title="도로 클래스별" onClick={() => setRoadSplit((x) => !x)}>⋯</button>
                      )}
                    </div>
                    {ld.isRoad && roadSplit && (
                      <div className="ms-subclasses">
                        {ROAD_CLASSES.map((rc) => (
                          <label className="ms-sub" key={rc.key}>
                            <input type="checkbox" checked={roadClasses[rc.key]} onChange={() => setRoadClasses((v) => ({ ...v, [rc.key]: !v[rc.key] }))} />
                            <span className="ms-lyr-sw" style={{ background: rc.color }} />{rc.label}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="ms-opts">
                  <label className="ms-opt"><input type="checkbox" checked={clip} onChange={() => setClip((x) => !x)} />반경 5km 밖 숨기기</label>
                  <label className="ms-opt"><input type="checkbox" checked={stationLabels} onChange={() => setStationLabels((x) => !x)} />역 이름 표시</label>
                </div>
                <div className="ms-lyr-src">출처: © OpenStreetMap</div>
              </div>
            )}
            {osmErr && <div className="ms-lyr-err">⚠ {osmErr}</div>}
          </div>
        </div>
        <div className="ms-footnote">
          타일: {tileMode === "maptiler" ? "MapTiler streets-v2 (키 적용)" : "OSM 기본 (키 없음)"} · 다음: Overpass 철도·도로 레이어 · PPT 익스포트 — docs/MAP_FEATURE_PLAN.md
        </div>
      </div>
    );
  }

  window.MapStudio = MapStudio;

  // 지도 모드 라우터: 분포 지도(기존 ECharts) ↔ Map Studio(MapLibre) 탭 전환
  function MapRouter() {
    const [tab, setTab] = React.useState("studio"); // 'studio' | 'choropleth'
    const TABS = [
      { id: "studio", label: "Map Studio", icon: "map" },
      { id: "choropleth", label: "분포 지도", icon: "grid" },
    ];
    return (
      <div className="ms-router">
        <div className="ms-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={"ms-tab" + (tab === t.id ? " on" : "")}
              onClick={() => setTab(t.id)}
            >
              <Icon name={t.icon} size={14} />{t.label}
            </button>
          ))}
        </div>
        <div className="ms-router-body">
          {tab === "studio"
            ? <MapStudio />
            : (window.MapMode ? window.MapMode() : null)}
        </div>
      </div>
    );
  }
  window.MapRouter = MapRouter;
})();
