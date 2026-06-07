# insight Analytics Prop — DESIGN SPEC (드리프트 방지용)

> Claude Code가 **색·간격을 임의로 재추정하지 않도록** 정확한 값을 못박은 문서입니다.
> 디자인이 미세하게 달라지는 원인은 거의 ① 색을 눈대중/oklch→hex 반올림으로 다시 만들거나 ② `soft`·`line`(알파) 변형이나 정확한 px를 놓쳐서입니다.

## 0. 가장 중요한 규칙
1. **색은 추정 금지.** 아래 표의 hex/rgba를 **그대로** 쓰세요. 변환·근사 금지.
2. 가능하면 프로토타입의 `css/tokens.css`·`css/shell.css`·`css/modules.css`·`css/drafts.css`를 **그대로 복사**해 CSS 변수로 쓰고, 컴포넌트는 변수만 참조하세요. (값을 인라인으로 풀어쓰면 드리프트 납니다.)
3. 모든 색·간격은 **CSS custom property**로. 컴포넌트에 raw hex를 박지 마세요.
4. 폰트는 **IBM Plex Sans / IBM Plex Sans KR / IBM Plex Mono** 고정. 숫자는 `font-variant-numeric: tabular-nums`.

---

## 1. 컬러 토큰 (다크, 정확값)

### 표면 (쿨 네이비-그레이)
| 변수 | 값 | 용도 |
|---|---|---|
| `--bg-0` | `#12151c` | 앱 배경 / 작업영역 |
| `--bg-1` | `#181c24` | 패널·토바·레일·카드 |
| `--bg-2` | `#20252f` | 입력·raised·호버 버튼 |
| `--bg-3` | `#2a303b` | 칩·강한 호버 |
| `--bg-hover` | `rgba(255,255,255,0.045)` | 행 호버 |
| `--line` | `#2a303b` | 기본 보더 |
| `--line-2` | `#20252f` | 옅은 구분선 |
| `--line-strong` | `#353c49` | 강한 보더 |

### 텍스트
| 변수 | 값 | 용도 |
|---|---|---|
| `--tx-hi` | `#d6dbe4` | 본문·제목 |
| `--tx-mid` | `#9aa3b2` | 보조 본문 |
| `--tx-lo` | `#6f7888` | 레이블 |
| `--tx-faint` | `#565d6a` | 흐린 보조·플레이스홀더 |

### Accent (연두) — UI 강조색
| 변수 | 값 | 용도 |
|---|---|---|
| `--accent` | `#98da6a` | 기본 강조(버튼·액티브·바) |
| `--accent-hi` | `#b3e88c` | 강조 텍스트·아이콘(다크 위) |
| `--accent-deep` | `#43963c` | 그라데이션 하단·아바타 |
| `--accent-soft` | `rgba(152,218,106,0.15)` | 선택 배경·뱃지·액티브 칩 |
| `--accent-line` | `rgba(152,218,106,0.45)` | 강조 보더 |
| `--on-accent` | `#11210e` | **연두 위 텍스트(어두운 색)** |

> ⚠️ 연두 버튼/탭의 글자색은 흰색이 아니라 **`--on-accent #11210e`**(짙은 녹흑)입니다. 여기서 자주 틀립니다.

### 브랜드 마크 (워드마크·로고)
| 변수 | 값 | 용도 |
|---|---|---|
| `--orange` | `#fb8a44` | **로고마크 배경** + 워드마크 "Analytics" |
| `--navy` | `#7ba1fc` | 워드마크 "sight" |

### 상태 · 필드 타입
| 변수 | 값 | 용도 |
|---|---|---|
| `--pos` | `#79e0a8` | 성공·상승·채택 |
| `--warn` | `#d8b673` | 경고·이상치·조사중 |
| `--neg` | `#f08e86` | 오류·하락·기각 |
| `--dim-color` | `#789bef` | 차원(범주) — STR 배지 |
| `--meas-color` | `#87ce5b` | 측정값(수치) — 123 배지 |
| `--dim-soft` | `rgba(120,155,239,0.16)` | 차원 배경 |
| `--meas-soft` | `rgba(135,206,91,0.16)` | 측정값 배경 |

### 차트 카테고리 팔레트 (`--cat-1` … `--cat-8`)
`#789bef` · `#b886da` · `#dd7aa1` · `#e1815c` · `#c2982a` · `#81af54` · `#07b89b` · `#00b0d7`

### 그림자
| 변수 | 값 |
|---|---|
| `--shadow-1` | `0 1px 2px rgba(0,0,0,0.45)` |
| `--shadow-2` | `0 6px 22px -6px rgba(0,0,0,0.6)` |
| `--grid-line` | `rgba(255,255,255,0.06)` |

---

## 2. 워드마크 (정확)
`in`·`sight`·`Analytics`·`Prop`를 **공백으로 구분**, 소문자 표준.
```html
<span class="wm">
  <span class="i">in</span><span class="s">sight</span> <span class="a">Analytics</span> <span class="p">Prop</span>
</span>
```
| 토큰 | 색 |
|---|---|
| `in` | `--tx-hi #d6dbe4` |
| `sight` | `--navy #7ba1fc` |
| `Analytics` | `--orange #fb8a44` |
| `Prop` | `--accent #98da6a` |

- 워드마크 폰트: 700, 15px, `letter-spacing:-0.01em`.
- **로고마크**: 26×26, `border-radius:7px`, 배경 `--orange #fb8a44`, 안에 흰색 "The Insight Point" 차트 글리프(svg 17×17). 심볼 색은 항상 오렌지(제품군 공통, 고정) — 연두로 바꾸지 말 것.

---

## 3. 레이아웃·컴포넌트 치수 (정확 px)
고밀도 데이터 툴 기준. 임의로 키우지 말 것.

### 셸
- 앱 그리드: `grid-template-rows: 44px 1fr 26px` (토바 / 본문 / 상태바). 기본 폰트 13px.
- **토바** `.tb`: 높이 44px, 패딩 `0 14px`, gap 14px, 배경 `--bg-1`, 하단 `1px solid --line`.
- **레일** `.rail`: 너비 52px, 배경 `--bg-1`, 우측 `1px --line`, 패딩 `8px 0`, 항목간 gap 2px.
  - 레일 항목 `.ri`: 40×42, radius 8px, 아이콘 18px + 라벨 9px, 색 `--tx-lo`; 액티브=배경 `--accent-soft`·글자 `--accent-hi`.
- **패널** `.panel`: 배경 `--bg-1`, 사이드 보더 `1px --line`. 헤더 `.ph` 패딩 `11px 13px`, 제목 11px/700/`letter-spacing:0.08em`/uppercase/`--tx-lo`.
- **작업영역** `.center`: 배경 `--bg-0`.
- **상태바** `.sb`: 높이 26px, 폰트 10px mono, 색 `--tx-faint`, 상단 `1px --line`.

### 공통 요소
- **칩** `.chip`: 높이 22px, radius 11px, 패딩 `0 9px`, 11px/500, 배경 `--bg-2`/보더 `--line-2`. 강조 `.chip.g`=배경 `--accent-soft`·글자 `--accent-hi`·보더 `--accent-line`.
- **버튼** `.btn`: 높이 28px, radius 7px, 패딩 `0 12px`, 12px/600. primary=배경 `--accent`·글자 `--on-accent`.
- **토바 액션** `.act`: 높이 28px, radius 7px. primary=`--accent`/`--on-accent`.
- **아바타**: 28×28 원, `linear-gradient(135deg, var(--accent), var(--accent-deep))`, 글자 `--on-accent`.
- **뷰 전환기** `.vsw`(문서/대시보드/보드): 컨테이너 배경 `--bg-2`/보더 `--line`/radius 9px/패딩 3px. 탭 높이 26px, radius 6px, 12px/600; 액티브=배경 `--accent`·글자 `--on-accent`.
- **타입 배지**(그리드): 8.5px/800 mono, radius 3px, 패딩 `1px 4px`. 수치=`--meas-soft`+`--meas-color`, 문자=`--dim-soft`+`--dim-color`.
- **데이터 그리드 행**: 높이 ~28px, 헤더 배경 `--bg-2`, 셀 보더 `--line-2`. null 값=이탤릭 `--neg` 0.7 투명.

### 라운딩 스케일
`--r-sm 4` · `--r-md 6` · `--r-lg 9` · `--r-xl 14`. 카드 대부분 10–14px, 칩/버튼 7–11px.

---

## 4. 타이포 스케일
- UI/본문: IBM Plex Sans + KR. 본문 13px, 레이블 10–11px, 섹션제목 11–13px(700, uppercase, `letter-spacing:0.06–0.08em`).
- 수치·필드키·URL·토큰: IBM Plex Mono, `tabular-nums`.
- 큰 KPI 숫자: 22–27px/700, `letter-spacing:-0.02em`, mono.
- 한글 줄바꿈 `word-break: keep-all`. 긴 본문 `text-wrap: pretty`.

---

## 5. 자주 나는 드리프트 & 교정
| 증상 | 원인 | 교정 |
|---|---|---|
| 연두 버튼 글자가 흰색 | `--on-accent` 미적용 | 연두 위 글자는 `#11210e` |
| 액센트가 너무 쨍하거나 칙칙 | hex 재추정 | `#98da6a` 그대로, hi `#b3e88c` |
| 선택 배경이 불투명 초록 | soft를 불투명색으로 | `rgba(152,218,106,0.15)` 사용 |
| 표면이 초록빛/완전 무채색 | 쿨 네이비 미반영 | `#12151c/#181c24/#20252f/#2a303b` |
| "sight"가 주황 | v1 기준 | ver2는 **sight=네이비**, Analytics=오렌지 |
| 보더가 너무 진함 | line/line-strong 혼동 | 기본 `--line #2a303b`, 강조만 `#353c49` |
| 차트색이 임의 | 팔레트 미사용 | `--cat-1..8` 고정값 |
| UI가 헐렁함 | 간격 키움 | 토바 44·레일 52·행 28·칩 22·버튼 28 고정 |

---

## 6. Claude Code에 줄 프롬프트 예시
> "디자인 토큰은 추정하지 말고 첨부한 DESIGN_SPEC.md / css/tokens.css의 hex·rgba를 **그대로** CSS 변수로 정의하고, 모든 컴포넌트는 변수만 참조해줘. 연두(`--accent #98da6a`) 위 글자는 `--on-accent #11210e`다. 표면은 쿨 네이비(`#12151c`…), 워드마크는 in·sight(네이비 #7ba1fc)·Analytics(오렌지 #fb8a44)·Prop(연두 #98da6a). 치수(토바 44/레일 52/행 28/칩 22/버튼 28)도 스펙대로. **아이콘은 js/icons.jsx의 path를 그대로 쓰고 lucide 등으로 대체하지 마**. 임의 근사·반올림 금지."

---

## 7. 아이콘 (모양이 달라지는 주원인)
아이콘은 lucide/heroicons 같은 라이브러리가 **아니라** 커스텀 인라인 SVG 라인아이콘입니다. 라이브러리로 바꾸면 stroke 두께·코너·모양이 달라집니다.

### 렌더 규약 (반드시 동일하게)
```jsx
<svg width={size} height={size} viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="1.7"
     stroke-linecap="round" stroke-linejoin="round">
  {/* 'M'으로 분리된 서브패스들을 각각 <path d="M…"/> 로 */}
</svg>
```
- viewBox `0 0 24 24`, **stroke-width 1.7**, `currentColor`, **round cap/join** 고정.
- 색은 부모 `color`를 상속(레일 비활성 `--tx-lo`, 활성 `--accent-hi`).
- 크기: 레일 18 · 토바 액션 15 · 인라인 13–15 · 작은 칩 11–13.

### 가장 확실한 방법
**`js/icons.jsx`를 그대로 복사**해 `Ic(name, size)` 헬퍼를 쓰세요. 아래는 레일/탭 아이콘의 정확한 path(달라지면 안 되는 것들):

| name | 쓰는 곳 | path `d` |
|---|---|---|
| `planning` | 레일 Plan | `M3 5h18M3 12h12M3 19h8` |
| `api` | 레일 Hub | `M4 7h6M4 12h10M4 17h6M16 5l4 4-4 4M20 9h-6` |
| `data` | 레일 Data | `M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6` |
| `clean` | 레일 Clean | `M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14` |
| `analysis` | 레일 Study + 로고마크 | `M4 19V5M4 19h16M8 15l3-4 3 2 4-6` |
| `chart` | 레일 Chart | `M5 21V9M12 21V3M19 21v-7` |
| `map` | 레일 Map | `M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3zM9 3v15M15 6v15` |
| `report` | 레일 Report | `M7 3h7l5 5v13H7zM14 3v5h5` |
| `search` | 레일 Refs | `M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3` |
| `grid` | 문서·캔버스 | `M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z` |
| `target` | 연구질문 | `M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8zM12 11.5a.5.5 0 100 1 .5.5 0 000-1z` |
| `flag` | 가설 | `M5 21V4M5 4c3-2 6 2 9 0s5 0 5 0v9c-2 1-3 1-5 0s-6-2-9 0` |
| `swot` | SWOT | `M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z` |
| `node` | 마인드맵 | `M12 8a3 3 0 100-6 3 3 0 000 6zM5 22a3 3 0 100-6 3 3 0 000 6zM19 22a3 3 0 100-6 3 3 0 000 6zM12 8v4M12 12l-5 4M12 12l5 4` |
| `bulb` | 인사이트 | `M9 18h6M10 21h4M12 3a6 6 0 00-4 10c.7.7 1 1.4 1 2h6c0-.6.3-1.3 1-2a6 6 0 00-4-10z` |
| `doc` | 문서·브리프 | `M7 3h7l5 5v13H7zM9 12h8M9 16h8M9 8h3` |

> 토바 우측 아이콘: `save`·`import`·`export`·`sliders`(Tweaks)·`sun`(테마). 나머지(`pin`·`users`·`train`·`table`·`layers`·`dollar`·`arrow`·`chevron`·`chevd`·`plus`·`check`·`drag`·`link`·`folder`) 포함 **전체 35개 path는 `js/icons.jsx`에 있으니 파일째 복사가 가장 안전**합니다.

> 동일 규약을 못 맞추겠으면 라이브러리는 **lucide-react**가 가장 근접(같은 24 viewBox·라운드·얇은 stroke). 단 `stroke-width`를 **1.7**로 맞추고, 위 표의 의미에 맞는 아이콘을 골라야 모양이 비슷해집니다.
