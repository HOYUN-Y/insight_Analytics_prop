/* Brand strip — wordmark family + 연두 accent system */
(function () {
  const Ic = window.Ic;
  const fam = (name, fnPart, color) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.01em' }}>
      <span style={{ color: 'var(--tx-hi)' }}>in</span>
      <span style={{ color: 'var(--orange)' }}>sight</span>
      <span style={{ width: '0.28em', display: 'inline-block' }}></span>
      <span style={{ color }}>{name}</span>
      <span style={{ color: 'var(--tx-faint)', fontWeight: 600 }}>{fnPart}</span>
    </div>
  );

  function BrandStrip() {
    return (
      <div style={{ width: '100%', height: '100%', background: 'var(--bg-0)', color: 'var(--tx-hi)', fontFamily: 'var(--font-ui)', padding: '30px 38px', display: 'flex', gap: 40, boxSizing: 'border-box' }}>
        {/* identity */}
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--tx-faint)' }}>제품 정체성</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '16px 0 8px' }}>
            <div style={{ width: 56, height: 56, borderRadius: 15, background: 'var(--orange)', display: 'grid', placeItems: 'center', color: '#fff' }}>{Ic('analysis', 30)}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em' }}>
                <span>in</span><span style={{ color: 'var(--navy)' }}>sight</span>
                <span style={{ width: '0.28em', display: 'inline-block' }}></span>
                <span style={{ color: 'var(--orange)' }}>Analytics</span>
                <span style={{ width: '0.24em', display: 'inline-block' }}></span>
                <span style={{ color: 'var(--accent)' }}>Prop</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--tx-lo)', marginTop: 2 }}>insight Analytics 의 부동산(Prop) 에디션 · 분양 기획 분석 워크벤치</div>
            </div>
          </div>

          <div style={{ fontSize: 12.5, color: 'var(--tx-mid)', lineHeight: 1.6, maxWidth: 560, marginTop: 14 }}>
            워드마크 색 역할 —
            <b style={{ color: 'var(--tx-hi)' }}> in</b> 기본텍스트,
            <b style={{ color: 'var(--navy)' }}> sight</b> 네이비,
            <b style={{ color: 'var(--orange)' }}> Analytics</b> 오렌지(로고마크 계승),
            <b style={{ color: 'var(--accent)' }}> Prop</b> 연두. 부동산 도메인을 뜻하는 <b style={{ color: 'var(--accent)' }}>연두</b>가 이 에디션의 UI accent 색입니다.
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--tx-faint)', margin: '26px 0 12px' }}>제품군 (Family)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.01em' }}>
                <span style={{ color: 'var(--tx-hi)' }}>in</span><span style={{ color: 'var(--orange)' }}>sight</span> <span style={{ color: 'var(--orange)' }}>Analytics</span>
              </span>
              <span style={{ fontSize: 11, color: 'var(--tx-faint)', fontFamily: 'var(--font-mono)' }}>데이터 분석 · #E8611A</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.01em' }}>
                <span style={{ color: 'var(--tx-hi)' }}>in</span><span style={{ color: 'var(--orange)' }}>sight</span> <span style={{ color: 'var(--blue)' }}>Data</span><span style={{ color: 'var(--tx-faint)', fontWeight: 600 }}>hub</span>
              </span>
              <span style={{ fontSize: 11, color: 'var(--tx-faint)', fontFamily: 'var(--font-mono)' }}>데이터 수집 · #3F74E8</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.01em' }}>
                <span style={{ color: 'var(--tx-hi)' }}>in</span><span style={{ color: 'var(--navy)' }}>sight</span> <span style={{ color: 'var(--orange)' }}>Analytics</span> <span style={{ color: 'var(--accent)' }}>Prop</span>
              </span>
              <span style={{ fontSize: 11, color: 'var(--accent-hi)', fontFamily: 'var(--font-mono)' }}>부동산 분석 · NEW 연두</span>
            </div>
          </div>
        </div>

        {/* accent system */}
        <div style={{ flex: '0 0 420px', borderLeft: '1px solid var(--line)', paddingLeft: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--tx-faint)' }}>연두 Accent</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 16 }}>
            {[
              ['accent-hi', 'hi', 'oklch .86 .155 132'],
              ['accent', 'base', 'oklch .78 .165 135'],
              ['accent-deep', 'deep', 'oklch .62 .15 140'],
            ].map(([v, l, c]) => (
              <div key={v} style={{ borderRadius: 11, overflow: 'hidden', border: '1px solid var(--line)' }}>
                <div style={{ height: 60, background: 'var(--' + v + ')' }}></div>
                <div style={{ padding: '8px 9px', background: 'var(--bg-1)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{l}</div>
                  <div style={{ fontSize: 9.5, color: 'var(--tx-faint)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{c}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--tx-faint)', margin: '24px 0 10px' }}>적용 예</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="btn pri">{Ic('export', 14)} 보고서 생성</span>
            <span className="chip g">진행도 48%</span>
            <span className="st-pill done" style={{ alignSelf: 'center' }}>완료</span>
            <span className="st-pill adopt" style={{ alignSelf: 'center' }}>채택</span>
          </div>

          <div style={{ marginTop: 22, background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 12, padding: '13px 15px' }}>
            <div style={{ fontSize: 11, color: 'var(--tx-lo)', lineHeight: 1.6 }}>
              <b style={{ color: 'var(--tx-hi)' }}>SWOT · 차트 카테고리</b>는 연두를 앵커로 한 조화 팔레트를 사용합니다. 주황은 형제 제품 헤리티지 전용 — 경고/오류 의미로 쓰지 않습니다.
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              {['--accent', '--swot-o', '--dim-color', '--swot-t', '--note-violet', '--pos', '--neg'].map(c => (
                <div key={c} style={{ flex: 1, height: 22, borderRadius: 5, background: 'var(' + c + ')' }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  window.BrandStrip = BrandStrip;
})();
