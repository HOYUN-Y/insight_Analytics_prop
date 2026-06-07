/* Shared dense data grid for Data + Clean studios. window.REGrid */
(function () {
  const Ic = window.Ic, RE = window.RE;
  const { isNum, typeShort, fmt, stat } = RE;

  function REGrid({ columns, rows, selCol, onSelectCol }) {
    // precompute measure ranges for in-cell bars
    const ranges = {};
    columns.forEach((c) => { if (isNum(c.type)) { const vs = rows.map((r) => r[c.key]); ranges[c.key] = [stat.min(vs), stat.max(vs)]; } });
    return (
      <div className="gridwrap">
        <table className="rgrid">
          <thead>
            <tr>
              <th className="rg-idx">#</th>
              {columns.map((c) => {
                const tb = typeShort(c.type);
                return (
                  <th key={c.key} className={(selCol === c.key ? 'sel ' : '') + (isNum(c.type) ? 'num' : '')} onClick={() => onSelectCol && onSelectCol(c.key)}>
                    <span className={'tb2 ' + tb.c}>{tb.l}</span>
                    <span className="hname">{c.label}</span>
                    {c.unit && <span className="hunit">{c.unit}</span>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="rg-idx">{i + 1}</td>
                {columns.map((c) => {
                  const v = r[c.key];
                  const isMissing = v == null || v === '';
                  if (isNum(c.type)) {
                    const [mn, mx] = ranges[c.key] || [0, 1];
                    const pct = isMissing ? 0 : ((v - mn) / (mx - mn || 1)) * 100;
                    return (
                      <td key={c.key} className={'num' + (selCol === c.key ? ' selc' : '')}>
                        {isMissing ? <i className="nullc">null</i> : (
                          <span className="cellbar">
                            <span className="bar3" style={{ width: pct + '%' }}></span>
                            <span className="cv">{fmt.n(v, c.type === 'float' ? (Math.abs(v) < 100 ? 2 : 1) : 0)}</span>
                          </span>
                        )}
                      </td>
                    );
                  }
                  return (
                    <td key={c.key} className={selCol === c.key ? 'selc' : ''}>
                      {isMissing ? <i className="nullc">null</i> : <span className="tcell">{String(v)}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  window.REGrid = REGrid;
})();
