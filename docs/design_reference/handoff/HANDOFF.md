# insight Analytics Prop — 개발 인수인계 (HANDOFF)

> 분양대행사 마케팅 기획 전용 **로컬-퍼스트 부동산 분석 워크벤치** 프로토타입.
> 형제 제품 `insight Analytics`(주황) · `insight Data hub`(블루)의 자매 제품 — 부동산(Prop) 에디션, **연두 accent**.
> 단일 페이지 · 무빌드(in-browser Babel) · React 18 + ECharts. 이 폴더는 **디자인 레퍼런스(작동하는 HTML 프로토타입)** 이며,
> 실제 제품은 대상 코드베이스(Next.js/Vite + TS 등)의 패턴으로 **재구현**하는 것을 전제로 합니다.

---

## 1. 무엇인가
좌측 레일로 전환하는 **8개 모듈**의 부동산 분석 워크벤치:

| rail id | 라벨 | 내용 |
|---|---|---|
| `planning` | Plan | Planning Studio — 문서/대시보드/보드 3뷰 + 11개 페이지(브리프·캔버스·연구질문·가설·SWOT·마인드맵·인사이트·의사결정·출처·Report Builder) |
| `api` | Hub | API Data Hub — 노코드 데이터 수집(커넥터·자연어 검색·응답 미리보기·데이터셋 생성·Lineage) |
| `data` | Data | Data Studio — 데이터셋 탐색·미리보기·프로파일링·컬럼 프로파일 + 부동산 조사 템플릿 |
| `clean` | Clean | Cleaning Studio — 이슈바(결측·중복·이상치) + 연산/단위변환 + 되돌리기 가능한 파이프라인 |
| `analysis` | Study | Real Estate Analysis — 7개 탭(시장개요·가격·경쟁단지·입지·수요인구·분양조건·마케팅) |
| `chart` | Chart | Visualization — Tableau식 shelves → ECharts(막대/가로막대/선/영역/산점도/파이/레이더) |
| `map` | Map | 입지 분석 지도 — 사업지·경쟁단지·시설 마커 + 반경 분석(500m/1km/3km) |
| `report` | Report | Plan ▸ 산출물 ▸ Report Builder로 라우팅(8섹션 보고서) |

모든 분석·전처리·차트 결과는 **인사이트 → Report Builder**로 모이는 흐름.

## 2. 실행
빌드 불필요. 정적 서버에서 `Planning Studio.html`을 연다(또는 프리뷰).
- 외부 CDN(런타임): React 18.3.1 / ReactDOM / @babel/standalone 7.29.0(핀+SRI), Apache ECharts 5.5.1(jsdelivr), Google Fonts(IBM Plex Sans/KR/Mono).
- 상태는 인메모리 + 일부 localStorage(`ps-view`). 새로고침 시 데이터 초기화.

> 산출물 파일
> - **`Planning Studio.html`** — 메인 앱(프로토타입). ← 시작점
> - `index.html` — 초기 탐색 캔버스(브랜드 + 드래프트 A/B/C + Project Brief). 디자인 캔버스 위 비교용.
> - `insight Analytics Prop - Brand Spec.html` — 브랜드 스펙 문서.

## 3. 렌더링 모델
- React 18 (UMD 전역) · **JSX import/모듈 없음**. 각 `*.jsx`는 `<script type="text/babel">`로 자체 스코프에서 트랜스파일.
- **파일 간 공유는 `window`로**: 각 모듈은 끝에서 `window.X = …` 또는 `Object.assign(window, {…})`로 노출.
- `index.html` / `Planning Studio.html`의 `<script>` **로드 순서가 중요**(아래 순서: tokens/css → icons → store → shell → pages → 모듈 → echarts → viz/map → app).
- 차트는 ECharts(`animation:false` — 프리뷰 iframe의 offscreen rAF 스로틀로 빈 차트 방지, 유지할 것).
- CSS는 손수 작성, 전부 디자인 토큰(CSS custom properties) 기반.
- **스타일 객체명 충돌 금지**(`const styles` 쓰지 말 것). 인라인 또는 고유 이름.

## 4. 파일 맵
```
Planning Studio.html       # 메인 앱 — 로드 순서·모듈 라우팅(module state)·1440×900 스케일
index.html                 # 디자인 캔버스(브랜드/드래프트/브리프)
design-canvas.jsx          # 디자인 캔버스 래퍼(index 전용)

css/
  tokens.css               # 디자인 토큰 (ver2: 쿨 네이비 표면 · 연두 accent · 오렌지/네이비 브랜드)
  shell.css                # 앱 셸(topbar·rail·panel·chip·btn·뷰 전환기·워드마크 클래스)
  drafts.css               # Plan 페이지/드래프트 스타일(.dA/.dB/.dC/.dP + .pg 페이지들)
  modules.css              # Hub/Study/Data/Clean/Chart/Map(.dH/.dS/.dDS/.dCl/.dV/.dM) + 그리드

js/
  icons.jsx                # window.Ic(name,size) — 인라인 라인아이콘
  planStore.jsx            # window.PlanStore — 기획 데이터 스토어(질문/가설/SWOT/인사이트/캔버스/출처/리포트/프로젝트/결정) + window.Edit(인라인 편집)
  redata.js                # window.RE(경쟁단지 샘플데이터·stat·전처리엔진) + window.REStore(데이터/클린 스토어)
  shell.jsx                # window.Shell, RAIL, Statusbar (topbar+rail+뷰전환기)
  pages.jsx                # window.Pages — Plan 문서 페이지들(canvas/questions/hypotheses/swot/dashboard/insights/brief/mindmap/decisions/refs/report)
  draftA.jsx               # window.ABody/DraftA — Plan 대시보드(Cockpit) 뷰
  draftB.jsx               # window.BBody/DraftB — Plan 보드(Canvas) 뷰
  draftC.jsx               # window.CBody/DraftC — Plan 문서(Docs) 뷰 + nav 라우터
  projectBrief.jsx         # window.ProjectBrief — (index 캔버스용 풀스크린 브리프)
  brand.jsx                # window.BrandStrip — 브랜드 카드(index 캔버스)
  hub.jsx                  # window.HubBody — API Data Hub
  study.jsx                # window.StudyBody — Real Estate Analysis(7탭)
  regrid.jsx               # window.REGrid — 공용 데이터 그리드
  dataStudio.jsx           # window.DataStudioBody — Data Studio
  cleanStudio.jsx          # window.CleanStudioBody — Cleaning Studio
  vizStudio.jsx            # window.VizStudioBody — 차트 빌더(ECharts)
  mapStudio.jsx            # window.MapStudioBody — 입지 지도
```

## 5. 상태 스토어
두 개의 작은 redux-like 스토어(둘 다 `useStore(selector)` 훅 + `actions`):

- **`window.PlanStore`** (`js/planStore.jsx`) — 기획/문서 데이터.
  state: `{ page, questions[], hypotheses[], swot{S,W,O,T}, insights[], canvas[], links[], purposes{}, project{}, decisions[], mindmap[], sources[], report[] }`
  actions: `setPage, cycleQ/cycleQPri/addQ/setQText/delQ, cycleH/addH/…, addSwot/setSwot/delSwot, addInsight/setStar/…, toggleLink, addCanvasItem/…, setProject/setType/togglePurpose, addDecision/…, addSource/cycleTrust/…, setReportMemo/addReportInsight/delReportBlock`.
  상태 변경은 문서·대시보드·보드·상태바에 **실시간 동기**.
- **`window.REStore`** (`js/redata.js`) — 데이터/전처리.
  state: `{ activeId, selCol, dataTab, steps[], cursor }`. `RE.applySteps(dataset, steps, cursor)`가 전처리 파이프라인을 순수 함수로 재계산(되돌리기/시간이동). 연산: drop_missing/fill_mean·median·mode/drop_duplicates/remove_outliers/money_unit/area_unit/change_type/rename/drop_col/formula.

## 6. 브랜드 토큰 (`css/tokens.css`, Brand Spec ver2)
변수명 유지 → 전 모듈 일괄 반영.
- 표면(다크, 쿨 네이비): `--bg-0 #12151c` / `--bg-1 #181c24` / `--bg-2 #20252f` / `--bg-3 #2a303b` · line `#2a303b`
- 텍스트: `--tx-hi #d6dbe4` / `--tx-mid #9aa3b2` / `--tx-lo #6f7888` / `--tx-faint #565d6a`
- accent(연두): `--accent #98da6a` / `--accent-hi #b3e88c` / `--accent-deep #43963c` / soft·line(rgba) / `--on-accent #11210e`
- 브랜드 마크: `--orange #fb8a44`(로고마크+"Analytics") · `--navy #7ba1fc`("sight")
- 상태: `--pos #79e0a8` / `--warn #d8b673` / `--neg #f08e86` · 필드: `--dim-color #789bef`(차원) / `--meas-color #87ce5b`(측정값)
- 차트 카테고리 `--cat-1..8`: #789bef #b886da #dd7aa1 #e1815c #c2982a #81af54 #07b89b #00b0d7
- **워드마크**: `in`(tx) · `sight`(navy) · `Analytics`(orange) · `Prop`(green). 로고마크는 오렌지 The Insight Point(제품군 공통, 고정).
- 타이포: IBM Plex Sans/KR(UI·본문) + IBM Plex Mono(수치·필드키, tabular-nums). 본문 13px, 레이블 10–11px, 행 28px, `word-break: keep-all`.

## 7. 확장 가이드
- **차트 타입 추가** → `vizStudio.jsx` `TYPES` + `buildOption` 분기.
- **전처리 연산 추가** → `redata.js` `applySteps` case + `cleanStudio.jsx` 버튼 + `OP_LABEL`.
- **Plan 페이지 추가** → `pages.jsx`에 컴포넌트 + `window.Pages`에 등록 + `draftC.jsx` `NAV`에 항목.
- **모듈 추가** → `xStudio.jsx`에서 `window.XBody` export + `shell.jsx RAIL` + `Planning Studio.html`의 module 라우팅 분기.
- **브랜드/테마 변경** → `css/tokens.css`(변수명 유지) + `shell.css`의 `.wm` 클래스.

## 8. 주의(편집 전 필독)
- 데이터는 항상 `REStore.getActive()`(전처리 적용본)로 읽기.
- ECharts `animation:false` 유지. `const styles` 전역 금지(스코프 충돌).
- 무영속(새로고침 초기화) — 프로덕션에선 스토어 직렬화(localStorage/프로젝트 JSON) 추가.
- 캐노니컬 HTML(명시적 닫는 태그) 유지 — 비주얼 에디터 호환.

## 9. 프로덕션 포팅 제안
Next.js + TS + Tailwind/shadcn + Zustand(현 스토어가 거의 1:1) + TanStack Table(REGrid 대체) + ECharts + dnd-kit(보드/마인드맵 드래그) + 파일 import(CSV/XLSX/JSON 타입추론) + 실 API 커넥터(공공데이터/국토부/KOSIS/VWorld) + export(PNG/PDF/MD).
