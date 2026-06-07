/* Planning docs pages — render inside the docs (.page) area. Read/write PlanStore.
   window.Pages = { canvas, questions, hypotheses, swot, dashboard, insights, brief, ... } */
(function () {
  const Ic = window.Ic, Edit = window.Edit;
  const PS = window.PlanStore;
  const { useStore, actions: A, Q_LABEL, H_LABEL, H_CLASS } = PS;

  const DocHead = ({ icon, title, crumb }) => (
    <React.Fragment>
      <div className="crumb">래미안 송도 더퍼스트 / Planning Studio / {crumb}</div>
      <div className="h1"><span className="emoji">{Ic(icon, 22)}</span>{title}</div>
    </React.Fragment>
  );

  const QPill = ({ q }) => (
    <span className={'st-pill ' + q.st} style={{ cursor: 'pointer' }} title="클릭해 상태 변경 (미착수→조사중→완료)" onClick={() => A.cycleQ(q.id)}>{Q_LABEL[q.st]}</span>
  );
  const HPill = ({ h }) => (
    <span className={'st-pill ' + H_CLASS[h.st]} style={{ cursor: 'pointer' }} title="클릭해 상태 변경 (미검증→검증중→채택→기각)" onClick={() => A.cycleH(h.id)}>{H_LABEL[h.st]}</span>
  );

  // ---------------- Business Canvas ----------------
  function PageCanvas() {
    const canvas = useStore((s) => s.canvas);
    const links = useStore((s) => s.links);
    const questions = useStore((s) => s.questions);
    const qById = (id) => questions.find((q) => q.id === id);
    const filled = canvas.filter((c) => c.items.length).length;
    return (
      <div className="doc pg">
        <DocHead icon="grid" title="비즈니스 캔버스" crumb="Business Canvas" />
        <div className="props">
          <div className="pk">{Ic('target', 14)} 사업 유형</div><div>아파트 · 1,204세대</div>
          <div className="pk">{Ic('pin', 14)} 위치</div><div>인천 연수구 송도동</div>
          <div className="pk">{Ic('flag', 14)} 분양 예정</div><div>2026 Q4</div>
          <div className="pk">{Ic('check', 14)} 상태</div><div><span className="chip g" style={{ height: 20 }}>작성 {filled}/8</span></div>
        </div>
        <div className="callout">
          <span className="ci">{Ic('bulb', 16)}</span>
          <div><b>분양 사업 분석용 캔버스</b> — 항목을 클릭해 편집하고, <b>+ 항목</b>으로 추가하세요. 채운 내용은 SWOT·Report로 이어집니다.</div>
        </div>
        <div className="h2">캔버스 8 섹션</div>
        <div className="bcanvas">
          {canvas.map((c, i) => (
            <div key={i} className="bc">
              <div className="bk">{c.k}</div>
              <div className="bl">
                {c.items.map((t, j) => (
                  <div key={j} className="li">
                    <Edit value={t} onCommit={(v) => v ? A.setCanvasItem(i, j, v) : A.delCanvasItem(i, j)} />
                    <span className="del" onClick={() => A.delCanvasItem(i, j)} title="삭제">×</span>
                  </div>
                ))}
                <div className="additem" onClick={() => A.addCanvasItem(i)}>{Ic('plus', 12)} 항목</div>
              </div>
            </div>
          ))}
        </div>
        <div className="h2">연결된 연구 질문</div>
        {links.map((l, i) => {
          const q = qById(l.qid); if (!q) return null;
          return (
            <div key={i} className="qline">
              <span className={'cb' + (l.done ? ' done' : '')} style={{ cursor: 'pointer' }} onClick={() => A.toggleLink(l.qid)}>
                {l.done && <span style={{ color: 'var(--on-accent)', display: 'grid', placeItems: 'center' }}>{Ic('check', 12)}</span>}
              </span>
              <span style={{ flex: 1, textDecoration: l.done ? 'line-through' : 'none', color: l.done ? 'var(--tx-faint)' : 'var(--tx-hi)' }}>{q.t}</span>
              <span className="htag" style={{ cursor: 'pointer' }} onClick={() => A.setPage('questions')}>→ Research Q</span>
            </div>
          );
        })}
      </div>
    );
  }

  // ---------------- Research Questions ----------------
  function PageQuestions() {
    const questions = useStore((s) => s.questions);
    const done = questions.filter((q) => q.st === 'done').length;
    const doing = questions.filter((q) => q.st === 'doing').length;
    return (
      <div className="doc pg">
        <DocHead icon="target" title="연구 질문 빌더" crumb="연구 질문" />
        <div className="statline">
          <span className="stat"><b>{questions.length}</b> 질문</span>
          <span className="stat"><b style={{ color: 'var(--accent-hi)' }}>{done}</b> 완료</span>
          <span className="stat"><b style={{ color: 'var(--swot-t)' }}>{doing}</b> 조사중</span>
          <span className="sp" style={{ flex: 1 }}></span>
          <span className="muted" style={{ fontSize: 11 }}>상태·우선순위 칩을 클릭해 변경</span>
        </div>
        <div className="qbuild">
          {questions.map((q, i) => (
            <div key={q.id} className="qb">
              <span className="qbn">Q{i + 1}</span>
              <span className={'pri ' + q.p} style={{ cursor: 'pointer' }} title="우선순위 변경" onClick={() => A.cycleQPri(q.id)}>{q.p.toUpperCase()}</span>
              <div className="qbmain">
                <Edit className="qbt" value={q.t} onCommit={(v) => A.setQText(q.id, v)} />
                <div className="qbm">{q.m}</div>
              </div>
              <QPill q={q} />
              <span className="ava" style={{ width: 24, height: 24, fontSize: 10 }}>{q.who}</span>
              <span className="del" onClick={() => A.delQ(q.id)} title="삭제">×</span>
            </div>
          ))}
        </div>
        <div className="addrow" onClick={A.addQ}>{Ic('plus', 15)} 연구 질문 추가</div>
      </div>
    );
  }

  // ---------------- Hypotheses ----------------
  function PageHypotheses() {
    const hyp = useStore((s) => s.hypotheses);
    const adopt = hyp.filter((h) => h.st === 'adopt').length;
    const testing = hyp.filter((h) => h.st === 'testing').length;
    return (
      <div className="doc pg">
        <DocHead icon="flag" title="가설 매니저" crumb="가설 관리" />
        <div className="statline">
          <span className="stat"><b>{hyp.length}</b> 가설</span>
          <span className="stat"><b style={{ color: 'var(--pos)' }}>{adopt}</b> 채택</span>
          <span className="stat"><b style={{ color: 'var(--swot-t)' }}>{testing}</b> 검증중</span>
          <span className="sp" style={{ flex: 1 }}></span>
          <span className="muted" style={{ fontSize: 11 }}>분석 결과를 연결하고 상태를 검증</span>
        </div>
        <div className="qbuild">
          {hyp.map((h) => (
            <div key={h.id} className="qb">
              <span style={{ color: 'var(--tx-faint)', display: 'flex' }}>{Ic('flag', 16)}</span>
              <div className="qbmain">
                <Edit className="qbt" value={h.t} onCommit={(v) => A.setHText(h.id, v)} />
                <div className="qbm">{Ic('link', 11)} {h.m}</div>
              </div>
              <HPill h={h} />
              <span className="del" onClick={() => A.delH(h.id)} title="삭제">×</span>
            </div>
          ))}
        </div>
        <div className="addrow" onClick={A.addH}>{Ic('plus', 15)} 가설 추가</div>
      </div>
    );
  }

  // ---------------- SWOT ----------------
  function PageSWOT() {
    const swot = useStore((s) => s.swot);
    const QUAD = [
      { k: 'S', l: '강점 · Strength', c: 'var(--swot-s)', tx: 'oklch(0.24 0.03 150)' },
      { k: 'W', l: '약점 · Weakness', c: 'var(--swot-w)', tx: '#fff' },
      { k: 'O', l: '기회 · Opportunity', c: 'var(--swot-o)', tx: 'oklch(0.24 0.03 235)' },
      { k: 'T', l: '위협 · Threat', c: 'var(--swot-t)', tx: 'oklch(0.24 0.03 75)' },
    ];
    return (
      <div className="doc pg">
        <DocHead icon="swot" title="SWOT 분석" crumb="SWOT" />
        <div className="callout"><span className="ci">{Ic('bulb', 16)}</span><div>각 사분면에 항목을 추가·편집하세요. 캔버스·인사이트·차트에서 끌어온 근거를 정리하는 공간입니다.</div></div>
        <div className="swotgrid">
          {QUAD.map((qd) => (
            <div key={qd.k} className="swotq" style={{ background: qd.c }}>
              <div className="sqh" style={{ color: qd.tx }}><b>{qd.k}</b> · {qd.l}<span className="sp" style={{ flex: 1 }}></span><span className="sqn" style={{ color: qd.tx }}>{swot[qd.k].length}</span></div>
              {swot[qd.k].map((item, i) => (
                <div key={i} className="sqi" style={{ color: qd.tx, borderTopColor: qd.k === 'W' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)' }}>
                  <Edit value={item} onCommit={(v) => v ? A.setSwot(qd.k, i, v) : A.delSwot(qd.k, i)} style={{ flex: 1 }} />
                  <span className="del" style={{ color: qd.tx, opacity: 0.6 }} onClick={() => A.delSwot(qd.k, i)} title="삭제">×</span>
                </div>
              ))}
              <div className="sqadd" style={{ color: qd.tx, borderTopColor: qd.k === 'W' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)' }} onClick={() => A.addSwot(qd.k)}>{Ic('plus', 13)} 항목 추가</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------- Planning Dashboard (compact) ----------------
  function PageDashboard() {
    const s = useStore((x) => x);
    const qDone = s.questions.filter((q) => q.st === 'done').length;
    const hAdopt = s.hypotheses.filter((h) => h.st === 'adopt').length;
    const swotN = s.swot.S.length + s.swot.W.length + s.swot.O.length + s.swot.T.length;
    const KPI = [
      { k: '연구 질문', v: s.questions.length, sub: '완료 ' + qDone, hl: true, page: 'questions' },
      { k: '가설', v: s.hypotheses.length, sub: '채택 ' + hAdopt, hl: true, page: 'hypotheses' },
      { k: 'SWOT 항목', v: swotN, sub: 'S' + s.swot.S.length + ' W' + s.swot.W.length + ' O' + s.swot.O.length + ' T' + s.swot.T.length, page: 'swot' },
      { k: '인사이트', v: s.insights.length, sub: '★3 이상 ' + s.insights.filter((i) => i.star >= 3).length, page: 'canvas' },
    ];
    return (
      <div className="doc pg">
        <DocHead icon="grid" title="Planning 대시보드" crumb="Planning 대시보드" />
        <div className="pipe" style={{ marginBottom: 20 }}>
          {[{ ic: 'planning', l: 'Planning', pct: 48, cur: true }, { ic: 'api', l: 'Data', pct: 70, done: true }, { ic: 'analysis', l: 'Analysis', pct: 35 }, { ic: 'bulb', l: 'Insight', pct: 20 }, { ic: 'report', l: 'Report', pct: 5 }].map((st, i, a) => (
            <React.Fragment key={i}>
              <div className={'st' + (st.cur ? ' cur' : '') + (st.done ? ' done' : '')}>
                <div className="lbl"><span className="i">{Ic(st.ic, 12)}</span>{st.l}</div>
                <div className="bar"><i style={{ width: st.pct + '%' }}></i></div>
                <div className="pct">{st.pct}%</div>
              </div>
              {i < a.length - 1 && <div className="arr">{Ic('arrow', 16)}</div>}
            </React.Fragment>
          ))}
        </div>
        <div className="dashkpis">
          {KPI.map((k, i) => (
            <div key={i} className={'kpi' + (k.hl ? ' hl' : '')} style={{ cursor: 'pointer' }} onClick={() => A.setPage(k.page)}>
              <div className="k">{k.k}</div><div className="v">{k.v}</div><div className="s">{k.sub}</div>
            </div>
          ))}
        </div>
        <div className="h2">바로가기</div>
        <div className="qline" onClick={() => A.setPage('questions')} style={{ cursor: 'pointer' }}><span style={{ color: 'var(--accent-hi)' }}>{Ic('target', 15)}</span><span style={{ flex: 1 }}>연구 질문 빌더</span><span className="htag">열기 →</span></div>
        <div className="qline" onClick={() => A.setPage('hypotheses')} style={{ cursor: 'pointer' }}><span style={{ color: 'var(--accent-hi)' }}>{Ic('flag', 15)}</span><span style={{ flex: 1 }}>가설 매니저</span><span className="htag">열기 →</span></div>
        <div className="qline" onClick={() => A.setPage('swot')} style={{ cursor: 'pointer' }}><span style={{ color: 'var(--accent-hi)' }}>{Ic('swot', 15)}</span><span style={{ flex: 1 }}>SWOT 분석</span><span className="htag">열기 →</span></div>
      </div>
    );
  }

  // ---------------- Insights list ----------------
  function PageInsights() {
    const insights = useStore((s) => s.insights);
    return (
      <div className="doc pg">
        <DocHead icon="bulb" title="인사이트 저장소" crumb="인사이트" />
        <div className="statline"><span className="stat"><b>{insights.length}</b> 인사이트</span><span className="sp" style={{ flex: 1 }}></span><span className="muted" style={{ fontSize: 11 }}>★ 클릭으로 중요도 조정 · Report Builder에서 재사용</span></div>
        <div className="inslist">
          {insights.map((c) => (
            <div key={c.id} className="insrow">
              <div style={{ flex: 1, minWidth: 0 }}>
                <Edit className="it" value={c.t} onCommit={(v) => A.setInsightField(c.id, 't', v)} />
                <div style={{ marginTop: 4 }}><Edit className="ib" value={c.b} onCommit={(v) => A.setInsightField(c.id, 'b', v)} /></div>
                <div style={{ marginTop: 7 }}>{c.tags.map((t, j) => <span key={j} className="htag" style={{ marginRight: 8 }}>{t}</span>)}</div>
              </div>
              <div className="starset">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} style={{ cursor: 'pointer', color: n <= c.star ? 'var(--accent-hi)' : 'var(--tx-faint)' }} onClick={() => A.setStar(c.id, n)}>★</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="addrow" onClick={A.addInsight}>{Ic('plus', 15)} 인사이트 추가</div>
      </div>
    );
  }

  // ---------------- Project Brief (doc form) ----------------
  function PageBrief() {
    const p = useStore((s) => s.project);
    const purposes = useStore((s) => s.purposes);
    const TYPES = ['아파트', '오피스텔', '상가', '지식산업센터', '생활숙박시설', '기타'];
    const F = (label, k, opts = {}) => (
      <div className="bff">
        <div className="bfl">{label}</div>
        <div className="bfv"><Edit value={p[k]} onCommit={(v) => A.setProject(k, v)} /></div>
      </div>
    );
    return (
      <div className="doc pg">
        <DocHead icon="doc" title="Project Brief" crumb="Project Brief" />
        <div className="callout"><span className="ci">{Ic('bulb', 16)}</span><div>여기 입력한 기본 정보는 <b>최근 프로젝트 카드</b>와 <b>보고서 표지</b>에 그대로 재사용됩니다. 값을 클릭해 편집하세요.</div></div>

        <div className="h2">기본 정보</div>
        <div className="bfgrid">
          {F('프로젝트명', 'name')}
          {F('사업지명', 'site')}
          {F('위치', 'loc')}
          {F('총 세대수', 'units')}
          {F('시행사', 'dev')}
          {F('시공사', 'cons')}
          {F('분양 예정 시기', 'when')}
        </div>

        <div className="h2">사업 유형</div>
        <div className="bchips">
          {TYPES.map((t) => (
            <div key={t} className={'bchip' + (p.type === t ? ' on' : '')} onClick={() => A.setType(t)}>
              {p.type === t && <span style={{ display: 'flex' }}>{Ic('check', 13)}</span>}{t}
            </div>
          ))}
        </div>

        <div className="h2">분석 목적</div>
        <div className="bchips">
          {Object.keys(purposes).map((k) => (
            <div key={k} className={'bchip' + (purposes[k] ? ' on' : '')} onClick={() => A.togglePurpose(k)}>
              <span className={'cbx' + (purposes[k] ? ' on' : '')}>{purposes[k] && Ic('check', 11)}</span>{k}
            </div>
          ))}
        </div>

        <div className="h2">프로젝트 설명</div>
        <div className="bfarea"><Edit value={p.desc} onCommit={(v) => A.setProject('desc', v)} /></div>
      </div>
    );
  }

  // ---------------- Mind Map ----------------
  function PageMindMap() {
    const nodes = useStore((s) => s.mindmap);
    const rootX = 20, rootY = 232, childX = 280, gapY = 64, topY = 30;
    return (
      <div className="doc pg">
        <DocHead icon="node" title="Mind Map" crumb="Mind Map" />
        <div className="callout"><span className="ci">{Ic('bulb', 16)}</span><div>프로젝트를 7개 축으로 구조화한 정보 허브. 노드를 클릭하면 해당 분석 페이지로 이동합니다.</div></div>
        <div className="mmbox" style={{ height: topY + nodes.length * gapY + 20 }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {nodes.map((n, i) => {
              const y = topY + i * gapY + 16;
              return <path key={i} d={`M${rootX + 130} ${rootY + 16} C ${rootX + 200} ${rootY + 16}, ${childX - 46} ${y}, ${childX} ${y}`} fill="none" stroke="var(--accent-line)" strokeWidth="1.6" />;
            })}
          </svg>
          <div className="mmroot" style={{ left: rootX, top: rootY }}>{Ic('pin', 14)} 송도 더퍼스트</div>
          {nodes.map((n, i) => (
            <div key={i} className="mmnode" style={{ left: childX, top: topY + i * gapY }} onClick={() => A.setPage(n.page)} title="페이지로 이동">
              <span className="d" style={{ background: n.c }}></span>{n.t}
              <span className="mmgo">{Ic('arrow', 13)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------- Decision Log ----------------
  function PageDecisions() {
    const decisions = useStore((s) => s.decisions);
    return (
      <div className="doc pg">
        <DocHead icon="doc" title="의사결정 로그" crumb="의사결정 로그" />
        <div className="statline"><span className="stat"><b>{decisions.length}</b> 건</span><span className="sp" style={{ flex: 1 }}></span><span className="muted" style={{ fontSize: 11 }}>날짜·작성자·결정·근거 — 회고와 보고서에 활용</span></div>
        <div className="declist">
          {decisions.map((d) => (
            <div key={d.id} className="decard">
              <div className="dechead">
                <span className="decdate mono">{d.date}</span>
                <span className="decwho">{d.who}</span>
                <span className="htag">#{d.tag}</span>
                <span className="sp" style={{ flex: 1 }}></span>
                <span className="del" onClick={() => A.delDecision(d.id)} title="삭제">×</span>
              </div>
              <div className="decwhat"><Edit value={d.what} onCommit={(v) => A.setDecisionField(d.id, 'what', v)} /></div>
              <div className="decwhy"><span className="decwl">근거</span><Edit value={d.why} onCommit={(v) => A.setDecisionField(d.id, 'why', v)} style={{ flex: 1 }} /></div>
            </div>
          ))}
        </div>
        <div className="addrow" onClick={A.addDecision}>{Ic('plus', 15)} 의사결정 기록</div>
      </div>
    );
  }

  // ---------------- Sources / References ----------------
  function PageRefs() {
    const sources = useStore((s) => s.sources);
    const TRUST_C = { A: 'tA', B: 'tB', C: 'tC' };
    return (
      <div className="doc pg">
        <DocHead icon="search" title="출처 · 레퍼런스" crumb="출처 · 레퍼런스" />
        <div className="statline"><span className="stat"><b>{sources.length}</b> 출처</span><span className="stat"><b style={{ color: 'var(--pos)' }}>{sources.filter((s) => s.trust === 'A').length}</b> 신뢰도 A</span><span className="sp" style={{ flex: 1 }}></span><span className="muted" style={{ fontSize: 11 }}>신뢰도·유형 배지를 클릭해 변경</span></div>
        <div className="srctable">
          <div className="srch">
            <div>출처 / URL</div><div>유형</div><div>조사일</div><div>담당</div><div>신뢰도</div><div></div>
          </div>
          {sources.map((s) => (
            <div key={s.id} className="srcrow">
              <div className="srcmain">
                <Edit className="srctitle" value={s.title} onCommit={(v) => A.setSourceField(s.id, 'title', v)} />
                <div className="srcurl mono">{Ic('link', 11)} <Edit value={s.url || '—'} onCommit={(v) => A.setSourceField(s.id, 'url', v)} /></div>
              </div>
              <div><span className="srctype" onClick={() => A.cycleSourceType(s.id)} title="유형 변경">{s.type}</span></div>
              <div className="mono srcsm">{s.date}</div>
              <div className="srcsm">{s.who}</div>
              <div><span className={'trust ' + TRUST_C[s.trust]} onClick={() => A.cycleTrust(s.id)} title="신뢰도 변경 (A→B→C)">{s.trust}</span></div>
              <div><span className="del" onClick={() => A.delSource(s.id)} title="삭제">×</span></div>
            </div>
          ))}
        </div>
        <div className="addrow" onClick={A.addSource}>{Ic('plus', 15)} 출처 추가</div>
      </div>
    );
  }

  // ---------------- Report Builder ----------------
  function PageReport() {
    const report = useStore((s) => s.report);
    const insights = useStore((s) => s.insights);
    const insById = (id) => insights.find((x) => x.id === id);
    const filled = report.filter((r) => r.memo.trim()).length;
    const BICON = { insight: 'bulb', chart: 'chart', table: 'table', map: 'map' };
    const BLABEL = { insight: '인사이트', chart: '차트', table: '표', map: '지도' };
    return (
      <div className="doc pg rpt">
        <DocHead icon="report" title="Report Builder" crumb="보고서" />
        <div className="rpttool">
          <span className="chip g">해석 메모 {filled}/8</span>
          <span className="sp" style={{ flex: 1 }}></span>
          <span className="rptexp">{Ic('export', 14)} Markdown</span>
          <span className="rptexp">{Ic('export', 14)} HTML</span>
          <span className="rptexp pri">{Ic('report', 14)} PDF 미리보기</span>
        </div>
        <div className="callout"><span className="ci">{Ic('bulb', 16)}</span><div>시장조사 보고서 8개 섹션 템플릿. 각 섹션에 <b>차트·표·인사이트</b>를 삽입하고 <b>해석 메모</b>를 직접 작성하면 보고서 초안이 됩니다. 자동 문구는 제안일 뿐, 최종 판단은 직접.</div></div>
        <div className="rptsecs">
          {report.map((r, i) => (
            <div key={r.id} className="rptsec">
              <div className="rsh">
                <span className="rsnum">{i + 1}</span>
                <span className="rstitle">{r.title}</span>
                <span className="sp" style={{ flex: 1 }}></span>
                {r.memo.trim() ? <span className="rsbadge ok">{Ic('check', 11)} 작성</span> : <span className="rsbadge no">빈 섹션</span>}
              </div>
              {r.blocks.length > 0 && (
                <div className="rblocks">
                  {r.blocks.map((b, j) => (
                    <span key={j} className={'rblock ' + b.type}>
                      {Ic(BICON[b.type], 13)}
                      <span className="rbl">{b.type === 'insight' ? (insById(b.ref) ? insById(b.ref).t : '인사이트') : b.label}</span>
                      <span className="rbt">{BLABEL[b.type]}</span>
                      <span className="del" onClick={() => A.delReportBlock(r.id, j)} title="제거">×</span>
                    </span>
                  ))}
                </div>
              )}
              <div className="rbadds">
                <span className="rbadd" onClick={() => A.addReportInsight(r.id)}>{Ic('bulb', 13)} 인사이트 삽입</span>
                <span className="rbadd dis">{Ic('chart', 13)} 차트</span>
                <span className="rbadd dis">{Ic('table', 13)} 표</span>
              </div>
              <div className="rmemo">
                <div className="rmlbl">{Ic('doc', 12)} 해석 메모</div>
                <Edit className="rmtext" value={r.memo} onCommit={(v) => A.setReportMemo(r.id, v)} placeholder="이 섹션의 해석을 직접 작성하세요…" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------- simple stubs ----------------
  const Stub = (icon, title, crumb, note) => function () {
    return (
      <div className="doc pg">
        <DocHead icon={icon} title={title} crumb={crumb} />
        <div className="callout"><span className="ci">{Ic('bulb', 16)}</span><div>{note}</div></div>
        <div className="stubbox">{Ic(icon, 30)}<div>이 페이지는 다음 단계에서 설계합니다.</div></div>
      </div>
    );
  };

  window.Pages = {
    canvas: PageCanvas,
    questions: PageQuestions,
    hypotheses: PageHypotheses,
    swot: PageSWOT,
    dashboard: PageDashboard,
    insights: PageInsights,
    brief: PageBrief,
    mindmap: PageMindMap,
    decisions: PageDecisions,
    refs: PageRefs,
    report: PageReport,
  };
})();
