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
    { key: "rail",    label: "철도·지하철", color: "#c98bf0" },
    { key: "road",    label: "주요도로",   color: "#fb8a44" },
    { key: "school",  label: "학교",       color: "#79e0a8", dot: true },
    { key: "medical", label: "병원·의원",  color: "#f08e86", dot: true },
    { key: "station", label: "역·승강장",  color: "#7ba1fc", dot: true },
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
    const radiusMkRef = React.useRef([]);
    const [ready, setReady] = React.useState(false);
    const [err, setErr] = React.useState(null);
    const [shownRadii, setShownRadii] = React.useState({ 2: true, 3: true, 5: true });
    const [tileMode, setTileMode] = React.useState("osm");
    const [osm, setOsm] = React.useState(null);        // { rail, road, counts }
    const [osmLoading, setOsmLoading] = React.useState(false);
    const [osmErr, setOsmErr] = React.useState(null);
    const [layerVis, setLayerVis] = React.useState({ rail: true, road: true, school: true, medical: true, station: true });

    const coord = (project && project.coord) || { lat: 36.8389, lng: 127.1278 };
    const center = [coord.lng, coord.lat];

    // 지도 초기화 (1회) — 로컬 키 로드 후 빌드
    React.useEffect(() => {
      if (!window.maplibregl) { setErr("MapLibre GL 라이브러리가 로드되지 않았습니다."); return; }
      if (mapRef.current || !containerRef.current) return;

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

        // load 이벤트가 누락되는 레이스 대비: 이미 로드됐으면 즉시, 아니면 load/idle 양쪽 대기
        if (map.isStyleLoaded()) setup();
        else { map.on("load", setup); map.once("idle", setup); }

        map.on("error", (e) => { if (e && e.error) console.warn("[MapStudio]", e.error); });
      });

      return () => {
        cancelled = true;
        try { if (ro) ro.disconnect(); } catch (_) {}
        try { if (map) map.remove(); } catch (_) {}
        mapRef.current = null;
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
      const ovp = (q) =>
        fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: "data=" + encodeURIComponent(q) })
          .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Overpass " + r.status))));

      Promise.all([ovp(qLines), ovp(qPoints)])
        .then((jsons) => {
          const elements = [].concat(jsons[0].elements || [], jsons[1].elements || []);
          const fc = () => ({ type: "FeatureCollection", features: [] });
          const rail = fc(), road = fc(), school = fc(), medical = fc(), station = fc();
          const ptLngLat = (el) =>
            el.lat != null ? [el.lon, el.lat] : (el.center ? [el.center.lon, el.center.lat] : null);
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
            const f = { type: "Feature", geometry: { type: "Point", coordinates: ll }, properties: { name: t.name || t["name:ko"] || "" } };
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
            paint: {
              "line-color": ["match", ["get", "railway"], "subway", "#7ba1fc", "light_rail", "#7ba1fc", "tram", "#9b7bfc", "#c98bf0"],
              "line-width": 2.4,
            },
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
        pt("osm-school", osm.school, "#79e0a8", 4);
        pt("osm-medical", osm.medical, "#f08e86", 4);
        pt("osm-station", osm.station, "#7ba1fc", 5.5);
      };
      if (map.isStyleLoaded()) apply(); else map.once("idle", apply);
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
    }, [layerVis, ready, osm]);

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
                  <label className="ms-lyr" key={ld.key}>
                    <input type="checkbox" checked={layerVis[ld.key]} onChange={() => setLayerVis((v) => ({ ...v, [ld.key]: !v[ld.key] }))} />
                    <span className={"ms-lyr-sw" + (ld.dot ? " dot" : "")} style={{ background: ld.color }} />{ld.label} <em>{osm.counts[ld.key]}</em>
                  </label>
                ))}
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
