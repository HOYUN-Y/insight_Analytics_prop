/* Real Estate Analysis — Study screen, all 7 tabs. window.StudyBody */
(function () {
  const Ic = window.Ic;
  const { useState } = React;
  const PS = window.PlanStore;

  const TABS = ['시장 개요', '가격 분석', '경쟁단지 비교', '입지 분석', '수요·인구', '분양조건', '마케팅 포인트'];
  const DS = [
    { ab: '실', t: '송도_실거래가_2024', n: '5,234', on: true },
    { ab: '경', t: '경쟁단지_조사표', n: '12' },
    { ab: '인', t: '인구_세대_연수구', n: '48' },
  ];

  const Card = ({ k, v, u, d, dc }) => <div className="scard"><div className="sk">{k}</div><div className="sv">{v}{u && <span className="u">{u}</span>}</div>{d && <div className={'sd ' + (dc || '')}>{d}</div>}</div>;
  const VizH = ({ ic, t, s }) => <div className="vh">{Ic(ic, 15)}<span className="vt">{t}</span><span className="sp" style={{ flex: 1 }}></span>{s && <span className="vs">{s}</span>}</div>;
  const Bars = ({ data }) => <div className="barchart">{data.map((b, i) => <div key={i} className={'barcol' + (b.hl ? ' hl' : '')}><span className="bval">{b.v}</span><div className="bar2" style={{ height: b.h + '%' }}></div><span className="blab">{b.l}</span></div>)}</div>;

  // ---------- 0 시장 개요 ----------
  function MarketTab() {
    return (
      <div className="swrap">
        <div className="scards">
          <Card k="송도 평균 평당가" v="2,040" u="만" d="▲ 최근 6개월 +3.8%" dc="up" />
          <Card k="분기 거래량" v="1,284" u="건" d="전분기 대비 +6.2%" dc="up" />
          <Card k="청약경쟁률 평균" v="9.2" u=":1" d="권역 신축 기준" />
          <Card k="공급 예정" v="6" u="개" d="향후 12개월 분양" />
        </div>
        <div className="panes2">
          <div className="vizcard"><VizH ic="analysis" t="월별 평당가 추이" s="만원/평" />
            <Bars data={[{ l: '1월', v: '1,960', h: 52 }, { l: '2월', v: '1,990', h: 60 }, { l: '3월', v: '2,010', h: 66 }, { l: '4월', v: '2,000', h: 63 }, { l: '5월', v: '2,030', h: 72 }, { l: '6월', v: '2,040', h: 76, hl: true }]} />
          </div>
          <div className="vizcard"><VizH ic="table" t="권역 공급 예정" s="향후 12개월" />
            <table className="ranktable"><thead><tr><th>단지</th><th>세대</th><th>분양</th></tr></thead><tbody>
              {[['래미안 송도 더퍼스트', '1,204', '26 Q4', true], ['송도 캐슬앤스카이', '690', '26 Q3'], ['송도 자이', '880', '27 Q1'], ['더샵 송도리버', '1,020', '27 Q2']].map((r, i) => (
                <tr key={i} className={r[3] ? 'me' : ''}><td className="nm3">{r[0]}</td><td className="mono">{r[1]}</td><td>{r[2]}</td></tr>
              ))}
            </tbody></table>
          </div>
        </div>
      </div>
    );
  }

  // ---------- 1 가격 분석 ----------
  function PriceTab() {
    const DOTS = [{ x: 78, y: 72, l: '본 사업지', cls: 'me' }, { x: 64, y: 64, l: '더샵 센트럴', cls: 'comp' }, { x: 52, y: 50, l: '힐스테이트', cls: 'comp' }, { x: 40, y: 78, l: 'e편한세상', cls: 'comp' }, { x: 30, y: 38, l: '푸르지오', cls: 'comp' }];
    const RANK = [{ nm: '본 사업지 (래미안)', pp: 2100, yr: '신축', dist: '0.3km', d: 0, me: true }, { nm: '더샵 송도센트럴', pp: 2040, yr: '5년', dist: '0.5km', d: 2.9 }, { nm: 'e편한세상 송도', pp: 1980, yr: '7년', dist: '0.8km', d: 6.1 }, { nm: '힐스테이트 송도', pp: 1920, yr: '6년', dist: '1.1km', d: 9.4 }, { nm: '푸르지오', pp: 1860, yr: '4년', dist: '1.4km', d: 12.9 }];
    return (
      <div className="swrap">
        <div className="scards">
          <Card k="평균 평당가" v="2,148" u="만" d="▲ 경쟁단지 평균 +5.3%" dc="up" />
          <Card k="중앙값" v="2,090" u="만" d="최빈 84㎡ 기준" />
          <Card k="최소" v="1,760" u="만" d="푸르지오 59㎡" />
          <Card k="최대" v="2,540" u="만" d="본 사업지 펜트" />
        </div>
        <div className="panes2">
          <div className="vizcard"><VizH ic="chart" t="면적대별 평당가" s="만원/평" />
            <Bars data={[{ l: '59㎡', v: '2,240', h: 78 }, { l: '74㎡', v: '2,180', h: 70 }, { l: '84㎡', v: '2,100', h: 62, hl: true }, { l: '101㎡', v: '2,040', h: 54 }]} />
          </div>
          <div className="vizcard"><VizH ic="analysis" t="가격 포지셔닝 매트릭스" s="입지 × 가격" />
            <div className="scatter"><div className="avg" style={{ left: '55%', top: 0, bottom: 0, borderLeftWidth: 1 }}></div><div className="avg" style={{ top: '42%', left: 0, right: 0, borderTopWidth: 1 }}></div>
              {DOTS.map((d, i) => <div key={i} className={'dot3 ' + d.cls} style={{ left: d.x + '%', bottom: d.y + '%' }}><span className="dl">{d.l}</span></div>)}
              <span className="axl x">입지 점수 →</span><span className="axl y">↑ 평당가</span>
            </div>
          </div>
        </div>
        <div className="vizcard"><VizH ic="table" t="경쟁단지 평당가 Ranking" s="본 사업지 대비" />
          <table className="ranktable"><thead><tr><th>단지</th><th>평당가</th><th>연식</th><th>역 거리</th><th>본 사업지 대비</th></tr></thead><tbody>
            {RANK.map((r, i) => <tr key={i} className={r.me ? 'me' : ''}><td className="nm3">{r.nm}</td><td><span className="mono">{r.pp.toLocaleString()}만</span></td><td>{r.yr}</td><td className="mono">{r.dist}</td><td>{r.me ? <span className="muted">기준</span> : <span className="prem p">+{r.d}% 비쌈</span>}</td></tr>)}
          </tbody></table>
        </div>
      </div>
    );
  }

  // ---------- 2 경쟁단지 비교 ----------
  function CompareTab() {
    const ROWS = [
      { nm: '본 사업지 (래미안)', u: 1204, yr: '신축', d: '0.3km', pp: 2100, br: '삼성물산', cr: '—', me: true },
      { nm: '더샵 송도센트럴', u: 980, yr: '5년', d: '0.5km', pp: 2040, br: '포스코', cr: '8.1' },
      { nm: '힐스테이트 송도', u: 1500, yr: '6년', d: '1.1km', pp: 1920, br: '현대', cr: '6.5' },
      { nm: 'e편한세상 송도', u: 760, yr: '7년', d: '0.8km', pp: 1980, br: 'DL이앤씨', cr: '5.2' },
      { nm: '송도국제도시 푸르지오', u: 543, yr: '4년', d: '0.6km', pp: 2010, br: '대우', cr: '9.8' },
    ];
    return (
      <div className="swrap">
        <div className="vizcard"><VizH ic="table" t="경쟁단지 비교 매트릭스" s="본 사업지 하이라이트" />
          <table className="ranktable"><thead><tr><th>단지</th><th>세대수</th><th>연식</th><th>역거리</th><th>평당가</th><th>브랜드</th><th>청약</th></tr></thead><tbody>
            {ROWS.map((r, i) => <tr key={i} className={r.me ? 'me' : ''}><td className="nm3">{r.nm}</td><td className="mono">{r.u.toLocaleString()}</td><td>{r.yr}</td><td className="mono">{r.d}</td><td className="mono">{r.pp.toLocaleString()}만</td><td>{r.br}</td><td className="mono">{r.cr}{r.cr !== '—' ? ':1' : ''}</td></tr>)}
          </tbody></table>
        </div>
        <div className="panes2">
          <div className="vizcard" style={{ borderLeft: '2px solid var(--swot-s)' }}><VizH ic="check" t="강점 (vs 경쟁)" />
            <ul className="swlist s">{['유일 신축 + 대단지(1,204세대)', '삼성물산 브랜드 프리미엄', '역세권 도보 5분 — 최단거리', '센트럴파크 인접'].map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
          <div className="vizcard" style={{ borderLeft: '2px solid var(--swot-w)' }}><VizH ic="flag" t="약점 (vs 경쟁)" />
            <ul className="swlist w">{['평당가 권역 1위 — 가격 저항', '학군 경쟁력 보통 수준', '입주 시점 경쟁 공급 겹침'].map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
        </div>
      </div>
    );
  }

  // ---------- 3 입지 분석 ----------
  function LocationTab() {
    const CATS = [
      { ic: 'train', l: '교통', c: 'var(--swot-o)', n: 2, top: '캠퍼스타운역', d: '0.3km' },
      { ic: 'doc', l: '교육', c: 'var(--swot-t)', n: 3, top: '송도초등학교', d: '0.5km' },
      { ic: 'grid', l: '상권', c: 'var(--note-violet)', n: 2, top: '커넬워크', d: '0.6km' },
      { ic: 'pin', l: '자연·공원', c: 'var(--pos)', n: 2, top: '센트럴파크', d: '0.4km' },
    ];
    const FAC = [['캠퍼스타운역', '교통', '0.3'], ['센트럴파크', '자연', '0.4'], ['송도초등학교', '교육', '0.5'], ['커넬워크', '상권', '0.6'], ['송도국제고', '교육', '0.9'], ['미추홀공원', '자연', '1.1'], ['인천대입구역', '교통', '1.2'], ['트리플스트리트', '상권', '1.4']];
    return (
      <div className="swrap">
        <div className="catgrid">
          {CATS.map((c, i) => <div key={i} className="catcard"><div className="cathd"><span className="catic" style={{ background: c.c }}>{Ic(c.ic, 14)}</span>{c.l}<span className="sp" style={{ flex: 1 }}></span><span className="catn">{c.n}</span></div><div className="cattop">{c.top}</div><div className="catd mono">최단 {c.d}</div></div>)}
        </div>
        <div className="panes2">
          <div className="vizcard"><VizH ic="map" t="반경별 입지시설" s="사업지 기준" />
            <div className="radcards" style={{ marginTop: 2 }}>{[['500m', 3], ['1km', 8], ['3km', 16]].map(([l, n]) => <div key={l} className="radcard"><div className="rk">{l} 이내</div><div className="rv">{n}<span className="ru">개</span></div></div>)}</div>
            <div className="locnote">반경 500m 내 역·공원·초교 모두 포함 — <b style={{ color: 'var(--accent-hi)' }}>올인원 생활권</b></div>
          </div>
          <div className="vizcard"><VizH ic="table" t="시설별 거리" s="가까운 순" />
            <div className="factable" style={{ marginTop: 2 }}>{FAC.map((f, i) => <div key={i} className="facrow"><span className="fnm2">{f[0]}</span><span className="fcat">{f[1]}</span><span className="fdist mono">{f[2]}km</span></div>)}</div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- 4 수요·인구 ----------
  function DemandTab() {
    return (
      <div className="swrap">
        <div className="scards">
          <Card k="반경 3km 인구" v="8.4" u="만" d="연수구 송도 권역" />
          <Card k="세대 수" v="3.2" u="만" d="평균 가구원 2.6명" />
          <Card k="30–40대 비중" v="54" u="%" d="실수요 핵심층" dc="up" />
          <Card k="전입 추세" v="+2.4" u="%" d="최근 1년 순유입" dc="up" />
        </div>
        <div className="panes2">
          <div className="vizcard"><VizH ic="users" t="연령대 분포" s="반경 3km" />
            <Bars data={[{ l: '20대', v: '14%', h: 40 }, { l: '30대', v: '28%', h: 80, hl: true }, { l: '40대', v: '26%', h: 74, hl: true }, { l: '50대', v: '18%', h: 52 }, { l: '60+', v: '14%', h: 40 }]} />
          </div>
          <div className="vizcard"><VizH ic="grid" t="가구 구성" s="세대 유형" />
            <Bars data={[{ l: '1–2인', v: '38%', h: 76 }, { l: '3인', v: '31%', h: 62, hl: true }, { l: '4인', v: '23%', h: 46 }, { l: '5인+', v: '8%', h: 18 }]} />
          </div>
        </div>
        <div className="locnote" style={{ marginTop: 0 }}>30–40대 3인 내외 실수요가 핵심 — <b style={{ color: 'var(--accent-hi)' }}>직주근접·교육·신축</b> 메시지에 반응도 높음.</div>
      </div>
    );
  }

  // ---------- 5 분양조건 ----------
  function TermsTab() {
    const SEG = [{ l: '계약금', p: '10%', w: 10, c: 'var(--accent)' }, { l: '중도금 (무이자)', p: '60%', w: 60, c: 'var(--swot-o)' }, { l: '잔금', p: '30%', w: 30, c: 'var(--swot-t)' }];
    const CMP = [['중도금 무이자', '60% 전액', '일부(40%)', '유리'], ['발코니 확장', '무상 제공', '유상 평균 1,200만', '유리'], ['시스템에어컨', '옵션 (유상)', '옵션', '동등'], ['계약금', '10%', '10~20%', '유리']];
    return (
      <div className="swrap">
        <div className="vizcard"><VizH ic="flag" t="납부조건 타임라인" s="분양가 100% 기준" />
          <div className="timeline">{SEG.map((s, i) => <div key={i} className="tlseg" style={{ flex: s.w, background: s.c }}><span className="tlp">{s.p}</span><span className="tll">{s.l}</span></div>)}</div>
          <div className="tlnote">계약 → 중도금 6회 무이자 → 입주 잔금. <b style={{ color: 'var(--accent-hi)' }}>중도금 무이자 60%</b>로 초기 자금 부담 최소화.</div>
        </div>
        <div className="vizcard"><VizH ic="table" t="경쟁 사업지 대비 분양조건" s="유리/불리" />
          <table className="ranktable"><thead><tr><th>항목</th><th>본 사업지</th><th>경쟁 평균</th><th>판단</th></tr></thead><tbody>
            {CMP.map((r, i) => <tr key={i}><td className="nm3">{r[0]}</td><td>{r[1]}</td><td className="muted">{r[2]}</td><td>{r[3] === '유리' ? <span className="prem m">유리 ▲</span> : <span className="muted">동등</span>}</td></tr>)}
          </tbody></table>
        </div>
      </div>
    );
  }

  // ---------- 6 마케팅 포인트 ----------
  function MarketingTab() {
    const PTS = [{ ic: 'pin', t: '신축 · 브랜드', d: '송도 권역 유일 신축 대단지 + 삼성물산 래미안' }, { ic: 'train', t: '역세권 5분', d: '캠퍼스타운역 도보 5분 — 경쟁 최단거리' }, { ic: 'users', t: '1,204 대단지', d: '커뮤니티·관리 규모의 경제' }];
    const MSG = [['1순위', '"송도 마지막 신축 대단지"', '신축 희소성 강조'], ['2순위', '"역세권 5분 올인원 생활권"', '입지 우위'], ['3순위', '"중도금 무이자 60%"', '자금 부담 완화']];
    return (
      <div className="swrap">
        <div className="catgrid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          {PTS.map((p, i) => <div key={i} className="ptcard"><span className="ptic">{Ic(p.ic, 18)}</span><div className="ptt">{p.t}</div><div className="ptd">{p.d}</div></div>)}
        </div>
        <div className="vizcard"><VizH ic="report" t="메시지 우선순위" s="제안서 핵심 카피" />
          <table className="ranktable"><thead><tr><th>순위</th><th>핵심 메시지</th><th>근거</th></tr></thead><tbody>
            {MSG.map((m, i) => <tr key={i}><td><span className="chip g" style={{ height: 20 }}>{m[0]}</span></td><td className="nm3">{m[1]}</td><td className="muted">{m[2]}</td></tr>)}
          </tbody></table>
        </div>
        <div className="vizcard"><VizH ic="api" t="추천 마케팅 채널" />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>{['네이버 부동산', '유튜브 단지 투어', '현장 모델하우스', '지역 커뮤니티', '분양 포털', 'SNS 타겟광고'].map((c) => <span key={c} className="chip">{c}</span>)}</div>
        </div>
      </div>
    );
  }

  const TABCMP = [MarketTab, PriceTab, CompareTab, LocationTab, DemandTab, TermsTab, MarketingTab];
  const MEMOS = {
    0: [['target', '관찰', '송도 권역 평당가는 6개월간 +3.8% 완만한 상승. 거래량도 회복세 — 분양 타이밍 우호적.'], ['flag', '리스크', '향후 12개월 6개 단지 공급 — 입주 시점 경쟁 심화 가능.']],
    1: [['target', '해석', '본 사업지는 고입지·고가 사분면 단독 포지션. 가격 우위(+5.3%)는 입지·신축으로 방어하되 가격 저항 관리 필요.'], ['flag', '리스크', '평당가 1위 — 경쟁 대비 최대 +12.9%. 초기 계약률 부담.'], ['report', '제안서 문구', '"송도 권역 유일 신축 대단지 — 입지 프리미엄을 가격에 반영"']],
    2: [['target', '해석', '신축·브랜드·역세권 3축에서 명확한 우위. 가격·학군은 보완 메시지 필요.'], ['report', '제안서 문구', '"비교 우위 3관왕 — 신축·브랜드·역세권"']],
    3: [['target', '해석', '반경 500m 내 역·공원·초교 모두 포함된 올인원 생활권. 입지 점수 최상위.'], ['bulb', '기회', '채드윅·국제고 인접 — 교육 수요 타겟 메시지 보강 여지.']],
    4: [['target', '해석', '30–40대 3인 가구 실수요가 핵심(54%). 직주근접·교육·신축 소구에 반응.'], ['flag', '추가 조사', '소득·구매력 지표 보강 시 가격 수용도 정밀 추정 가능.']],
    5: [['target', '해석', '중도금 무이자 60% + 발코니 무상으로 경쟁 대비 자금·혜택 우위.'], ['report', '제안서 문구', '"실입주금 부담 최소화 — 중도금 전액 무이자"']],
    6: [['report', '제안서 문구', '"송도 마지막 신축 대단지" — 신축 희소성을 1순위 메시지로.'], ['bulb', '기회', '유튜브 단지투어 + 지역 커뮤니티 결합 시 30–40대 도달 효율 ↑.']],
  };

  function StudyBody() {
    const [tab, setTab] = useState(1);
    const TabCmp = TABCMP[tab];
    return (
      <React.Fragment>
        <div className="panel" style={{ width: 232 }}>
          <div className="ph"><span className="t">데이터셋</span><span className="sp"></span><span className="c">3</span></div>
          <div className="conn">{DS.map((d, i) => <div key={i} className={'cw' + (d.on ? ' on' : '')}><span className="ci2">{d.ab}</span><span>{d.t}</span><span className="sp"></span><span className="n" style={{ fontSize: 10 }}>{d.n}</span></div>)}</div>
        </div>

        <div className="center dS">
          <div className="subtabs">{TABS.map((t, i) => <div key={i} className={'subtab' + (i === tab ? ' on' : '')} onClick={() => setTab(i)}>{t}</div>)}</div>
          <TabCmp />
        </div>

        <div className="panel r" style={{ width: 288 }}>
          <div className="ph"><span className="t">해석 메모</span><span className="sp"></span><span className="muted" style={{ fontSize: 10 }}>{TABS[tab]}</span></div>
          <div className="memopanel">
            {(MEMOS[tab] || []).map((m, i) => <div key={i} className="memocard"><span className="memotype">{Ic(m[0], 11)} {m[1]}</span><div className="mb">{m[2]}</div></div>)}
            <div className="addmemo" onClick={() => PS && PS.actions.addInsight()}>{Ic('plus', 14)} 이 분석 해석 메모 추가</div>
          </div>
        </div>
      </React.Fragment>
    );
  }
  window.StudyBody = StudyBody;
})();
