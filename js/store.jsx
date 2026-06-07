/* insight Analytics Prop — Global Store
   window.Store = { useStore, getState, setState, actions, derive, stat, conv }
*/
(function () {
  const D = window.NODE.datasets;

  function uid() { return Math.random().toString(36).slice(2, 10); }
  function now() { return new Date().toISOString(); }

  const SAMPLE_PROJECT = {
    id: "proj_sample",
    name: "천안 성성7지구 시장조사",
    siteName: "천안 서북구 성성7지구 공동주택",
    type: "apartment", saleMethod: "general",
    address: "천안시 서북구 성성동 366-3번지 일원",
    developer: "웰메이드개발", builder: "", builderTier: "미정",
    saleDate: "2026-01", moveInDate: "2029-01",
    stage: "planning",
    floors: { basement: 2, max: 38 }, buildings: 4, totalUnits: 554,
    area: { site_sqm: 25941, building_sqm: 4993.64, total_sqm: 96199.58 },
    ratio: { coverage: 19.25, floorArea: 249.68 },
    parking: { total: 727, perUnit: 1.31, legalRatio: 123 },
    landscape_sqm: 3819.15,
    unitTypes: [
      { id: uid(), name: "84A", exclusiveArea_sqm: 84.9954, supplyArea_sqm: 115.6929, units: 282, shape: "판상형", bay: "4Bay", facing: "남", note: "맞통풍·알파룸" },
      { id: uid(), name: "84B", exclusiveArea_sqm: 84.9916, supplyArea_sqm: 115.6684, units: 272, shape: "타워형", bay: "4Bay", facing: "남동", note: "광폭 드레스룸" },
    ],
    saleCondition: {
      depositRatio: 5, depositInstallment: true,
      midPaymentRatio: 60, midPaymentType: "deferred",
      remainderRatio: 35, balconyBasis: "separate", balconyFee: 500,
      loanAvailable: true, transferRestriction: false, promoNote: ""
    },
    objectives: ["market", "pricing", "competition"],
    canvas: [
      { id: uid(), section: 1, body: "84타입 적정 분양가 산정 및 시장조사 보고서 제출" },
      { id: uid(), section: 7, body: "호수공원 직접 조망, 초품아, 신축성" },
      { id: uid(), section: 8, body: "554세대 소규모, 브랜드 미확정, 임대 소송 이슈" },
    ],
    researchQuestions: [
      { id: uid(), order: 1, text: "적정 분양가는 얼마인가?", status: "wip", priority: "High", assignee: "" },
      { id: uid(), order: 2, text: "주 수요층은 누구인가?", status: "todo", priority: "High", assignee: "" },
      { id: uid(), order: 3, text: "경쟁단지 대비 강점은 무엇인가?", status: "todo", priority: "Med", assignee: "" },
      { id: uid(), order: 4, text: "어떤 마케팅 포인트를 강조해야 하는가?", status: "todo", priority: "Low", assignee: "" },
    ],
    hypotheses: [
      { id: uid(), text: "성성 생활권은 불당 다음 선호 주거지로 부상하고 있다", status: "wip" },
      { id: uid(), text: "1군 브랜드 확보 시 분양가 경쟁력이 높아진다", status: "todo" },
      { id: uid(), text: "역세권일수록 가격 경쟁력이 높다", status: "todo" },
    ],
    swot: { S: "", W: "", O: "", T: "" },
    canvasCards: {},
    decisions: [], datasets: [], charts: [], insights: [],
    risks: "'24년 7월 장기일반민간임대 임차인 모집 실패로 인한 탈퇴·환불 소송 이슈 발생",
    createdAt: now(), updatedAt: now(),
  };

  const initial = {
    theme: "dark",
    mode: "planning",
    planView: "docs",
    planPage: "dashboard",
    activeId: D.length ? D[0].id : null,
    projects: [SAMPLE_PROJECT],
    activeProjectId: "proj_sample",
    ui: { leftW: 240, rightW: 280, dataTab: "preview", selCol: null, aiOpen: false },
    clean: {},
    viz: { type: "bar", cols: [], rows: [], color: null, label: null, filters: [], sortDesc: true, topN: 0 },
    dash: { widgets: null, cross: null, edit: false },
    tweaks: { layout: "classic", sidebar: "rail", tone: "cool", density: "compact" },
  };

  let state = JSON.parse(JSON.stringify(initial));
  const listeners = new Set();

  function setState(patch) {
    state = typeof patch === "function" ? patch(state) : deepMerge(state, patch);
    listeners.forEach((l) => l());
  }
  function deepMerge(a, b) {
    const o = { ...a };
    for (const k in b) {
      if (b[k] && typeof b[k] === "object" && !Array.isArray(b[k]) && a[k] && typeof a[k] === "object" && !Array.isArray(a[k]))
        o[k] = deepMerge(a[k], b[k]);
      else o[k] = b[k];
    }
    return o;
  }
  function getState() { return state; }

  function useStore(sel) {
    const select = sel || ((s) => s);
    const [, force] = React.useReducer((x) => x + 1, 0);
    React.useEffect(() => { listeners.add(force); return () => listeners.delete(force); }, []);
    return select(state);
  }

  // ── Stats ─────────────────────────────────────────────────
  const num = (a) => a.filter((v) => v != null && v !== "" && !isNaN(v)).map(Number);
  const stat = {
    mean: (a) => { const x = num(a); return x.length ? x.reduce((s, v) => s + v, 0) / x.length : null; },
    sum: (a) => num(a).reduce((s, v) => s + v, 0),
    min: (a) => { const x = num(a); return x.length ? Math.min(...x) : null; },
    max: (a) => { const x = num(a); return x.length ? Math.max(...x) : null; },
    median: (a) => { const x = num(a).sort((p, q) => p - q); if (!x.length) return null; const m = x.length >> 1; return x.length % 2 ? x[m] : (x[m - 1] + x[m]) / 2; },
    quantile: (a, q) => { const x = num(a).sort((p, q2) => p - q2); if (!x.length) return null; const pos = (x.length - 1) * q, b = Math.floor(pos), rest = pos - b; return x[b + 1] !== undefined ? x[b] + rest * (x[b + 1] - x[b]) : x[b]; },
    std: (a) => { const x = num(a); if (x.length < 2) return null; const m = x.reduce((s, v) => s + v, 0) / x.length; return Math.sqrt(x.reduce((s, v) => s + (v - m) ** 2, 0) / (x.length - 1)); },
    countDistinct: (a) => new Set(a.filter((v) => v != null && v !== "")).size,
    missing: (a) => a.filter((v) => v == null || v === "").length,
    pearson: (a, b) => {
      const pairs = []; for (let i = 0; i < a.length; i++) if (a[i] != null && b[i] != null && !isNaN(a[i]) && !isNaN(b[i])) pairs.push([+a[i], +b[i]]);
      const n = pairs.length; if (n < 2) return null;
      const mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
      let sxy = 0, sxx = 0, syy = 0; for (const [x, y] of pairs) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; }
      return sxx && syy ? sxy / Math.sqrt(sxx * syy) : null;
    },
    histogram: (a, bins = 20) => {
      const x = num(a); if (!x.length) return { bins: [], max: 0 };
      const lo = Math.min(...x), hi = Math.max(...x), w = (hi - lo) / bins || 1;
      const out = Array.from({ length: bins }, (_, i) => ({ x0: lo + i * w, x1: lo + (i + 1) * w, c: 0 }));
      for (const v of x) { let i = Math.floor((v - lo) / w); if (i >= bins) i = bins - 1; if (i < 0) i = 0; out[i].c++; }
      return { bins: out, max: Math.max(...out.map((b) => b.c)) };
    },
  };
  const aggFn = {
    sum: stat.sum, avg: stat.mean, mean: stat.mean, median: stat.median,
    min: stat.min, max: stat.max, count: (a) => a.length, countd: stat.countDistinct,
  };

  // ── Clean apply ───────────────────────────────────────────
  function applySteps(dataset, steps) {
    let rows = dataset.rows.map((r) => ({ ...r }));
    let columns = dataset.columns.map((c) => ({ ...c }));
    for (const s of steps) {
      try {
        switch (s.op) {
          case "drop_missing": rows = rows.filter((r) => r[s.col] != null && r[s.col] !== ""); break;
          case "fill_mean": { const m = stat.mean(rows.map((r) => r[s.col])); rows = rows.map((r) => ({ ...r, [s.col]: r[s.col] == null || r[s.col] === "" ? m : r[s.col] })); break; }
          case "fill_median": { const m = stat.median(rows.map((r) => r[s.col])); rows = rows.map((r) => ({ ...r, [s.col]: r[s.col] == null || r[s.col] === "" ? m : r[s.col] })); break; }
          case "fill_zero": rows = rows.map((r) => ({ ...r, [s.col]: r[s.col] == null || r[s.col] === "" ? 0 : r[s.col] })); break;
          case "drop_duplicates": { const seen = new Set(); rows = rows.filter((r) => { const k = JSON.stringify(r); if (seen.has(k)) return false; seen.add(k); return true; }); break; }
          case "rename": { const old = s.col; const nn = s.newName; columns = columns.map((c) => c.key === old ? { ...c, key: nn, label: nn } : c); rows = rows.map((r) => { const nr = { ...r }; nr[nn] = nr[old]; delete nr[old]; return nr; }); break; }
          case "cast_number": rows = rows.map((r) => ({ ...r, [s.col]: r[s.col] == null || r[s.col] === "" ? null : isNaN(+r[s.col]) ? null : +r[s.col] })); break;
          case "trim": rows = rows.map((r) => ({ ...r, [s.col]: r[s.col] ? String(r[s.col]).trim() : r[s.col] })); break;
          case "formula": { const fn = new Function("row", "return " + s.expr); rows = rows.map((r) => { try { return { ...r, [s.newCol]: fn(r) }; } catch { return { ...r, [s.newCol]: null }; } }); columns = [...columns, { key: s.newCol, label: s.newCol, type: "float", role: "measure", agg: "sum" }]; break; }
        }
      } catch (e) { console.warn("step error", s, e); }
    }
    return { rows, columns };
  }

  // ── Actions ───────────────────────────────────────────────
  const actions = {
    setMode: (mode) => setState({ mode }),
    setPlanView: (planView) => setState({ planView }),
    setPlanPage: (planPage) => setState({ planPage }),
    setActive: (id) => setState({ activeId: id }),
    toggleTheme: () => setState((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
    setUI: (patch) => setState((s) => ({ ui: { ...s.ui, ...patch } })),
    setViz: (patch) => setState((s) => ({ viz: { ...s.viz, ...patch } })),
    setDash: (patch) => setState((s) => ({ dash: { ...s.dash, ...patch } })),
    setCleanSteps: (dsId, steps, cursor) => setState((s) => ({
      clean: { ...s.clean, [dsId]: { steps, cursor: cursor !== undefined ? cursor : steps.length } }
    })),

    // Project
    setActiveProject: (id) => setState({ activeProjectId: id }),
    createProject: (data) => {
      const p = {
        id: "proj_" + uid(), createdAt: now(), updatedAt: now(),
        type: "apartment", saleMethod: "general", stage: "planning",
        objectives: [], unitTypes: [], canvas: [], canvasCards: {}, researchQuestions: [],
        hypotheses: [], swot: { S:"",W:"",O:"",T:"" }, decisions: [], datasets: [], charts: [], insights: [],
        saleCondition: { depositRatio: 5, depositInstallment: true, midPaymentRatio: 60, midPaymentType: "free", remainderRatio: 35, balconyBasis: "tbd", balconyFee: 500, loanAvailable: true, transferRestriction: false, promoNote: "" },
        ...data,
      };
      setState((s) => ({ projects: [...s.projects, p], activeProjectId: p.id }));
      return p;
    },
    updateProject: ({ id, ...patch }) => setState((s) => ({
      projects: s.projects.map((p) => p.id === id ? { ...p, ...patch, updatedAt: now() } : p)
    })),
    deleteProject: (id) => setState((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      activeProjectId: s.activeProjectId === id ? (s.projects.find((p) => p.id !== id)?.id || null) : s.activeProjectId,
    })),
    duplicateProject: (id) => {
      const src = getState().projects.find((p) => p.id === id);
      if (!src) return;
      const copy = { ...JSON.parse(JSON.stringify(src)), id: "proj_" + uid(), name: src.name + " (복사본)", createdAt: now(), updatedAt: now() };
      setState((s) => ({ projects: [...s.projects, copy], activeProjectId: copy.id }));
    },
    upsertCanvasCard: ({ projectId, sectionId, items }) => setState((s) => ({
      projects: s.projects.map((p) => {
        if (p.id !== projectId) return p;
        const cards = { ...(p.canvasCards || {}), [sectionId]: { items } };
        return { ...p, canvasCards: cards, updatedAt: now() };
      })
    })),
    addResearchQuestion: ({ projectId, text, priority, category }) => setState((s) => ({
      projects: s.projects.map((p) => {
        if (p.id !== projectId) return p;
        const q = { id: uid(), order: p.researchQuestions.length + 1, text, status: "todo", priority: priority || "Med", category: category || "기타", assignee: "" };
        return { ...p, researchQuestions: [...p.researchQuestions, q], updatedAt: now() };
      })
    })),
    updateQuestion: ({ projectId, questionId, ...patch }) => setState((s) => ({
      projects: s.projects.map((p) => p.id !== projectId ? p : { ...p, researchQuestions: p.researchQuestions.map((q) => q.id === questionId ? { ...q, ...patch } : q), updatedAt: now() })
    })),
    deleteQuestion: ({ projectId, questionId }) => setState((s) => ({
      projects: s.projects.map((p) => p.id !== projectId ? p : { ...p, researchQuestions: p.researchQuestions.filter((q) => q.id !== questionId), updatedAt: now() })
    })),
    addHypothesis: ({ projectId, text }) => setState((s) => ({
      projects: s.projects.map((p) => {
        if (p.id !== projectId) return p;
        return { ...p, hypotheses: [...p.hypotheses, { id: uid(), text, status: "todo" }], updatedAt: now() };
      })
    })),
    updateHypothesis: ({ projectId, hypId, ...patch }) => setState((s) => ({
      projects: s.projects.map((p) => p.id !== projectId ? p : { ...p, hypotheses: p.hypotheses.map((h) => h.id === hypId ? { ...h, ...patch } : h), updatedAt: now() })
    })),
    deleteHypothesis: ({ projectId, hypId }) => setState((s) => ({
      projects: s.projects.map((p) => p.id !== projectId ? p : { ...p, hypotheses: p.hypotheses.filter((h) => h.id !== hypId), updatedAt: now() })
    })),
  };

  // ── Derive ────────────────────────────────────────────────
  const derive = {
    getActiveData: (activeId) => {
      const empty = { id: "", name: "", short: "—", icon: "table", source: "", rows: [], columns: [] };
      if (!activeId) return { ds: empty, rows: [], columns: [] };
      const ds = D.find((d) => d.id === activeId) || empty;
      const cs = getState().clean[activeId];
      if (cs && cs.steps && cs.cursor > 0) {
        const applied = applySteps(ds, cs.steps.slice(0, cs.cursor));
        return { ds, rows: applied.rows, columns: applied.columns };
      }
      return { ds, rows: ds.rows || [], columns: ds.columns || [] };
    },
    getActiveProject: () => {
      const s = getState();
      return s.projects.find((p) => p.id === s.activeProjectId) || null;
    },
    aggRows: (rows, dimKey, measKey, aggFnName) => {
      const fn = aggFn[aggFnName] || aggFn.sum;
      const map = {};
      for (const r of rows) { const k = r[dimKey] ?? "(blank)"; if (!map[k]) map[k] = []; map[k].push(r[measKey]); }
      return Object.entries(map).map(([k, vals]) => ({ dim: k, val: fn(vals) }));
    },
  };

  // ── Conversion helpers ────────────────────────────────────
  const conv = {
    sqmToPyeong: (v) => v ? +(v / 3.30579).toFixed(2) : null,
    pyeongToSqm: (v) => v ? +(v * 3.30579).toFixed(2) : null,
    wonToManwon: (v) => v ? +(v / 10000).toFixed(1) : null,
    wonToEok: (v) => v ? +(v / 100000000).toFixed(4) : null,
    manwonToWon: (v) => v ? v * 10000 : null,
    calcUnitType: (ut) => {
      const sp = (v) => v ? +(v / 3.30579).toFixed(2) : null;
      return { ...ut, exclusiveArea_pyeong: sp(ut.exclusiveArea_sqm), supplyArea_pyeong: sp(ut.supplyArea_sqm), exclusiveRatio: (ut.exclusiveArea_sqm && ut.supplyArea_sqm) ? +((ut.exclusiveArea_sqm / ut.supplyArea_sqm) * 100).toFixed(1) : null };
    },
  };

  window.Store = { useStore, getState, setState, actions, derive, stat, aggFn, applySteps, conv };
})();
