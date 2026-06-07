/* Clean Studio — issue bar + grid + operations + pipeline. window.CleanStudioBody */
(function () {
  const Ic = window.Ic, RE = window.RE, RS = window.REStore;
  const { useStore, actions } = RS;
  const { isNum, stat } = RE;

  const OP_LABEL = {
    drop_missing: ['결측 행 삭제', 'x'], fill_mean: ['평균 채우기', 'plus'], fill_median: ['중앙값 채우기', 'plus'], fill_mode: ['최빈값 채우기', 'plus'],
    drop_duplicates: ['중복 행 제거', 'layers'], remove_outliers: ['이상치 제외 (IQR)', 'clean'],
    money_unit: ['금액 단위 변환', 'dollar'], area_unit: ['면적 단위 변환', 'grid'], change_type: ['타입 변환', 'layers'],
    rename: ['컬럼명 변경', 'doc'], drop_col: ['컬럼 삭제', 'x'], formula: ['수식 컬럼', 'bulb'],
  };
  function stepText(s, columns) {
    const cm = (RE.datasets.find((d) => d.id === RS.getState().activeId).columns.find((c) => c.key === s.col)) || {};
    const nm = cm.label || s.col;
    const base = OP_LABEL[s.op] ? OP_LABEL[s.op][0] : s.op;
    if (s.op === 'drop_duplicates') return [base, ''];
    if (s.op === 'money_unit' || s.op === 'area_unit') return [base + ' → ' + s.params.to, nm];
    if (s.op === 'change_type') return [base + ' → ' + s.params.to, nm];
    if (s.op === 'rename') return ['이름 → ' + s.params.to, nm];
    if (s.op === 'formula') return ['수식: ' + s.params.name, s.params.expr];
    return [base, nm];
  }

  function IssueBar({ rows, columns }) {
    let totalMissing = 0, missCols = 0;
    columns.forEach((c) => { const m = stat.missing(rows.map((r) => r[c.key])); if (m) { totalMissing += m; missCols++; } });
    const seen = new Set(); let dups = 0; rows.forEach((r) => { const k = JSON.stringify(r); if (seen.has(k)) dups++; else seen.add(k); });
    let outliers = 0, outCol = null, outLabel = '';
    columns.forEach((c) => { if (isNum(c.type) && c.role === 'measure') { const q1 = stat.quantile(rows.map((r) => r[c.key]), .25), q3 = stat.quantile(rows.map((r) => r[c.key]), .75), iqr = q3 - q1; const lo = q1 - 1.5 * iqr, hi = q3 + 1.5 * iqr; const n = rows.filter((r) => r[c.key] != null && (r[c.key] < lo || r[c.key] > hi)).length; if (n > outliers) { outliers = n; outCol = c.key; outLabel = c.label; } } });
    const Issue = ({ ok, icon, val, label, sub, action }) => (
      <div className={'issue' + (ok ? ' ok' : '')}>
        <span className="iic">{Ic(ok ? 'check' : icon, 13)}</span>
        <div className="ibody"><div className="ival mono">{ok ? '깨끗' : val.toLocaleString()}</div><div className="ilbl">{label}{!ok && sub ? ' · ' + sub : ''}</div></div>
        {!ok && action && <span className="ibtn" onClick={action.fn}>{action.t}</span>}
      </div>
    );
    return (
      <div className="issuebar2">
        <Issue ok={!totalMissing} icon="bulb" val={totalMissing} label="결측 셀" sub={missCols + '개 컬럼'} action={{ t: '처리', fn: () => { } }} />
        <Issue ok={!dups} icon="layers" val={dups} label="중복 행" action={{ t: '제거', fn: () => actions.addStep({ op: 'drop_duplicates', col: null }) }} />
        <Issue ok={!outliers} icon="clean" val={outliers} label="이상치" sub={outLabel} action={{ t: '제외', fn: () => actions.addStep({ op: 'remove_outliers', col: outCol }) }} />
        <span className="sp" style={{ flex: 1 }}></span>
        <span className="imeta mono">{rows.length} 행</span>
      </div>
    );
  }

  function Ops({ columns, rows }) {
    const [col, setCol] = React.useState('price');
    const [rn, setRn] = React.useState('');
    const sel = columns.find((c) => c.key === col) || columns[0];
    React.useEffect(() => { if (!columns.find((c) => c.key === col)) setCol(columns[0] && columns[0].key); }, [columns.length]);
    if (!sel) return null;
    const numeric = isNum(sel.type);
    const isMoney = ['만원', '억원', '원'].includes(sel.unit);
    const isArea = ['㎡', '평'].includes(sel.unit);
    const add = (op, params) => actions.addStep({ op, col, params });
    const OpBtn = ({ op, on, params, label, danger }) => <span className={'opb2' + (danger ? ' dng' : '')} onClick={on || (() => add(op, params))}>{Ic(OP_LABEL[op] ? OP_LABEL[op][1] : 'bolt', 13)}{label || OP_LABEL[op][0]}</span>;
    return (
      <div className="cleanops">
        <div className="cog"><div className="cot">대상 컬럼</div>
          <select className="csel" value={col} onChange={(e) => setCol(e.target.value)}>
            {columns.map((c) => <option key={c.key} value={c.key}>{c.label} ({c.type}{c.unit ? ' ' + c.unit : ''})</option>)}
          </select>
        </div>
        <div className="cog"><div className="coh">결측치 처리</div><div className="opbs">
          <OpBtn op="drop_missing" label="행 삭제" />
          {numeric && <OpBtn op="fill_mean" label="평균" />}
          {numeric && <OpBtn op="fill_median" label="중앙값" />}
          <OpBtn op="fill_mode" label="최빈값" />
        </div></div>
        <div className="cog"><div className="coh">행 정리</div><div className="opbs">
          <OpBtn op="drop_duplicates" on={() => actions.addStep({ op: 'drop_duplicates', col: null })} label="중복 제거" />
          {numeric && <OpBtn op="remove_outliers" label="이상치 제외" />}
        </div></div>
        {(isMoney || isArea) && (
          <div className="cog"><div className="coh">단위 변환 <span className="cohs">실무 비교용</span></div><div className="opbs">
            {isMoney && <React.Fragment>
              <OpBtn op="money_unit" params={{ to: '만원' }} label="만원" /><OpBtn op="money_unit" params={{ to: '억원' }} label="억원" /><OpBtn op="money_unit" params={{ to: '원' }} label="원" />
            </React.Fragment>}
            {isArea && <React.Fragment>
              <OpBtn op="area_unit" params={{ to: '㎡' }} label="㎡" /><OpBtn op="area_unit" params={{ to: '평' }} label="평" />
            </React.Fragment>}
          </div></div>
        )}
        <div className="cog"><div className="coh">변환</div>
          <div className="opinline"><input className="cinp" placeholder={'"' + sel.label + '" 새 이름'} value={rn} onChange={(e) => setRn(e.target.value)} /><span className={'cbtn' + (rn.trim() ? '' : ' dis')} onClick={() => { if (rn.trim()) { add('rename', { to: rn.trim() }); setRn(''); } }}>적용</span></div>
          <div className="opinline" style={{ marginTop: 6 }}><span className="colab">타입</span>{['string', 'integer', 'float', 'datetime'].map((t) => <span key={t} className="typeb" onClick={() => add('change_type', { to: t })}>{t.slice(0, 3)}</span>)}</div>
          <div className="opbs" style={{ marginTop: 6 }}><OpBtn op="drop_col" danger label="컬럼 삭제" /></div>
        </div>
        <div className="cog"><div className="coh">파생 컬럼 (수식)</div>
          <div className="opbs">
            <span className="opb2" onClick={() => add('formula', { name: '평형', expr: 'row.area / 3.305785' })}>{Ic('bulb', 13)}평형 = 면적/3.3</span>
            <span className="opb2" onClick={() => add('formula', { name: '총분양금', expr: 'row.price * row.units' })}>{Ic('bulb', 13)}총분양금</span>
          </div>
          <div className="cohint"><code>row</code> 객체로 각 행 접근 · 예: <code>row.price / row.area</code></div>
        </div>
      </div>
    );
  }

  function Pipeline({ ds, steps, cursor, columns }) {
    return (
      <div className="cog">
        <div className="coh" style={{ display: 'flex', alignItems: 'center' }}>파이프라인 <span className="mono" style={{ color: 'var(--tx-faint)', marginLeft: 6, fontWeight: 400 }}>{cursor}/{steps.length}</span><span className="sp" style={{ flex: 1 }}></span>{steps.length > 0 && <span className="clearb" onClick={actions.clearSteps}>초기화</span>}</div>
        <div className="pipe2">
          <div className={'pl2 src' + (cursor === 0 ? ' cur' : '')} onClick={() => actions.gotoStep(0)}>
            <span className="plic">{Ic('data', 12)}</span><div className="plb"><div className="pln">소스 · {ds.short}</div><div className="pls">{ds.rows.length}행 로드</div></div>
          </div>
          {steps.map((s, i) => {
            const [name, c] = stepText(s, columns);
            const future = i >= cursor;
            return (
              <div key={s.id} className={'pl2' + (i + 1 === cursor ? ' cur' : '') + (future ? ' future' : '')} onClick={() => actions.gotoStep(i + 1)}>
                <span className="plic">{Ic(OP_LABEL[s.op] ? OP_LABEL[s.op][1] : 'bolt', 12)}</span>
                <div className="plb"><div className="pln">{name}</div>{c && <div className="pls mono">{c}</div>}</div><span className="pln2 mono">{i + 1}</span>
              </div>
            );
          })}
          {steps.length === 0 && <div className="plempty">아직 단계가 없습니다. 위에서 연산을 추가하세요 — 모든 작업은 기록되고 되돌릴 수 있습니다.</div>}
        </div>
      </div>
    );
  }

  function Center() {
    const s = useStore((x) => x);
    const { ds, rows, columns, steps, cursor } = RS.getActive();
    return (
      <div className="center dCl">
        <div className="wsh">{Ic('clean', 17)}<h2>Cleaning Studio</h2><span className="chip" style={{ height: 20 }}>{ds.short}</span><span className="sp" style={{ flex: 1 }}></span>
          <span className={'undob' + (cursor === 0 ? ' dis' : '')} onClick={actions.undo}>{Ic('import', 13)} 되돌리기</span>
          <span className={'undob' + (cursor >= steps.length ? ' dis' : '')} onClick={actions.redo}>{Ic('export', 13)} 다시</span>
        </div>
        <IssueBar rows={rows} columns={columns} />
        <window.REGrid columns={columns} rows={rows} selCol={s.selCol} onSelectCol={actions.setSelCol} />
      </div>
    );
  }

  window.CleanStudioBody = function () {
    const s = useStore((x) => x);
    const { ds, columns, steps, cursor, rows } = RS.getActive();
    return (
      <React.Fragment>
        <Center />
        <div className="panel r" style={{ width: 300 }}>
          <div className="ph"><span className="t">연산 &amp; 파이프라인</span></div>
          <div className="cleanpanel2">
            <Ops columns={columns} rows={rows} />
            <Pipeline ds={ds} steps={steps} cursor={cursor} columns={columns} />
          </div>
        </div>
      </React.Fragment>
    );
  };
})();
