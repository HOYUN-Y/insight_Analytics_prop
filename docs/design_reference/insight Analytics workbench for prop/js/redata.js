/* Real-estate data engine for Data Studio + Clean Studio.
   window.RE = { datasets, fmt }, window.REStore = { useStore, getState, actions } */
(function () {
  // ---------- sample datasets ----------
  const compCols = [
    { key: 'name', label: '단지명', type: 'string', role: 'dimension' },
    { key: 'loc', label: '위치', type: 'string', role: 'dimension' },
    { key: 'units', label: '세대수', type: 'integer', role: 'measure', unit: '세대' },
    { key: 'moveIn', label: '입주', type: 'datetime', role: 'dimension' },
    { key: 'area', label: '전용면적', type: 'float', role: 'measure', unit: '㎡' },
    { key: 'price', label: '분양가', type: 'integer', role: 'measure', unit: '만원' },
    { key: 'ppy', label: '평당가', type: 'integer', role: 'measure', unit: '만원' },
    { key: 'compet', label: '청약경쟁률', type: 'float', role: 'measure', unit: ':1' },
    { key: 'stnDist', label: '역거리', type: 'float', role: 'measure', unit: 'km' },
    { key: 'schDist', label: '학교거리', type: 'float', role: 'measure', unit: 'km' },
    { key: 'note', label: '비고', type: 'string', role: 'dimension' },
  ];
  const compRows = [
    { name: '래미안 송도 더퍼스트', loc: '송도동', units: 1204, moveIn: '2026-12', area: 84.97, price: 71400, ppy: 2100, compet: 12.4, stnDist: 0.3, schDist: 0.5, note: '본 사업지' },
    { name: '더샵 송도센트럴', loc: '송도동', units: 980, moveIn: '2021-03', area: 84.92, price: 69000, ppy: 2040, compet: 8.1, stnDist: 0.5, schDist: 0.7, note: '' },
    { name: '힐스테이트 송도', loc: '송도동', units: 1500, moveIn: '2020-09', area: 74.88, price: 58000, ppy: 1920, compet: 6.5, stnDist: 1.1, schDist: 0.4, note: '' },
    { name: 'e편한세상 송도', loc: '송도동', units: 760, moveIn: '2019-06', area: 101.2, price: 78000, ppy: 1980, compet: 5.2, stnDist: 0.8, schDist: 1.2, note: '' },
    { name: '송도 더샵 마스터뷰', loc: '송도동', units: 1300, moveIn: '2018-11', area: 59.94, price: 47000, ppy: 1860, compet: null, stnDist: 1.4, schDist: 0.9, note: '청약경쟁률 미상' },
    { name: '송도국제도시 푸르지오', loc: '송도동', units: 543, moveIn: '2022-05', area: 84.91, price: 67900, ppy: 2010, compet: 9.8, stnDist: 0.6, schDist: 0.6, note: '' },
    { name: '송도 자이', loc: '송도동', units: null, moveIn: '2023-02', area: 84.9, price: 72000, ppy: 2120, compet: 14.2, stnDist: 0.4, schDist: 0.8, note: '세대수 미상' },
    { name: '송도 SK뷰', loc: '송도동', units: 1120, moveIn: '2017-08', area: 110.5, price: 99000, ppy: 2540, compet: 3.1, stnDist: 2.1, schDist: 1.5, note: '대형 평형' },
    { name: '더샵 송도센트럴', loc: '송도동', units: 980, moveIn: '2021-03', area: 84.92, price: 69000, ppy: 2040, compet: 8.1, stnDist: 0.5, schDist: 0.7, note: '' },
    { name: '송도 캐슬앤스카이', loc: '송도동', units: 690, moveIn: '2024-01', area: 74.85, price: 61000, ppy: 1990, compet: 11.0, stnDist: 0.9, schDist: 0.3, note: '' },
  ];

  const datasets = [
    { id: 'comp', short: '경쟁단지_조사표', icon: 'table', rows: compRows, columns: compCols, src: '현장조사 + 분양홈페이지', note: '송도 권역 경쟁 10개 단지 조사. 결측·중복·이상치 포함(정제 연습용).' },
    { id: 'txn', short: '송도_실거래가_2024', icon: 'data', rows: [], columns: [], src: '국토부 API', note: 'API Data Hub에서 수집 · 5,234행' },
    { id: 'pop', short: '인구_세대_연수구', icon: 'data', rows: [], columns: [], src: 'KOSIS', note: '반경 3km 행정동 인구·세대' },
  ];

  const TEMPLATES = ['경쟁단지 조사표', '분양가 비교표', '입지시설 조사표', '교통환경 조사표', '인구·세대 데이터', '청약경쟁률 데이터', '실거래가 비교표', '납부조건 비교표', '마케팅 채널 성과표'];

  // ---------- stat helpers ----------
  const num = (a) => a.filter((v) => v != null && v !== '' && !isNaN(v)).map(Number);
  const S = {
    mean: (a) => { const n = num(a); return n.length ? n.reduce((x, y) => x + y, 0) / n.length : null; },
    sum: (a) => num(a).reduce((x, y) => x + y, 0),
    min: (a) => { const n = num(a); return n.length ? Math.min(...n) : null; },
    max: (a) => { const n = num(a); return n.length ? Math.max(...n) : null; },
    median: (a) => S.quantile(a, 0.5),
    quantile: (a, q) => { const n = num(a).sort((x, y) => x - y); if (!n.length) return null; const i = (n.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i); return n[lo] + (n[hi] - n[lo]) * (i - lo); },
    std: (a) => { const n = num(a); if (n.length < 2) return 0; const m = S.mean(a); return Math.sqrt(n.reduce((s, v) => s + (v - m) ** 2, 0) / (n.length - 1)); },
    missing: (a) => a.filter((v) => v == null || v === '').length,
    distinct: (a) => new Set(a.filter((v) => v != null && v !== '')).size,
    mode: (a) => { const m = new Map(); a.forEach((v) => { if (v != null && v !== '') m.set(v, (m.get(v) || 0) + 1); }); let best, bc = -1; m.forEach((c, v) => { if (c > bc) { bc = c; best = v; } }); return best; },
    histogram: (a, bins) => { const n = num(a); if (!n.length) return { bins: [], max: 0 }; const mn = Math.min(...n), mx = Math.max(...n), w = (mx - mn) / bins || 1; const b = Array.from({ length: bins }, (_, i) => ({ x0: mn + i * w, x1: mn + (i + 1) * w, c: 0 })); n.forEach((v) => { let i = Math.floor((v - mn) / w); if (i >= bins) i = bins - 1; if (i < 0) i = 0; b[i].c++; }); return { bins: b, max: Math.max(...b.map((x) => x.c)) }; },
  };

  const fmt = {
    n: (v, d = 0) => v == null ? '—' : Number(v).toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d }),
    compact: (v) => v == null ? '—' : Math.abs(v) >= 10000 ? (v / 10000).toFixed(1) + '만' : v.toLocaleString(),
  };
  const isNum = (t) => t === 'integer' || t === 'float';
  const typeShort = (t) => ({ string: { l: 'STR', c: 'str' }, integer: { l: '123', c: 'num' }, float: { l: '1.2', c: 'num' }, category: { l: 'ABC', c: 'cat' }, datetime: { l: 'DATE', c: 'date' } }[t] || { l: 'STR', c: 'str' });

  // ---------- transform engine ----------
  function applySteps(dataset, steps, cursor) {
    let rows = dataset.rows.map((r) => Object.assign({}, r));
    let columns = dataset.columns.map((c) => Object.assign({}, c));
    const colMeta = (k) => columns.find((c) => c.key === k);
    for (let i = 0; i < cursor; i++) {
      const s = steps[i]; const k = s.col;
      switch (s.op) {
        case 'drop_missing': rows = rows.filter((r) => r[k] != null && r[k] !== ''); break;
        case 'fill_mean': { const m = S.mean(rows.map((r) => r[k])); rows.forEach((r) => { if (r[k] == null || r[k] === '') r[k] = Math.round(m * 100) / 100; }); break; }
        case 'fill_median': { const m = S.median(rows.map((r) => r[k])); rows.forEach((r) => { if (r[k] == null || r[k] === '') r[k] = Math.round(m * 100) / 100; }); break; }
        case 'fill_mode': { const m = S.mode(rows.map((r) => r[k])); rows.forEach((r) => { if (r[k] == null || r[k] === '') r[k] = m; }); break; }
        case 'drop_duplicates': { const seen = new Set(); rows = rows.filter((r) => { const key = JSON.stringify(r); if (seen.has(key)) return false; seen.add(key); return true; }); break; }
        case 'remove_outliers': { const q1 = S.quantile(rows.map((r) => r[k]), 0.25), q3 = S.quantile(rows.map((r) => r[k]), 0.75), iqr = q3 - q1; const lo = q1 - 1.5 * iqr, hi = q3 + 1.5 * iqr; rows = rows.filter((r) => r[k] == null || (r[k] >= lo && r[k] <= hi)); break; }
        case 'money_unit': { const cm = colMeta(k); const factor = s.params.to === '억원' ? (cm.unit === '만원' ? 1 / 10000 : 1) : (cm.unit === '억원' ? 10000 : 1); rows.forEach((r) => { if (r[k] != null) r[k] = Math.round(r[k] * factor * 100) / 100; }); cm.unit = s.params.to; break; }
        case 'area_unit': { const cm = colMeta(k); const factor = s.params.to === '평' ? (cm.unit === '㎡' ? 1 / 3.305785 : 1) : (cm.unit === '평' ? 3.305785 : 1); rows.forEach((r) => { if (r[k] != null) r[k] = Math.round(r[k] * factor * 100) / 100; }); cm.unit = s.params.to; cm.type = 'float'; break; }
        case 'change_type': { const cm = colMeta(k); cm.type = s.params.to; if (isNum(s.params.to)) rows.forEach((r) => { r[k] = parseFloat(r[k]); if (isNaN(r[k])) r[k] = null; }); break; }
        case 'rename': { const cm = colMeta(k); cm.label = s.params.to; break; }
        case 'drop_col': { columns = columns.filter((c) => c.key !== k); rows.forEach((r) => delete r[k]); break; }
        case 'formula': { const key = 'f_' + s.params.name; columns.push({ key, label: s.params.name, type: 'float', role: 'measure', unit: '' }); rows.forEach((r) => { try { r[key] = Math.round(Function('row', 'return ' + s.params.expr)(r) * 100) / 100; } catch (e) { r[key] = null; } }); break; }
        default: break;
      }
    }
    return { rows, columns };
  }

  // ---------- reactive store ----------
  let uid = 0;
  let state = { activeId: 'comp', selCol: 'price', dataTab: 'preview', steps: [], cursor: 0 };
  const subs = new Set();
  const setState = (p) => { state = Object.assign({}, state, typeof p === 'function' ? p(state) : p); subs.forEach((f) => f()); };
  const getState = () => state;
  function useStore(sel) {
    const select = sel || ((s) => s);
    const [, force] = React.useReducer((x) => x + 1, 0);
    React.useEffect(() => { subs.add(force); return () => subs.delete(force); }, []);
    return select(state);
  }
  const getDataset = (id) => datasets.find((d) => d.id === (id || state.activeId));
  const getActive = () => { const ds = getDataset(); const r = applySteps(ds, state.steps, state.cursor); return { ds, rows: r.rows, columns: r.columns, steps: state.steps, cursor: state.cursor }; };

  const actions = {
    setActive: (activeId) => setState({ activeId, selCol: null, steps: [], cursor: 0 }),
    setSelCol: (selCol) => setState({ selCol }),
    setDataTab: (dataTab) => setState({ dataTab }),
    addStep: (step) => setState((s) => { const steps = s.steps.slice(0, s.cursor).concat(Object.assign({ id: ++uid }, step)); return { steps, cursor: steps.length }; }),
    undo: () => setState((s) => ({ cursor: Math.max(0, s.cursor - 1) })),
    redo: () => setState((s) => ({ cursor: Math.min(s.steps.length, s.cursor + 1) })),
    gotoStep: (cursor) => setState({ cursor }),
    clearSteps: () => setState({ steps: [], cursor: 0 }),
  };

  Object.assign(window, { RE: { datasets, TEMPLATES, fmt, stat: S, isNum, typeShort, applySteps }, REStore: { useStore, getState, getActive, getDataset, actions } });
})();
