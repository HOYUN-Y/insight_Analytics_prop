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

  function MapStudio() {
    const project = useStore((s) => s.projects.find((p) => p.id === s.activeProjectId) || s.projects[0]);
    const containerRef = React.useRef(null);
    const mapRef = React.useRef(null);
    const radiusMkRef = React.useRef([]);
    const [ready, setReady] = React.useState(false);
    const [err, setErr] = React.useState(null);
    const [shownRadii, setShownRadii] = React.useState({ 2: true, 3: true, 5: true });

    const coord = (project && project.coord) || { lat: 36.8389, lng: 127.1278 };
    const center = [coord.lng, coord.lat];

    // 지도 초기화 (1회)
    React.useEffect(() => {
      if (!window.maplibregl) { setErr("MapLibre GL 라이브러리가 로드되지 않았습니다."); return; }
      if (mapRef.current || !containerRef.current) return;

      let map;
      try {
        map = new window.maplibregl.Map({
          container: containerRef.current,
          style: {
            version: 8,
            sources: {
              osm: {
                type: "raster",
                tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                tileSize: 256,
                attribution: "© OpenStreetMap contributors",
              },
            },
            layers: [{ id: "osm", type: "raster", source: "osm" }],
          },
          center,
          zoom: 12.5,
          attributionControl: true,
        });
      } catch (e) { setErr(String(e)); return; }

      mapRef.current = map;

      // 컨테이너 크기 확정/변경 시 캔버스 리사이즈 (탭·지연 레이아웃 대응)
      let ro;
      if (window.ResizeObserver) {
        ro = new ResizeObserver(() => { try { map.resize(); } catch (_) {} });
        ro.observe(containerRef.current);
      }

      map.addControl(new window.maplibregl.NavigationControl({ showCompass: false }), "top-right");
      map.addControl(new window.maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-left");

      const radiusMarkers = radiusMkRef.current = [];

      map.on("load", () => {
        // 반경 동심원 (line) — 라벨은 글리프 폰트 의존이라 PoC에선 HTML 마커로 대체
        RADII.forEach((r) => {
          const srcId = "radius-" + r.km;
          map.addSource(srcId, { type: "geojson", data: circleGeoJSON(center, r.km) });
          map.addLayer({
            id: srcId + "-line", type: "line", source: srcId,
            paint: { "line-color": r.color, "line-width": 2.4, "line-dasharray": [2, 1.4], "line-opacity": 1 },
          });
          // 반경 라벨 (북쪽 끝점에 HTML 마커)
          const labelEl = document.createElement("div");
          labelEl.className = "ms-radlabel";
          labelEl.textContent = r.km + "km";
          labelEl.style.color = r.color;
          const labelMk = new window.maplibregl.Marker({ element: labelEl, anchor: "bottom" })
            .setLngLat([center[0], center[1] + r.km / 110.574])
            .addTo(map);
          radiusMarkers.push({ km: r.km, marker: labelMk });
        });
        map.resize(); // 탭 컨테이너 사이즈 반영

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

        setReady(true);
      });

      map.on("error", (e) => { if (e && e.error) console.warn("[MapStudio]", e.error); });

      return () => { try { if (ro) ro.disconnect(); } catch (_) {} try { map.remove(); } catch (_) {} mapRef.current = null; };
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

    return (
      <div className="ms-root">
        <div className="ms-toolbar">
          <div className="ms-tb-title">
            <Icon name="map" size={16} />
            <span>{project ? project.siteName || project.name : "Map Studio"}</span>
            <span className="ms-tb-badge">PoC · M0</span>
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
        </div>
        <div className="ms-footnote">
          OSM 기본 타일 (PoC). 다음 단계: VWorld/MapTiler 전환 · Overpass 철도·도로 레이어 · PPT 익스포트 — docs/MAP_FEATURE_PLAN.md
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
