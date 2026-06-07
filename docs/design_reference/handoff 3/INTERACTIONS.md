# 인터랙션 명세 (INTERACTIONS)

스크린샷·레이아웃에 안 드러나는 **동작/상태 변화**를 요소별로 명시합니다.
프로토타입은 작은 redux식 스토어 2개로 동작 — 모든 변경은 액션을 통해서만, 변경 시 관련 화면이 **실시간 동기**됩니다.
구현 시 이 표의 트리거→결과를 그대로 재현하세요. (소스: `js/planStore.jsx`, `js/redata.js`)

> 공통: 인라인 편집 = 텍스트 클릭 → `contentEditable`, blur 또는 Enter 시 저장(`window.Edit`). · 삭제 = 항목 hover 시 우측 `×` 노출.

---

## A. PlanStore (기획 데이터) — 한 곳에서 바꾸면 문서·대시보드·보드·상태바·Report 동기

### 인사이트 (Insights) — *별점 등*
- **★ 별점**: 별 5개, n번째 별 클릭 → 중요도 = n (`setStar(id, 1..5)`). 채운 별 `--accent-hi`, 빈 별 `--tx-faint`.
- **제목/내용**: 인라인 편집 (`setInsightField(id,'t'|'b',v)`).
- **추가**: "인사이트 추가" → 기본 항목 1개 append (`addInsight`). Chart·Map·Study의 "인사이트로 저장"도 동일 액션 → **목록·Report에 즉시 반영**.
- 문서뷰 우측 "연결 인사이트"는 상위 3개 미리보기(카드 클릭 → 인사이트 페이지로 이동).

### 연구 질문 (Questions)
- **상태 칩 클릭**: 미착수→조사중→완료 **순환** (`cycleQ`). 색: todo=`--bg-3`/회색, doing=`--warn`, done=`--accent`.
- **우선순위 칩 클릭**: P1→P2→P3 순환 (`cycleQPri`). P1=`--neg`, P2=`--warn`, P3=회색.
- **본문**: 인라인 편집(`setQText`). **추가/삭제**: `addQ`/`delQ`. 헤더의 완료/조사중 카운트는 자동 집계.

### 가설 (Hypotheses)
- **상태 칩**: 미검증→검증중→채택→기각 순환(`cycleH`). 채택=`--pos`, 기각=`--neg`, 검증중=`--warn`, 미검증=회색.
- 본문 인라인 편집, 추가/삭제(`addH`/`delH`).

### SWOT
- 사분면별 **항목 추가**(`addSwot('S'|'W'|'O'|'T')`) · **인라인 편집**(`setSwot`) · **× 삭제**(`delSwot`). 빈 문자열로 저장 시 삭제.

### Business Canvas
- 8섹션 각각 **+항목 추가**(`addCanvasItem(i)`) · 항목 **인라인 편집/삭제**(`setCanvasItem`/`delCanvasItem`).
- "연결 연구질문" **체크박스 토글**(`toggleLink(qid)`) — 체크 시 취소선. 헤더 "작성 n/8"은 내용 있는 섹션 수.

### Project Brief
- 기본정보 필드 인라인 편집(`setProject`). **사업유형 칩**: 단일 선택(`setType`). **분석목적 칩**: 다중 토글(`togglePurpose`). → 대시보드 브리프·분석목적 칩에 동기.

### 의사결정 로그
- 결정/근거 인라인 편집(`setDecisionField`), 추가는 **최신이 맨 위**(`addDecision`, 오늘 날짜 자동), 삭제(`delDecision`).

### 출처·레퍼런스
- 제목/URL 인라인 편집(`setSourceField`). **유형 배지 클릭**: 정부기관→공공데이터→언론→기업→현장조사→내부자료 순환(`cycleSourceType`). **신뢰도 배지 클릭**: A→B→C 순환(`cycleTrust`, A=`--pos`/B=`--warn`/C=회색). 추가/삭제.

### Report Builder
- 섹션별 **해석 메모** 인라인 편집(`setReportMemo`) → 헤더 "해석 메모 n/8" 자동.
- **"인사이트 삽입"**: 아직 안 쓴 인사이트를 순서대로 블록 추가(`addReportInsight`) — 블록은 인사이트 제목 표시. 차트/표 버튼은 비활성(데모).
- 블록 **× 제거**(`delReportBlock`). 메모 있으면 "작성", 없으면 "빈 섹션" 배지.

### 뷰/페이지 전환
- 토바 **문서/대시보드/보드** = PlanningStudio의 `view` state(+`localStorage 'ps-view'`). 문서뷰 좌측 nav 클릭 = `setPage`.
- 레일 **Report** 클릭 → 모듈=Plan + 뷰=문서 + 페이지=report로 점프.

---

## B. REStore (데이터/전처리) — `js/redata.js`

### Data Studio
- 좌측 데이터셋 클릭 → `setActive`(파이프라인 초기화). 필드/컬럼 클릭 → `setSelCol`(우측 컬럼 프로파일 갱신). 탭 = `setDataTab('preview'|'profiling')`.

### Cleaning Studio — **되돌리기 가능한 파이프라인**
- 이슈바 "제거/제외/처리" 또는 우측 연산 버튼 → `addStep({op, col, params})`. 현재 cursor 이후 단계는 잘리고 새 단계 추가.
- **연산**: drop_missing / fill_mean·median·mode / drop_duplicates / remove_outliers(IQR ±1.5) / **money_unit(만원·억원·원)** / **area_unit(㎡·평)** / change_type / rename / drop_col / formula(`row.*` 식).
- **되돌리기/다시**(`undo`/`redo`), 파이프라인 단계 클릭 = **시간이동**(`gotoStep`) — 이후 단계는 취소선. "초기화"(`clearSteps`).
- 그리드·이슈바·행수는 `applySteps(dataset, steps, cursor)` 재계산 결과로 **항상 파생**(원본 불변).

### Visualization (Chart) — 로컬 state(컴포넌트 내)
- 필드 클릭 → X(차원)/Y(측정값) 지정. **Show Me 타일** = 차트 타입 전환 → ECharts `setOption(opt, true)` 재렌더.
- 우측: 제목(input) · 값라벨/평균선 **토글** · 팔레트 3종 · 집계(평균/합계/최대/최소) · **PNG 내보내기**(`echarts.getDataURL`).

### Map — 로컬 state
- 좌측 **레이어 토글**(카테고리 show/hide) · 상단 **반경 토글**(500m/1km/3km 링 on/off). 우측 반경 분석 카운트는 거리 기준 자동 집계.

### Study (7탭) — 로컬 state
- 서브탭 클릭 → 탭 본문 + **우측 해석 메모가 탭별로 교체**. "해석 메모 추가" → `PlanStore.addInsight`(인사이트로 흘러감).

---

## C. 상태값 enum (정확)
- 연구질문 status: `todo`(미착수) → `doing`(조사중) → `done`(완료)
- 가설 status: `untested`(미검증) → `testing`(검증중) → `adopt`(채택) → `reject`(기각)
- 우선순위: `p1` → `p2` → `p3`
- 신뢰도: `A` → `B` → `C`
- 출처유형: 정부기관 / 공공데이터 / 언론 / 기업 / 현장조사 / 내부자료
- 인사이트 중요도(star): 1–5

> 가장 확실: `js/planStore.jsx`·`js/redata.js`의 `actions`를 그대로 포팅(거의 Zustand 1:1). 인사이트 별점처럼 "빠지기 쉬운" 동작은 위 표를 체크리스트로 사용.

---

## D. 보드 뷰 (Canvas) — 현재 상태 & 향후 구현 동작
`draft B`(BBody)는 현재 **프레젠테이션용 정적 보드**입니다 — 마인드맵·SWOT 2×2·스티키 노트가 고정 좌표로 배치된 시각 목업이며, 드래그·연결 기능은 **미구현**.

프로덕션에서 구현할 동작(권장 라이브러리: dnd-kit / react-flow):
- **노드·스티키 드래그 이동** — 자유 좌표 배치, 위치 저장.
- **노드 연결(엣지)** — 핸들 드래그로 노드 간 화살표 생성/삭제.
- **요소 추가** — 툴바에서 텍스트/메모/이미지/차트/도형 추가(상단 플로팅 툴바 `.ctoolbar` 자리).
- **그룹화·색상 지정** — 다중 선택 후 그룹, 노드 색상 변경.
- **연결 데이터** — 노드에 데이터셋/차트/지도/메모/URL 첨부(스토어 `mindmap`/`canvas`와 연동).
- **줌·팬** — 무한 캔버스 스크롤/확대(현재 고정).
- SWOT 사분면은 보드에서도 `PlanStore.swot`와 동기되도록(현재는 시각만) 연결 권장.

> 즉 보드 뷰는 "레이아웃·비주얼은 스크린샷 기준, 인터랙션은 위 항목을 신규 구현" 으로 다루세요. 문서/대시보드 뷰는 위 A절대로 이미 완전 동작합니다.
