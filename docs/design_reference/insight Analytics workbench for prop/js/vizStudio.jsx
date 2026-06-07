/* Visualization — Tableau-style chart builder over ECharts. window.VizStudioBody */
(function () {
  const Ic = window.Ic, RE = window.RE, RS = window.REStore;
  const { useStore } = RS;
  const { isNum } = RE;
  const { useState, useRef, useEffect } = React;

  // green-anchored categorical palette (hex for canvas)
  const PALETTES = {
    '연두 기본': ['#93e05f', '#5b9bd5', '#e0b341', '#b98fe0', '#5fb0c8', '#e0786a', '#7cc98a', '#c9a24a'],
    '단색 그린': ['#bdf08a', '#93e05f', '#6cc23f', '#4e9e2e', '#3a7d22', '#2c5f1a', '#9fe06a', '#7cc94f'],
    '대비': ['#93e05f', '#e0685f', '#5b9bd5', '#e0b341', '#b98fe0', '#5fb0c8', '#7cc98a', '#d98f50'],
  };
  const AX = { tx: '#8f988f', txDim: '#5e655e', line: 'rgba(255,255,255,0.07)', split: 'rgba(255,255,255,0.05)' };

  function aggregate(rows, xKey, yKey, agg) {
    const m = new Map();
    rows.forEach((r) => { const k = r[xKey]; if (k == null || k === '') return; if (!m.has(k)) m.set(k, []); const v = r[yKey]; if (v != null && !isNaN(v)) m.get(k).push(Number(v)); });
    const out = [];
    m.forEach((vals, k) => {
      let v; const sum = vals.reduce((a, b) => a + b, 0);
      if (agg === 'sum') v = sum; else if (agg === 'max') v = Math.max(...vals); else if (agg === 'min') v = Math.min(...vals); else if (agg === 'count') v = vals.length; else v = sum / (vals.length || 1);
      out.push([k, Math.round(v * 100) / 100]);
    });
    return out;
  }

  function buildOption(cfg, rows, columns) {
    const colLabel = (k) => { const c = columns.find((x) => x.key === k); return c ? c.label : k; };
    const pal = PALETTES[cfg.palette] || PALETTES['연두 기본'];
    const base = {
      animation: false, color: pal,
      grid: { left: 54, right: 22, top: 30, bottom: 64 },
      tooltip: { trigger: cfg.type === 'scatter' ? 'item' : 'axis', backgroundColor: '#2a2f2a', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#e8eae8', fontSize: 12 } },
      textStyle: { fontFamily: 'IBM Plex Sans, sans-serif' },
      title: cfg.title ? { text: cfg.title, left: 'center', top: 4, textStyle: { color: '#cfd4cf', fontSize: 13, fontWeight: 600 } } : null,
    };
    const labelOpt = cfg.showLabels ? { show: true, color: AX.tx, fontSize: 10 } : { show: false };
    const avgMark = cfg.showAvg ? { markLine: { silent: true, symbol: 'none', lineStyle: { color: '#93e05f', type: 'dashed' }, data: [{ type: 'average', name: '평균' }], label: { color: '#93e05f', fontSize: 10, formatter: '평균 {c}' } } } : {};

    if (cfg.type === 'scatter') {
      const data = rows.filter((r) => r[cfg.x] != null && r[cfg.y] != null).map((r) => ({ value: [r[cfg.x], r[cfg.y]], name: r.name }));
      return Object.assign({}, base, {
        grid: { left: 60, right: 26, top: 30, bottom: 56 },
        xAxis: { name: colLabel(cfg.x), nameLocation: 'middle', nameGap: 30, nameTextStyle: { color: AX.txDim, fontSize: 10 }, axisLabel: { color: AX.tx, fontSize: 10 }, axisLine: { lineStyle: { color: AX.line } }, splitLine: { lineStyle: { color: AX.split } } },
        yAxis: { name: colLabel(cfg.y), axisLabel: { color: AX.tx, fontSize: 10 }, axisLine: { lineStyle: { color: AX.line } }, splitLine: { lineStyle: { color: AX.split } } },
        series: [{ type: 'scatter', symbolSize: 14, data, itemStyle: { color: pal[0], opacity: 0.85, borderColor: '#1b211b' }, label: cfg.showLabels ? { show: true, formatter: (p) => p.data.name, position: 'top', color: AX.tx, fontSize: 9 } : { show: false } }],
      });
    }
    if (cfg.type === 'pie') {
      const data = aggregate(rows, cfg.x, cfg.y, cfg.agg).map(([k, v]) => ({ name: k, value: v }));
      return Object.assign({}, base, {
        tooltip: { trigger: 'item', backgroundColor: '#2a2f2a', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#e8eae8' } },
        series: [{ type: 'pie', radius: ['38%', '70%'], center: ['50%', '54%'], data, label: { color: AX.tx, fontSize: 10 }, itemStyle: { borderColor: '#1b211b', borderWidth: 2 } }],
      });
    }
    if (cfg.type === 'radar') {
      const inds = [{ key: 'ppy', name: '평당가' }, { key: 'compet', name: '청약경쟁률' }, { key: 'units', name: '세대수' }, { key: 'stnDist', name: '역접근', inv: true }];
      const maxes = inds.map((ind) => Math.max(...rows.map((r) => r[ind.key] || 0)));
      const norm = (r) => inds.map((ind, i) => { const v = r[ind.key] || 0; const n = ind.inv ? (1 - v / (maxes[i] || 1)) : (v / (maxes[i] || 1)); return Math.round(n * 100); });
      const me = rows.find((r) => r.note === '본 사업지') || rows[0];
      const avg = inds.map((ind, i) => { const vs = rows.map((r) => r[ind.key] || 0); const a = vs.reduce((x, y) => x + y, 0) / vs.length; const n = ind.inv ? (1 - a / (maxes[i] || 1)) : (a / (maxes[i] || 1)); return Math.round(n * 100); });
      return Object.assign({}, base, {
        tooltip: { backgroundColor: '#2a2f2a', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#e8eae8' } },
        legend: { bottom: 6, textStyle: { color: AX.tx, fontSize: 11 } },
        radar: { indicator: inds.map((ind) => ({ name: ind.name, max: 100 })), center: ['50%', '50%'], radius: '62%', axisName: { color: AX.tx, fontSize: 11 }, splitLine: { lineStyle: { color: AX.split } }, splitArea: { areaStyle: { color: ['transparent'] } }, axisLine: { lineStyle: { color: AX.line } } },
        series: [{ type: 'radar', data: [
          { value: norm(me), name: '본 사업지', areaStyle: { color: 'rgba(147,224,95,0.25)' }, lineStyle: { color: pal[0] }, itemStyle: { color: pal[0] } },
          { value: avg, name: '경쟁 평균', areaStyle: { color: 'rgba(91,155,213,0.15)' }, lineStyle: { color: pal[1] }, itemStyle: { color: pal[1] } },
        ] }],
      });
    }
    // bar / hbar / line / area
    const data = aggregate(rows, cfg.x, cfg.y, cfg.agg);
    const cats = data.map((d) => d[0]); const vals = data.map((d) => d[1]);
    const catAxis = { type: 'category', data: cats, axisLabel: { color: AX.tx, fontSize: 10, interval: 0, rotate: cats.length > 6 ? 28 : 0 }, axisLine: { lineStyle: { color: AX.line } }, axisTick: { show: false } };
    const valAxis = { type: 'value', axisLabel: { color: AX.tx, fontSize: 10 }, axisLine: { show: false }, splitLine: { lineStyle: { color: AX.split } } };
    const hbar = cfg.type === 'hbar';
    const series = {
      type: cfg.type === 'line' || cfg.type === 'area' ? 'line' : 'bar',
      data: vals, label: Object.assign({ position: hbar ? 'right' : 'top' }, labelOpt),
      itemStyle: { color: pal[0], borderRadius: hbar ? [0, 4, 4, 0] : [4, 4, 0, 0] },
      areaStyle: cfg.type === 'area' ? { color: 'rgba(147,224,95,0.18)' } : undefined,
      lineStyle: cfg.type === 'line' || cfg.type === 'area' ? { color: pal[0], width: 2 } : undefined,
      smooth: cfg.type === 'area', symbol: 'circle', symbolSize: 6,
    };
    Object.assign(series, avgMark);
    return Object.assign({}, base, {
      grid: hbar ? { left: 96, right: 40, top: 30, bottom: 30 } : base.grid,
      xAxis: hbar ? valAxis : catAxis, yAxis: hbar ? catAxis : valAxis, series: [series],
    });
  }

  function EChart({ option, onInst }) {
    const ref = useRef(null); const inst = useRef(null);
    useEffect(() => { inst.current = window.echarts.init(ref.current, null, { renderer: 'canvas' }); onInst && onInst(inst.current); const ro = new ResizeObserver(() => inst.current && inst.current.resize()); ro.observe(ref.current); return () => { ro.disconnect(); inst.current.dispose(); }; }, []);
    useEffect(() => { if (inst.current && option) inst.current.setOption(option, true); }, [option]);
    return <div ref={ref} style={{ width: '100%', height: '100%' }}></div>;
  }

  const TYPES = [
    { k: 'bar', l: '막대', ic: 'chart' }, { k: 'hbar', l: '가로막대', ic: 'chart' }, { k: 'line', l: '선', ic: 'analysis' },
    { k: 'area', l: '영역', ic: 'analysis' }, { k: 'scatter', l: '산점도', ic: 'analysis' }, { k: 'pie', l: '파이', ic: 'target' }, { k: 'radar', l: '레이더', ic: 'swot' },
  ];

  function VizStudioBody() {
    const s = useStore((x) => x);
    const { rows, columns } = RS.getActive();
    const dims = columns.filter((c) => !isNum(c.type));
    const meas = columns.filter((c) => isNum(c.type));
    const [cfg, setCfg] = useState({ type: 'bar', x: 'name', y: 'ppy', agg: 'avg', title: '경쟁단지 평당가 비교', showLabels: true, showAvg: true, palette: '연두 기본' });
    const set = (p) => setCfg((c) => Object.assign({}, c, p));
    const instRef = useRef(null);
    const option = buildOption(cfg, rows, columns);
    const needs2Meas = cfg.type === 'scatter';
    const xField = needs2Meas ? cfg.x : cfg.x;

    const exportPng = () => { if (!instRef.current) return; const url = instRef.current.getDataURL({ pixelRatio: 2, backgroundColor: 'transparent' }); const a = document.createElement('a'); a.href = url; a.download = (cfg.title || 'chart') + '.png'; a.click(); };

    return (
      <React.Fragment>
        {/* left fields */}
        <div className="panel" style={{ width: 224 }}>
          <div className="ph"><span className="t">필드</span><span className="sp"></span><span className="c">{RS.getDataset().short}</span></div>
          <div className="dexp">
            <div className="fgh">차원 (Dimensions) <span>{dims.length}</span></div>
            {dims.map((c) => <div key={c.key} className={'frow dim' + (cfg.x === c.key ? ' sel' : '')} onClick={() => set(needs2Meas ? {} : { x: c.key })}><span className="fic">{c.type === 'datetime' ? '◷' : 'Abc'}</span><span className="fnm">{c.label}</span></div>)}
            <div className="fgh">측정값 (Measures) <span>{meas.length}</span></div>
            {meas.map((c) => <div key={c.key} className={'frow meas' + ((needs2Meas ? (cfg.x === c.key || cfg.y === c.key) : cfg.y === c.key) ? ' sel' : '')} onClick={() => needs2Meas ? set({ y: c.key }) : set({ y: c.key })}><span className="fic">#</span><span className="fnm">{c.label}</span><span className="fty">{c.unit}</span></div>)}
          </div>
        </div>

        {/* center builder */}
        <div className="center dV">
          <div className="shelfbar">
            <div className="shelf"><span className="shl">{needs2Meas ? 'X (측정값)' : '열 · X'}</span><span className="schip dim" onClick={() => { }}>{(columns.find((c) => c.key === (needs2Meas ? cfg.x : cfg.x)) || {}).label || '—'}</span></div>
            <div className="shelf"><span className="shl">{needs2Meas ? 'Y (측정값)' : '행 · Y'}</span>
              <span className="schip meas">{(columns.find((c) => c.key === cfg.y) || {}).label}{!needs2Meas && <span className="aggp" onClick={() => set({ agg: { avg: 'sum', sum: 'max', max: 'min', min: 'count', count: 'avg' }[cfg.agg] })}>{{ avg: '평균', sum: '합계', max: '최대', min: '최소', count: '개수' }[cfg.agg]}</span>}</span>
            </div>
            <span className="sp" style={{ flex: 1 }}></span>
            <div className="showme">{TYPES.map((t) => <span key={t.k} className={'smt' + (cfg.type === t.k ? ' on' : '')} title={t.l} onClick={() => set({ type: t.k, x: t.k === 'scatter' ? 'area' : 'name', y: t.k === 'scatter' ? 'ppy' : cfg.y })}>{Ic(t.ic, 15)}<span>{t.l}</span></span>)}</div>
          </div>
          <div className="chartarea"><EChart option={option} onInst={(i) => (instRef.current = i)} /></div>
        </div>

        {/* right options */}
        <div className="panel r" style={{ width: 268 }}>
          <div className="ph"><span className="t">차트 옵션</span><span className="sp"></span><span className="vexp" onClick={exportPng}>{Ic('export', 13)} PNG</span></div>
          <div className="vopts">
            <div className="vog"><div className="vol">제목</div><input className="cinp" value={cfg.title} onChange={(e) => set({ title: e.target.value })} /></div>
            <div className="vog"><div className="vol">표시</div>
              <label className="vtog" onClick={() => set({ showLabels: !cfg.showLabels })}><span className={'tgl' + (cfg.showLabels ? ' on' : '')}></span>값 라벨</label>
              {(cfg.type === 'bar' || cfg.type === 'hbar' || cfg.type === 'line' || cfg.type === 'area') && <label className="vtog" onClick={() => set({ showAvg: !cfg.showAvg })}><span className={'tgl' + (cfg.showAvg ? ' on' : '')}></span>평균선</label>}
            </div>
            <div className="vog"><div className="vol">색상 팔레트</div>
              {Object.keys(PALETTES).map((p) => (
                <div key={p} className={'palrow' + (cfg.palette === p ? ' on' : '')} onClick={() => set({ palette: p })}>
                  <span className="palsw">{PALETTES[p].slice(0, 5).map((c, i) => <i key={i} style={{ background: c }}></i>)}</span><span className="paln">{p}</span>
                </div>
              ))}
            </div>
            <div className="vog"><div className="vol">집계</div>
              <div className="aggrow">{['avg', 'sum', 'max', 'min'].map((a) => <span key={a} className={'aggb' + (cfg.agg === a ? ' on' : '')} onClick={() => set({ agg: a })}>{{ avg: '평균', sum: '합계', max: '최대', min: '최소' }[a]}</span>)}</div>
            </div>
            <div className="vmemo"><div className="vol">해석 메모</div><div className="vmemob">이 차트에서 읽은 인사이트를 기록하면 Report Builder로 전달됩니다.</div><div className="addmemo" onClick={() => window.PlanStore && window.PlanStore.actions.addInsight()}>{Ic('plus', 13)} 인사이트로 저장</div></div>
          </div>
        </div>
      </React.Fragment>
    );
  }
  window.VizStudioBody = VizStudioBody;
})();
