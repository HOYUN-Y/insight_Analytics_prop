/* insight Analytics Prop — Cockpit View (대시보드 뷰)
   window.CockpitView
*/
(function () {
  const { useStore, actions } = window.Store;
  const Icon = window.Icon;

  const STAGE_COLS = [
    { ic: 'planning', l: 'Planning', pct: 45, cur: true },
    { ic: 'data',     l: 'Data',     pct: 70, done: true },
    { ic: 'analysis', l: 'Analysis', pct: 35 },
    { ic: 'bolt',     l: 'Insight',  pct: 20 },
    { ic: 'report',   l: 'Report',   pct: 5 },
  ];

  const STAGE_LABELS = {
    planning: '기획 중', research: '조사 중', analysis: '분석 중', done: '완료'
  };

  const TYPE_LABELS = {
    apartment: '아파트', officetel: '오피스텔', commercial: '상가',
    knowledge: '지식산업센터', living: '생활숙박시설', other: '기타'
  };

  function PriBadge({ p }) {
    const cls = p === 'High' ? 'p1' : p === 'Med' ? 'p2' : 'p3';
    return <span className={`pri ${cls}`}>{p}</span>;
  }

  function StatusChip({ s, onClick }) {
    return <span className={`st-pill ${s}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>{
      s === 'todo' ? '미착수' : s === 'wip' ? '진행중' : s === 'done' ? '완료' :
      s === 'accepted' ? '채택' : s === 'rejected' ? '기각' : s
    }</span>;
  }

  /* ── Left nav tree ────────────────────────────────────────── */
  function CockpitNav({ proj }) {
    return (
      <div className="ck-nav">
        <div className="ck-nav-head">
          <Icon name="planning" size={13} />
          <span>Planning Studio</span>
        </div>
        <div className="ck-proj-badge">
          <Icon name="target" size={11} />
          <span>{proj.name || '프로젝트'}</span>
        </div>
        <div className="ck-nav-sec">프로젝트</div>
        {[
          { ic: 'doc', t: 'Project Brief' },
          { ic: 'grid', t: 'Business Canvas' },
          { ic: 'target', t: '연구 질문', cnt: (proj.researchQuestions||[]).length },
          { ic: 'flag', t: '가설 관리', cnt: (proj.hypotheses||[]).length },
          { ic: 'swot', t: 'SWOT' },
          { ic: 'node', t: 'Mind Map' },
        ].map((it, i) => (
          <div key={i} className="ck-nav-item"
            onClick={() => { actions.setPlanView('docs'); actions.setPlanPage(
              it.t === 'Project Brief' ? 'brief' : it.t === 'Business Canvas' ? 'canvas' :
              it.t === '연구 질문' ? 'rq' : it.t === '가설 관리' ? 'hyp' :
              it.t === 'SWOT' ? 'swot' : 'mindmap'
            ); }}>
            <Icon name={it.ic} size={13} />
            <span>{it.t}</span>
            {it.cnt != null && <span className="ck-cnt">{it.cnt}</span>}
          </div>
        ))}
        <div className="ck-nav-sec">기록</div>
        {[
          { ic: 'bulb', t: '인사이트', cnt: (proj.insights||[]).length },
          { ic: 'doc', t: '의사결정 로그', cnt: (proj.decisions||[]).length },
          { ic: 'search', t: '출처·레퍼런스' },
        ].map((it, i) => (
          <div key={i} className="ck-nav-item"
            onClick={() => { actions.setPlanView('docs'); actions.setPlanPage(
              it.t === '인사이트' ? 'insight' : it.t === '의사결정 로그' ? 'decision' : 'refs'
            ); }}>
            <Icon name={it.ic} size={13} />
            <span>{it.t}</span>
            {it.cnt != null && <span className="ck-cnt">{it.cnt}</span>}
          </div>
        ))}
      </div>
    );
  }

  /* ── Center ───────────────────────────────────────────────── */
  function CockpitCenter({ proj }) {
    const qs   = proj.researchQuestions || [];
    const hyp  = proj.hypotheses || [];
    const ins  = proj.insights || [];
    const dec  = proj.decisions || [];
    const swot = proj.swot || {};
    const swotN = ['S','W','O','T'].reduce((s,k) => s + (swot[k] ? swot[k].split('\n').filter(Boolean).length : 0), 0);
    const qDone  = qs.filter(q => q.status === 'done').length;
    const hAdopt = hyp.filter(h => h.status === 'accepted').length;
    const qOpen  = qs.filter(q => q.status !== 'done').length;

    function cycleQStatus(q) {
      const cycle = { todo: 'wip', wip: 'done', done: 'todo' };
      const updated = proj.researchQuestions.map(x => x.id === q.id ? {...x, status: cycle[x.status]} : x);
      actions.updateProject({ id: proj.id, researchQuestions: updated });
    }
    function cycleHStatus(h) {
      const cycle = { todo: 'wip', wip: 'accepted', accepted: 'rejected', rejected: 'todo' };
      const updated = proj.hypotheses.map(x => x.id === h.id ? {...x, status: cycle[x.status]} : x);
      actions.updateProject({ id: proj.id, hypotheses: updated });
    }

    return (
      <div className="ck-center">
        {/* Header */}
        <div className="ck-header">
          <div>
            <div className="ck-h1">{proj.name || '프로젝트명 미입력'}</div>
            <div className="ck-h1-sub">{proj.address || '주소 미입력'}</div>
          </div>
          <span className={`st-pill ${proj.stage || 'planning'}`}>{STAGE_LABELS[proj.stage] || '기획 중'}</span>
        </div>

        {/* Project meta grid */}
        <div className="ck-meta">
          {[
            { l: '시행사', v: proj.developer || '—' },
            { l: '사업유형', v: TYPE_LABELS[proj.type] || proj.type || '—' },
            { l: '총세대', v: proj.totalUnits ? proj.totalUnits + '세대' : '—' },
            { l: '분양예정', v: proj.saleDate || '—' },
            { l: '시공사', v: proj.builder || '미정' },
            { l: '입주예정', v: proj.moveInDate || '—' },
          ].map((f, i) => (
            <div key={i} className="ck-mf">
              <span className="ck-ml">{f.l}</span>
              <span className="ck-mv">{f.v}</span>
            </div>
          ))}
        </div>

        {/* Pipeline */}
        <div className="ck-section-label">진행 파이프라인</div>
        <div className="pipe ck-pipe">
          {STAGE_COLS.map((st, i, a) => (
            <React.Fragment key={i}>
              <div className={'st' + (st.cur ? ' cur' : '') + (st.done ? ' done' : '')}>
                <div className="lbl"><span className="i"><Icon name={st.ic} size={11} /></span>{st.l}</div>
                <div className="bar"><i style={{ width: st.pct + '%' }} /></div>
                <div className="pct">{st.pct}%</div>
              </div>
              {i < a.length-1 && <div className="arr"><Icon name="chevR" size={16} /></div>}
            </React.Fragment>
          ))}
        </div>

        {/* KPI row */}
        <div className="ck-kpis">
          {[
            { k: '연구 질문', v: qs.length, sub: `완료 ${qDone}` },
            { k: '가설', v: hyp.length, sub: `채택 ${hAdopt}` },
            { k: '인사이트', v: ins.length, sub: `★3↑ ${ins.filter(i=>(i.star||3)>=3).length}` },
            { k: 'SWOT 항목', v: swotN, sub: 'S/W/O/T' },
            { k: '의사결정', v: dec.length, sub: '기록' },
            { k: '미해결 과제', v: qOpen, sub: '진행중+미착수' },
          ].map((k, i) => (
            <div key={i} className="ck-kpi">
              <div className="ck-kv">{k.v}</div>
              <div className="ck-kk">{k.k}</div>
              <div className="ck-ks">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* RQ + Hypotheses 2-col */}
        <div className="ck-2col">
          {/* Research Questions */}
          <div className="ck-col">
            <div className="ck-col-head">
              <Icon name="target" size={13} />
              <span>연구 질문</span>
              <span className="ck-cnt">{qs.length}</span>
              <span style={{ flex: 1 }} />
              <button className="icon-btn-sm" onClick={() => {
                const text = prompt('연구 질문:');
                if (text) actions.updateProject({ id: proj.id, researchQuestions: [...qs, { id: 'rq_'+Date.now(), order: qs.length+1, text, status: 'todo', priority: 'Med', assignee: '' }] });
              }}><Icon name="plus" size={11} /></button>
            </div>
            <div className="ck-list">
              {qs.map(q => (
                <div key={q.id} className="ck-row">
                  <PriBadge p={q.priority} />
                  <span className="ck-row-text">{q.text}</span>
                  <StatusChip s={q.status} onClick={() => cycleQStatus(q)} />
                </div>
              ))}
              {qs.length === 0 && <div className="plan-empty">연구 질문이 없습니다.</div>}
            </div>
          </div>

          {/* Hypotheses */}
          <div className="ck-col">
            <div className="ck-col-head">
              <Icon name="flag" size={13} />
              <span>가설</span>
              <span className="ck-cnt">{hyp.length}</span>
              <span style={{ flex: 1 }} />
              <button className="icon-btn-sm" onClick={() => {
                const text = prompt('가설:');
                if (text) actions.updateProject({ id: proj.id, hypotheses: [...hyp, { id: 'hyp_'+Date.now(), text, status: 'todo' }] });
              }}><Icon name="plus" size={11} /></button>
            </div>
            <div className="ck-list">
              {hyp.map(h => (
                <div key={h.id} className="ck-row">
                  <StatusChip s={h.status} onClick={() => cycleHStatus(h)} />
                  <span className="ck-row-text">{h.text}</span>
                </div>
              ))}
              {hyp.length === 0 && <div className="plan-empty">가설이 없습니다.</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Right panel ──────────────────────────────────────────── */
  function CockpitRight({ proj }) {
    const ins = proj.insights || [];
    const dec = proj.decisions || [];
    return (
      <div className="ck-right">
        {/* Insights */}
        <div className="ck-panel-head">
          <Icon name="bulb" size={13} />
          <span>인사이트</span>
          <span className="ck-cnt">{ins.length}</span>
          <span style={{ flex: 1 }} />
          <button className="icon-btn-sm" onClick={() => { actions.setPlanView('docs'); actions.setPlanPage('insight'); }}>
            <Icon name="chevR" size={11} />
          </button>
        </div>
        <div className="ck-insp">
          {[...ins].reverse().slice(0, 5).map(i => (
            <div key={i.id} className="ck-ins-card">
              <div className="ck-ins-title">{i.title || i.text || ''}</div>
              {(i.body) && <div className="ck-ins-body">{i.body.slice(0,80)}{i.body.length>80?'…':''}</div>}
              <div className="ck-ins-foot">
                {i.tag && <span className="htag">#{i.tag}</span>}
                <span style={{flex:1}}/>
                <span style={{ fontSize: 11, color: 'var(--accent-hi)', letterSpacing: 0 }}>
                  {'★'.repeat(i.star||3)}
                </span>
              </div>
            </div>
          ))}
          {ins.length === 0 && <div className="plan-empty">인사이트 없음</div>}
        </div>

        {/* Decisions */}
        <div className="ck-panel-head" style={{ marginTop: 16 }}>
          <Icon name="doc" size={13} />
          <span>의사결정 로그</span>
          <span className="ck-cnt">{dec.length}</span>
          <span style={{ flex: 1 }} />
          <button className="icon-btn-sm" onClick={() => { actions.setPlanView('docs'); actions.setPlanPage('decision'); }}>
            <Icon name="chevR" size={11} />
          </button>
        </div>
        <div className="ck-insp">
          {[...dec].reverse().slice(0, 4).map(d => (
            <div key={d.id} className="ck-ins-card">
              <div className="ck-ins-title">{d.title}</div>
              {d.rationale && <div className="ck-ins-body">{d.rationale.slice(0,70)}{d.rationale.length>70?'…':''}</div>}
              <div className="ck-ins-foot">
                {d.tag && <span className="htag">#{d.tag}</span>}
                {d.createdAt && <span style={{ fontSize: 10, color: 'var(--tx-faint)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>{d.createdAt}</span>}
              </div>
            </div>
          ))}
          {dec.length === 0 && <div className="plan-empty">결정 로그 없음</div>}
        </div>
      </div>
    );
  }

  /* ── Root ─────────────────────────────────────────────────── */
  function CockpitView() {
    const projects = useStore(s => s.projects);
    const activeId = useStore(s => s.activeProjectId);
    const proj = projects.find(p => p.id === activeId) || projects[0] || {};

    return (
      <div className="ck-root">
        <CockpitNav proj={proj} />
        <CockpitCenter proj={proj} />
        <CockpitRight proj={proj} />
      </div>
    );
  }

  window.CockpitView = CockpitView;
})();
