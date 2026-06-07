/* Draft B — Planning Canvas (Miro/FigJam-style infinite board) */
(function () {
  const Ic = window.Ic;

  const MM = [
    { t: '가격', x: 250, y: 132, c: 'var(--accent)' },
    { t: '경쟁단지', x: 250, y: 226, c: 'var(--swot-o)' },
    { t: '입지', x: 250, y: 320, c: 'var(--dim-color)' },
    { t: '수요·인구', x: 250, y: 414, c: 'var(--swot-t)' },
    { t: '분양조건', x: 250, y: 508, c: 'var(--note-violet)' },
    { t: '마케팅', x: 250, y: 602, c: 'var(--pos)' },
    { t: '리스크', x: 250, y: 696, c: 'var(--neg)' },
  ];

  function BBody() {
    const rootX = 70, rootY = 400, childX = 250;
    return (
        <div className="center dB">
          {/* floating toolbar */}
          <div className="ctoolbar">
            <div className="tl on">{Ic('drag', 18)}</div>
            <div className="tl">{Ic('grid', 18)}</div>
            <div className="sep"></div>
            <div className="tl">{Ic('node', 18)}</div>
            <div className="tl">{Ic('swot', 18)}</div>
            <div className="tl">{Ic('arrow', 18)}</div>
            <div className="sep"></div>
            <div className="tl">{Ic('chart', 18)}</div>
            <div className="tl">{Ic('doc', 18)}</div>
            <div className="tl">{Ic('pin', 18)}</div>
          </div>

          <div className="cv">
            {/* edges */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {MM.map((n, i) => (
                <path key={i} d={`M${rootX + 96} ${rootY + 16} C ${rootX + 160} ${rootY + 16}, ${childX - 40} ${n.y + 16}, ${childX} ${n.y + 16}`}
                  fill="none" stroke="var(--accent-line)" strokeWidth="1.6" />
              ))}
              {/* connector: 가격 cluster -> SWOT S */}
              <path d="M395 148 C 520 148, 540 150, 596 150" fill="none" stroke="var(--line-strong)" strokeWidth="1.4" strokeDasharray="4 4" />
              <path d="M1010 250 C 1040 250, 1030 150, 1052 150" fill="none" stroke="var(--line-strong)" strokeWidth="1.4" strokeDasharray="4 4" />
            </svg>

            {/* mind map */}
            <div className="mnode root" style={{ left: rootX, top: rootY }}>{Ic('pin', 14)} 송도 더퍼스트</div>
            {MM.map((n, i) => (
              <div key={i} className="mnode" style={{ left: n.x, top: n.y }}>
                <span className="d" style={{ background: n.c }}></span>{n.t}
              </div>
            ))}
            <div className="cluster" style={{ left: 32, top: 96, width: 200, height: 660 }}>
              <span className="cl-lbl">MIND MAP · 프로젝트 구조</span>
            </div>

            {/* SWOT 2x2 */}
            <div className="cluster" style={{ left: 588, top: 110, width: 428, height: 320 }}>
              <span className="cl-lbl">SWOT</span>
            </div>
            <div className="swotcard" style={{ left: 596, top: 130, background: 'var(--swot-s)' }}>
              <div className="sh" style={{ color: 'oklch(0.2 0.03 150)' }}>S · 강점</div>
              <div className="si" style={{ color: 'oklch(0.24 0.03 150)', borderTopColor: 'rgba(0,0,0,0.12)' }}>역세권 (인천1호선 도보 5분)</div>
              <div className="si" style={{ color: 'oklch(0.24 0.03 150)', borderTopColor: 'rgba(0,0,0,0.12)' }}>삼성물산 브랜드</div>
              <div className="si" style={{ color: 'oklch(0.24 0.03 150)', borderTopColor: 'rgba(0,0,0,0.12)' }}>신축 · 대단지 1,204세대</div>
            </div>
            <div className="swotcard" style={{ left: 808, top: 130, background: 'var(--swot-w)' }}>
              <div className="sh" style={{ color: '#fff' }}>W · 약점</div>
              <div className="si" style={{ color: 'oklch(0.96 0.02 30)', borderTopColor: 'rgba(255,255,255,0.18)' }}>높은 분양가 (평당 2,100만)</div>
              <div className="si" style={{ color: 'oklch(0.96 0.02 30)', borderTopColor: 'rgba(255,255,255,0.18)' }}>학군 경쟁력 보통</div>
            </div>
            <div className="swotcard" style={{ left: 596, top: 290, background: 'var(--swot-o)' }}>
              <div className="sh" style={{ color: 'oklch(0.2 0.03 235)' }}>O · 기회</div>
              <div className="si" style={{ color: 'oklch(0.24 0.03 235)', borderTopColor: 'rgba(0,0,0,0.12)' }}>인근 GTX-B 개발계획</div>
              <div className="si" style={{ color: 'oklch(0.24 0.03 235)', borderTopColor: 'rgba(0,0,0,0.12)' }}>송도 바이오 클러스터 확장</div>
            </div>
            <div className="swotcard" style={{ left: 808, top: 290, background: 'var(--swot-t)' }}>
              <div className="sh" style={{ color: 'oklch(0.2 0.03 75)' }}>T · 위협</div>
              <div className="si" style={{ color: 'oklch(0.24 0.03 75)', borderTopColor: 'rgba(0,0,0,0.12)' }}>경쟁단지 공급 증가</div>
              <div className="si" style={{ color: 'oklch(0.24 0.03 75)', borderTopColor: 'rgba(0,0,0,0.12)' }}>금리·대출 규제</div>
            </div>

            {/* sticky notes */}
            <div className="note" style={{ left: 1052, top: 110, width: 256, background: 'var(--note-green)' }}>
              <div className="nh">💡 인사이트 · ★★★★★</div>
              신축성과 브랜드를 강조하면 경쟁단지 대비 차별화 가능. 제안서 핵심 메시지로 채택.
            </div>
            <div className="note" style={{ left: 1052, top: 250, width: 256, background: 'var(--note-amber)' }}>
              <div className="nh">🔬 가설 · 검증중</div>
              역세권일수록 가격 경쟁력 ↑
              <ul><li>Scatter Plot r = 0.71</li><li>경쟁단지 5곳 거리·가격</li></ul>
            </div>
            <div className="note" style={{ left: 1052, top: 408, width: 256, background: 'var(--note-blue)' }}>
              <div className="nh">📊 차트 연결</div>
              가격 포지셔닝 매트릭스 — 본 사업지 상단 우측(고가·고입지) 분포.
            </div>
            <div className="note" style={{ left: 1052, top: 540, width: 256, background: 'var(--note-pink)' }}>
              <div className="nh">⚠ 추가 조사 필요</div>
              30–40대 실수요 비중 / 전입 추세 데이터 보강.
            </div>

            {/* mini business-canvas note bottom */}
            <div className="note" style={{ left: 470, top: 470, width: 230, background: '#fff' }}>
              <div className="nh" style={{ opacity: 0.7 }}>🎯 타겟 고객</div>
              30–40대 실수요 · 송도 직주근접 · 자녀 1–2인 가구
            </div>
            <div className="note" style={{ left: 470, top: 600, width: 230, background: '#fff' }}>
              <div className="nh" style={{ opacity: 0.7 }}>📌 의사결정</div>
              분양가 평당 2,100만 제안 — 근거 3건 첨부
            </div>
          </div>
        </div>
    );
  }
  function DraftB() { return (<window.Shell active="planning"><BBody /></window.Shell>); }
  Object.assign(window, { BBody, DraftB });
})();
