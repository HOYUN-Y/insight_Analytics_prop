# insight Analytics Prop

> **분양대행사 기획 직무 전용 Planning OS**  
> insight Analytics 패밀리의 부동산 분양 특화 제품 — Planning Studio를 중심으로 시장조사부터 보고서 산출까지 하나의 워크스페이스에서.

---

## 개요

**insight Analytics Prop**은 분양대행사 기획 담당자가 일상적으로 수행하는 작업 — 시장조사, 경쟁단지 분석, 분양가 검토, 마케팅 전략 수립, 보고서 작성 — 을 하나의 로컬 웹앱 안에서 처리할 수 있도록 설계된 도구입니다.

기존 insight Analytics Workbench의 데이터 분석 인프라(데이터셋 관리, 시각화, 지도, 클린 등)를 그대로 계승하면서, 분양 업무에 특화된 **Planning Studio** 레이어를 최상위에 추가했습니다.

```
insight Analytics  →  Workbench (범용 데이터 분석)
                  ↘  Prop      (분양대행사 특화) ← 이 프로젝트
```

---

## 목적

| 문제 | 해결 |
|------|------|
| 시장조사 내용이 Excel·메모·카톡에 분산 | 프로젝트 단위로 모든 정보를 한 곳에 |
| 분양가 산정 근거를 매번 재계산 | 비교사례지수 빌더 → 자동 보정율·적정가 산출 |
| 보고서가 매 프로젝트마다 처음부터 | 섹션 템플릿 + 데이터 자동 주입 Report Builder |
| 가설·결정 근거가 사라짐 | 가설 매니저 + 의사결정 로그로 누적 |
| 분석과 인사이트가 연결 안 됨 | 차트/데이터/지도 → 인사이트 메모 → 보고서로 흐름 |

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| **프레임워크** | React 18.3 UMD + in-browser Babel (빌드 없음, 단일 HTML) |
| **차트** | Apache ECharts 5.5 |
| **타이포** | IBM Plex Sans · IBM Plex Sans KR · IBM Plex Mono |
| **상태 관리** | 커스텀 `window.Store` — pub/sub 패턴 |
| **영속성** | `localStorage` (프로젝트 단위) |
| **아이콘** | 커스텀 인라인 SVG (`js/icons.jsx`, stroke-width 1.7, 24×24 viewBox) |
| **CSS** | CSS Custom Properties (Design Tokens) — 다크/라이트 테마 |
| **실행** | `python3 -m http.server 7474` (빌드 스텝 없음) |

> 빌드 도구·번들러·Node.js 없이 브라우저에서 직접 실행. 인터넷 없는 환경에서도 동작.

---

## 디자인 시스템

DESIGN_SPEC ver2 기준. 정확한 hex/rgba를 CSS 변수로 고정하고 컴포넌트는 변수만 참조.

### 컬러 토큰 (다크 기준)

| 역할 | 변수 | 값 |
|------|------|----|
| 앱 배경 | `--bg-0` | `#12151c` |
| 패널·카드 | `--bg-1` | `#181c24` |
| 입력·버튼 | `--bg-2` | `#20252f` |
| 칩·강한 호버 | `--bg-3` | `#2a303b` |
| 강조 (연두) | `--accent` | `#98da6a` |
| 강조 텍스트 | `--accent-hi` | `#b3e88c` |
| 강조 위 글자 | `--on-accent` | `#11210e` |
| 로고마크 | `--orange` | `#fb8a44` |
| "sight" 워드 | `--navy` | `#7ba1fc` |

### SWOT 토큰

| 사분면 | 변수 | 색 |
|--------|------|----|
| 강점 Strength | `--swot-s` | `#87ce5b` |
| 약점 Weakness | `--swot-w` | `#e1815c` |
| 기회 Opportunity | `--swot-o` | `#789bef` |
| 위협 Threat | `--swot-t` | `#d8b673` |

---

## 모드 구성 (Rail)

```
1. Planning   ← Planning Studio (핵심)
2. Project    ← 프로젝트 생성·목록·선택
3. Data       ← 부동산 템플릿 12종 기반 데이터 관리
4. API Hub    ← 공공 API 노코드 수집 (Phase 3)
5. Clean      ← 전처리 (평↔㎡, 원↔만원↔억원 변환 포함)
6. Chart      ← 시각화 (Waterfall·Radar·Price Matrix 추가 예정)
7. Map        ← 입지 분석 (경쟁단지 오버레이·등급 레이어)
8. Analysis   ← 부동산 분석 (비교사례지수·분양가 산정)
9. Board      ← 대시보드
10. Report    ← Report Builder
```

---

## Planning Studio 상세

### 페이지 구성

```
워크스페이스
  ├── Planning 대시보드   파이프라인 진척 · 4-KPI · 바로가기
  ├── Project Brief       기본정보 · 건축규모 · 평형구성(평↔㎡ 자동) · 분석목적
  ├── Business Canvas     8섹션 그리드 (목표/과제/타겟/경쟁/강점/약점/데이터/결과)
  ├── 연구 질문           Q번호 · High/Med/Low 우선순위 · 상태 pill · 클릭 순환
  ├── 가설 관리           미검증→검증중→채택/기각 상태 흐름
  ├── SWOT 분석           4색 사분면 · flat row 항목 · CRUD
  └── Mind Map            Phase 3

기록
  ├── 인사이트            별점 1-5 · 해시태그 · 날짜 기록
  ├── 의사결정 로그       결정 제목 · 근거 · 태그
  └── 출처·레퍼런스       Phase 3

산출물
  └── Report Builder      Phase 3
```

### 우측 패널
현재 프로젝트의 최근 인사이트 3건 미리보기 + 빠른 추가.

---

## 프로젝트 데이터 모델

```
Project
├── 기본정보     프로젝트명, 사업지, 시행사, 시공사, 분양예정, 총세대
├── 사업유형     아파트/오피스텔/상가/지식산업센터/생활숙박시설/기타
├── 분석목적     다중선택 (시장조사/분양가/경쟁/입지/마케팅/제안서 등)
├── 평형구성     [ { 타입명, 전용㎡, 전용평(auto), 세대수 } ]
│
├── canvasCards         { sectionId: { items[] } }
├── researchQuestions   [ { text, priority:'High'|'Med'|'Low', status:'todo'|'wip'|'done' } ]
├── hypotheses          [ { text, status:'todo'|'wip'|'accepted'|'rejected' } ]
├── swot                { S: "항목1\n항목2", W: ..., O: ..., T: ... }
├── insights            [ { text, tag, star:1-5, createdAt } ]
└── decisions           [ { title, rationale, tag, createdAt } ]
```

---

## 파일 구조

```
insight_Analytics_prop/
├── index.html              진입점 (스크립트 로드 순서 중요)
├── PLAN.md                 구현 계획 (피처 전체 명세 포함)
├── CHANGELOG.md            세션별 작업 내역
├── README.md               이 파일
│
├── css/
│   ├── tokens.css          디자인 토큰 (DESIGN_SPEC 정확값)
│   ├── app.css             셸·레이아웃
│   ├── planning.css        Planning Studio 전용 스타일
│   └── ...
│
└── js/
    ├── app.jsx             루트 (모드 라우팅)
    ├── store.jsx           상태 관리 (pub/sub + localStorage)
    ├── icons.jsx           커스텀 SVG 아이콘 40종
    ├── shell.jsx           TopBar + Rail
    ├── planningMode.jsx    Planning Studio (메인 모듈)
    ├── projectMode.jsx     프로젝트 생성·선택
    ├── dataMode.jsx        데이터셋 관리
    ├── cleanMode.jsx       전처리
    ├── vizMode.jsx         시각화
    ├── mapMode.jsx         지도
    └── dashMode.jsx        대시보드
```

---

## 실행 방법

```bash
cd insight_Analytics_prop
python3 -m http.server 7474
# → http://localhost:7474
```

---

## 구현 현황

| Phase | 내용 | 상태 |
|-------|------|------|
| **0 · 셋업** | 디렉토리, 브랜드 토큰, index.html, Rail 재편 | ✅ 완료 |
| **1 · Core** | Planning Studio 8페이지, 프로젝트 모드, 스토어, 아이콘 시스템 | ✅ 주요 완료 |
| **2 · 분석** | 비교사례지수 빌더, 분양가 산정, Map 재구성, 데이터 템플릿 12종 | ⬜ 다음 단계 |
| **3 · 고도화** | API Hub, Mind Map, Report Builder 완성 | ⬜ 예정 |

상세 체크리스트: [PLAN.md § 9. 구현 단계](./PLAN.md)

---

## 도메인 지식 — 분양 업무 핵심 데이터

| 분류 | 주요 항목 |
|------|---------|
| **경쟁단지** | 단지명·세대수·타입·분양가·실거래가·분양권·프리미엄·전세가율·선호도 등급 |
| **비교사례지수** | 부지특성/환경요인/단지시설/상품특성 배점 → 보정율 → 적정분양가 |
| **가격 시계열** | 매매/전세/분양권 월별 추이 |
| **수급 동향** | 분양 예정 물량 타임라인, 미분양 추이 |
| **청약 경쟁률** | 1순위/2순위/최고경쟁타입/미달 세대 |
| **인구·세대** | 전입출처, 연령대, 순이동, 노후주택 비중 |
| **입지 시설** | 교통/교육/상권/의료/공원/업무지구 거리·소요시간 |
| **개발 호재** | GTX·역세권·산단 예정, 진행 단계 |

전체 피처 명세 → [PLAN.md § 6](./PLAN.md)

---

## 관련 자료

| 자료 | 경로 |
|------|------|
| 구현 계획 (피처 명세 포함) | [PLAN.md](./PLAN.md) |
| 작업 내역 | [CHANGELOG.md](./CHANGELOG.md) |
| 디자인 스펙 | `docs/insight Analytics Prop Brand Spec (standalone) ver2.html` |
| 로고 에셋 | `docs/brand-assets-prop/logos/prop/` |
| 디자인 레퍼런스 | `docs/design_reference/insight Analytics workbench for prop/` |
