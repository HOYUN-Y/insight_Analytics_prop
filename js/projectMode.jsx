/* insight Analytics Prop — Project Mode (list / create / edit) */
(function () {
  const { useStore, actions } = window.Store;
  const Icon = window.Icon;

  function ProjectCard({ proj, active }) {
    const types = proj.unitTypes || [];
    const totalUnits = proj.totalUnits || types.reduce((s, t) => s + (+t.units || 0), 0);
    return (
      <div className={"proj-card" + (active ? " active" : "")} onClick={() => { actions.setActiveProject(proj.id); actions.setMode("planning"); }}>
        <div className="proj-card-head">
          <div className="proj-card-name">{proj.name || "무제 프로젝트"}</div>
          {active && <span className="proj-badge-active">Active</span>}
        </div>
        <div className="proj-card-meta">
          <span>{proj.siteName || "—"}</span>
          <span>{totalUnits ? totalUnits + "세대" : "—"}</span>
          <span>{(proj.brief || {}).phase || "—"}</span>
        </div>
        <div className="proj-card-types">
          {types.slice(0, 4).map(t => (
            <span key={t.id} className="proj-type-chip">{t.name || "—"} {t.sqm ? t.sqm + "㎡" : ""}</span>
          ))}
        </div>
        <div className="proj-card-actions" onClick={e => e.stopPropagation()}>
          <button className="btn ghost xs" onClick={() => actions.setActiveProject(proj.id)}>
            <Icon name="check" size={11} /> 활성
          </button>
          <button className="btn ghost xs" onClick={() => actions.duplicateProject(proj.id)}>
            <Icon name="duplicate" size={11} /> 복제
          </button>
          <button className="btn ghost xs danger" onClick={() => {
            if (confirm("프로젝트를 삭제할까요?")) actions.deleteProject(proj.id);
          }}>
            <Icon name="x" size={11} /> 삭제
          </button>
        </div>
      </div>
    );
  }

  function NewProjectForm({ onDone }) {
    const [name, setName] = React.useState("");
    const [site, setSite] = React.useState("");
    function create() {
      if (!name.trim()) { alert("프로젝트명을 입력하세요."); return; }
      actions.createProject({ name, siteName: site });
      onDone();
    }
    return (
      <div className="new-proj-form">
        <div className="new-proj-title">새 프로젝트</div>
        <input className="pf-input" value={name} onChange={e => setName(e.target.value)}
          placeholder="프로젝트명 (예: 수원 영통 래미안)" autoFocus />
        <input className="pf-input" value={site} onChange={e => setSite(e.target.value)}
          placeholder="사업지명 (예: 수원 영통지구)" />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="btn primary" onClick={create}><Icon name="plus" size={13} /> 생성</button>
          <button className="btn ghost" onClick={onDone}>취소</button>
        </div>
      </div>
    );
  }

  function ProjectMode() {
    const projects = useStore(s => s.projects);
    const activeId = useStore(s => s.activeProjectId);
    const [creating, setCreating] = React.useState(false);

    return (
      <div className="project-mode">
        <div className="project-mode-head">
          <div className="project-mode-title">
            <Icon name="project" size={16} style={{ color: "var(--accent)" }} />
            프로젝트 관리
          </div>
          <button className="btn primary sm" onClick={() => setCreating(true)}>
            <Icon name="plus" size={13} /> 새 프로젝트
          </button>
        </div>
        {creating && <NewProjectForm onDone={() => setCreating(false)} />}
        <div className="proj-list">
          {projects.length === 0 && (
            <div className="empty-hint" style={{ padding: "60px 0", textAlign: "center" }}>
              프로젝트가 없습니다. 새 프로젝트를 만들어보세요.
            </div>
          )}
          {projects.map(p => (
            <ProjectCard key={p.id} proj={p} active={p.id === activeId} />
          ))}
        </div>
      </div>
    );
  }

  window.ProjectMode = ProjectMode;
})();
