/* Data Studio — explorer + preview/profiling + column profile. window.DataStudioBody */
(function () {
  const Ic = window.Ic, RE = window.RE, RS = window.REStore;
  const { useStore, actions } = RS;
  const { isNum, typeShort, fmt, stat } = RE;

  // ---- left explorer ----
  function Explorer() {
    const activeId = useStore((s) => s.activeId);
    const selCol = useStore((s) => s.selCol);
    return (
      <div className="panel" style={{ width: 252 }}>
        <div className="ph"><span className="t">데이터셋</span><span className="sp"></span><span className="c">{RE.datasets.length}</span></div>
        <div className="dexp">
          <div className="dsearch">{Ic('search', 13)}<span>데이터셋·필드 검색…</span></div>
          {RE.datasets.map((ds) => {
            const on = ds.id === activeId;
            const dims = ds.columns.filter((c) => c.role === 'dimension');
            const meas = ds.columns.filter((c) => c.role === 'measure');
            return (
              <div key={ds.id}>
                <div className={'dsrow' + (on ? ' on' : '')} onClick={() => actions.setActive(ds.id)}>
                  {Ic('chevron', 12)}{Ic(ds.icon, 14)}<span className="dsn">{ds.short}</span><span className="dsm">{ds.rows.length || '—'}</span>
                </div>
                {on && ds.columns.length > 0 && (
                  <div className="dfields">
                    <div className="fgh">차원 (Dimensions) <span>{dims.length}</span></div>
                    {dims.map((c) => <FieldRow key={c.key} c={c} sel={selCol === c.key} />)}
                    <div className="fgh">측정값 (Measures) <span>{meas.length}</span></div>
                    {meas.map((c) => <FieldRow key={c.key} c={c} sel={selCol === c.key} />)}
                  </div>
                )}
              </div>
            );
          })}
          <div className="ph" style={{ padding: '12px 4px 6px', borderBottom: 'none' }}><span className="t">부동산 조사 템플릿</span></div>
          <div className="tmpls">
            {RE.TEMPLATES.map((t) => <div key={t} className="tmpl">{Ic('plus', 12)}{t}</div>)}
          </div>
          <div className="dropz">{Ic('import', 18)}<div className="dzt">CSV · XLSX · JSON 끌어다 놓기</div><div className="dzs">또는 빈 시트 생성 · 수기 입력</div></div>
        </div>
      </div>
    );
  }
  function FieldRow({ c, sel }) {
    const role = c.role === 'measure' ? 'meas' : 'dim';
    return (
      <div className={'frow ' + role + (sel ? ' sel' : '')} onClick={() => actions.setSelCol(c.key)}>
        <span className="fic">{c.type === 'datetime' ? '◷' : c.role === 'measure' ? '#' : 'Abc'}</span>
        <span className="fnm">{c.label}</span><span className="fty">{c.unit || typeShort(c.type).l}</span>
      </div>
    );
  }

  // ---- center ----
  function Center() {
    const s = useStore((x) => x);
    const { rows, columns } = RS.getActive();
    const ds = RS.getDataset();
    if (!columns.length) return (
      <div className="center dDS"><div className="modstub"><div className="ms-ic">{Ic('data', 26)}</div><div className="ms-t">{ds.short}</div><div className="ms-s">{ds.note}</div><div className="ms-s" style={{ fontSize: 11 }}>경쟁단지_조사표를 선택해 미리보기·프로파일링을 확인하세요.</div></div></div>
    );
    return (
      <div className="center dDS">
        <div className="subtabs" style={{ paddingLeft: 14 }}>
          {[['preview', '데이터 미리보기'], ['profiling', '프로파일링']].map(([k, l]) => (
            <div key={k} className={'subtab' + (s.dataTab === k ? ' on' : '')} onClick={() => actions.setDataTab(k)}>{l}{k === 'preview' && <span className="cnt2">{rows.length}</span>}</div>
          ))}
          <span className="sp" style={{ flex: 1 }}></span>
          <span className="chip g" style={{ alignSelf: 'center', marginRight: 12 }}>{Ic('bulb', 12)} 자동 프로파일</span>
        </div>
        {s.dataTab === 'preview'
          ? <window.REGrid columns={columns} rows={rows} selCol={s.selCol} onSelectCol={actions.setSelCol} />
          : <Profiling columns={columns} rows={rows} selCol={s.selCol} />}
      </div>
    );
  }

  function MiniHist({ rows, col, h }) {
    const cat = !isNum(col.type);
    let bars;
    if (cat) { const m = new Map(); rows.forEach((r) => { const v = r[col.key]; if (v != null && v !== '') m.set(v, (m.get(v) || 0) + 1); }); const arr = [...m.values()].sort((a, b) => b - a).slice(0, 14); const mx = Math.max(...arr, 1); bars = arr.map((c) => c / mx); }
    else { const hh = stat.histogram(rows.map((r) => r[col.key]), 20); bars = hh.bins.map((b) => b.c / (hh.max || 1)); }
    return <div className="minihist">{bars.map((v, i) => <span key={i} style={{ height: Math.max(2, v * h) + 'px', background: cat ? 'var(--dim-color)' : 'var(--meas-color)' }}></span>)}</div>;
  }

  function Profiling({ columns, rows, selCol }) {
    return (
      <div className="profwrap">
        <div className="profgrid">
          {columns.map((c) => {
            const vals = rows.map((r) => r[c.key]);
            const miss = stat.missing(vals) / rows.length * 100;
            const tb = typeShort(c.type);
            return (
              <div key={c.key} className={'profcard2' + (selCol === c.key ? ' sel' : '')} onClick={() => actions.setSelCol(c.key)}>
                <div className="pch"><span className={'tb2 ' + tb.c}>{tb.l}</span><span className="pcn">{c.label}</span></div>
                <MiniHist rows={rows} col={c} h={34} />
                <div className="pcs">
                  {isNum(c.type)
                    ? <React.Fragment><span><b>{fmt.compact(stat.mean(vals))}</b> 평균</span><span><b>{fmt.compact(stat.min(vals))}</b>–<b>{fmt.compact(stat.max(vals))}</b></span></React.Fragment>
                    : <React.Fragment><span><b>{stat.distinct(vals)}</b> 고유</span><span className="ell">최빈 <b>{String(stat.mode(vals)).slice(0, 8)}</b></span></React.Fragment>}
                  <span className={miss > 0 ? 'miss' : ''}>{miss > 0 ? <b>{miss.toFixed(0)}% 결측</b> : '0 결측'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ---- right column profile ----
  function ColProfile() {
    const s = useStore((x) => x);
    const { rows, columns } = RS.getActive();
    const col = columns.find((c) => c.key === s.selCol);
    if (!col) return (<div className="panel r" style={{ width: 286 }}><div className="ph"><span className="t">컬럼 프로파일</span></div><div className="modstub" style={{ padding: 20 }}><div className="ms-s" style={{ textAlign: 'center' }}>컬럼 헤더나 프로파일 카드를<br />선택하면 분포·통계를 봅니다.</div></div></div>);
    const vals = rows.map((r) => r[col.key]);
    const tb = typeShort(col.type);
    const missing = stat.missing(vals);
    const Row = ({ k, v, acc }) => <div className="kvr"><span className="kk">{k}</span><span className={'kv2 mono' + (acc ? ' acc' : '')}>{v}</span></div>;
    return (
      <div className="panel r" style={{ width: 286 }}>
        <div className="ph"><span className="t">컬럼 프로파일</span></div>
        <div className="cprof">
          <div className="cph"><span className={'tb2 ' + tb.c}>{tb.l}</span><span className="cpn">{col.label}</span></div>
          <div className="cpsub mono">{col.type}{col.unit ? ' · ' + col.unit : ''} · {col.role === 'measure' ? '측정값' : '차원'}</div>
          <div className="cpsec"><div className="cpt">개요</div>
            <Row k="행 수" v={rows.length.toLocaleString()} />
            <Row k="결측" v={missing + ' (' + (missing / rows.length * 100).toFixed(0) + '%)'} acc={missing > 0} />
            <Row k="고유값" v={stat.distinct(vals).toLocaleString()} />
          </div>
          {isNum(col.type) ? (
            <React.Fragment>
              <div className="cpsec"><div className="cpt">분포</div><FullHist rows={rows} col={col} /><BoxPlot vals={vals} /></div>
              <div className="cpsec"><div className="cpt">통계</div>
                <Row k="평균" v={fmt.n(stat.mean(vals), 1)} />
                <Row k="중앙값" v={fmt.n(stat.median(vals), 1)} />
                <Row k="표준편차" v={fmt.n(stat.std(vals), 1)} />
                <Row k="최소 / 최대" v={fmt.n(stat.min(vals), 0) + ' / ' + fmt.n(stat.max(vals), 0)} />
                <Row k="Q1 / Q3" v={fmt.n(stat.quantile(vals, .25), 0) + ' / ' + fmt.n(stat.quantile(vals, .75), 0)} />
              </div>
            </React.Fragment>
          ) : col.type === 'datetime' ? (
            <div className="cpsec"><div className="cpt">기간</div><Row k="시작" v={vals.filter(Boolean).sort()[0]} /><Row k="끝" v={vals.filter(Boolean).sort().slice(-1)[0]} /></div>
          ) : (
            <div className="cpsec"><div className="cpt">상위 값</div><TopVals rows={rows} col={col} /></div>
          )}
        </div>
      </div>
    );
  }
  function FullHist({ rows, col }) {
    const hh = stat.histogram(rows.map((r) => r[col.key]), 22);
    return <div className="fullhist2">{hh.bins.map((b, i) => <span key={i} className="fhb" style={{ height: Math.max(2, (b.c / (hh.max || 1)) * 100) + '%' }}></span>)}</div>;
  }
  function BoxPlot({ vals }) {
    const mn = stat.min(vals), mx = stat.max(vals), q1 = stat.quantile(vals, .25), q3 = stat.quantile(vals, .75), med = stat.median(vals);
    if (mn == null) return null; const sc = (v) => ((v - mn) / (mx - mn || 1)) * 100;
    return <div className="boxp"><div className="bpl"></div><div className="bpb" style={{ left: sc(q1) + '%', width: (sc(q3) - sc(q1)) + '%' }}></div><div className="bpm" style={{ left: sc(med) + '%' }}></div></div>;
  }
  function TopVals({ rows, col }) {
    const m = new Map(); rows.forEach((r) => { const v = r[col.key]; m.set(v, (m.get(v) || 0) + 1); });
    const data = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8); const max = Math.max(...data.map((d) => d[1]), 1);
    return <div className="tvals">{data.map(([v, c], i) => <div key={i} className="tvr"><span className="tvn ell">{v == null || v === '' ? <i className="nullc">null</i> : String(v)}</span><span className="tvb"><span style={{ width: (c / max * 100) + '%', background: 'var(--accent)' }}></span></span><span className="tvc mono">{c}</span></div>)}</div>;
  }

  window.DataStudioBody = function () {
    return (<React.Fragment><Explorer /><Center /><ColProfile /></React.Fragment>);
  };
})();
