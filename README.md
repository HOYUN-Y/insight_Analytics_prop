# insight Analytics Prop

> **분양대행사 기획 직무 전용 Planning OS**  
> insight Analytics 패밀리의 부동산 분양 특화 제품 — Planning Studio를 중심으로 시장조사부터 보고서 산출까지 하나의 워크스페이스에서.

---

## 개요

**insight Analytics Prop**은 분양대행사 기획 담당자가 일상적으로 수행하는 작업 — 시장조사, 경쟁단지 분석, 분양가 검토, 마케팅 전략 수립, 보고서 작성 — 을 하나의 로컬 웹앱 안에서 처리할 수 있도록 설계된 도구입니다.

```
insight Analytics  →  Workbench (범용 데이터 분석)
                  ↘  Prop      (분양대행사 특화) ← 이 프로젝트
```

---

## 실행 방법

```bash
cd insight_Analytics_prop
python3 -m http.server 7474
# → http://localhost:7474
```

빌드 도구·번들러·Node.js 없이 브라우저에서 직접 실행. (지도 타일·Overpass는 온라인 필요)

**Map Studio 키(선택):** 루트에 `keys.local.env` 생성 — `MAPTILER_KEY=...` (없으면 OSM 폴백). gitignore 처리됨.

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| **프레임워크** | React 18.3 UMD + in-browser Babel (빌드 없음) |
| **차트** | Apache ECharts 5.5 |
| **타이포** | IBM Plex Sans · IBM Plex Sans KR · IBM Plex Mono |
| **상태 관리** | `window.Store` — pub/sub 패턴 (`useStore` 훅 + `actions`) |
| **아이콘** | 커스텀 인라인 SVG (`js/icons.jsx`, stroke-width 1.7, 24×24 viewBox) |
| **CSS** | CSS Custom Properties (Design Tokens) |

---

## 모드 구성 (Rail)

| Rail | 라벨 | 상태 |
|------|------|------|
| `planning` | Plan | ✅ Planning Studio — 3뷰(문서/대시보드/보드) + 11페이지 |
| `project` | Project | ✅ 프로젝트 생성·선택 |
| `data` | Data | ✅ 데이터셋 관리·프로파일링 |
| `clean` | Clean | ✅ 전처리 파이프라인 (평↔㎡·원↔만원·되돌리기) |
| `visualize` | Chart | ✅ ECharts 시각화 빌더 |
| `map` | Map | ✅ Map Studio(MapLibre — 베이스 전환·반경·철도/도로/POI) + 분포 지도(ECharts) 탭 |
| `dashboard` | Dash | ✅ 대시보드 |
| `analysis` | Study | ⬜ Phase 2 |
| `apihub` | Hub | ⬜ Phase 3 |
| `report` | Report | → Plan ▸ Report Builder로 라우팅 |

---

## Planning Studio 상세

### 3-뷰 전환기 (토바)

| 뷰 | 아이콘 | 내용 |
|----|--------|------|
| **문서** | `doc` | 좌 nav 트리 + 중앙 페이지 + 우 인사이트 패널 |
| **대시보드** | `grid` | Cockpit — 프로젝트 메타·파이프라인·KPI·연구질문·가설 한눈에 |
| **보드** | `node` | Canvas — SVG 마인드맵 + SWOT 2×2 + 스티키 노트 |

### 문서 뷰 페이지 구성

```
워크스페이스
  ├── Planning 대시보드   파이프라인 진척 · 4-KPI · 바로가기
  ├── Project Brief       기본정보 · 평형구성(평↔㎡ 자동) · 사업유형 · 분석목적
  ├── Business Canvas     8섹션 그리드 · 연결 연구질문 체크
  ├── 연구 질문           우선순위(High/Med/Low) · 상태(미착수/조사중/완료) · 클릭 순환
  ├── 가설 관리           미검증→검증중→채택/기각 상태 흐름 · 인라인 추가
  ├── SWOT 분석           4색 사분면 · 인라인 항목 추가/삭제
  └── Mind Map            (Phase 3)

기록
  ├── 인사이트            제목+내용 2필드 · 별점 1-5 · 해시태그
  ├── 의사결정 로그       결정 제목 · 근거 · 태그 · 날짜
  └── 출처·레퍼런스       출처명 · URL · 유형 · 신뢰도(A/B/C) 배지 클릭 순환

산출물
  └── Report Builder      8섹션 아코디언 · 해석 메모 · 인사이트 블록 삽입
```

---

## Map Studio (입지 지도)

> 분양 기획 실무의 "입지 지도 제작"을 손으로 선 따라 그리던 방식에서 **공개 데이터 레이어 렌더**로 전환.
> 상세 계획·로드맵: [docs/MAP_FEATURE_PLAN.md](./docs/MAP_FEATURE_PLAN.md)

Map 모드는 두 탭으로 구성: **Map Studio**(MapLibre) ↔ **분포 지도**(기존 ECharts 코로플레스).

### 구성

| 기능 | 내용 |
|------|------|
| 베이스 지도 | MapTiler 스타일 전환 — 기본/심플/연한(오버레이용)/위성 (키 없으면 OSM 폴백) |
| 단지 핀 | 프로젝트 좌표(`coord`) 마커 + 팝업(사업지명·주소) |
| 반경 동심원 | 2 / 3 / 5km dashed + km 라벨, 색상별 토글 |
| 철도·도로 (선) | Overpass(OSM)에서 추출 — 곡선 그대로, 도로 클래스별(고속/자동차전용/주간선/보조간선) 세분화 |
| 학교·병원·역 (점) | Overpass 포인트 + 클릭 이름 팝업 |
| 옵션 | 포인트 **색상 변경**, 반경 5km 밖 클리핑, 역 이름 라벨 상시 표시 |

### 키 설정

API 키는 프로젝트 루트 **`keys.local.env`** (gitignore, 커밋 안 됨)에 `KEY=VALUE`로 저장:

```
MAPTILER_KEY=발급받은_키
```

키가 없으면 OSM 기본 타일로 자동 폴백. 데이터(철도·도로·POI)는 Overpass라 키 불필요.

### 데이터 출처

- 배경 타일: MapTiler / OSM
- 지오메트리(철도·도로·POI): **OpenStreetMap (Overpass API)** — 출처표기 시 자유
- ⚠️ 네이버·카카오맵은 약관상 산출물 사용 금지
- 참고 자산: `docs/reference/data reference/국토교통부_도시철도 전체노선` (좌표 없음 → 명칭·순서 참조용)

---

## 프로젝트 데이터 모델

```
Project
├── 기본정보        프로젝트명, 사업지명, 주소, 시행사, 시공사, 분양예정, 입주예정
├── coord           { lat, lng }  ← Map Studio 지도 중심
├── 건축개요        층수, 동수, 세대수, 면적, 용적률, 건폐율, 주차
├── 사업유형        아파트/오피스텔/상가/지식산업센터/생활숙박시설/기타
├── 평형구성        [ { 타입명, 전용㎡, 전용평(auto), 세대수, 형태, Bay, 향 } ]
├── 분양조건        계약금/중도금/잔금 비율, 발코니, 대출여부
│
├── canvasCards         { sectionId: { items[] } }
├── researchQuestions   [ { text, priority, status:'todo'|'wip'|'done' } ]
├── hypotheses          [ { text, status:'todo'|'wip'|'accepted'|'rejected' } ]
├── swot                { S, W, O, T: "항목1\n항목2\n..." }
├── insights            [ { title, body, tag, star:1-5, createdAt } ]
├── decisions           [ { title, rationale, tag, createdAt, status } ]
├── sources             [ { title, url, type, trust:'A'|'B'|'C', createdAt } ]
└── report              { [secId]: { memo, blocks[] } }
```

---

## 파일 구조

```
insight_Analytics_prop/
├── index.html              진입점 (스크립트 로드 순서 중요)
├── CHANGELOG.md            세션별 작업 내역
├── README.md               이 파일
│
├── css/
│   ├── tokens.css          디자인 토큰 (DESIGN_SPEC ver2 정확값)
│   ├── app.css             셸·레이아웃·공통 컴포넌트
│   ├── planning.css        Planning Studio 전용 스타일
│   └── (grid/data/clean/viz/dash/map/ai/tweaks).css
│
├── js/
│   ├── app.jsx             루트 — 모드·planView 라우팅
│   ├── store.jsx           상태 관리 + 액션 + 통계·변환 헬퍼
│   ├── icons.jsx           커스텀 SVG 아이콘 40+ 종
│   ├── shell.jsx           TopBar (뷰전환기 포함) + Rail + StatusBar
│   ├── planningMode.jsx    Planning Studio 문서 뷰 (11페이지)
│   ├── cockpitView.jsx     Planning Studio 대시보드 뷰 (Cockpit)
│   ├── boardView.jsx       Planning Studio 보드 뷰 (Canvas)
│   ├── projectMode.jsx     프로젝트 생성·목록
│   ├── dataMode.jsx        데이터셋 탐색·프로파일링
│   ├── cleanMode.jsx       전처리 파이프라인
│   ├── vizMode.jsx         ECharts 시각화 빌더
│   ├── mapMode.jsx         입지 지도 (ECharts 분포)
│   ├── mapStudio.jsx       Map Studio — MapLibre 지도·반경·레이어 (M0~)
│   └── dashMode.jsx        대시보드
│
└── docs/
    ├── design_reference/   디자인 레퍼런스 (handoff 3 스펙 포함)
    └── brand-assets-prop/  로고·브랜드 에셋
```

---

## 디자인 시스템

DESIGN_SPEC ver2 기준. 정확한 hex/rgba를 CSS 변수로 고정하고 컴포넌트는 변수만 참조.

| 역할 | 변수 | 값 |
|------|------|----|
| 앱 배경 | `--bg-0` | `#12151c` |
| 패널·카드 | `--bg-1` | `#181c24` |
| 입력·버튼 | `--bg-2` | `#20252f` |
| 칩·강한 호버 | `--bg-3` | `#2a303b` |
| 강조 (연두) | `--accent` | `#98da6a` |
| 강조 위 글자 | `--on-accent` | `#11210e` |
| 로고마크 | `--orange` | `#fb8a44` |
| "sight" 워드 | `--navy` | `#7ba1fc` |
| SWOT 강점 | `--swot-s` | `#87ce5b` |
| SWOT 약점 | `--swot-w` | `#e1815c` |
| SWOT 기회 | `--swot-o` | `#789bef` |
| SWOT 위협 | `--swot-t` | `#d8b673` |

---

## 구현 현황

| Phase | 내용 | 상태 |
|-------|------|------|
| **0 · 셋업** | 브랜드 토큰, 셸, Rail, 스토어 기반 | ✅ 완료 |
| **1 · Planning Core** | 3-뷰 전환, 11페이지, 인사이트/의사결정/출처/Report Builder | ✅ 완료 |
| **2 · 뷰 고도화** | 보드 뷰 수평 마인드맵·플로팅 툴바, 대시보드 뷰 세부화 | 🔄 다음 단계 |
| **2 · Map Studio** | M0~M2 ✅ 베이스 전환·반경·철도/도로/POI·색상·옵션 / M3~ PPT 익스포트 ([계획](./docs/MAP_FEATURE_PLAN.md)) | 🔄 진행 중 |
| **3 · 분석** | 비교사례지수 빌더, 분양가 산정, Map 재구성 | ⬜ Phase 2 |
| **4 · 고도화** | API Hub, Mind Map 인터랙티브, 프로젝트 JSON 내보내기 | ⬜ Phase 3 |

---

## 관련 자료

| 자료 | 경로 |
|------|------|
| 작업 내역 | [CHANGELOG.md](./CHANGELOG.md) |
| Map Studio 계획 | [docs/MAP_FEATURE_PLAN.md](./docs/MAP_FEATURE_PLAN.md) |
| 디자인 스펙 | `docs/design_reference/handoff 3/DESIGN_SPEC.md` |
| 화면 명세 | `docs/design_reference/handoff 3/SCREENS.md` |
| 인터랙션 명세 | `docs/design_reference/handoff 3/INTERACTIONS.md` |
| 레퍼런스 스크린샷 | `docs/design_reference/handoff 3/screenshots/` |
| 로고 에셋 | `docs/brand-assets-prop/logos/prop/` |
