/* insight Analytics Prop — Root App */
(function () {
  const { useStore, actions } = window.Store;
  const Icon = window.Icon;

  function Placeholder({ icon, title, desc }) {
    return (
      <div className="empty" style={{ gap: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--bg-1)",
          border: "1px solid var(--line)", display: "flex", alignItems: "center",
          justifyContent: "center", color: "var(--accent)" }}>
          <Icon name={icon} size={26} />
        </div>
        <div style={{ fontSize: 15, color: "var(--tx-hi)", fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 13, color: "var(--tx-mid)" }}>{desc}</div>
        <span className="badge" style={{ marginTop: 4 }}>
          <span className="dot" style={{ background: "var(--warn)" }} /> Coming soon
        </span>
      </div>
    );
  }

  function App() {
    const theme = useStore(s => s.theme);
    const mode  = useStore(s => s.mode);
    const tw    = useStore(s => s.tweaks);

    React.useEffect(() => {
      const r = document.documentElement;
      r.setAttribute("data-theme",   theme);
      r.setAttribute("data-tone",    tw.tone    || "cool");
      r.setAttribute("data-density", tw.density || "compact");
      r.setAttribute("data-sidebar", tw.sidebar || "labeled");
      r.setAttribute("data-accent",  tw.accent  || "orange");
    }, [theme, tw]);

    let content;

    if (mode === "planning" && window.PlanningMode) {
      content = <window.PlanningMode />;
    } else if (mode === "project" && window.ProjectMode) {
      content = (
        <window.Workspace
          center={<window.ProjectMode />}
        />
      );
    } else if (mode === "data") {
      content = (
        <window.Workspace
          left={<window.DatasetTree />} leftTitle="Data Explorer"
          center={<window.DataCenter />}
          right={<window.ColumnProfile />} rightTitle="Column Profile"
        />
      );
    } else if (mode === "clean" && window.CleanMode) {
      content = window.CleanMode();
    } else if (mode === "visualize" && window.VizMode) {
      content = window.VizMode();
    } else if (mode === "map" && window.MapMode) {
      content = window.MapMode();
    } else if (mode === "dashboard" && window.DashMode) {
      content = window.DashMode();
    } else if (mode === "analysis") {
      content = (
        <window.Workspace center={<Placeholder icon="analysis" title="분석 모듈" desc="가격분석 · 경쟁단지 · 입지분석 — Phase 2에서 구현 예정" />} />
      );
    } else if (mode === "apihub") {
      content = (
        <window.Workspace center={<Placeholder icon="api" title="API Hub" desc="공공데이터 · 부동산 API 자동 수집 — Phase 3에서 구현 예정" />} />
      );
    } else if (mode === "report") {
      content = (
        <window.Workspace center={<Placeholder icon="report" title="리포트" desc="시장조사 보고서 자동 생성 — Phase 3에서 구현 예정" />} />
      );
    } else {
      content = (
        <window.Workspace
          left={<window.DatasetTree />} leftTitle="Data Explorer"
          center={<window.DataCenter />}
          right={<window.ColumnProfile />} rightTitle="Column Profile"
        />
      );
    }

    const aiOpen = useStore(s => s.ui.aiOpen);

    return (
      <div className="app">
        <window.TopBar />
        <div className="body">
          <window.Rail />
          <div className="main">
            {content}
            <window.StatusBar />
          </div>
        </div>
        {aiOpen && window.AiDrawer && <window.AiDrawer />}
        {window.TweaksDrawer && <window.TweaksDrawer />}
      </div>
    );
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(React.createElement(App));
})();
