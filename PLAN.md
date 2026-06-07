# insight Analytics Prop — 구현 계획서

> **최종 업데이트:** 2026-06-07 (실무 보고서 분석 반영)  
> **기반 프로젝트:** Visualization Tool (React 18 + ECharts 5, 빌드 없음)  
> **목표:** 분양대행사 기획 직무 전용 Planning OS

---

## 1. 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | React 18.3 UMD + in-browser Babel (빌드 없음) |
| 차트 | Apache ECharts 5.5 |
| 타이포 | IBM Plex Sans / IBM Plex Mono |
| 상태관리 | 커스텀 store (window.Store) — pub/sub 패턴 |
| 데이터 저장 | 브라우저 localStorage (프로젝트 단위) |
| 배포 | `python3 -m http.server` |
| CSS | CSS Custom Properties (Design Tokens) |

---

## 2. 브랜드 토큰 (Prop 전용)

```css
--accent:       #e76709;   /* Heritage Orange — 로고마크 */
--prop-green:   #87ce5b;   /* Product Accent — Prop 전용 */
--sight-light:  #26418d;   /* insight 네이비 (라이트) */
--sight-dark:   #7ba1fc;   /* insight 네이비 (다크) */
--prop-text:    #43963c;   /* "Prop" 워드마크 색상 */
```

Logo assets: `docs/brand-assets-prop/logos/prop/`

---

## 3. Visualization Tool → insight Analytics Prop 이식 계획

### ✅ 직접 이식 (그대로 복사 후 토큰만 교체)
| 파일 | 비고 |
|------|------|
| `css/tokens.css` | Prop 브랜드 토큰 오버라이드 |
| `css/app.css`, `grid.css` | 그대로 |
| `js/store.jsx` | 프로젝트 관리 스테이트 추가 |
| `js/icons.jsx` | 부동산 아이콘 추가 |
| `js/charts.jsx` | 그대로 |
| `js/logger.js` | 그대로 |
| `js/statsMath.js` | 그대로 |
| `js/dataMode.jsx` | 부동산 템플릿 8종 추가 |
| `js/cleanMode.jsx` | 한국어 실무 용어 재구성, 단위 변환 추가 |
| `js/vizMode.jsx` | Waterfall·Radar·Price Matrix 추가 |
| `js/mapMode.jsx` | 부동산 입지 분석 중심 재구성 |

### 🔄 재구성 (구조 유지, 내용 교체)
| 파일 | 변경 내용 |
|------|----------|
| `js/shell.jsx` | TopBar에 프로젝트 셀렉터, Rail 전면 재편 |
| `js/app.jsx` | 모드 목록 재편, Planning Studio 최상위 |
| `js/dashMode.jsx` | 부동산 KPI 카드 템플릿 추가 |

### ❌ 제거 (우선순위 3순위 — 후순위 처리)
| 파일 | 이유 |
|------|------|
| `js/mlMode.jsx` | ML/AutoML 기능 불필요 |
| `js/statsMode.jsx` | 고급 통계 후순위 (기본 EDA만 유지) |
| `js/sqlMode.jsx` | SQL 후순위 |

---

## 4. 모드 구성 (Rail 순서)

```
1. Planning   — Planning Studio (프로젝트 OS)
2. Project    — 프로젝트 관리
3. Data       — 데이터셋 관리
4. API Hub    — 노코드 데이터 수집 플랫폼
5. Clean      — 전처리
6. Chart      — 시각화
7. Map        — 지도 (입지 분석)
8. Analysis   — 부동산 분석
9. Board      — 대시보드
10. Report    — 리포트 빌더
```

---

## 5. 신규 모듈 목록

```
js/
├── projectMode.jsx       # 프로젝트 생성 / 목록 / 선택 / 복제
├── planningMode.jsx      # Planning Studio 컨테이너
│   ├── 0-1 ProjectBrief       — 프로젝트 기본 정보, 분석 목적
│   ├── 0-2 BusinessCanvas     — 8개 섹션 카드 (목표/과제/타겟/경쟁사업지 등)
│   ├── 0-3 ResearchQuestions  — 연구 질문 관리 (상태/우선순위/담당자)
│   ├── 0-4 HypothesisManager  — 가설 관리 (미검증/검증중/채택/기각)
│   ├── 0-5 MindMapWorkspace   — 프로젝트 구조화 허브
│   ├── 0-6 SWOTWorkspace      — SWOT 분석 (드래그 배치)
│   ├── 0-7 StrategyBoard      — Miro 스타일 전략 보드
│   ├── 0-8 InsightRepository  — 인사이트 저장소
│   ├── 0-9 DecisionLog        — 의사결정 기록
│   └── 0-10 PlanningDashboard — Planning Studio 전체 현황
├── analysisMode.jsx      # 부동산 분석 (가격/경쟁단지/입지/수요/분양조건)
├── reportMode.jsx        # Report Builder (섹션 템플릿, 차트 삽입, export)
├── apiHubMode.jsx        # API Data Hub (Registry, Explorer, Builder, Scheduler)
└── insightMemo.jsx       # 전역 메모 컴포넌트 (차트/데이터/지도에 부착)
```

---

## 6. 데이터 피처 전체 명세

> 실무 보고서 2종 (천안 성성7지구·화성 장짐지구) 전수 분석 기반.  
> 보고서에 등장한 모든 데이터 항목을 도메인별로 정리했다.

---

### 6-A. Project Brief — 입력 항목 전체

**[기본 정보]**

| 필드 | 타입 | 보기 |
|------|------|------|
| 프로젝트명 | text | 천안 성성7지구 시장조사 |
| 사업지명 | text | 천안 서북구 성성7지구 공동주택 |
| 사업 유형 | select | 아파트 / 오피스텔 / 지식산업센터 / 상가 / 생활숙박시설 / 기타 |
| 사업 방식 | select | 일반분양 / 장기임대 / 지역주택조합 / 재개발 / 재건축 / 도시개발 |
| 대지위치 | text | 천안시 서북구 성성동 366-3번지 일원 |
| 시행사 | text | 웰메이드개발 |
| 시공사 (예정) | text | - |
| 도급순위 | select | 1군 / 2군 / 중견 / 미정 |
| 분양 예정 시기 | date | 2026년 상반기 |
| 입주 예정 시기 | date | 2029년 |

**[건축 규모]**

| 필드 | 타입 | 보기 |
|------|------|------|
| 지하 층수 | number | 2 |
| 지상 최고 층수 | number | 38 |
| 동 수 | number | 4 |
| 총 세대수 | number | 554 |
| 대지면적 (㎡ / 평) | number | 25,941㎡ / 7,847평 |
| 건축면적 (㎡ / 평) | number | 4,993㎡ / 1,510평 |
| 연면적 (㎡ / 평) | number | 96,199㎡ / 29,100평 |
| 건폐율 (%) | number | 19.25 |
| 용적률 (%) | number | 249.68 |
| 주차대수 (총 / 세대당) | number | 727대 / 1.31대 |
| 법정 주차 대비 (%) | number | 123 |
| 조경면적 (㎡ / 대지대비%) | number | 3,819㎡ / 15% |

**[타입 구성 — 행 반복 입력]**

| 필드 | 타입 |
|------|------|
| 타입명 | text (84A, 84B, 59A …) |
| 전용면적 (㎡) | number |
| 전용면적 (평) | auto-calc |
| 공급면적 (㎡) | number |
| 공급면적 (평) | auto-calc |
| 전용률 (%) | auto-calc |
| 세대수 | number |
| 비율 (%) | auto-calc |
| 형태 | select (판상형 / 타워형) |
| Bay 수 | select (3Bay / 4Bay / 5Bay) |
| 주향 | select (남 / 남동 / 남서 / 동 / 서) |
| 특징 메모 | text |

**[분양 조건]**

| 필드 | 타입 | 보기 |
|------|------|------|
| 계약금 (%) | number | 5 |
| 계약금 분납 여부 | boolean | Y |
| 중도금 (%) | number | 60 |
| 중도금 조건 | select | 무이자 / 이자후불제 / 이자부담 |
| 잔금 (%) | number | 35 |
| 발코니 확장 | select | 포함 / 별도 / 미정 |
| 발코니 확장비 (천원/평) | number | 500 |
| 중도금 대출 가능 여부 | boolean | - |
| 전매 제한 여부 | boolean | - |
| 특별 프로모션 메모 | text | 계약 축하금 1,000만원 등 |

**[사업 현황 / 이슈]**

| 필드 | 타입 |
|------|------|
| 현재 사업 단계 | select (기획 / 인허가 / 착공 / 분양준비 / 분양중 / 완료) |
| 모델하우스 위치 | text |
| 모델하우스 오픈 예정일 | date |
| 사업 리스크 메모 | textarea (소송, 인허가 지연 등) |
| 분양 방식 전환 이력 | textarea |

**[분석 목적 — 다중 선택]**

```
☐ 시장조사    ☐ 분양가 검토    ☐ 경쟁단지 분석
☐ 입지 분석   ☐ 수요/인구 분석 ☐ 마케팅 전략 수립
☐ 제안서 작성 ☐ 투자 검토      ☐ 사업성 분석
```

---

### 6-B. Business Canvas — 섹션별 항목 전체

> 기존 8개 섹션에서 실무 관점으로 재설계. 각 섹션은 카드 형태로 자유 입력.

| # | 섹션 | 핵심 질문 | 실무 입력 예시 |
|---|------|----------|--------------|
| 1 | **프로젝트 목표** | 이 분석으로 무엇을 결정하는가? | "84타입 적정 분양가 @16,500~17,000 산정" |
| 2 | **핵심 과제** | 무엇이 해결되어야 분양이 성공하는가? | 브랜드 열위 극복, 규모 열위 보완 |
| 3 | **타겟 고객 프로파일** | 실수요 vs 투자, 주요 전입 출처 | 30-40대 삼성전자 직주근접 실수요, 서북구 상급지 이동 수요 |
| 4 | **입지 위계 포지셔닝** | 이 지역에서 사업지는 어느 위치인가? | 성성 생활권 A+ 등급, 불당(S) 다음 |
| 5 | **직접 경쟁 사업지** | 동일 생활권·분양 시기 겹치는 단지 | e편한세상 성성호수공원, 천안아이파크시티 |
| 6 | **간접 경쟁 / 대체재** | 분양권 매물, 기입주 신축 | 성성자이레이크파크 분양권, 천안시티자이 |
| 7 | **예상 강점 (USP)** | 경쟁단지 대비 차별화 포인트 | 호수공원 직접 조망, 초품아, 신축성 |
| 8 | **예상 약점 / 리스크** | 분양 장기화 유발 요인 | 554세대 소규모, 브랜드 미확정, 임대 소송 이슈 |
| 9 | **시장 환경 요약** | 현재 시장이 유리한가 불리한가? | 관망세 지속, 공급 과잉, 양극화 심화 |
| 10 | **개발 호재** | 입지 가치를 끌어올릴 외부 요인 | GTX-C 2030년 예정, 부성역 2029년 예정 |
| 11 | **분양가 방향성** | 보수/적정/공격 중 어느 방향? | 보수적 접근 (@16,000~16,500) |
| 12 | **마케팅 포인트** | 광고·홍보에서 강조할 USP | 호수공원 뷰, 직주근접, 1군 브랜드 (협의 중) |
| 13 | **필요한 데이터** | 아직 없어서 수집해야 할 것 | 최근 3개월 분양권 실거래 업데이트, 전입 출처 세분화 |
| 14 | **기대 결과 / 산출물** | 이 프로젝트의 최종 deliverable | 시장조사 보고서 (시행사 제출), 분양가 제안서 |

---

### 6-C. 도메인별 데이터 피처 전체 목록

#### C-1. 경쟁단지 (Competitor Unit) 피처

```
기본
├── 번호 (지도 핀 연결용 ❶~❿)
├── 단지명
├── 주소 (도로명)
├── 위도 / 경도
├── 생활권 등급 (S / A+ / A / B / C)
├── 시공사 (브랜드)
├── 도급순위 (1군 / 2군 / 중견)
├── 사업 유형 (일반분양 / 임대 / 재건축 등)

규모
├── 총 세대수
├── 동 수
├── 최고 층수
├── 주차 (세대당)

타입별 (행 반복)
├── 타입명
├── 전용면적 (㎡ / 평)
├── 공급면적 (㎡ / 평)
├── 전용률 (%)        ← auto-calc
├── 세대수
├── 비율 (%)          ← auto-calc

일정
├── 분양일
├── 청약일
├── 입주 예정년월
├── 분양 상태 (분양중 / 완판 / 미분양 / 분양예정)

가격 (타입별)
├── 분양가 총액 (천원)
├── 분양가 평당가 (천원/평)   ← auto-calc
├── 발코니 확장 기준 (포함 / 별도)
├── 발코니 확장비 (천원)
├── 실거래가 총액 (최근 3개월 평균, 천원)
├── 실거래가 평당가             ← auto-calc
├── 분양권 총액 (천원)
├── 분양권 평당가               ← auto-calc
├── 프리미엄 (분양권 - 분양가, 천원)  ← auto-calc
├── 프리미엄 비율 (%)           ← auto-calc
├── 매물 평균가 (천원)
├── 매물 수량
├── 전세가 (천원)
├── 전세가율 (%)                ← auto-calc

분양 조건
├── 계약금 (%)
├── 계약금 분납 여부
├── 중도금 (%)
├── 중도금 조건 (무이자 / 이자후불 / 이자부담)
├── 잔금 (%)
├── 특별 혜택 메모

상품 특성
├── 형태 (판상형 / 타워형)
├── Bay 수
├── 주향
├── 커뮤니티 시설 메모
├── 평면 특징 메모

주거선호도 평가
├── 선호도 등급 (A / B / C) — 조사자 평가
├── 비고
```

---

#### C-2. 가격 시계열 (Price History) 피처

```
단지명
타입 (전용면적)
거래 유형 (매매실거래 / 전세 / 월세 / 분양권 / 매물호가)
거래일 (YYYY-MM)
총액 (천원)
평당가 (천원/평)     ← auto-calc
층 (저층 / 중층 / 고층)
거래 건수
전기 대비 변동액     ← auto-calc
전기 대비 변동률 (%) ← auto-calc
출처 (국토부 / 네이버 / KB / 현장조사)
```

---

#### C-3. 수급 동향 (Supply / Demand) 피처

**공급 (분양 예정 물량)**
```
사업지명
위치 (행정구역)
위도 / 경도
사업 유형
시공사 (예정)
총 세대수
59타입 세대수
84타입 세대수
기타 타입 세대수
분양 예정 시기 (YYYY-QQ)
입주 예정 시기 (YYYY-QQ)
분양 상태
비고 (경쟁 강도 메모)
```

**수급 밸런스 지표**
```
행정구역
연도 / 분기
공급 세대수
입주 세대수
미분양 잔여 세대
전년 동기 공급
YoY 공급 변동률 ← auto-calc
```

---

#### C-4. 거래 동향 (Transaction) 피처

```
행정구역
연도 / 월
매매 거래량
전세 거래량
월세 거래량
전월세 합계         ← auto-calc
매매 대비 전월세 배수 ← auto-calc
외지인 거래 비율 (%)
서울 거래 비율 (%)
기타 경기 거래 비율 (%)
지역 내 거래 비율 (%) ← auto-calc
```

---

#### C-5. 인구 / 세대 (Demographics) 피처

```
행정구역 (시 / 구 / 동 / 읍)
연도
총 인구
세대수
평균 세대원수      ← auto-calc
전입 인구
전출 인구
순 이동 (전입 - 전출) ← auto-calc
전입 출처 구분 (시도별 비율 — 행 반복)
  ├── 출처 지역
  └── 비율 (%)
연령대별 인구 (행 반복)
  ├── 연령대
  └── 인구수 / 비율
노후주택 비중 (입주 10년 초과 %)
신축 이전 수요 잠재 지수 (메모)
```

---

#### C-6. 입지 시설 (Location Facilities) 피처

```
시설명
시설 유형
  ├── 교통 (지하철 / 버스 / 기차 / 고속도로IC)
  ├── 교육 (초등 / 중학 / 고등 / 학원가 / 대학)
  ├── 상권 (대형마트 / 백화점 / 편의시설)
  ├── 의료 (종합병원 / 의원)
  ├── 공원 / 자연환경
  ├── 업무지구 / 산단
  └── 기피시설 (혐오시설 / 소음원)
주소
위도 / 경도
사업지로부터 직선거리 (m)
도보 소요시간 (분)
차량 소요시간 (분)
중요도 (상 / 중 / 하)
비고 (예정 시설은 예정일 기재)
```

---

#### C-7. 청약 경쟁률 (Subscription) 피처

```
단지명
청약일
공급 세대수
특별공급 세대수
1순위 신청 건수
2순위 신청 건수
총 신청 건수
1순위 경쟁률     ← auto-calc
최고 경쟁률 타입
최저 경쟁률 타입
미달 세대수
잔여 세대 처리 방법
비고
```

---

#### C-8. 비교사례지수 (Comparison Index) 피처

> 분양가 산정의 핵심. 평가항목 × 비교단지 매트릭스.

**평가항목 구조 (고정 + 커스텀 가능)**

| 영역 | 항목 | 기본 배점 |
|------|------|---------|
| 부지특성 | 조망권 / 개방감 | 10 |
| 부지특성 | 지형여건 (평탄도, 경사) | 5 |
| 부지특성 | 기피시설 / 소음원 | 5 |
| 환경요인 | 지역여건 (선호도, 정주여건) | 10 |
| 환경요인 | 교육여건 (학군, 학원가) | 10 |
| 환경요인 | 교통여건 (접근성, 대중교통) | 10 |
| 환경요인 | 주거인프라 (쇼핑, 의료, 공원) | 5 (또는 10) |
| 단지시설 | 평면구성 (Bay, 동선) | 5 (또는 10) |
| 단지시설 | 단지시설 (커뮤니티, 조경) | 10 |
| 단지시설 | 단지규모 (세대수, 주차) | 5 (또는 10) |
| 상품특성 | 브랜드 선호도 | 5 (또는 10) |
| 상품특성 | 프리미엄 요소 (조망, 특화) | 5 |
| 상품특성 | 연식보정 (입주시기) | 10 |
| **합계** | | **100** |

**피처 구조**
```
평가항목명
영역 (부지특성 / 환경요인 / 단지시설 / 상품특성)
배점 (기본값, 수정 가능)
당 사업지 점수
비교단지 1 점수
비교단지 2 점수
비교단지 N 점수
→ 합계 자동 계산
→ 보정율 자동 계산 (당PJT / 비교단지)
→ 비교사례가격 × 보정율 = 지수 보정 적정가 자동 계산
```

---

#### C-9. 분양가 산정 (Pricing Calculation) 피처

```
사업지명
타입명
공급면적 (평)
세대수

[비교지수 보정]
비교단지 1명 / 점수 / 비교가격 / 보정율 / 보정가
비교단지 2명 / 점수 / 비교가격 / 보정율 / 보정가
→ 비교지수 보정 범위 자동 계산

[총액 볼륨 분석]
비교 단지들 실거래가 상위 N개 평균
실거래가 범위
매물호가 범위

[포지셔닝]
보수 평당가 → 총액 자동
적정 평당가 → 총액 자동
공격 평당가 → 총액 자동

[검토 조건]
계약금 조건
중도금 조건
발코니 기준 (포함 / 별도)
발코니 확장비

[최종 산출]
채택 시나리오 (보수 / 적정 / 공격)
채택 근거 메모
```

---

#### C-10. 개발 호재 (Development Pipeline) 피처

```
호재명
유형 (교통 / 개발사업 / 산업단지 / 상업시설 / 기타)
예정 완료 시기
현재 진행 단계 (계획 / 확정 / 착공 / 완료)
사업지로부터 영향 범위
기대 효과 메모
출처 URL
```

---

## 7. 부동산 데이터 템플릿 (Data 모드)

> 아래 템플릿은 빈 시트 + 컬럼 타입 프리셋으로 제공. 사용자는 선택 후 바로 입력 시작.

| # | 템플릿명 | 주요 컬럼 (전체) |
|---|---------|----------------|
| 1 | **경쟁단지 조사표** | 번호, 단지명, 주소, 위도, 경도, 생활권등급, 시공사, 세대수, 입주년월, 분양상태, 타입, 전용㎡, 전용평, 공급평, 전용률, 분양가(천원), 평당가, 발코니기준, 실거래가, 분양권가, 프리미엄, 매물평균가, 전세가, 전세가율, 주거선호도, 형태, Bay수, 주향, 계약금%, 중도금조건, 비고 |
| 2 | **분양가 비교표** | 단지명, 타입, 공급면적(평), 분양가(천원), 평당가, 발코니포함여부, 발코니확장비, 발코니포함평당가, 당사업지대비차이, 당사업지대비비율 |
| 3 | **가격 시계열** | 단지명, 타입, 전용면적(평), 거래유형, 거래년월, 총액(천원), 평당가, 층구분, 거래건수, 전기대비변동액, 전기대비변동률, 출처 |
| 4 | **청약경쟁률** | 단지명, 청약일, 공급세대, 특공세대, 1순위신청, 2순위신청, 경쟁률, 최고경쟁타입, 미달세대, 비고 |
| 5 | **수급 물량 (분양예정)** | 사업지명, 위치, 위도, 경도, 시공사, 총세대, 59타입, 84타입, 분양예정, 입주예정, 분양상태, 비고 |
| 6 | **거래 동향** | 행정구역, 연도, 월, 매매거래량, 전세거래량, 월세거래량, 전월세합, 매매대비배수, 외지인비율, 서울비율, 경기비율 |
| 7 | **인구/세대** | 행정구역, 연도, 총인구, 세대수, 평균세대원수, 전입, 전출, 순이동, 노후주택비중 |
| 8 | **전입 출처** | 행정구역, 조사연도, 출처지역, 비율(%), 인구수 |
| 9 | **입지시설 조사표** | 번호, 시설명, 유형, 주소, 위도, 경도, 직선거리(m), 도보시간(분), 차량시간(분), 중요도, 비고 |
| 10 | **교통환경 조사표** | 교통수단, 노선명, 역정류장명, 주소, 위도, 경도, 직선거리(m), 도보시간(분), 차량시간(분), 1일운행횟수, 비고 |
| 11 | **개발 호재** | 호재명, 유형, 예정완료, 진행단계, 영향범위, 기대효과, 출처URL |
| 12 | **납부조건 비교표** | 단지명, 계약금%, 계약금분납, 중도금%, 중도금조건, 잔금%, 발코니포함여부, 발코니확장비, 특별혜택메모 |

---

## 8. 핵심 데이터 모델 (store.jsx)

```js
// ─── 프로젝트 ───────────────────────────────────────────────────────
Project {
  id, name, siteName,

  // 기본 정보
  type: 'apartment'|'officetel'|'commercial'|'knowledge'|'living'|'other',
  saleMethod: 'general'|'rental'|'association'|'redevelopment'|'reconstruction'|'development',
  address, developer, builder, builderTier: '1군'|'2군'|'중견'|'미정',
  saleDate, moveInDate, modelHouseDate, modelHouseAddress,

  // 건축 규모
  floors: { basement, aboveground, max },
  buildings: number,
  totalUnits: number,
  area: { site_sqm, building_sqm, total_sqm },    // ㎡
  ratio: { coverage, floorArea },                  // 건폐율, 용적률
  parking: { total, perUnit, legalRatio },
  landscape_sqm: number,

  // 타입 구성
  unitTypes: UnitType[],

  // 분양 조건
  saleCondition: SaleCondition,

  // 사업 현황
  stage: 'planning'|'permit'|'construction'|'sale'|'completed',
  risks: string,                    // 리스크/이슈 메모

  // 분석 목적 (다중선택)
  objectives: ('market'|'pricing'|'competition'|'location'|'demand'|'marketing'|'proposal'|'investment'|'feasibility')[],

  // Planning Studio 데이터
  canvas: CanvasCard[],             // Business Canvas 14개 섹션
  researchQuestions: Question[],
  hypotheses: Hypothesis[],
  swot: SwotItem[],
  decisions: Decision[],

  // 연결된 데이터
  datasets: DatasetRef[],
  charts: ChartRef[],
  insights: Insight[],

  createdAt, updatedAt
}

// ─── 타입 구성 ──────────────────────────────────────────────────────
UnitType {
  name,                    // 84A, 59A …
  exclusiveArea_sqm,       // 전용면적 ㎡
  supplyArea_sqm,          // 공급면적 ㎡
  // 자동 계산
  exclusiveArea_pyeong,    // ← auto
  supplyArea_pyeong,       // ← auto
  exclusiveRatio,          // 전용률 ← auto
  units, ratio,            // 세대수, 비율 ← auto
  shape: 'slab'|'tower',
  bay: '3'|'4'|'5',
  facing: '남'|'남동'|'남서'|'동'|'서',
  note
}

// ─── 분양 조건 ──────────────────────────────────────────────────────
SaleCondition {
  depositRatio,            // 계약금 %
  depositInstallment,      // 분납 여부
  midPaymentRatio,         // 중도금 %
  midPaymentType: 'free'|'deferred'|'paid',
  remainderRatio,          // 잔금 %
  balconyBasis: 'included'|'separate'|'tbd',
  balconyFee,              // 발코니 확장비 (천원/평)
  loanAvailable, transferRestriction,
  promoNote
}

// ─── Business Canvas 카드 ────────────────────────────────────────────
CanvasCard {
  id, projectId,
  section: 1~14,           // 14개 섹션
  sectionLabel,
  body,                    // 자유 텍스트
  tags: string[],
  linkedInsights: string[]
}

// ─── 인사이트 메모 ───────────────────────────────────────────────────
Insight {
  id, projectId,
  title, body,
  type: 'observation'|'interpretation'|'opportunity'|'risk'|'copy'|'todo',
  tags: string[],
  importance: 1|2|3|4|5,
  linkedTo: { type: 'chart'|'dataset'|'map'|'canvas', id }
}

// ─── 연구 질문 ──────────────────────────────────────────────────────
Question {
  id, projectId, order,
  text,
  status: 'todo'|'wip'|'done',
  priority: 'high'|'mid'|'low',
  assignee,
  linkedResults: ResultRef[]
}

// ─── 가설 ────────────────────────────────────────────────────────────
Hypothesis {
  id, projectId,
  text,
  status: 'unverified'|'testing'|'accepted'|'rejected',
  evidence: EvidenceRef[]
}

// ─── 의사결정 ────────────────────────────────────────────────────────
Decision {
  id, projectId,
  date, author,
  title, body,
  basis: string[]
}

// ─── 비교사례지수 ────────────────────────────────────────────────────
ComparisonIndex {
  id, projectId,
  name,                    // "84타입 비교사례지수"
  items: IndexItem[],
  competitors: IndexCompetitor[],
  // 자동 계산
  subjectScore,            // 당 사업지 합계
  correctionRates,         // 경쟁단지별 보정율
  correctedPrices          // 보정 적정가
}

IndexItem {
  area,                    // 부지특성 | 환경요인 | 단지시설 | 상품특성
  label,                   // 항목명
  maxScore,                // 배점
  subjectScore,            // 당 사업지
  competitorScores: {}     // { competitorId: score }
}

IndexCompetitor {
  id, name,
  referencePrice,          // 비교사례가격 (평당, 천원)
  referenceBasis           // '실거래가' | '분양가'
}
```

---

## 9. 구현 단계

### Phase 0 — 프로젝트 셋업
- [x] 디렉토리 구조 생성
- [x] Visualization Tool 기반 파일 복사
- [x] Prop 브랜드 토큰 적용 (DESIGN_SPEC ver2 정확 hex — `tokens.css`)
- [x] index.html 기본 구조 (React UMD + Babel 인라인)
- [x] Rail 모드 목록 재편 (Planning 최상위)

### Phase 1 — Core (1순위)
- [x] `projectMode.jsx` — 프로젝트 생성/목록/선택 (샘플 프로젝트 포함)
- [x] `planningMode.jsx` — 3-패널 Planning Studio 전면 구현
  - [x] Planning 대시보드 (파이프라인·KPI·바로가기)
  - [x] Project Brief (기본정보·사업유형·분석목적·평형구성 폼)
  - [x] Business Canvas (8섹션 그리드, bullet-list 방식)
  - [x] 연구 질문 빌더 (Q번호·우선순위·상태 pill·클릭 순환)
  - [x] 가설 매니저 (미검증/검증중/채택/기각 상태)
  - [x] SWOT 분석 (4색 쿼드, flat row 구조, 토큰 색상)
  - [x] 인사이트 저장소 (별점·태그·날짜)
  - [x] 의사결정 로그 (제목·근거·태그)
  - [ ] Mind Map (Phase 3으로 이월)
  - [ ] Strategy Board (Phase 3으로 이월)
- [x] `store.jsx` 확장 — 프로젝트 단위 상태 관리 (localStorage 연동)
- [x] `icons.jsx` 교정 — DESIGN_SPEC path 정확 적용, 플래닝 전용 아이콘 6종 추가
- [x] `planning.css` — 디자인 레퍼런스 기반 전용 스타일시트 작성
- [ ] `dataMode.jsx` 개선 — 부동산 템플릿 12종 _(다음 단계)_
- [ ] `cleanMode.jsx` 개선 — 한국어 용어, 평↔㎡, 원↔만원↔억원 변환
- [ ] `insightMemo.jsx` — 차트/데이터에 메모 부착

### Phase 2 — 분석 & 시각화
- [ ] `analysisMode.jsx` — 비교사례지수 빌더, 분양가 산정 계산기, 경쟁단지, 입지분석
- [ ] `vizMode.jsx` 확장 — Waterfall, Radar, Price Matrix, 포지셔닝 스케일 차트
- [ ] `mapMode.jsx` 재구성 — 사업지 핀, 경쟁단지 오버레이, 입지 등급 레이어
- [ ] `reportMode.jsx` — Report Builder 기본 구조 (표지, 목차, SUMMARY 빌더)

### Phase 3 — API Hub & 고도화
- [ ] `apiHubMode.jsx` — API Registry, Visual Builder, Dataset Generator
- [ ] Mind Map 페이지 구현
- [ ] 대시보드 부동산 KPI 템플릿
- [ ] Report Builder 완성 (Markdown / HTML export)

---

## 10. 최종 파일 구조

```
insight_Analytics_prop/
├── index.html
├── launch.command
├── PLAN.md                   ← 이 파일
├── CHANGELOG.md
├── css/
│   ├── tokens.css            # Prop 브랜드 토큰
│   ├── app.css
│   ├── grid.css
│   ├── planning.css          # Planning Studio 전용
│   ├── project.css
│   ├── data.css
│   ├── clean.css
│   ├── viz.css
│   ├── map.css
│   ├── analysis.css
│   ├── dash.css
│   ├── report.css
│   ├── apihub.css
│   └── ai.css
├── js/
│   ├── app.jsx               # 루트 (모드 라우팅)
│   ├── store.jsx             # 프로젝트 스테이트 포함
│   ├── shell.jsx             # TopBar + Rail
│   ├── data.js               # 부동산 샘플 데이터
│   ├── icons.jsx
│   ├── charts.jsx
│   ├── logger.js
│   ├── statsMath.js
│   ├── projectMode.jsx       # 신규
│   ├── planningMode.jsx      # 신규 (메인)
│   ├── dataMode.jsx
│   ├── cleanMode.jsx
│   ├── vizMode.jsx
│   ├── mapMode.jsx
│   ├── analysisMode.jsx      # 신규
│   ├── dashMode.jsx
│   ├── reportMode.jsx        # 신규
│   ├── apiHubMode.jsx        # 신규
│   └── insightMemo.jsx       # 신규 (공통)
└── docs/
    ├── brand-assets-prop/
    └── brand-assets-insight_platform/
```

---

## 11. 실무 보고서 분석 기반 추가 기능

> 분석 자료: 천안 성성7지구 시장조사 보고서 (2025.12), 화성 장짐지구 시장조사 보고서 (2026.03)

### 🔴 필수 추가 (현재 계획에 없음)

| 기능 | 위치 | 설명 |
|------|------|------|
| **비교사례지수 빌더** | Analysis > 가격분석 | 평가항목×비교단지 배점표 → 보정율 자동계산 → 적정분양가 산출 |
| **분양가 산정 계산기** | Analysis > 가격분석 | 보수/적정/공격 3안 + 발코니 포함/별도 병행 + 타입별 총액 |
| **포지셔닝 스케일 차트** | Visualization | 수평 스케일 위 단지별 가격 포인트 + 당 사업지 범위 |
| **입지 위계 시각화** | Map | S/A/B/C 등급 지역 레이어 (지도 위 등급 색상 오버레이) |
| **SUMMARY 섹션 빌더** | Report Builder | 구분/내용/한줄평 3열 자동 조합 테이블 |

### 🟡 강화 필요 (계획에 있으나 깊이 부족)

| 기능 | 위치 | 설명 |
|------|------|------|
| **단지 프로파일 카드** | Analysis > 경쟁단지 | 실거래가/분양가/분양권/프리미엄/선호도 등급 카드뷰 |
| **수급 타임라인** | Analysis > 시장개요 | 분양 예정 물량 타임라인 (당 사업지 분양 시점 마킹) |
| **전입 분석 차트** | Analysis > 수요분석 | 전입 출처 Pie+Treemap (수요 타겟팅 근거 자료) |
| **매매/전세 동향 콤보 차트** | Visualization | Bar(거래량) + Line(평당가) 이중 Y축 |
| **검토조건 관리** | Analysis > 분양조건 | 계약금/중도금/발코니 조건 체크리스트 → 분양가 계산 연동 |

### 🟢 보고서 UX (데이터 비관련)

| 기능 | 위치 | 설명 |
|------|------|------|
| **보고서 표지 생성기** | Report Builder | 사업명/시행사/날짜 입력 → 브랜드 표지 자동 생성 |
| **목차 자동 생성** | Report Builder | 활성화된 섹션 기반 목차 자동 조합 |
| **단지 번호 맵핑** | Map + Analysis | 지도 핀 ❶~❿ ↔ 비교단지 테이블 연결, 핀 클릭 시 카드 팝업 |

---

## 12. 참고 소스

- **Visualization Tool:** `/Users/lyuhoyun/Documents/GitHub/Visualization Tool/`
- **브랜드 스펙:** `docs/insight Analytics Prop Brand Spec (standalone) ver2.html`
- **로고 에셋:** `docs/brand-assets-prop/logos/prop/`
- **요구사항:** `requirements_prompt.txt`
