/* Shared Planning Studio store — in-memory, cross-view reactive.
   window.PlanStore = { useStore, getState, setState, actions, Q_*, H_* }
   window.Edit = inline-editable text span */
(function () {
  let uid = 100;
  const nid = (p) => p + (++uid);

  // status orders + labels --------------------------------------------------
  const Q_ORDER = ['todo', 'doing', 'done'];
  const Q_LABEL = { todo: '미착수', doing: '조사중', done: '완료' };
  const H_ORDER = ['untested', 'testing', 'adopt', 'reject'];
  const H_LABEL = { untested: '미검증', testing: '검증중', adopt: '채택', reject: '기각' };
  const H_CLASS = { untested: 'todo', testing: 'doing', adopt: 'adopt', reject: 'reject' };
  const P_ORDER = ['p1', 'p2', 'p3'];

  const initial = {
    page: 'canvas',
    questions: [
      { id: 'q1', t: '적정 분양가는 평당 얼마인가?', m: '가격 분석 · 경쟁단지 5곳', st: 'doing', p: 'p1', who: 'JP' },
      { id: 'q2', t: '주 수요층은 누구인가?', m: '수요/인구 분석 · 반경 3km', st: 'doing', p: 'p2', who: '민' },
      { id: 'q3', t: '경쟁단지 대비 강점은 무엇인가?', m: 'Radar · 입지 비교', st: 'done', p: 'p1', who: 'JP' },
      { id: 'q4', t: '어떤 마케팅 포인트를 강조할까?', m: '미착수', st: 'todo', p: 'p2', who: '—' },
      { id: 'q5', t: '분양 시기는 적절한가?', m: '시장 동향 · 청약경쟁률', st: 'todo', p: 'p3', who: '연' },
    ],
    hypotheses: [
      { id: 'h1', t: '역세권일수록 가격 경쟁력이 높다', m: 'Scatter · r = 0.71', st: 'adopt' },
      { id: 'h2', t: '신축일수록 청약경쟁률이 높다', m: '연식별 비교 검증중', st: 'testing' },
      { id: 'h3', t: '학군이 핵심 구매요인이다', m: '수요 설문 필요', st: 'untested' },
      { id: 'h4', t: '브랜드 프리미엄이 5% 이상', m: '기각 · 차이 2.1%', st: 'reject' },
    ],
    swot: {
      S: ['역세권 (인천1호선 도보 5분)', '삼성물산 브랜드', '신축 · 대단지 1,204세대'],
      W: ['높은 분양가 (평당 2,100만)', '학군 경쟁력 보통'],
      O: ['인근 GTX-B 개발계획', '송도 바이오 클러스터 확장'],
      T: ['경쟁단지 공급 증가', '금리·대출 규제'],
    },
    insights: [
      { id: 'i1', t: '신축·브랜드 차별화 여지', b: '경쟁단지 대비 신축성·브랜드 강조 시 차별화 가능.', tags: ['#마케팅'], star: 5 },
      { id: 'i2', t: '높은 분양가 = 핵심 약점', b: '평당 2,100만 — 가격 저항 관리 메시지 필요.', tags: ['#가격'], star: 4 },
      { id: 'i3', t: '3km 내 30대 가구 집중', b: '반경 3km 세대 중 30–40대 비중 54%. 실수요 중심 메시지 적합.', tags: ['#수요'], star: 3 },
    ],
    canvas: [
      { k: '프로젝트 목표', items: ['송도 권역 분양가 1위 포지셔닝', '계약률 초기 70% 달성'] },
      { k: '핵심 과제', items: ['적정 분양가 산정', '경쟁단지 차별화 메시지'] },
      { k: '타겟 고객', items: ['30–40대 실수요', '송도 직주근접 가구'] },
      { k: '경쟁 사업지', items: ['더샵 송도센트럴', '힐스테이트 송도', 'e편한세상 송도'] },
      { k: '예상 강점', items: ['역세권 · 브랜드', '신축 대단지'] },
      { k: '예상 약점', items: ['높은 분양가', '학군 보통'] },
      { k: '필요한 데이터', items: ['실거래가 / 청약경쟁률', '반경 3km 인구·세대'] },
      { k: '기대 결과', items: ['시장조사 보고서', '분양 제안서 초안'] },
    ],
    links: [
      { qid: 'q1', done: false }, { qid: 'q3', done: true }, { qid: 'q4', done: false },
    ],
    purposes: { '시장조사': true, '분양가 검토': true, '경쟁단지 분석': true, '입지 분석': false, '마케팅 전략 수립': false, '제안서 작성': true },
    project: {
      name: '래미안 송도 더퍼스트 시장조사', site: '래미안 송도 더퍼스트', type: '아파트', units: '1,204',
      loc: '인천 연수구 송도동 24-5', dev: '송도개발(주)', cons: '삼성물산', when: '2026년 4분기 (Q4)',
      desc: '인천 1호선 캠퍼스타운역 도보 5분 역세권 신축 대단지. 삼성물산 브랜드 프리미엄과 송도 직주근접을 핵심 소구점으로, 경쟁단지(더샵·힐스테이트·e편한세상) 대비 분양가 포지셔닝과 마케팅 차별화 방향을 도출하는 것이 목표.',
    },
    decisions: [
      { id: 'd1', date: '2026-06-05', who: '박기획', what: '분양가를 평당 2,100만원으로 제안', why: '경쟁단지 평균 2,040만 · 입지 우위(역세권) · 최근 실거래 상승세', tag: '가격' },
      { id: 'd2', date: '2026-05-28', who: '이대리', what: '주 타겟을 30–40대 실수요로 확정', why: '반경 3km 30–40대 비중 54% · 송도 직주근접 수요 견조', tag: '수요' },
      { id: 'd3', date: '2026-05-20', who: '박기획', what: '마케팅 1순위 메시지 = 신축·브랜드', why: '브랜드 프리미엄 가설 기각(차이 2.1%)이나 신축성은 경쟁 우위', tag: '마케팅' },
    ],
    mindmap: [
      { t: '가격', c: 'var(--accent)', page: 'questions' },
      { t: '경쟁단지', c: 'var(--swot-o)', page: 'swot' },
      { t: '입지', c: 'var(--dim-color)', page: 'swot' },
      { t: '수요·인구', c: 'var(--swot-t)', page: 'questions' },
      { t: '분양조건', c: 'var(--note-violet)', page: 'canvas' },
      { t: '마케팅', c: 'var(--pos)', page: 'insights' },
      { t: '리스크', c: 'var(--neg)', page: 'hypotheses' },
    ],
    sources: [
      { id: 's1', title: '국토부 실거래가 — 송도동 아파트', url: 'rt.molit.go.kr', date: '2026-06-01', who: '박기획', type: '정부기관', trust: 'A' },
      { id: 's2', title: 'KOSIS 연수구 인구·세대 통계', url: 'kosis.kr', date: '2026-05-30', who: '이대리', type: '공공데이터', trust: 'A' },
      { id: 's3', title: '네이버부동산 매물 시세', url: 'land.naver.com', date: '2026-05-29', who: '이대리', type: '기업', trust: 'B' },
      { id: 's4', title: '경쟁단지 현장 방문 조사', url: '—', date: '2026-05-25', who: '박기획', type: '현장조사', trust: 'B' },
      { id: 's5', title: '송도 분양시장 언론 보도', url: 'news.example.com', date: '2026-05-20', who: '연구원', type: '언론', trust: 'C' },
    ],
    report: [
      { id: 'r1', title: '프로젝트 개요', memo: '인천 송도 1,204세대 신축 아파트. 역세권·브랜드·신축을 핵심 자산으로 한 시장조사·제안 기반 정리.', blocks: [{ type: 'table', label: '프로젝트 기본 정보' }] },
      { id: 'r2', title: '입지 환경', memo: '', blocks: [{ type: 'map', label: '반경 1km 입지시설 지도' }] },
      { id: 'r3', title: '시장 동향', memo: '', blocks: [{ type: 'chart', label: '월별 평당가 추이' }] },
      { id: 'r4', title: '경쟁단지 분석', memo: '경쟁 3개 단지 대비 신축·브랜드 우위, 가격은 상단.', blocks: [{ type: 'chart', label: 'Radar — 경쟁단지 비교' }, { type: 'table', label: '경쟁단지 Ranking' }] },
      { id: 'r5', title: '가격 포지셔닝', memo: '본 사업지는 고가·고입지 사분면에 위치. 가격 저항 관리가 관건.', blocks: [{ type: 'chart', label: '가격 포지셔닝 매트릭스' }] },
      { id: 'r6', title: '수요 분석', memo: '', blocks: [] },
      { id: 'r7', title: '마케팅 제안 방향', memo: '', blocks: [] },
      { id: 'r8', title: '핵심 인사이트', memo: '', blocks: [{ type: 'insight', ref: 'i1' }, { type: 'insight', ref: 'i2' }] },
    ],
  };

  let state = initial;
  const subs = new Set();
  function setState(patch) {
    state = Object.assign({}, state, typeof patch === 'function' ? patch(state) : patch);
    subs.forEach((f) => f());
  }
  function getState() { return state; }
  function useStore(sel) {
    const select = sel || ((s) => s);
    const [, force] = React.useReducer((x) => x + 1, 0);
    React.useEffect(() => { subs.add(force); return () => subs.delete(force); }, []);
    return select(state);
  }
  const upd = (arr, id, fn) => arr.map((x) => (x.id === id ? Object.assign({}, x, fn(x)) : x));
  const nextIn = (order, cur) => order[(order.indexOf(cur) + 1) % order.length];

  const actions = {
    setPage: (page) => setState({ page }),
    cycleQ: (id) => setState((s) => ({ questions: upd(s.questions, id, (q) => ({ st: nextIn(Q_ORDER, q.st) })) })),
    cycleQPri: (id) => setState((s) => ({ questions: upd(s.questions, id, (q) => ({ p: nextIn(P_ORDER, q.p) })) })),
    setQText: (id, t) => setState((s) => ({ questions: upd(s.questions, id, () => ({ t })) })),
    addQ: () => setState((s) => ({ questions: s.questions.concat({ id: nid('q'), t: '새 연구 질문 — 클릭해 편집', m: '미착수', st: 'todo', p: 'p3', who: '—' }) })),
    delQ: (id) => setState((s) => ({ questions: s.questions.filter((q) => q.id !== id), links: s.links.filter((l) => l.qid !== id) })),
    cycleH: (id) => setState((s) => ({ hypotheses: upd(s.hypotheses, id, (h) => ({ st: nextIn(H_ORDER, h.st) })) })),
    setHText: (id, t) => setState((s) => ({ hypotheses: upd(s.hypotheses, id, () => ({ t })) })),
    addH: () => setState((s) => ({ hypotheses: s.hypotheses.concat({ id: nid('h'), t: '새 가설 — 클릭해 편집', m: '미검증', st: 'untested' }) })),
    delH: (id) => setState((s) => ({ hypotheses: s.hypotheses.filter((h) => h.id !== id) })),
    addSwot: (q) => setState((s) => ({ swot: Object.assign({}, s.swot, { [q]: s.swot[q].concat('새 항목') }) })),
    setSwot: (q, i, v) => setState((s) => ({ swot: Object.assign({}, s.swot, { [q]: s.swot[q].map((x, j) => (j === i ? v : x)) }) })),
    delSwot: (q, i) => setState((s) => ({ swot: Object.assign({}, s.swot, { [q]: s.swot[q].filter((_, j) => j !== i) }) })),
    addInsight: () => setState((s) => ({ insights: s.insights.concat({ id: nid('i'), t: '새 인사이트 — 제목 편집', b: '내용을 입력하세요.', tags: ['#메모'], star: 3 }) })),
    setInsightField: (id, k, v) => setState((s) => ({ insights: upd(s.insights, id, () => ({ [k]: v })) })),
    setStar: (id, star) => setState((s) => ({ insights: upd(s.insights, id, () => ({ star })) })),
    toggleLink: (qid) => setState((s) => ({ links: s.links.map((l) => (l.qid === qid ? { qid, done: !l.done } : l)) })),
    addCanvasItem: (i) => setState((s) => ({ canvas: s.canvas.map((c, j) => (j === i ? Object.assign({}, c, { items: c.items.concat('새 항목') }) : c)) })),
    setCanvasItem: (i, j, v) => setState((s) => ({ canvas: s.canvas.map((c, ci) => (ci === i ? Object.assign({}, c, { items: c.items.map((x, xi) => (xi === j ? v : x)) }) : c)) })),
    delCanvasItem: (i, j) => setState((s) => ({ canvas: s.canvas.map((c, ci) => (ci === i ? Object.assign({}, c, { items: c.items.filter((_, xi) => xi !== j) }) : c)) })),
    togglePurpose: (k) => setState((s) => ({ purposes: Object.assign({}, s.purposes, { [k]: !s.purposes[k] }) })),
    setProject: (k, v) => setState((s) => ({ project: Object.assign({}, s.project, { [k]: v }) })),
    setType: (t) => setState((s) => ({ project: Object.assign({}, s.project, { type: t }) })),
    addDecision: () => setState((s) => ({ decisions: [{ id: nid('d'), date: new Date().toISOString().slice(0, 10), who: '나', what: '새 결정사항 — 클릭해 편집', why: '근거를 입력하세요.', tag: '메모' }].concat(s.decisions) })),
    setDecisionField: (id, k, v) => setState((s) => ({ decisions: upd(s.decisions, id, () => ({ [k]: v })) })),
    delDecision: (id) => setState((s) => ({ decisions: s.decisions.filter((d) => d.id !== id) })),
    addSource: () => setState((s) => ({ sources: s.sources.concat({ id: nid('s'), title: '새 출처 — 클릭해 편집', url: '', date: new Date().toISOString().slice(0, 10), who: '나', type: '내부자료', trust: 'C' }) })),
    setSourceField: (id, k, v) => setState((s) => ({ sources: upd(s.sources, id, () => ({ [k]: v })) })),
    cycleTrust: (id) => setState((s) => ({ sources: upd(s.sources, id, (x) => ({ trust: nextIn(['A', 'B', 'C'], x.trust) })) })),
    cycleSourceType: (id) => setState((s) => ({ sources: upd(s.sources, id, (x) => ({ type: nextIn(['정부기관', '공공데이터', '언론', '기업', '현장조사', '내부자료'], x.type) })) })),
    delSource: (id) => setState((s) => ({ sources: s.sources.filter((x) => x.id !== id) })),
    setReportMemo: (id, memo) => setState((s) => ({ report: upd(s.report, id, () => ({ memo })) })),
    delReportBlock: (id, idx) => setState((s) => ({ report: upd(s.report, id, (r) => ({ blocks: r.blocks.filter((_, i) => i !== idx) })) })),
    addReportInsight: (id) => setState((s) => {
      const sec = s.report.find((r) => r.id === id);
      const used = new Set(sec.blocks.filter((b) => b.type === 'insight').map((b) => b.ref));
      const next = s.insights.find((x) => !used.has(x.id));
      if (!next) return {};
      return { report: upd(s.report, id, (r) => ({ blocks: r.blocks.concat({ type: 'insight', ref: next.id }) })) };
    }),
  };

  // inline-editable text
  function Edit({ value, onCommit, className, style, placeholder }) {
    const ref = React.useRef(null);
    return React.createElement('span', {
      ref, contentEditable: true, suppressContentEditableWarning: true,
      className: 'editable ' + (className || ''), style,
      'data-ph': placeholder || '',
      onBlur: (e) => { const t = e.currentTarget.textContent.trim(); if (t !== value) onCommit(t); },
      onKeyDown: (e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } },
    }, value);
  }

  Object.assign(window, { PlanStore: { useStore, getState, setState, actions, Q_ORDER, Q_LABEL, H_ORDER, H_LABEL, H_CLASS }, Edit });
})();
