/* Cockpit view (A) — workbench 3-panel dashboard, live from PlanStore. */
(function () {
  const Ic = window.Ic;
  const { useStore, actions: A, Q_LABEL, H_LABEL, H_CLASS } = window.PlanStore;

  const TREE = [
    { g: '기획 (Planning)' },
    { ic: 'doc', t: 'Project Brief' },
    { ic: 'grid', t: 'Business Canvas' },
    { ic: 'target', t: '연구 질문', n: 'q' },
    { ic: 'flag', t: '가설', n: 'h' },
    { ic: 'swot', t: 'SWOT' },
    { ic: 'node', t: 'Mind Map' },
    { ic: 'bulb', t: '인사이트', n: 'i' },
    { ic: 'doc', t: '의사결정 로그', n: '7' },
    { g: '자료 (Assets)' },
    { ic: 'data', t: '데이터셋', n: '8' },
    { ic: 'chart', t: '차트', n: '5' },
    { ic: 'map', t: '지도', n: '2' },
  ];

  function ABody() {
    const s = useStore((x) => x);
    const { questions, hypotheses, insights, swot } = s;
    const qDone = questions.filter((q) => q.st === 'done').length;
    const qDoing = questions.filter((q) => q.st === 'doing').length;
    const hAdopt = hypotheses.filter((h) => h.st === 'adopt').length;
    const hTesting = hypotheses.filter((h) => h.st === 'testing').length;
    const swotN = swot.S.length + swot.W.length + swot.O.length + swot.T.length;
    const counts = { q: questions.length, h: hypotheses.length, i: insights.length };

    return (
      <React.Fragment>
        {/* LEFT explorer */}
        <div className="panel" style={{ width: 244 }}>
          <div className="ph"><span className="t">프로젝트 구조</span><span className="sp"></span>{Ic('plus', 15)}</div>
          <div className="tree">
            {TREE.map((r, i) => r.g
              ? <div key={i} className="grp">{r.g}</div>
              : <div key={i} className="tw">{Ic(r.ic, 15)}<span>{r.t}</span><span className="sp"></span>{r.n && <span className="n">{counts[r.n] != null ? counts[r.n] : r.n}</span>}</div>
            )}
          </div>
        </div>

        {/* CENTER planning dashboard */}
        <div className="center">
          <div className="wsh">
            {Ic('planning', 17)}<h2>Planning Studio</h2>
            <span className="chip g">진행도 48%</span>
            <span className="sp" style={{ flex: 1 }}></span>
            <span className="muted" style={{ fontSize: 11 }}>상태 칩을 클릭해 변경</span>
          </div>
          <div className="scroll">
            {/* brief */}
            <div className="briefcard">
              <div className="meta">
                <div className="kv"><div className="k">사업지</div><div className="v">래미안 송도 더퍼스트</div></div>
                <div className="kv"><div className="k">유형</div><div className="v">아파트 · 1,204세대</div></div>
                <div className="kv"><div className="k">위치</div><div className="v">인천 연수구 송도동</div></div>
                <div className="kv"><div className="k">분양 예정</div><div className="v">2026 Q4</div></div>
                <div className="kv"><div className="k">시행</div><div className="v">송도개발(주)</div></div>
                <div className="kv"><div className="k">시공</div><div className="v">삼성물산</div></div>
                <div className="kv" style={{ gridColumn: 'span 2' }}><div className="k">분석 목적</div>
                  <div className="purp">
                    {Object.keys(s.purposes).filter((k) => s.purposes[k]).map((k) => <span key={k} className="chip g">{k}</span>)}
                  </div>
                </div>
              </div>
            </div>

            {/* pipeline */}
            <div className="pipe">
              {[
                { ic: 'planning', l: 'Planning', pct: 48, cur: true },
                { ic: 'api', l: 'Data Collection', pct: 70, done: true },
                { ic: 'analysis', l: 'Analysis', pct: 35 },
                { ic: 'bulb', l: 'Insight', pct: 20 },
                { ic: 'report', l: 'Report', pct: 5 },
              ].map((st, i, a) => (
                <React.Fragment key={i}>
                  <div className={'st' + (st.cur ? ' cur' : '') + (st.done ? ' done' : '')}>
                    <div className="lbl"><span className="i">{Ic(st.ic, 12)}</span>{st.l}</div>
                    <div className="bar"><i style={{ width: st.pct + '%' }}></i></div>
                    <div className="pct">{st.pct}% 완료</div>
                  </div>
                  {i < a.length - 1 && <div className="arr">{Ic('arrow', 16)}</div>}
                </React.Fragment>
              ))}
            </div>

            {/* KPIs */}
            <div className="kpis">
              {[
                { k: '프로젝트 목표', v: 3, s: '정의됨' },
                { k: '연구 질문', v: counts.q, s: '완료 ' + qDone + ' · 조사중 ' + qDoing, hl: true },
                { k: '가설', v: counts.h, s: '검증 ' + hTesting + ' · 채택 ' + hAdopt, hl: true },
                { k: '등록 인사이트', v: counts.i, s: '★3 이상 ' + insights.filter((x) => x.star >= 3).length },
                { k: 'SWOT 항목', v: swotN, s: 'S' + swot.S.length + ' W' + swot.W.length + ' O' + swot.O.length + ' T' + swot.T.length },
                { k: '미해결 과제', v: 5, s: '우선 P1 2건' },
              ].map((k, i) => (
                <div key={i} className={'kpi' + (k.hl ? ' hl' : '')}>
                  <div className="k">{k.k}</div><div className="v">{k.v}</div><div className="s">{k.s}</div>
                </div>
              ))}
            </div>

            {/* two lists */}
            <div className="cols2">
              <div className="lcard">
                <div className="lh">{Ic('target', 15)}<span className="t">연구 질문</span><span className="sp"></span><span className="muted" style={{ fontSize: 10 }}>상태 칩 클릭 → 변경</span></div>
                {questions.map((q, i) => (
                  <div key={q.id} className="qrow">
                    <span className="qn">Q{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}><div className="qt">{q.t}</div><div className="qm">{q.m}</div></div>
                    <span className={'pri ' + q.p} style={{ cursor: 'pointer' }} onClick={() => A.cycleQPri(q.id)} title="우선순위 변경">{q.p.toUpperCase()}</span>
                    <span className={'st-pill ' + q.st} style={{ cursor: 'pointer' }} onClick={() => A.cycleQ(q.id)} title="상태 변경">{Q_LABEL[q.st]}</span>
                    <span className="ava" style={{ width: 22, height: 22, fontSize: 9 }}>{q.who}</span>
                  </div>
                ))}
              </div>
              <div className="lcard">
                <div className="lh">{Ic('flag', 15)}<span className="t">가설 관리</span><span className="sp"></span><span className="muted" style={{ fontSize: 10 }}>상태 칩 클릭 → 변경</span></div>
                {hypotheses.map((h) => (
                  <div key={h.id} className="qrow">
                    <span style={{ color: 'var(--tx-faint)' }}>{Ic('flag', 14)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}><div className="qt">{h.t}</div><div className="qm">{Ic('link', 11)} {h.m}</div></div>
                    <span className={'st-pill ' + H_CLASS[h.st]} style={{ cursor: 'pointer' }} onClick={() => A.cycleH(h.id)} title="상태 변경">{H_LABEL[h.st]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT inspector */}
        <div className="panel r" style={{ width: 296 }}>
          <div className="ph"><span className="t">인사이트 저장소</span><span className="sp"></span><span className="chip" style={{ height: 18, fontSize: 10 }}>{insights.length}</span></div>
          <div className="insp">
            {insights.map((c) => (
              <div key={c.id} className="icard">
                <div className="it">{c.t}</div>
                <div className="ib">{c.b}</div>
                <div className="if">
                  {c.tags.map((t, j) => <span key={j} className="htag">{t}</span>)}
                  <span className="sp" style={{ flex: 1 }}></span>
                  <span className="star">{'★'.repeat(c.star)}<span style={{ color: 'var(--tx-faint)' }}>{'★'.repeat(5 - c.star)}</span></span>
                </div>
              </div>
            ))}
            <div className="btn" style={{ justifyContent: 'center', cursor: 'pointer' }} onClick={A.addInsight}>{Ic('plus', 14)} 인사이트 추가</div>
            <div className="ph" style={{ padding: '8px 2px', borderBottom: 'none' }}><span className="t">의사결정 로그</span></div>
            <div className="dlog">
              <div className="dt">분양가 평당 2,100만원 제안</div>
              <div className="dd">2026-06-05 · 박기획</div>
              <div className="dr">근거 — 경쟁단지 평균 2,040만 · 입지 우위(역세권) · 최근 실거래 상승세</div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
  function DraftA() { return (<window.Shell active="planning"><ABody /></window.Shell>); }
  Object.assign(window, { ABody, DraftA });
})();
