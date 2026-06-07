/* insight Analytics Prop — Board View (보드 뷰)
   window.BoardView
*/
(function () {
  const { useStore, actions } = window.Store;
  const Icon = window.Icon;

  const SWOT_Q = [
    { k: 'S', l: '강점 · Strength',    bg: 'var(--swot-s)', tx: 'oklch(0.18 0.04 150)' },
    { k: 'W', l: '약점 · Weakness',    bg: 'var(--swot-w)', tx: '#fff' },
    { k: 'O', l: '기회 · Opportunity', bg: 'var(--swot-o)', tx: 'oklch(0.18 0.04 235)' },
    { k: 'T', l: '위협 · Threat',      bg: 'var(--swot-t)', tx: 'oklch(0.18 0.04 75)' },
  ];

  const MIND_NODES = [
    { id: 'root', label: '프로젝트 전략', x: 400, y: 280, root: true },
    { id: 'n1', label: '시장 분석',    x: 120, y: 120, cx: 260, cy: 190 },
    { id: 'n2', label: '경쟁 단지',    x: 100, y: 280, cx: 260, cy: 280 },
    { id: 'n3', label: '입지 강점',    x: 120, y: 440, cx: 260, cy: 370 },
    { id: 'n4', label: '분양가 전략',  x: 620, y: 120, cx: 540, cy: 190 },
    { id: 'n5', label: '타겟 수요층',  x: 640, y: 280, cx: 540, cy: 280 },
    { id: 'n6', label: '마케팅 포인트',x: 620, y: 440, cx: 540, cy: 370 },
    { id: 'n7', label: '리스크',       x: 390, y: 500, cx: 400, cy: 400 },
  ];

  function MindMap() {
    return (
      <div className="bv-widget bv-mindmap-widget">
        <div className="bv-widget-head">
          <Icon name="node" size={13} /><span>Mind Map</span>
        </div>
        <svg viewBox="0 0 760 560" className="bv-mindmap-svg" preserveAspectRatio="xMidYMid meet">
          {MIND_NODES.filter(n => !n.root).map(n => (
            <g key={n.id}>
              <line x1={400} y1={280} x2={n.cx} y2={n.cy}
                stroke="var(--accent-line)" strokeWidth="1.5" strokeDasharray="4 3" />
              <line x1={n.cx} y1={n.cy} x2={n.x + 55} y2={n.y + 14}
                stroke="var(--accent-line)" strokeWidth="1" />
            </g>
          ))}
          {/* Root node */}
          <rect x={325} y={255} width={150} height={50} rx={10}
            fill="var(--accent)" />
          <text x={400} y={286} textAnchor="middle" fill="var(--on-accent)"
            fontSize="13" fontWeight="700" fontFamily="var(--font-sans)">프로젝트 전략</text>
          {/* Leaf nodes */}
          {MIND_NODES.filter(n => !n.root).map(n => (
            <g key={n.id}>
              <rect x={n.x} y={n.y} width={110} height={28} rx={6}
                fill="var(--bg-2)" stroke="var(--line)" strokeWidth="1" />
              <text x={n.x + 55} y={n.y + 19} textAnchor="middle"
                fill="var(--tx-hi)" fontSize="11.5" fontFamily="var(--font-sans)">{n.label}</text>
            </g>
          ))}
        </svg>
      </div>
    );
  }

  function SwotWidget({ proj }) {
    const swot = proj.swot || {};
    return (
      <div className="bv-widget bv-swot-widget">
        <div className="bv-widget-head">
          <Icon name="swot" size={13} /><span>SWOT</span>
        </div>
        <div className="bv-swot-grid">
          {SWOT_Q.map(q => {
            const items = (swot[q.k] || '').split('\n').filter(Boolean);
            return (
              <div key={q.k} className="bv-sq" style={{ background: q.bg, color: q.tx }}>
                <div className="bv-sq-label">{q.l}</div>
                {items.map((it, i) => (
                  <div key={i} className="bv-sq-item">· {it}</div>
                ))}
                {items.length === 0 && <div className="bv-sq-empty">항목 없음</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function StickyNotes({ proj }) {
    const ins = (proj.insights || []).slice(0, 4);
    const dec = (proj.decisions || []).slice(0, 3);
    const COLORS = ['#2a3a2a', '#3a2a2a', '#2a2a3a', '#3a3020'];
    return (
      <div className="bv-stickies">
        <div className="bv-stickies-head">
          <Icon name="bulb" size={12} /><span>인사이트 & 결정</span>
        </div>
        {ins.map((i, idx) => (
          <div key={i.id} className="bv-sticky" style={{ borderLeft: '3px solid var(--accent)', background: COLORS[idx % COLORS.length] }}>
            <div className="bv-sticky-badge" style={{ color: 'var(--accent-hi)' }}>인사이트</div>
            <div className="bv-sticky-title">{i.title || i.text || ''}</div>
            {i.body && <div className="bv-sticky-body">{i.body.slice(0, 60)}{i.body.length > 60 ? '…' : ''}</div>}
          </div>
        ))}
        {dec.map(d => (
          <div key={d.id} className="bv-sticky" style={{ borderLeft: '3px solid var(--warn)' }}>
            <div className="bv-sticky-badge" style={{ color: 'var(--warn)' }}>결정</div>
            <div className="bv-sticky-title">{d.title}</div>
            {d.rationale && <div className="bv-sticky-body">{d.rationale.slice(0, 60)}{d.rationale.length > 60 ? '…' : ''}</div>}
          </div>
        ))}
        {ins.length === 0 && dec.length === 0 && (
          <div className="plan-empty" style={{ marginTop: 16 }}>인사이트나 결정 기록이 없습니다.</div>
        )}
        <button className="addrow" style={{ marginTop: 8 }}
          onClick={() => { actions.setPlanView('docs'); actions.setPlanPage('insight'); }}>
          <Icon name="bulb" size={12} /> 인사이트 보기
        </button>
      </div>
    );
  }

  function BoardView() {
    const projects = useStore(s => s.projects);
    const activeId = useStore(s => s.activeProjectId);
    const proj = projects.find(p => p.id === activeId) || projects[0] || {};

    return (
      <div className="bv-root">
        <div className="bv-canvas">
          <div className="bv-canvas-inner">
            <MindMap />
            <SwotWidget proj={proj} />
            <StickyNotes proj={proj} />
          </div>
        </div>
      </div>
    );
  }

  window.BoardView = BoardView;
})();
