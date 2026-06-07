/* Map — 입지 분석 schematic map. window.MapStudioBody */
(function () {
  const Ic = window.Ic;
  const { useState } = React;

  const CATS = {
    site: { l: '사업지', c: 'var(--accent)' },
    comp: { l: '경쟁단지', c: 'var(--tx-lo)' },
    transit: { l: '교통', c: 'var(--swot-o)' },
    edu: { l: '교육', c: 'var(--swot-t)' },
    retail: { l: '상권', c: 'var(--note-violet)' },
    nature: { l: '자연·공원', c: 'var(--pos)' },
    medical: { l: '의료', c: 'var(--neg)' },
    biz: { l: '업무지구', c: 'var(--dim-color)' },
  };

  const POINTS = [
    { n: '래미안 송도 더퍼스트', cat: 'site', d: 0, a: 0 },
    // competitors
    { n: '더샵 송도센트럴', cat: 'comp', d: 0.7, a: 45 },
    { n: '힐스테이트 송도', cat: 'comp', d: 1.3, a: 115 },
    { n: 'e편한세상 송도', cat: 'comp', d: 1.0, a: 215 },
    { n: '송도국제도시 푸르지오', cat: 'comp', d: 0.9, a: 340 },
    { n: '송도 SK뷰', cat: 'comp', d: 2.2, a: 150 },
    // facilities
    { n: '캠퍼스타운역', cat: 'transit', d: 0.3, a: 20 },
    { n: '인천대입구역', cat: 'transit', d: 1.2, a: 200 },
    { n: '송도초등학교', cat: 'edu', d: 0.5, a: 80 },
    { n: '송도국제고', cat: 'edu', d: 0.9, a: 135 },
    { n: '채드윅국제학교', cat: 'edu', d: 2.1, a: 165 },
    { n: '커넬워크', cat: 'retail', d: 0.6, a: 320 },
    { n: '트리플스트리트', cat: 'retail', d: 1.4, a: 300 },
    { n: '센트럴파크', cat: 'nature', d: 0.4, a: 250 },
    { n: '미추홀공원', cat: 'nature', d: 1.1, a: 100 },
    { n: '가천대길병원 송도', cat: 'medical', d: 1.8, a: 35 },
    { n: '송도 바이오클러스터', cat: 'biz', d: 1.5, a: 355 },
  ];
  const KM = 17; // % per km
  const pos = (p) => ({ left: 50 + Math.cos(p.a * Math.PI / 180) * p.d * KM, top: 52 - Math.sin(p.a * Math.PI / 180) * p.d * KM });

  function MapStudioBody() {
    const [layers, setLayers] = useState(() => { const o = {}; Object.keys(CATS).forEach((k) => o[k] = true); return o; });
    const [rings, setRings] = useState({ r500: true, r1: true, r3: true });
    const toggle = (k) => setLayers((l) => Object.assign({}, l, { [k]: !l[k] }));
    const visible = POINTS.filter((p) => layers[p.cat]);
    const facilities = POINTS.filter((p) => p.cat !== 'site' && p.cat !== 'comp');
    const within = (km) => POINTS.filter((p) => p.cat !== 'site' && p.d <= km).length;

    return (
      <React.Fragment>
        {/* left layers */}
        <div className="panel" style={{ width: 224 }}>
          <div className="ph"><span className="t">레이어</span><span className="sp"></span>{Ic('layers', 15)}</div>
          <div className="dexp">
            {Object.keys(CATS).map((k) => {
              const cnt = POINTS.filter((p) => p.cat === k).length;
              return (
                <div key={k} className={'layrow' + (layers[k] ? '' : ' off')} onClick={() => toggle(k)}>
                  <span className={'lchk' + (layers[k] ? ' on' : '')} style={layers[k] ? { background: CATS[k].c, borderColor: 'transparent' } : {}}>{layers[k] && Ic('check', 11)}</span>
                  <span className="ldot" style={{ background: CATS[k].c }}></span>
                  <span className="lnm">{CATS[k].l}</span><span className="lcnt">{cnt}</span>
                </div>
              );
            })}
            <div className="ph" style={{ padding: '12px 4px 6px', borderBottom: 'none' }}><span className="t">데이터셋</span></div>
            <div className="layds">{Ic('table', 14)} 경쟁단지_조사표 · 입지시설</div>
          </div>
        </div>

        {/* center map */}
        <div className="center dM">
          <div className="maptop">
            {Ic('map', 16)}<span className="mtt">입지 분석 지도 — 송도동</span>
            <span className="sp" style={{ flex: 1 }}></span>
            <span className="mlbl">반경</span>
            {[['r500', '500m'], ['r1', '1km'], ['r3', '3km']].map(([k, l]) => <span key={k} className={'rtog' + (rings[k] ? ' on' : '')} onClick={() => setRings((r) => Object.assign({}, r, { [k]: !r[k] }))}>{l}</span>)}
            <span className="mexp">{Ic('export', 13)} 지도 PNG</span>
          </div>
          <div className="mapcanvas">
            <div className="mapbg"></div>
            {/* radius rings */}
            {rings.r3 && <div className="ring" style={{ width: 3 * KM * 2 + '%', aspectRatio: '1', left: '50%', top: '52%' }}><span className="rlab" style={{ top: '2%' }}>3km</span></div>}
            {rings.r1 && <div className="ring" style={{ width: 1 * KM * 2 + '%', aspectRatio: '1', left: '50%', top: '52%' }}><span className="rlab" style={{ top: '4%' }}>1km</span></div>}
            {rings.r500 && <div className="ring r-acc" style={{ width: 0.5 * KM * 2 + '%', aspectRatio: '1', left: '50%', top: '52%' }}><span className="rlab" style={{ top: '6%' }}>500m</span></div>}
            {/* points */}
            {visible.map((p, i) => {
              const ps = pos(p); const site = p.cat === 'site';
              return (
                <div key={i} className={'mpt' + (site ? ' site' : '')} style={{ left: ps.left + '%', top: ps.top + '%' }}>
                  <span className="mdot" style={{ background: CATS[p.cat].c }}></span>
                  <span className={'mptlab' + (site ? ' sitelab' : '')}>{p.n}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* right radius analysis */}
        <div className="panel r" style={{ width: 290 }}>
          <div className="ph"><span className="t">반경 분석</span></div>
          <div className="mright">
            <div className="radcards">
              {[['500m', 0.5], ['1km', 1], ['3km', 3]].map(([l, km]) => (
                <div key={l} className="radcard"><div className="rk">{l} 이내</div><div className="rv">{within(km)}<span className="ru">개</span></div></div>
              ))}
            </div>
            <div className="ph" style={{ padding: '10px 2px 6px', borderBottom: 'none' }}><span className="t">시설별 거리</span><span className="sp"></span><span className="muted" style={{ fontSize: 10 }}>사업지 기준</span></div>
            <div className="factable">
              {facilities.sort((a, b) => a.d - b.d).map((p, i) => (
                <div key={i} className="facrow">
                  <span className="fdot" style={{ background: CATS[p.cat].c }}></span>
                  <span className="fnm2">{p.n}</span>
                  <span className="fcat">{CATS[p.cat].l}</span>
                  <span className="fdist mono">{p.d.toFixed(1)}km</span>
                </div>
              ))}
            </div>
            <div className="addmemo" style={{ marginTop: 12 }} onClick={() => window.PlanStore && window.PlanStore.actions.addInsight()}>{Ic('plus', 13)} 입지 인사이트 저장</div>
          </div>
        </div>
      </React.Fragment>
    );
  }
  window.MapStudioBody = MapStudioBody;
})();
