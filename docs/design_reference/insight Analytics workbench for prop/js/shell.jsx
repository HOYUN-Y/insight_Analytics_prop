/* Shared app chrome: topbar + left rail. window.Shell, window.RAIL */
(function () {
  const Ic = window.Ic;

  const RAIL = [
    { id: 'planning', label: 'Plan', icon: 'planning' },
    { id: 'api',      label: 'Hub',  icon: 'api' },
    { id: 'data',     label: 'Data', icon: 'data' },
    { id: 'clean',    label: 'Clean', icon: 'clean' },
    { id: 'analysis', label: 'Study', icon: 'analysis' },
    { id: 'chart',    label: 'Chart', icon: 'chart' },
    { id: 'map',      label: 'Map',  icon: 'map' },
    { id: 'report',   label: 'Report', icon: 'report' },
  ];

  function Wordmark() {
    return (
      <span className="wm">
        <span className="i">in</span><span className="s">sight</span>{' '}
        <span className="a">Analytics</span>{' '}
        <span className="p">Prop</span>
      </span>
    );
  }

  function Topbar({ ctxName, ctxSub, view, setView }) {
    const VIEWS = [['docs', '문서', 'doc'], ['dash', '대시보드', 'grid'], ['board', '보드', 'node']];
    return (
      <div className="tb">
        <div className="mk" style={{ color: '#fff' }}>{Ic('analysis', 16)}</div>
        <Wordmark />
        <div className="ctx">
          <span style={{ color: 'var(--tx-faint)' }}>{Ic('chevron', 14)}</span>
          <div>
            <div className="nm">{ctxName || '래미안 송도 더퍼스트'}</div>
            <div className="sub">{ctxSub || '인천 연수구 송도동 · 아파트 1,204세대'}</div>
          </div>
        </div>
        {view && (
          <div className="vsw">
            {VIEWS.map(([k, l, ic]) => (
              <div key={k} className={'vb' + (view === k ? ' on' : '')} onClick={() => setView && setView(k)}>{Ic(ic, 14)}{l}</div>
            ))}
          </div>
        )}
        <div className="sp"></div>
        <div className="act">{Ic('save', 15)} 저장</div>
        <div className="act">{Ic('import', 15)} 가져오기</div>
        <div className="act pri">{Ic('export', 15)} 보고서</div>
        <div className="ico">{Ic('sliders', 16)}</div>
        <div className="ico">{Ic('sun', 16)}</div>
        <div className="ava">JP</div>
      </div>
    );
  }

  function Rail({ active, onNav }) {
    return (
      <div className="rail">
        {RAIL.map(r => (
          <div key={r.id} className={'ri' + (r.id === active ? ' on' : '')} onClick={() => onNav && onNav(r.id)} style={{ cursor: onNav ? 'pointer' : 'default' }}>
            {Ic(r.icon, 18)}<span>{r.label}</span>
          </div>
        ))}
        <div className="gap"></div>
        <div className="ri">{Ic('search', 18)}<span>Refs</span></div>
      </div>
    );
  }

  function Statusbar({ items }) {
    const st = window.PlanStore ? window.PlanStore.useStore((s) => s) : null;
    const def = st
      ? ['● 로컬 저장', 'Planning Studio', '연구질문 ' + st.questions.length + ' · 가설 ' + st.hypotheses.length, '인사이트 ' + st.insights.length]
      : ['● 로컬 저장', 'Planning Studio', '연구질문 6 · 가설 4', '인사이트 12'];
    return (
      <div className="sb">
        {(items || def).map((t, i) => <span key={i}>{t}</span>)}
        <span className="sp"></span>
        <span>연두 ACCENT</span><span>KO · UTF-8</span>
      </div>
    );
  }

  function Shell({ active, ctxName, ctxSub, view, setView, onNav, children }) {
    return (
      <div className="app">
        <Topbar ctxName={ctxName} ctxSub={ctxSub} view={view} setView={setView} />
        <div className="body">
          <Rail active={active} onNav={onNav} />
          {children}
        </div>
        <Statusbar />
      </div>
    );
  }

  Object.assign(window, { Shell, RAIL, Statusbar });
})();
