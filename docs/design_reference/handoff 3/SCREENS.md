# 화면별 구현 가이드 (SCREENS)

각 스크린샷이 어떤 소스 파일/컴포넌트에서 나오는지, 핵심 레이아웃·동작을 정리했습니다.
**스크린샷이 정답(source of truth)** 입니다 — 색·간격이 다르면 `DESIGN_SPEC.md`·`css/`를 따르세요.

공통: 좌측 레일(52px) + 패널/작업영역/인스펙터 3분할, 상단 토바(44px), 하단 상태바(26px).
레일 8개: Plan · Hub · Data · Clean · Study · Chart · Map · Report. (소스: `js/shell.jsx`)

---

## Plan (Planning Studio) — `js/draftA/B/C.jsx` + `js/pages.jsx`
상단 **문서·대시보드·보드** 뷰 전환기(`.vsw`)로 한 프로젝트를 3가지로 봄. 모든 편집은 `window.PlanStore`로 동기.

| 스크린샷 | 화면 | 소스 | 핵심 |
|---|---|---|---|
| `01-plan-dashboard` | 문서뷰 ▸ Planning 대시보드 | `pages.jsx`(PageDashboard) | KPI 카드(클릭→해당 페이지) + 진행 파이프라인 + 바로가기 |
| `02-plan-view-cockpit` | 대시보드 뷰(Cockpit) | `draftA.jsx`(ABody) | 좌 탐색 트리 / 중앙 브리프·파이프라인·KPI·연구질문·가설(상태칩 클릭 순환) / 우 인사이트·결정로그 |
| `03-plan-view-board` | 보드 뷰(Canvas) | `draftB.jsx`(BBody) | Miro식 보드: 마인드맵 + SWOT 2×2 + 스티키 노트, 점 격자 배경 |
| `04-plan-brief` | Project Brief | `pages.jsx`(PageBrief) | 기본정보 인라인 편집 + 사업유형/분석목적 칩 토글 + 설명 |
| `05-plan-canvas` | Business Canvas (기본 진입) | `pages.jsx`(PageCanvas) | 8섹션 캔버스(항목 인라인 편집·+추가·×삭제) + 연결 연구질문 체크 |
| `06-plan-questions` | 연구 질문 빌더 | `pages.jsx`(PageQuestions) | 행마다 우선순위/상태 칩 클릭 순환, 인라인 편집, 추가/삭제 |
| `07-plan-hypotheses` | 가설 매니저 | `pages.jsx`(PageHypotheses) | 상태(미검증→검증중→채택→기각) 칩 순환 |
| `08-plan-swot` | SWOT | `pages.jsx`(PageSWOT) | 4사분면 컬러 카드(강점=초록/약점=코랄/기회=네이비/위협=골드), 항목 편집·추가 |
| `09-plan-mindmap` | Mind Map | `pages.jsx`(PageMindMap) | 루트+7축 SVG 트리, 노드 클릭→해당 분석 페이지 |
| `10-plan-insights` | 인사이트 저장소 | `pages.jsx`(PageInsights) | 제목/내용 편집 + ★ 중요도 클릭 + 추가 |
| `11-plan-decisions` | 의사결정 로그 | `pages.jsx`(PageDecisions) | 날짜·작성자·태그·결정·근거 카드, 편집/추가/삭제 |
| `12-plan-refs` | 출처·레퍼런스 | `pages.jsx`(PageRefs) | 출처 테이블, 유형·신뢰도(A/B/C) 배지 클릭 변경 |
| `13-plan-report` | Report Builder | `pages.jsx`(PageReport) | 8섹션, 차트·표·인사이트 삽입 + 해석 메모 + MD/HTML/PDF |

> 문서뷰 좌측 nav·우측 "연결 인사이트" 레일: `draftC.jsx`(CBody). 페이지 본문만 `pages.jsx`에서 교체.

---

## Hub — API Data Hub — `js/hub.jsx`
`20-hub` · 좌 커넥터 목록(부동산/통계/지도/마케팅, 연결상태 점) / 중앙 **자연어 검색바** + 선택 API + GET 엔드포인트 + 파라미터 + 응답 미리보기 테이블 / 우 데이터셋 생성 + Lineage. accent 연두.

## Data — Data Studio — `js/dataStudio.jsx` (+ `regrid.jsx`, `redata.js`)
- `21-data-preview` · 좌 데이터셋 탐색(차원/측정값 필드)+부동산 템플릿+드롭존 / 중앙 그리드(타입배지·데이터바·null) / 우 컬럼 프로파일
- `22-data-profiling` · 중앙 프로파일링 탭: 컬럼별 미니 분포 카드 + 결측%

## Clean — Cleaning Studio — `js/cleanStudio.jsx`
`23-clean` · 상단 이슈바(결측·중복·이상치, 원클릭 처리) / 중앙 그리드 / 우 연산 패널(결측·행정리·**단위변환 만원/억원/원·㎡/평**·타입·수식) + **되돌리기 가능한 파이프라인**.

## Study — Real Estate Analysis (7탭) — `js/study.jsx`
서브탭 바 + 우측 탭별 해석 메모.
- `24-study-market` 시장 개요 — KPI+월별추이+공급예정
- `25-study-price` 가격 분석 — 평당가 KPI + 면적대별 막대 + 포지셔닝 매트릭스 + Ranking
- `26-study-compare` 경쟁단지 비교 — 비교 매트릭스 + 강점/약점
- `27-study-location` 입지 분석 — 교통/교육/상권/자연 카드 + 반경요약 + 시설거리
- `28-study-demand` 수요·인구 — 인구/세대 KPI + 연령대·가구구성 막대
- `29-study-terms` 분양조건 — 납부조건 타임라인 + 경쟁대비 유불리
- `30-study-marketing` 마케팅 포인트 — 소구점 카드 + 메시지 우선순위 + 채널

## Chart — Visualization — `js/vizStudio.jsx` (ECharts)
`31-chart` · 좌 필드 / 중앙 열·행 shelf + Show Me 7종(막대·가로막대·선·영역·산점도·파이·레이더) + ECharts 캔버스 / 우 옵션(제목·값라벨·평균선·팔레트·집계·PNG). **ECharts `animation:false` 유지.**

## Map — 입지 지도 — `js/mapStudio.jsx`
`32-map` · 좌 레이어 토글 / 중앙 도식 지도(사업지 중심 + 경쟁단지·시설 마커 + 반경 링 500m/1km/3km) / 우 반경 분석 + 시설별 거리.

---

## 구현 순서 제안
1. 셸(레일+토바+3분할+상태바) & 토큰 — `css/tokens.css`·`shell.css` 그대로.
2. 공용: 아이콘(`icons.jsx`), 그리드(`regrid.jsx`), 스토어 2개(`planStore.jsx`·`redata.js`).
3. Plan(문서뷰 + pages) → Data/Clean → Study → Chart/Map → Hub → Report 순.
