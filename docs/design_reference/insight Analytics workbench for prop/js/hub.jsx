/* API Data Hub — first screen (data collection). window.HubBody */
(function () {
  const Ic = window.Ic;

  const CONN = [
    { c: '부동산' },
    { ab: '국토', t: '국토부 실거래가', st: 'live', on: true },
    { ab: '부동', t: '한국부동산원', st: 'off' },
    { ab: '공공', t: '공공데이터포털', st: 'live' },
    { c: '통계' },
    { ab: 'KO', t: 'KOSIS 인구·세대', st: 'live' },
    { c: '지도' },
    { ab: 'VW', t: 'VWorld 주소·좌표', st: 'live' },
    { ab: '카카', t: '카카오맵 지역검색', st: 'off' },
    { c: '마케팅' },
    { ab: 'NA', t: '네이버 광고', st: 'off' },
  ];

  const ROWS = [
    ['래미안 송도 더퍼스트', '84.97', '79,800', '12', '2024', '송도동'],
    ['더샵 송도센트럴', '84.92', '76,500', '8', '2021', '송도동'],
    ['힐스테이트 송도', '74.88', '68,200', '15', '2020', '송도동'],
    ['e편한세상 송도', '101.2', '88,000', '22', '2019', '송도동'],
    ['송도 더샵 마스터뷰', '59.94', '54,300', '5', '2018', '송도동'],
    ['송도국제도시 푸르지오', '84.91', '71,900', '18', '2022', '송도동'],
  ];

  function HubBody() {
    return (
      <React.Fragment>
        {/* LEFT — connectors */}
        <div className="panel" style={{ width: 244 }}>
          <div className="ph"><span className="t">커넥터</span><span className="sp"></span>{Ic('plus', 15)}</div>
          <div className="conn">
            {CONN.map((r, i) => r.c
              ? <div key={i} className="cat">{r.c}</div>
              : (
                <div key={i} className={'cw' + (r.on ? ' on' : '')}>
                  <span className="ci2">{r.ab}</span><span>{r.t}</span><span className="sp"></span><span className={'stt ' + r.st}></span>
                </div>
              )
            )}
          </div>
        </div>

        {/* CENTER — builder + response */}
        <div className="center dH">
          <div className="wsh">
            {Ic('api', 17)}<h2>API Data Hub</h2>
            <span className="chip g">노코드 수집</span>
            <span className="sp" style={{ flex: 1 }}></span>
            <span className="muted" style={{ fontSize: 11 }}>API를 몰라도 데이터를 가져옵니다</span>
          </div>
          <div className="hwrap">
            {/* NL query */}
            <div className="nlbar">
              <span className="spark">{Ic('bulb', 17)}</span>
              <div className="nltext">2024년 이후 <b>송도 아파트 실거래가</b> 가져오기<span className="ph2"> — 자연어로 입력하면 API·파라미터를 자동 구성</span></div>
              <span className="nlbtn">{Ic('search', 14)} 검색</span>
            </div>

            {/* selected API */}
            <div className="apihead">
              <span className="ci2" style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--accent)', color: 'var(--on-accent)', fontSize: 11 }}>국토</span>
              <div style={{ flex: 1 }}>
                <div className="src">국토교통부 · 공공데이터포털</div>
                <div className="nm2">아파트 매매 실거래가 조회</div>
              </div>
              <span className="conn-ok"><span className="dot"></span> 연결됨</span>
            </div>

            {/* endpoint + params */}
            <div>
              <div className="endpoint">
                <span className="method">GET</span>
                <span className="urlbox">https://apis.data.go.kr/<b>RTMSDataSvcAptTrade</b>/getRTMSDataSvcAptTrade</span>
                <span className="runbtn">{Ic('arrow', 14)} 실행</span>
              </div>
              <div className="params" style={{ marginTop: 10 }}>
                <div className="param"><div className="pl">지역코드 <span className="req">*</span></div><div className="pi">{Ic('pin', 14)}<span className="mono">28185</span> · 인천 연수구</div></div>
                <div className="param"><div className="pl">조회 기간 <span className="req">*</span></div><div className="pi"><span className="mono">202401 ~ 202512</span></div></div>
                <div className="param"><div className="pl">주택 유형</div><div className="pi">아파트 매매<span className="sp" style={{ flex: 1 }}></span>{Ic('chevd', 14)}</div></div>
              </div>
            </div>

            {/* response preview */}
            <div className="resp">
              <div className="rhead">
                <span className="rtab on">Table</span><span className="rtab">JSON</span>
                <span className="sp" style={{ flex: 1 }}></span>
                <span className="ok2">200 OK · 5,234 rows</span>
              </div>
              <table className="dtable">
                <thead><tr>
                  <th>단지명</th><th>전용(㎡)</th><th>거래금액(만원)</th><th>층</th><th>건축년도</th><th>법정동</th>
                </tr></thead>
                <tbody>
                  {ROWS.map((r, i) => (
                    <tr key={i}>
                      <td className="t">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td><td className="t">{r[5]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT — dataset generator + lineage */}
        <div className="panel r" style={{ width: 300 }}>
          <div className="ph"><span className="t">데이터셋 생성</span></div>
          <div className="dsgen">
            <div className="dsfield"><div className="dfl">데이터셋 이름</div><div className="dfv">송도_실거래가_2024</div></div>
            <div className="dsmeta">
              <div className="m"><div className="mk2">행 수</div><div className="mv2">5,234</div></div>
              <div className="m"><div className="mk2">컬럼 수</div><div className="mv2">7</div></div>
            </div>
            <div className="dsfield"><div className="dfl">선택 필드</div><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
              {['거래금액', '전용면적', '거래일', '층', '건축년도', '법정동'].map((f) => <span key={f} className="chip g" style={{ height: 22 }}>{f}</span>)}
            </div></div>
            <div className="savebtn">{Ic('save', 15)} 프로젝트 데이터셋으로 저장</div>

            <div className="gh" style={{ marginTop: 4 }}>데이터 출처 추적 (Lineage)</div>
            <div className="lineage">
              <div className="ll"><span className="dot2"></span>송도_실거래가_2024</div>
              <div className="ll sub">↳ 국토교통부 실거래가 API</div>
              <div className="ll sub">↳ 인천 연수구 (28185)</div>
              <div className="ll sub">↳ 기간 202401 ~ 202512</div>
              <div className="ll sub">↳ 2026-06-07 생성 · 신뢰도 A</div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
  window.HubBody = HubBody;
})();
