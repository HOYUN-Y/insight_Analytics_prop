# insight Analytics Prop — CHANGELOG

> 세션별 작업 내역. 향후 세션 재개 및 컨텍스트 압축 시 참고용.

---

## [0.6.3] — 2026-06-08 · Map Studio M2.1 — 옵션·색상 커스터마이즈 + 초기화 안정화

### Added — `js/mapStudio.jsx`
- **포인트 색상 변경**: 철도·학교·병원·역 레이어별 컬러 피커(`input[type=color]`) → `setPaintProperty` 실시간 반영
- **반경 5km 밖 포인트 클리핑** 옵션: 점에 거리(`_d`) 속성 부여 → `setFilter`로 원형 클리핑
- **역 이름 라벨 상시 표시** 옵션: MapTiler 글리프 기반 symbol 레이어 (키 있을 때만)
- **도로 클래스별 세분화** 토글: 고속도로/자동차전용/주간선/보조간선 개별 on/off (`setFilter`)
- Overpass **엔드포인트 폴백**(de→private.coffee→mail.ru) + 요청 타임아웃(AbortController)

### Fixed — `js/mapStudio.jsx`
- **지도 초기화 간헐 실패 근본 해결**:
  - 비동기 생성 중 **이중 맵 생성** → `initLockRef` 동기 잠금으로 차단
  - maplibre `isStyleLoaded()`가 타일 로드 후에도 false를 반환하는 버그 → **probe 기반 준비 확인 + 재시도**로 setup/레이어 적용 보장

### Changed
- `index.html`: `mapStudio.jsx?v=18`

---

## [0.6.2] — 2026-06-08 · Map Studio M2 — 학교·병원·역 포인트 레이어

### Added — `js/mapStudio.jsx`
- **포인트 레이어**: 학교(`amenity=school`), 병원·의원(`hospital/clinic`), 역·승강장(`railway=station`/`station=subway`/`subway_entrance`)
- circle 레이어 렌더(색상별) + 클릭 시 이름 팝업 + 커서 포인터
- `LAYER_DEFS` 기반 레이어 패널 일원화 (철도·도로 선 + 학교·병원·역 점, 각 토글·개수)
- 키 불필요: 전부 Overpass(OSM)에서 수급 — 검증: 천안 5km 학교 81·병원의원 79·역 18

### Fixed — `js/mapStudio.jsx`
- 조합 Overpass 쿼리 **504(과부하)** → 선 쿼리·점 쿼리 **2개로 분리**(`Promise.all`)해 해결

### Changed
- `index.html`: `mapStudio.jsx?v=9` / 배지 M1 → M2 / 버튼 "주변 시설 불러오기"

---

## [0.6.1] — 2026-06-08 · Map Studio M1 — Overpass 철도·도로 레이어

### Added — `js/mapStudio.jsx`
- **Overpass API**로 반경 5km bbox 내 철도(`railway`)·주요도로(`highway`) 추출 → GeoJSON 변환 (`loadOSM`)
- 지도 레이어 렌더: 철도(보라, `subway/light_rail` 구분), 도로(위계별 색·굵기 `motorway>trunk>primary>secondary`)
- **레이어 패널**: "주변 도로·철도 불러오기" 버튼 + 철도/도로 체크박스 토글 + 추출 개수 + OSM 출처 표기
- 검증: 천안 성성동 5km → 철도 242 + 도로 575 자동 렌더·토글 확인 (수작업 트레이싱 제거)

### Fixed — `js/mapStudio.jsx`
- **지도 초기화 0-size 레이스 근본 수정**: `whenSized()`로 컨테이너 크기 확보 후 맵 생성
- `load` 이벤트 누락 대비: `isStyleLoaded` 즉시 / `load`+`idle` 양쪽 대기 + 멱등(`setup._done`) 처리

### Changed
- `index.html`: `mapStudio.jsx?v=7` / 헤더 배지 M0 → M1

---

## [0.6.0] — 2026-06-08 · Map Studio M0 (PoC) — MapLibre 지도 + 반경 동심원

### Added — `js/mapStudio.jsx` (신규)
- **MapLibre GL JS** 기반 입지 지도 컴포넌트 (OSM 기본 타일, API 키 불필요)
- 단지 좌표 핀(펄스 마커) + 팝업(사업지명·주소)
- **반경 2/3/5km 동심원**(dashed) + km 라벨 마커 + 색상별 토글 버튼
- `MapRouter`: 지도 모드 탭 전환 — **Map Studio**(MapLibre) ↔ **분포 지도**(기존 ECharts)
- `circleGeoJSON` 자체 구현(위경도 보정), `NavigationControl`·`ScaleControl`, `ResizeObserver`로 캔버스 리사이즈
- "단지로" 재중심 버튼

### Changed
- `js/store.jsx`: `SAMPLE_PROJECT.coord { lat, lng }` 추가 (천안 성성동) → `v=4`
- `js/app.jsx`: map 모드 라우팅을 `MapRouter`로 → `v=3`
- `index.html`: maplibre-gl 4.7.1 CSS/JS CDN, `mapStudio.jsx` 스크립트 추가
- `css/map.css`: `.ms-*` Map Studio 스타일 (툴바·캔버스·핀·반경 라벨·탭)

### 검증
- 미리보기로 천안 성성동 OSM 타일·핀·동심원·토글 렌더 확인 (캔버스 713px 정상)
- 트러블슈팅: ① 라벨 symbol 레이어 glyphs 의존 → HTML 마커로 대체 ② maplibre-gl.css가 컨테이너 position:relative 강제 → 명시적 100% 높이로 해결

### Added — 로컬 키 로더 + MapTiler 전환 (M0.1)
- `keys.local.env`(KEY=VALUE, **.gitignore 처리**)에서 런타임 `fetch`로 키 로드
- `MAPTILER_KEY` 있으면 **MapTiler streets-v2 벡터 타일**, 없으면 OSM 래스터 폴백
- 푸터에 현재 타일 소스 표시 / `.gitignore`에 `*.local.env`·`.env*` 등 시크릿 패턴 추가
- 미리보기 검증: MapTiler 벡터 타일 + 동심원 정상 렌더 확인

### 다음 (M1~)
- Overpass 철도·도로 추출·레이어, VWorld 지적도, PPT 익스포트 — docs/MAP_FEATURE_PLAN.md

---

## [계획] — 2026-06-08 · Map Studio 기능 계획 수립

### Added — `docs/MAP_FEATURE_PLAN.md` (신규)
- 입지 지도 시각화 + PPT 익스포트 기능 설계 문서 작성
- 배경: 실무의 수작업 트레이싱(곡선 철도·도로·산단 구획) 비효율 → 공개 데이터 레이어 렌더로 전환
- 데이터 소스 확정: 역/학교/병원(점)=공공데이터포털, 노선/도로(곡선 선형)=**OSM(Overpass)**, 경계(면)=VWorld/OSM
- 라이선스 정리: VWorld·MapTiler·OSM 사용 가능 / 네이버·카카오 약관상 산출물 사용 금지
- 기술 스택: MapLibre GL JS + turf.js(반경 버퍼) + PptxGenJS(`custGeom` 베지어 → 편집 가능 PPT)
- PPT 익스포트 2경로: A(이미지·쉬움) / B(편집 가능 벡터·R&D) → 하이브리드 권장
- 로드맵 M0~M6 정의 (PoC → 반경+레이어 → 포인트 → 이미지 익스포트 → 펜 도구 → 벡터 익스포트 → 광역입지)

---

## [0.5.0] — 2026-06-07 · handoff3 반영 — 출처·레퍼런스, Report Builder, SWOT/가설 인라인 편집

### Added — `js/planningMode.jsx`
- **RefsPage (출처·레퍼런스)**: 출처 목록 + 유형·신뢰도 배지 클릭 순환 + 추가/삭제 폼
- **ReportPage (Report Builder)**: 8섹션 아코디언 — 해석 메모 + 인사이트 블록 삽입/삭제, 작성 진행률 표시

### Changed — `js/planningMode.jsx`
- `SwotPage`: `prompt()` → 사분면별 인라인 input 필드 + `+` 버튼으로 교체
- `HypPage`: `prompt()` → 하단 인라인 input + 추가 버튼으로 교체
- PAGES 라우터: `refs`/`report` Stub → 실제 컴포넌트로 교체

### Changed — `js/store.jsx`
- `SAMPLE_PROJECT`: `sources[]` 샘플 2건, `report: {}` 필드 추가
- `createProject`: `sources: []`, `report: {}` 초기값 추가
- 액션 추가: `addSource`, `updateSource`, `deleteSource`
- 액션 추가: `setReportMemo`, `addReportBlock`, `delReportBlock`

### Changed — `index.html`
- `store.jsx?v=3`, `planningMode.jsx?v=3` 버전 쿼리 갱신

---

## [0.4.0] — 2026-06-07 · 뷰 전환 구현 (Cockpit · Board) & 인사이트 모델 개선

### Added — `js/cockpitView.jsx` (신규)
- **대시보드 뷰 (Cockpit)** 전용 컴포넌트 신규 구현
- 3패널 레이아웃: 좌 nav tree / 중앙 / 우 패널
  - 좌 nav: PLANNING STUDIO 헤더 + 프로젝트 배지 + 페이지 링크 (클릭 시 docs 뷰로 이동)
  - 중앙: 프로젝트 제목·주소 + 6-field 메타 그리드 + 파이프라인 바 + 6-KPI 행 + 연구질문·가설 2열
  - 우 패널: 최근 인사이트 5건 + 의사결정 로그 4건
  - 상태 칩 클릭으로 연구질문/가설 상태 순환 (Cockpit 내에서 직접 편집)

### Added — `js/boardView.jsx` (신규)
- **보드 뷰 (Canvas)** 전용 컴포넌트 신규 구현
- 도트 격자 배경 캔버스 (`radial-gradient` 24×24)
- SVG Mind Map: 루트 노드 + 7축 leaf 노드 + dashed 연결선
- SWOT 2×2 위젯: 스토어 데이터 실시간 반영
- 인사이트·의사결정 스티키 노트 카드 (색상 구분)

### Changed — `js/app.jsx`
- `planView` 상태에 따라 뷰 라우팅 추가
  - `"docs"` → `<window.PlanningMode />`
  - `"dashboard"` → `<window.CockpitView />`
  - `"board"` → `<window.BoardView />`

### Changed — `js/store.jsx`
- `SAMPLE_PROJECT.insights` — 샘플 인사이트 3건 추가 (`title` + `body` + `tag` + `star` 구조)
- `SAMPLE_PROJECT.decisions` — 샘플 의사결정 1건 추가

### Changed — `js/planningMode.jsx`
- `InsightPanel` (우측 패널): `text` 단일 필드 → `title`(bold) + `body`(faint) 2행 표시로 변경
- `InsightPanel` 빠른 추가: `prompt()` → 인라인 input 필드로 교체
- `InsightPage` (저장소 페이지): 인사이트 입력 폼에 `title` 필드 추가, `body` textarea 분리
- 기존 `text` 단일 필드 데이터 하위 호환 처리 (`ins.title || ins.text`)

### Changed — `css/planning.css`
- `.ins-quick` 스타일 추가 (우측 패널 빠른 추가 인풋)
- Cockpit 뷰 전용 CSS: `.ck-root`, `.ck-nav`, `.ck-center`, `.ck-right`, `.ck-kpis`, `.ck-2col`, `.ck-mf`, `.ck-ins-card` 등
- Board 뷰 전용 CSS: `.bv-root`, `.bv-canvas`, `.bv-widget`, `.bv-mindmap-svg`, `.bv-swot-grid`, `.bv-stickies`, `.bv-sticky` 등

### Changed — `index.html`
- `cockpitView.jsx`, `boardView.jsx` 스크립트 태그 추가 (planningMode 뒤, projectMode 앞)
- 수정된 파일 버전 쿼리 v1 → v2 (`store`, `planningMode`, `app`)

---

## [0.3.0] — 2026-06-07 · 디자인 스펙 정합 & 아이콘 시스템 교정

### Changed — `js/icons.jsx`
- `data` 아이콘: 테이블 그리드 → DESIGN_SPEC 정확 path (실린더 DB 형태)
- `clean` 아이콘: 2선 trash → 스펙 path (`M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14`)
- `analysis` 아이콘: 산점도 형태 → 꺾은선 차트 (`M4 19V5M4 19h16M8 15l3-4 3 2 4-6`)
- `planning` 아이콘: 문서+시계 복합 → 3단 라인 (`M3 5h18M3 12h12M3 19h8`)
- `api` 아이콘: 방사형 화살표 → 텍스트+화살표 코드 형태
- `map` 아이콘: path 좌표 스펙 정확값으로 교정

### Added — `js/icons.jsx`
- 플래닝 전용 아이콘 6종 추가:
  - `swot` — 4분할 그리드 (`M4 4h7v7H4zM13 4h7v7h-7z...`)
  - `flag` — 깃발 형태 (가설 관리용)
  - `bulb` — 전구 (인사이트용)
  - `doc` — 문서 (브리프·의사결정용)
  - `node` — 노드 트리 (마인드맵용)
  - `target` — 동심원 (연구 질문용)

### Changed — `js/planningMode.jsx`
- 좌측 네비게이션 아이콘 매핑 교정:
  - Project Brief: `report` → `doc`
  - 연구 질문: `search` → `target`
  - 가설 관리: `layers` → `flag`
  - SWOT: `analysis` → `swot`
  - 인사이트: `bolt` → `bulb`
  - 의사결정 로그: `report` → `doc`
  - Mind Map: `map` → `node`
- 각 페이지 h1 아이콘 동일하게 교정

---

## [0.2.0] — 2026-06-07 · Planning Studio 전면 재설계

### Rewritten — `js/planningMode.jsx`
3-패널(nav 232px · center flex-1 · right 264px) 구조로 전면 재작성.

**구성 요소:**
- `PlanNav` — 워크스페이스 / 기록 / 산출물 3섹션, 항목별 count 배지 (plain mono, no pill)
- `InsightPanel` — 우측 인사이트 패널, 최근 3건 미리보기
- `PageDoc` — 40px icon-box + 30px/800 h1 래퍼
- `DashboardPage` — 파이프라인 진척바 + 4-KPI 카드 + 바로가기
- `BriefPage` — 5섹션 폼 (기본정보·사업유형·분석목적·설명·평형구성), 평↔㎡ 자동변환
- `CanvasPage` — 8-섹션 캔버스 그리드, 연결된 연구질문 목록
- `RQPage` — Q1/Q2 번호·우선순위 배지(p1/p2/p3)·상태 pill, 클릭 순환
- `HypPage` — 미검증/검증중/채택/기각 상태 관리
- `SwotPage` — 4색 쿼드 flat row 구조, token 색상 사용
- `InsightPage` — 별점 조정 + 태그 + 날짜
- `DecisionPage` — 의사결정 제목·근거·태그 기록

**NAV 아이템:**
```
워크스페이스: dashboard / doc / grid / target / flag / swot / node
기록: bulb / doc / search
산출물: report
```

### Rewritten — `css/planning.css`
디자인 레퍼런스(`drafts.css`) 패턴으로 전면 재작성.

**주요 클래스:**
- `.plan-root` — 3패널 flex 레이아웃
- `.plan-nav` / `.plan-nv` / `.plan-nsec` / `.plan-nv-n` — 네비게이션
- `.plan-right` / `.insp` / `.icard` — 우측 인사이트 패널
- `.plan-doc` / `.plan-crumb` / `.plan-h1` / `.plan-h1-icon` / `.plan-h2` — 페이지 구조
- `.plan-callout` / `.plan-statline` / `.addrow` — 공통 UI
- `.swotgrid` / `.swotq` / `.sqh` / `.sqi` / `.sqadd` — SWOT
- `.bcanvas` / `.bc` / `.bk` / `.bl` / `.li` — 캔버스
- `.qbuild` / `.qb` / `.qbn` / `.qbmain` / `.qbt` — RQ·가설
- `.pri.p1/.p2/.p3` — 우선순위 배지
- `.st-pill.todo/.doing/.done/.adopt/.reject` — 상태 pill
- `.bfsec` / `.bfgrid` / `.bchips` / `.bchip` — 브리프 폼
- `.inslist` / `.insrow` / `.starset` — 인사이트
- `.declist` / `.decard` — 의사결정
- `.dashkpis` / `.kpi` / `.pipe` — 대시보드

---

## [0.1.0] — 2026-06-07 · 초기 구축 및 기반 정합

### Added — `css/tokens.css`
DESIGN_SPEC ver2 기준으로 정확한 토큰 정의:
- 표면: `--bg-0 #12151c` ~ `--bg-3 #2a303b` (쿨 네이비-그레이)
- 텍스트: `--tx-hi #d6dbe4` ~ `--tx-faint #565d6a`
- 강조: `--accent #98da6a` (연두), `--on-accent #11210e`, `--accent-soft rgba(152,218,106,0.15)`
- 브랜드: `--orange #fb8a44` (로고마크), `--navy #7ba1fc` (sight)
- 상태: `--pos #79e0a8`, `--neg #f08e86`, `--warn #d8b673`
- SWOT: `--swot-s #87ce5b`, `--swot-w #e1815c`, `--swot-o #789bef`, `--swot-t #d8b673`
- 차트 팔레트: `--cat-1` ~ `--cat-8`

### Added — `js/store.jsx`
`SAMPLE_PROJECT` 포함 상태 관리 구축:
- `swot: {S:"", W:"", O:"", T:""}` 구조
- `canvasCards`, `researchQuestions`, `hypotheses`, `insights`, `decisions`
- 액션: `updateProject`, `upsertCanvasCard`, `addResearchQuestion`, `updateQuestion`, `deleteQuestion`, `addHypothesis`, `updateHypothesis`, `deleteHypothesis`
- 모든 액션 단일 객체 구조분해 방식 통일

### Changed — `js/app.jsx`
Planning 모드: `<window.Workspace>` 래퍼 제거 → `<window.PlanningMode />` 직접 렌더

### Fixed
- SWOT 색상: 다크 subtle tint → 밝은 solid 색상 (스펙 SWOT 토큰 사용)
- 스토어 액션 서명 불일치 (단일 객체 방식으로 통일)
- 아이콘 path drift: DESIGN_SPEC 명시 path로 전량 교정

---

## 미구현 / 다음 단계

| 항목 | 우선순위 | Phase | 비고 |
|------|---------|-------|------|
| **Map Studio** — 지도 레이어 시각화(지하철·도로·POI) + 반경(2/3/5km) 추출 + PPT 익스포트 | 🔴 필수 | 2 | 상세 계획: [docs/MAP_FEATURE_PLAN.md](./docs/MAP_FEATURE_PLAN.md) |
| **보드 뷰 재구현** — 수평 트리 마인드맵 + 플로팅 툴바 + 자유 배치 스티키 | 🔴 필수 | 2 | handoff3 `03-plan-view-board` 기준 |
| **대시보드 뷰 세부화** — 연구질문 연결 분석·담당자, 가설 근거 링크 | 🔴 필수 | 2 | handoff3 `02-plan-view-cockpit` 기준 |
| Analysis 모드 (비교사례지수·분양가 산정) | 🔴 필수 | 2 | |
| ~~Map 모드 재구성 (입지 등급 레이어)~~ → **Map Studio**로 통합·확장 | 🔴 필수 | 2 | 위 Map Studio 항목 참조 |
| Data 모드 부동산 템플릿 12종 | 🟡 강화 | 1 | |
| Mind Map 페이지 구현 | 🟡 강화 | 3 | |
| API Hub | 🟢 선택 | 3 | |
