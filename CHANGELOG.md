# insight Analytics Prop — CHANGELOG

> 세션별 작업 내역. 향후 세션 재개 및 컨텍스트 압축 시 참고용.

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

| 항목 | 우선순위 | Phase |
|------|---------|-------|
| Analysis 모드 (비교사례지수·분양가 산정) | 🔴 필수 | 2 |
| Map 모드 재구성 (입지 등급 레이어) | 🔴 필수 | 2 |
| Data 모드 부동산 템플릿 12종 | 🟡 강화 | 1 |
| Mind Map 페이지 구현 | 🟡 강화 | 3 |
| Report Builder | 🟡 강화 | 3 |
| API Hub | 🟢 선택 | 3 |
