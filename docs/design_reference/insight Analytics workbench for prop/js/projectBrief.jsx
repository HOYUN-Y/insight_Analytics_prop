/* Project Brief — Planning Studio setup screen */
(function () {
  const Ic = window.Ic;

  const TREE = [
    { g: '기획 (Planning)' },
    { ic: 'doc', t: 'Project Brief', on: true },
    { ic: 'grid', t: 'Business Canvas' },
    { ic: 'target', t: '연구 질문', n: '6' },
    { ic: 'flag', t: '가설', n: '4' },
    { ic: 'swot', t: 'SWOT' },
    { ic: 'node', t: 'Mind Map' },
    { ic: 'bulb', t: '인사이트', n: '12' },
    { ic: 'doc', t: '의사결정 로그', n: '7' },
    { g: '자료 (Assets)' },
    { ic: 'data', t: '데이터셋', n: '8' },
    { ic: 'chart', t: '차트', n: '5' },
    { ic: 'map', t: '지도', n: '2' },
  ];

  const TYPES = [
    { t: '아파트', ic: 'grid', on: true },
    { t: '오피스텔', ic: 'layers' },
    { t: '상가', ic: 'table' },
    { t: '지식산업센터', ic: 'analysis' },
    { t: '생활숙박시설', ic: 'pin' },
    { t: '기타', ic: 'plus' },
  ];

  const PURP = [
    { t: '시장조사', on: true }, { t: '분양가 검토', on: true },
    { t: '경쟁단지 분석', on: true }, { t: '입지 분석', on: false },
    { t: '마케팅 전략 수립', on: false }, { t: '제안서 작성', on: true },
  ];

  const field = (label, value, opts = {}) => (
    <div className={'field' + (opts.full ? ' full' : '')}>
      <div className="fl">{label}{opts.req && <span className="req">*</span>}</div>
      <div className={'fi' + (opts.sel ? ' sel' : '') + (opts.ph ? ' ph' : '')}>
        {opts.icon && Ic(opts.icon, 15)}<span>{value}</span>
        {opts.sel && <span style={{ color: 'var(--tx-faint)' }}>{Ic('chevd', 15)}</span>}
      </div>
    </div>
  );

  function ProjectBrief() {
    return (
      <window.Shell active="planning">
        {/* LEFT explorer */}
        <div className="panel" style={{ width: 244 }}>
          <div className="ph"><span className="t">프로젝트 구조</span><span className="sp"></span>{Ic('plus', 15)}</div>
          <div className="tree dP">
            {TREE.map((r, i) => r.g
              ? <div key={i} className="grp">{r.g}</div>
              : <div key={i} className={'tw' + (r.on ? ' on' : '')}>{Ic(r.ic, 15)}<span>{r.t}</span><span className="sp"></span>{r.n && <span className="n">{r.n}</span>}</div>
            )}
          </div>
        </div>

        {/* CENTER form */}
        <div className="center dP">
          <div className="wsh">
            {Ic('doc', 17)}<h2>Project Brief</h2>
            <span className="chip g">작성 86%</span>
            <span className="sp" style={{ flex: 1 }}></span>
            <span className="muted" style={{ fontSize: 11 }}>자동 저장됨 · 14:22</span>
          </div>
          <div className="brief">
            <div className="briefwrap">
              {/* 1. basic */}
              <div className="bsec">
                <div className="bsh"><span className="num">1</span><span className="bt">기본 정보</span><span className="bd">이 브리프로 최근 프로젝트 카드와 보고서 표지가 채워집니다</span></div>
                <div className="frow">
                  {field('프로젝트명', '래미안 송도 더퍼스트 시장조사', { req: true })}
                  {field('사업지명', '래미안 송도 더퍼스트', { req: true })}
                </div>
                <div className="field full" style={{ marginTop: 14 }}>
                  <div className="fl">사업 유형 <span className="req">*</span></div>
                  <div className="types">
                    {TYPES.map((t, i) => (
                      <div key={i} className={'tc' + (t.on ? ' on' : '')}>{Ic(t.ic, 15)}{t.t}</div>
                    ))}
                  </div>
                </div>
                <div className="frow" style={{ marginTop: 14, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="field">
                    <div className="fl">위치 <span className="req">*</span></div>
                    <div className="fi"><span style={{ color: 'var(--accent-hi)', display: 'flex' }}>{Ic('pin', 15)}</span><span>인천 연수구 송도동 24-5</span></div>
                    <div className="minimap"><span className="pinpt">{Ic('pin', 22)}</span><span className="mlbl">VWorld 좌표 변환 · 37.38, 126.64</span></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="frow" style={{ gridTemplateColumns: '1fr 1fr' }}>
                      {field('시행사', '송도개발(주)')}
                      {field('시공사', '삼성물산')}
                    </div>
                    {field('분양 예정 시기', '2026년 4분기 (Q4)', { sel: true, icon: 'flag' })}
                    {field('총 세대수', '1,204 세대', { icon: 'users' })}
                  </div>
                </div>
              </div>

              {/* 2. purpose */}
              <div className="bsec">
                <div className="bsh"><span className="num">2</span><span className="bt">분석 목적</span><span className="bd">선택한 목적에 맞춰 추천 분석·연구질문이 제안됩니다</span></div>
                <div className="purps">
                  {PURP.map((p, i) => (
                    <div key={i} className={'pc' + (p.on ? ' on' : '')}>
                      <span className="cbx">{p.on && Ic('check', 12)}</span>{p.t}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. description */}
              <div className="bsec" style={{ marginBottom: 4 }}>
                <div className="bsh"><span className="num">3</span><span className="bt">프로젝트 설명</span><span className="bd">선택</span></div>
                <div className="fi area">
                  인천 1호선 캠퍼스타운역 도보 5분 역세권 신축 대단지. 삼성물산 브랜드 프리미엄과 송도 직주근접을 핵심 소구점으로, 경쟁단지(더샵·힐스테이트·e편한세상) 대비 분양가 포지셔닝과 마케팅 차별화 방향을 도출하는 것이 목표.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — live preview + completeness */}
        <div className="panel r dP" style={{ width: 296 }}>
          <div className="ph"><span className="t">미리보기</span><span className="sp"></span><span className="muted" style={{ fontSize: 10 }}>최근 프로젝트 카드</span></div>
          <div className="pvwrap">
            <div className="pvcard">
              <div className="pvtop"><span className="ptype">아파트</span><span className="muted" style={{ fontSize: 10, marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>2026 Q4</span></div>
              <div className="pnm">래미안 송도 더퍼스트</div>
              <div className="ploc">{Ic('pin', 13)} 인천 연수구 송도동 · 1,204세대</div>
              <div className="pmeta">
                <span className="pm">시장조사</span><span className="pm">분양가 검토</span><span className="pm">경쟁단지</span><span className="pm">제안서</span>
              </div>
            </div>

            <div className="seclbl">작성 완성도</div>
            <div className="compl">
              {[
                { t: '기본 정보', ok: true, n: '7/7' },
                { t: '사업 유형 · 위치', ok: true, n: '✓' },
                { t: '분석 목적', ok: true, n: '4개' },
                { t: '프로젝트 설명', ok: true, n: '✓' },
                { t: '대표 이미지', ok: false, n: '선택' },
              ].map((c, i) => (
                <div key={i} className="cr">
                  <span className={'ck ' + (c.ok ? 'ok' : 'no')}>{c.ok ? Ic('check', 11) : Ic('plus', 11)}</span>
                  <span>{c.t}</span><span className="sp"></span><span className="pctnum">{c.n}</span>
                </div>
              ))}
            </div>

            <div className="nextcta">
              <span style={{ color: 'var(--accent-hi)' }}>{Ic('grid', 18)}</span>
              <div><div className="nt">다음 단계</div><div className="nn">Business Canvas</div></div>
              <span className="go">{Ic('arrow', 16)}</span>
            </div>
          </div>
        </div>
      </window.Shell>
    );
  }
  window.ProjectBrief = ProjectBrief;
})();
