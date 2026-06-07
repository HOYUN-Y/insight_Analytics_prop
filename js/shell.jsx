/* insight Analytics Prop — App Shell: TopBar, Rail, Workspace, StatusBar */
(function () {
  const { useStore, actions, derive } = window.Store;
  const Icon = window.Icon;

  const MODES = [
    { id: "planning",  label: "Planning",  icon: "planning",  desc: "Planning Studio" },
    { id: "project",   label: "Project",   icon: "project",   desc: "프로젝트 관리" },
    { id: "data",      label: "Data",      icon: "data",      desc: "데이터셋" },
    { id: "apihub",    label: "API Hub",   icon: "api",       desc: "데이터 수집" },
    { id: "clean",     label: "Clean",     icon: "clean",     desc: "전처리" },
    { id: "visualize", label: "Chart",     icon: "visualize", desc: "시각화" },
    { id: "map",       label: "Map",       icon: "map",       desc: "지도" },
    { id: "analysis",  label: "Analysis",  icon: "analysis",  desc: "부동산 분석" },
    { id: "dashboard", label: "Board",     icon: "dashboard", desc: "대시보드" },
    { id: "report",    label: "Report",    icon: "report",    desc: "리포트" },
  ];

  function ImportBtn() {
    const [open, setOpen] = React.useState(false);
    const fileRef = React.useRef(null);

    function handleFiles(files) {
      const file = files[0]; if (!file) return;
      const ext = file.name.split(".").pop().toLowerCase();
      if (!["csv", "tsv", "json"].includes(ext)) { alert("CSV / TSV / JSON 파일만 지원합니다."); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          let rows;
          if (ext === "json") {
            rows = JSON.parse(e.target.result);
            if (!Array.isArray(rows)) throw new Error("JSON must be an array of objects");
          } else {
            const sep = ext === "tsv" ? "\t" : ",";
            const lines = e.target.result.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(Boolean);
            const parseRow = (line) => {
              const cells = []; let cur = "", inQ = false;
              for (let i = 0; i < line.length; i++) {
                const ch = line[i];
                if (ch === '"' && !inQ) inQ = true;
                else if (ch === '"' && inQ && line[i+1] === '"') { cur += '"'; i++; }
                else if (ch === '"' && inQ) inQ = false;
                else if (ch === sep && !inQ) { cells.push(cur); cur = ""; }
                else cur += ch;
              }
              cells.push(cur); return cells;
            };
            const headers = parseRow(lines[0]);
            rows = lines.slice(1).map((l) => {
              const vals = parseRow(l);
              const o = {};
              headers.forEach((h, i) => {
                const v = vals[i] !== undefined ? vals[i].trim() : "";
                o[h.trim()] = v === "" ? null : isNaN(v) ? v : +v;
              });
              return o;
            });
          }
          if (!rows.length) { alert("데이터가 비어 있습니다."); return; }
          const columns = Object.keys(rows[0]).map((k) => {
            const vals = rows.map((r) => r[k]).filter((v) => v != null);
            const isNum = vals.length && vals.every((v) => typeof v === "number" && !isNaN(v));
            return { key: k, label: k, type: isNum ? "float" : "string", role: isNum ? "measure" : "dimension", agg: isNum ? "sum" : null };
          });
          const id = "upload_" + Date.now();
          window.NODE.datasets.push({ id, name: file.name, short: file.name.replace(/\.[^.]+$/, ""), icon: "table", source: "Import", rows, columns });
          actions.setActive(id);
          window.LOG && window.LOG.info("import", "Loaded " + file.name + " — " + rows.length + " rows");
          setOpen(false);
        } catch (err) { alert("파일 파싱 실패: " + err.message); }
      };
      reader.readAsText(file, "UTF-8");
    }

    return (
      <div style={{ position: "relative" }}>
        <button className="btn ghost sm" onClick={() => setOpen(!open)}>
          <Icon name="upload" size={13} /> Import
        </button>
        {open && (
          <div style={{ position: "fixed", inset: 0, zIndex: 8000 }} onClick={() => setOpen(false)}>
            <div style={{ position: "absolute", top: 48, left: "50%", transform: "translateX(-50%)", width: 340,
              background: "var(--bg-2)", border: "1px solid var(--line-strong)", borderRadius: "var(--r-lg)",
              boxShadow: "var(--shadow-pop)", padding: 24 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--tx-hi)", marginBottom: 16 }}>파일 가져오기</div>
              <div style={{ border: "2px dashed var(--line-strong)", borderRadius: "var(--r-md)", padding: "28px 20px",
                textAlign: "center", color: "var(--tx-faint)", cursor: "pointer" }}
                onClick={() => fileRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--accent)"; }}
                onDragLeave={(e) => { e.currentTarget.style.borderColor = ""; }}
                onDrop={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = ""; handleFiles(e.dataTransfer.files); }}>
                <Icon name="upload" size={24} style={{ display: "block", margin: "0 auto 10px" }} />
                <div style={{ fontSize: 13, color: "var(--tx-mid)", marginBottom: 4 }}>CSV / TSV / JSON 드롭 또는 클릭</div>
                <div style={{ fontSize: 11 }}>첫 행을 헤더로 인식 · 숫자 자동 감지</div>
              </div>
              <input ref={fileRef} type="file" accept=".csv,.tsv,.json" style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
              <button className="btn ghost sm" style={{ marginTop: 14, width: "100%" }} onClick={() => setOpen(false)}>취소</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function ProjectSelector() {
    const [open, setOpen] = React.useState(false);
    const projects = useStore((s) => s.projects);
    const activeId = useStore((s) => s.activeProjectId);
    const active = projects.find((p) => p.id === activeId);

    return (
      <div style={{ position: "relative" }}>
        <button className="btn ghost sm" style={{ maxWidth: 220 }} onClick={() => setOpen(!open)}>
          <Icon name="project" size={12} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160, display: "inline-block" }}>
            {active ? active.name : "프로젝트 없음"}
          </span>
          <span style={{ color: "var(--tx-faint)", fontSize: 9 }}>▾</span>
        </button>
        {open && (
          <div style={{ position: "fixed", inset: 0, zIndex: 8000 }} onClick={() => setOpen(false)}>
            <div style={{ position: "absolute", top: 48, left: 56,
              background: "var(--bg-2)", border: "1px solid var(--line-strong)",
              borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-pop)",
              minWidth: 260, overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: "6px 12px 5px", fontSize: 10, fontWeight: 700, letterSpacing: ".1em",
                textTransform: "uppercase", color: "var(--tx-faint)", borderBottom: "1px solid var(--line)" }}>
                프로젝트 선택
              </div>
              {projects.map((p) => (
                <button key={p.id} onClick={() => { actions.setActiveProject(p.id); setOpen(false); }}
                  style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center",
                    gap: 8, padding: "9px 14px", background: p.id === activeId ? "var(--accent-soft)" : "none",
                    border: "none", color: p.id === activeId ? "var(--accent)" : "var(--tx-hi)",
                    cursor: "pointer", fontSize: 13, fontFamily: "var(--font-ui)" }}>
                  <Icon name="project" size={12} />
                  <div>
                    <div style={{ fontWeight: p.id === activeId ? 600 : 400 }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: "var(--tx-faint)" }}>{p.siteName || "—"}</div>
                  </div>
                </button>
              ))}
              <div style={{ borderTop: "1px solid var(--line)", padding: "6px 10px" }}>
                <button className="btn ghost sm" style={{ width: "100%" }}
                  onClick={() => { actions.setMode("project"); setOpen(false); }}>
                  <Icon name="plus" size={12} /> 프로젝트 관리
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function ViewSwitcher() {
    const planView = useStore((s) => s.planView || "docs");
    const mode = useStore((s) => s.mode);
    if (mode !== "planning") return null;
    const VIEWS = [
      { id: "docs",      label: "문서",    icon: "doc" },
      { id: "dashboard", label: "대시보드", icon: "grid" },
      { id: "board",     label: "보드",    icon: "node" },
    ];
    return (
      <div className="vsw">
        {VIEWS.map(v => (
          <button key={v.id} className={"vb" + (planView === v.id ? " on" : "")}
            onClick={() => actions.setPlanView(v.id)}>
            <Icon name={v.icon} size={13} /> {v.label}
          </button>
        ))}
      </div>
    );
  }

  function TopBar() {
    const theme = useStore((s) => s.theme);
    const activeId = useStore((s) => s.activeProjectId);
    const projects = useStore((s) => s.projects);
    const proj = projects.find(p => p.id === activeId);
    const totalUnits = proj ? (proj.totalUnits || 0) : 0;
    const siteName = proj ? (proj.siteName || "") : "";

    return (
      <div className="topbar">
        {/* Logo mark */}
        <div className="tb-mk">
          <svg width="18" height="18" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="var(--orange)"/>
            <g fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 14V50H50"/>
              <polyline points="20,44 30,30 38,38 50,20"/>
            </g>
            <circle cx="50" cy="20" r="4" fill="#fff"/>
          </svg>
        </div>
        {/* Wordmark */}
        <div className="tb-wm">
          <span style={{ color: "var(--tx-hi)" }}>in</span><span style={{ color: "var(--navy)" }}>sight</span>
          <span style={{ color: "var(--orange)" }}> Analytics</span>
          <span style={{ color: "var(--accent)", marginLeft: 4 }}>Prop</span>
        </div>
        {/* Project context */}
        {proj && (
          <React.Fragment>
            <div className="tb-sep" />
            <div className="tb-ctx" onClick={() => actions.setMode("project")} title="프로젝트 변경">
              <div className="tb-ctx-name">{proj.name}</div>
              {(siteName || totalUnits > 0) && (
                <div className="tb-ctx-sub">{[siteName, totalUnits > 0 ? totalUnits + "세대" : ""].filter(Boolean).join(" · ")}</div>
              )}
            </div>
          </React.Fragment>
        )}
        {/* View switcher (planning only) */}
        <ViewSwitcher />
        <div className="topbar-spacer" />
        {/* Right actions */}
        <button className="tb-act" onClick={() => {}}>
          <Icon name="save" size={13} /> 저장
        </button>
        <button className="tb-act" onClick={() => {}}>
          <Icon name="download" size={13} /> 가져오기
        </button>
        <button className="tb-act primary" onClick={() => {}}>
          <Icon name="report" size={13} /> 보고서
        </button>
        <div className="tb-sep" />
        <button className="tb-ico" title="설정" onClick={() => window.dispatchEvent(new CustomEvent("node-tweaks-toggle"))}>
          <Icon name="sliders" size={15} />
        </button>
        <button className="tb-ico" title="테마 전환" onClick={actions.toggleTheme}>
          <Icon name={theme === "dark" ? "sun" : "moon"} size={15} />
        </button>
        <div className="tb-ava">JP</div>
      </div>
    );
  }

  function Rail() {
    const mode = useStore((s) => s.mode);
    return (
      <div className="rail">
        {MODES.map((m) => (
          <button key={m.id} className={"ri" + (mode === m.id ? " on" : "")}
            onClick={() => actions.setMode(m.id)} title={m.desc}>
            <Icon name={m.icon} size={18} />
            <span>{m.label}</span>
          </button>
        ))}
        <div className="rail-gap" />
        <button className="ri" title="레퍼런스" onClick={() => {}}>
          <Icon name="search" size={18} />
          <span>Refs</span>
        </button>
      </div>
    );
  }

  function StatusBar() {
    const activeId = useStore((s) => s.activeId);
    const mode = useStore((s) => s.mode);
    const activeProjectId = useStore((s) => s.activeProjectId);
    const projects = useStore((s) => s.projects);
    const { ds, rows } = window.Store.derive.getActiveData(activeId);
    const proj = projects.find((p) => p.id === activeProjectId);
    const planView = useStore((s) => s.planView || "docs");
    return (
      <div className="statusbar">
        <span className="si"><span className="dot" style={{ background: "var(--accent)" }} /> Local-First</span>
        {proj && <span className="si" style={{ color: "var(--accent)", fontWeight: 600 }}>{proj.name}</span>}
        {mode === "planning"
          ? <span className="si">Planning Studio · {planView}</span>
          : <React.Fragment>
              <span className="si mono">{ds.short}</span>
              <span className="si mono">{rows.length.toLocaleString()} rows × {ds.columns.length} cols</span>
            </React.Fragment>
        }
        <span className="spacer" />
        <span className="si">{mode.toUpperCase()}</span>
        <span className="si" style={{ color: "var(--tx-faint)" }}>KO · UTF-8</span>
        <span className="si" style={{ color: "var(--tx-faint)" }}>Prop v0.1</span>
      </div>
    );
  }

  function Workspace({ left, center, right, leftTitle, rightTitle, leftHead, rightHead }) {
    const ui = useStore((s) => s.ui);
    const tweaks = useStore((s) => s.tweaks);
    const [drag, setDrag] = React.useState(null);
    let L = left, R = right, LT = leftTitle, RT = rightTitle, LH = leftHead, RH = rightHead;
    if ((tweaks.explorerSide || "left") === "right") { [L, R] = [R, L]; [LT, RT] = [RT, LT]; [LH, RH] = [RH, LH]; }
    if (tweaks.layout === "focus") R = null;
    const startResize = (which) => (e) => {
      e.preventDefault();
      const startX = e.clientX, startW = which === "left" ? ui.leftW : ui.rightW;
      setDrag(which);
      const onMove = (ev) => {
        const dx = ev.clientX - startX;
        if (which === "left") actions.setUI({ leftW: Math.max(180, Math.min(420, startW + dx)) });
        else actions.setUI({ rightW: Math.max(220, Math.min(460, startW - dx)) });
      };
      const onUp = () => { setDrag(null); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
      window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
    };
    const showLeft = !!L, showRight = !!R;
    const cols = [showLeft ? `${ui.leftW}px 5px` : "", "1fr", showRight ? `5px ${ui.rightW}px` : ""].join(" ").trim();
    return (
      <div className="workspace" style={{ gridTemplateColumns: cols }}>
        {showLeft && (
          <React.Fragment>
            <div className="panel left">
              {LH || (LT && <div className="phead"><span className="ttl">{LT}</span></div>)}
              <div className="pbody">{L}</div>
            </div>
            <div className={"resizer" + (drag === "left" ? " drag" : "")} onMouseDown={startResize("left")} />
          </React.Fragment>
        )}
        <div className="center">{center}</div>
        {showRight && (
          <React.Fragment>
            <div className={"resizer" + (drag === "right" ? " drag" : "")} onMouseDown={startResize("right")} />
            <div className="panel right">
              {RH || (RT && <div className="phead"><span className="ttl">{RT}</span></div>)}
              <div className="pbody">{R}</div>
            </div>
          </React.Fragment>
        )}
      </div>
    );
  }

  Object.assign(window, { TopBar, Rail, StatusBar, Workspace, MODES });
})();
