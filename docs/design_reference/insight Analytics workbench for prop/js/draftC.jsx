/* Docs view (C) — Notion-style Planning docs. Nav routes via PlanStore.page. */
(function () {
  const Ic = window.Ic;
  const { useStore, actions: A } = window.PlanStore;

  const NAV = [
    { s: '워크스페이스' },
    { ic: 'grid', t: 'Planning 대시보드', page: 'dashboard' },
    { ic: 'doc', t: 'Project Brief', page: 'brief' },
    { ic: 'grid', t: 'Business Canvas', page: 'canvas' },
    { ic: 'target', t: '연구 질문', page: 'questions', count: (s) => s.questions.length },
    { ic: 'flag', t: '가설 관리', page: 'hypotheses', count: (s) => s.hypotheses.length },
    { ic: 'swot', t: 'SWOT', page: 'swot' },
    { ic: 'node', t: 'Mind Map', page: 'mindmap' },
    { s: '기록' },
    { ic: 'bulb', t: '인사이트', page: 'insights', count: (s) => s.insights.length },
    { ic: 'doc', t: '의사결정 로그', page: 'decisions', n: '7' },
    { ic: 'search', t: '출처 · 레퍼런스', page: 'refs' },
    { s: '산출물' },
    { ic: 'report', t: 'Report Builder', page: 'report' },
  ];

  function CBody() {
    const page = useStore((s) => s.page);
    const state = useStore((s) => s);
    const insights = state.insights;
    const Page = window.Pages[page] || window.Pages.canvas;
    return (
      <div className="center dC">
        {/* nav */}
        <div className="nav">
          {NAV.map((r, i) => r.s
            ? <div key={i} className="nsec">{r.s}</div>
            : (
              <div key={i} className={'nv' + (r.page === page ? ' on' : '')} onClick={() => A.setPage(r.page)} style={{ cursor: 'pointer' }}>
                {Ic(r.ic, 15)}<span>{r.t}</span><span className="sp"></span>
                {(r.count || r.n) && <span className="n">{r.count ? r.count(state) : r.n}</span>}
              </div>
            )
          )}
          <div className="sp" style={{ flex: 1 }}></div>
          <div className="nv" style={{ cursor: 'pointer' }}>{Ic('plus', 15)}<span>새 페이지</span></div>
        </div>

        {/* page area */}
        <div className="page"><Page /></div>

        {/* right insight rail */}
        <div className="panel r" style={{ width: 264 }}>
          <div className="ph"><span className="t">연결 인사이트</span><span className="sp"></span><span className="chip" style={{ height: 18, fontSize: 10 }}>{insights.length}</span></div>
          <div className="insp">
            {insights.slice(0, 3).map((c) => (
              <div key={c.id} className="icard" onClick={() => A.setPage('insights')} style={{ cursor: 'pointer' }}>
                <div className="it">{c.t}</div>
                <div className="ib">{c.b}</div>
                <div className="if">
                  {c.tags.map((t, j) => <span key={j} className="htag">{t}</span>)}
                  <span className="sp" style={{ flex: 1 }}></span>
                  <span className="star">{'★'.repeat(c.star)}<span style={{ color: 'var(--tx-faint)' }}>{'★'.repeat(5 - c.star)}</span></span>
                </div>
              </div>
            ))}
            <div className="btn" style={{ justifyContent: 'center', marginTop: 2, cursor: 'pointer' }} onClick={A.addInsight}>{Ic('plus', 14)} 인사이트 추가</div>
          </div>
        </div>
      </div>
    );
  }
  function DraftC() { return (<window.Shell active="planning"><CBody /></window.Shell>); }
  Object.assign(window, { CBody, DraftC });
})();
