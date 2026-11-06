# MechanicsBook 챕터 작성 가이드

MechanicsBook은 ConstructionBooks 서가(`construction.euiyun.com`)의 첫 권인 구조역학 교과서다. 배포 주소는 `https://construction.euiyun.com/mechanics/`. 엔진과 장 구성 규칙은 math-books의 CalculusBook(`MB` 엔진)을 물려받았고, 전역 객체 이름만 `MB` → `CB`로 바꾸고 구조 해석 모듈을 더했다. 문체·구성·그림·시뮬레이터 수준의 본보기는 `chapters/beam-forces.html`이다.

## 기여물의 라이선스

코드는 MIT, 교재 콘텐츠는 CC BY 4.0. 다른 교재의 문장·그림·연습문제를 옮겨 오지 않는다. 역사·수치·기준 조항은 확인된 것만 쓴다(확실하지 않으면 쓰지 않거나 "약", "교육용 가정"으로 표시한다).

## 구조

빌드 없이 열리는 정적 페이지다. `index.html` + `chapters/<slug>.html` + `css/style.css`(색: 콘크리트 회색 바탕, 강철 파랑 `#1d5fa8`, 안전 주황 `#e8590c`) + `js/common.js`(전역 `CB`, 장 목록 `CHAPTERS`). classic script만 쓴다(ES module 금지). 외부 라이브러리는 쓰지 않는다(KaTeX는 빌드가 처리). 3D는 `CB.orbit`(캔버스 2D 투시)으로 그린다.

- 장 목록은 `js/common.js`의 `CHAPTERS`에 있다. 아직 쓰지 않은 장은 `planned: true`로 두면 목차에만 보인다.
- 용어는 `js/glossary-data.js`(시리즈 공통 v1: `ko`, `en`, `abbr`, `def`, `chapters`)에 있다. 본문에서 처음 나오는 용어는 `<span class="term">…</span>`.

## 원칙: 하중 → 그림 → 계산 → 구조물

구조역학은 "하중이 구조물 속을 어떻게 흘러 땅에 닿는가"를 계산하는 학문이다. 이 책은 정역학, 재료역학, 구조해석(부정정·매트릭스)을 한 권으로 잇는다. 모든 개념을 **하중을 끌어 놓고(그림) → 손으로 계산하고(식) → 시뮬레이터로 확인하고 → 실제 구조물(기준 건물 B-10, 기준 교량 T-36)에서 숫자로 만나는** 순서로 쓴다.

- 한국어, 대상은 건축·토목 2학년과 구조역학을 다시 공부하는 신입 엔지니어(미적분·벡터 기초를 안다고 가정). 영어 원어는 `<span class="en">(Bending moment)</span>`처럼 병기.
- 장 첫머리는 `.origin`("이 계산이 없었다면")으로 연다. 각 절은 가능하면 `.problem`(현장의 질문)으로 시작한다.
- 흐름: 문제 → 그림(SVG) → **조작하는 시뮬레이터** → 정의·원리(KaTeX) → **손으로 푸는 예제**(`.callout` 안에 단계별, 단위까지) → 기준 구조물 노트(`.callout.site`) → 쓰이는 곳(`.uses`) → 핵심 정리 → 확인 퀴즈(6–8문항).
- 교과서다운 엄밀함: 정의·원리·정리는 `<div class="callout def"><strong>원리 4.2 (하중–전단력–휨모멘트 관계)</strong> …</div>`처럼 **장 번호.순번**을 붙인다. `.callout.deep`은 "심화 · " 접두어가 붙는 심화 내용(유도·예외·고급 주제)에만 쓴다. 예제는 `예제 4.1`, 그림은 `그림 4-1.`.
- 장마다 **시뮬레이터 6–8개, 그림 6개 이상, 퀴즈 6–8문항.** 시뮬레이터는 장식이 아니라 **계산하는 모델**이다. 숫자를 바꾸거나 하중을 끌면 그림과 값이 바로 반응해야 하고, 입력을 끝까지 움직여도 NaN·음수 길이·0으로 나누기가 나오면 안 된다. 쓰는 식은 본문이나 `sim-note`에 적는다.
- 해석 결과는 `CB.frame`/`CB.beam`/`CB.truss`로 계산한다(장 고유의 모델 — 케이블 형상, 모어 원, 좌굴 곡선, 모멘트 분배 반복 등 — 은 페이지 스크립트에 둔다). 같은 공식을 장마다 다시 구현하지 않는다.
- 색은 CSS 변수와 `CB.palette()`만. 라이트/다크 모두 확인. 폭 360px에서 가로 스크롤 금지. SVG는 `viewBox`만 주고 width/height 생략, viewBox 폭은 900 이하.
- 시뮬레이터 `id`는 `sim-<장 접두사>-<이름>`, 캔버스·입력 등 요소 id도 같은 접두사를 붙인다(`bf-cv-cut`, `bf-a`). 이 장 전용 CSS 클래스도 접두사를 붙인다(`.bf-msg`). 절 `id`는 의미 있는 영어 슬러그로 짓고 바꾸지 않는다.

## 단위·부호·색 규약 (책 전체 공통)

**단위.** 힘 kN, 길이 m(단면 치수는 mm), 모멘트 kN·m, 분포 하중 kN/m, 면 하중 kN/m², 응력 MPa(= N/mm²). `CB.frame`의 E는 kN/m²(= kPa)로 넣는다: 강재 210 GPa = `2.1e8`, 철근 200 GPa = `2.0e8`, 콘크리트 fck 30 MPa의 Ec ≈ 27,500 MPa = `2.75e7`. 값 표시는 `CB.num(v, d)`(진짜 빼기표 −) 또는 `CB.sig(v)`.

**전역 좌표.** x 오른쪽, y 위쪽, 모멘트·회전은 반시계 방향 +. 부재 국부 좌표 x는 i단 → j단, y는 x를 반시계로 90° 돌린 방향.

**단면력(내력).** 축력 N은 인장 +. 전단력 V와 휨모멘트 M은 보의 부호 규약을 쓴다: 부재를 왼쪽(i단)에서 바라볼 때 잘린 면의 왼쪽 조각에서 V가 아래 방향이면 +, M은 아래로 볼록하게 휘게 하면(새깅, 아래 섬유 인장) +. 그림으로는 "왼쪽 조각의 오른쪽 면에서 V는 ↓, M은 ↺".

**단면력도를 그리는 방향.**
- 보 아래에 따로 그리는 SFD·BMD 그래프(`CB.chart`)는 **양(+)을 위로** 그린다(그래프 관습). 축 이름에 부호를 적는다.
- 구조물 위에 겹쳐 그리는 휨모멘트도(`CB.drawFrame`의 `diagram: "M"`)는 **인장측**에 그린다(라멘의 관습, 새깅이면 보 아래쪽). 두 방식을 4장에서 한 번 설명하고 장마다 그림 설명에 밝힌다.

**색.**

| 대상 | 색 | 사용 |
|---|---|---|
| 하중 | `accent2`(주황) | 화살표·분포 하중 |
| 반력 | `ok`(초록) | 지점 반력 화살표 |
| 인장 | `tension`(파랑, `--tension`) | 트러스 부재, 응력 분포 |
| 압축 | `compression`(빨강, `--compression`) | 트러스 부재, 응력 분포 |
| 휨모멘트 | `accent`(파랑) | BMD |
| 전단력 | `accent2`(주황) | SFD |
| 변형 형상 | `accent` 점선 | 처짐 곡선 |

## 기준 구조물 (가상, 교육용)

모든 장이 같은 두 구조물을 예로 든다. 실제 건물·교량이 아니다. 장마다 `<div class="callout site"><strong>제목</strong>…</div>`로 "기준 구조물 노트"를 1–3개 둔다(접두어는 CSS가 붙인다). 계산 결과가 이 표와 어긋나면 표에 맞추거나 본문에 이유를 쓴다.

**기준 건물 B-10** — 10층 철근콘크리트 업무시설

| 항목 | 값(교육용 가정) |
|---|---|
| 규모 | 지상 10층·지하 2층, 1층 층고 5.0 m, 2–10층 4.0 m → 지상 높이 41.0 m |
| 평면 | X 방향 4경간 × 8.0 m = 32 m, Y 방향 3경간 × 8.0 m = 24 m. 가운데 두 경간 × 한 경간(16 m × 8 m)에 코어(엘리베이터·계단) |
| 구조 | RC 모멘트 골조 + 코어 전단벽, 2방향 슬래브 두께 210 mm |
| 부재 | 큰보 G1 400 × 700 mm(경간 8.0 m), 내부 기둥 C1 1층 800 × 800 mm |
| 재료 | 콘크리트 fck = 30 MPa(Ec ≈ 27,500 MPa), 철근 SD500(fy = 500 MPa, Es = 200,000 MPa), 철근콘크리트 단위중량 24 kN/m³ |
| 바닥 하중 | 고정하중 D ≈ 6.5 kN/m²(슬래브 자중 5.04 + 마감·천장·설비 1.5), 활하중 L = 2.5 kN/m²(사무실) |
| 큰보 G1 하중 | 기여 폭 8.0 m로 단순화: w<sub>D</sub> ≈ 56.7 kN/m(바닥 52.0 + 보 자중 4.7), w<sub>L</sub> = 20 kN/m, 계수 하중 w<sub>u</sub> = 1.2D + 1.6L ≈ 100 kN/m, 사용 하중 ≈ 76.7 kN/m |
| G1 단면 | I = 0.4 × 0.7³/12 = 1.143 × 10⁻² m⁴(슬래브 무시), EI ≈ 3.14 × 10⁵ kN·m² |
| 기둥 C1 | 기여 면적 64 m², 1층 계수 축력 약 9,000 kN(바닥 11.8 kN/m² × 640 m² + 보·기둥 자중) |
| 수평 하중 | Y 방향 골조 한 줄(3경간)에 층마다 풍하중 약 50 kN(교육용 가정) |

**기준 교량 T-36** — 36 m 강 트러스 보도교

| 항목 | 값(교육용 가정) |
|---|---|
| 형식 | 단경간 프랫 트러스, 하로교(바닥판이 하현에), 트러스 2면 |
| 치수 | 지간 36 m = 6 패널 × 6.0 m, 높이 4.5 m(지간의 1/8), 폭 3.0 m |
| 재료 | 강재 SM355(항복강도 355 MPa), E = 210,000 MPa, 열팽창계수 1.2 × 10⁻⁵ /°C |
| 하중 | 트러스 한 면에 고정하중 4 kN/m + 군중 하중 4 kN/m²의 절반 폭(1.5 m) 6 kN/m = 10 kN/m → 하현 패널 절점마다 60 kN(사용 하중) |
| 대표 부재력 | 절점 이름: 하현 A–G(x = 0, 6, …, 36 m), 상현 H–L(x = 6–30 m). 반력 150 kN. 하현 A–B·B–C +200, C–D·D–E +320 kN(인장). 상현 H–I −320, I–J·J–K −360 kN(압축). 단부 경사재 A–H −250 kN. 사재 H–C +150, I–D +50 kN(인장). 수직재 B–H +60(인장), C–I −30(압축), D–J 0. 사재는 위에서 아래로 가운데를 향한다(프랫). |
| 부재 단면 | 현재·단부 경사재 H-200×200×8×12(필릿 무시, A = 6,208 mm², 약축 회전반경 약 50.8 mm), 사재·수직재 H-150×150×7×10(A = 3,910 mm²). 교육용 가정(7·12·13·14장) |
| 관리 차량 | 축하중 40 kN + 40 kN, 축간 3.0 m(교육용 가정, 6장 영향선) |

**기준 인용.** 국내 기준은 이름을 정확히 쓰고 세부 조항 번호는 확실할 때만 쓴다: 건축구조기준(KDS 41), 건축물 설계하중(KDS 41 12 00), 콘크리트구조 설계기준(KDS 14 20), 강구조 설계기준(KDS 14 31). 하중 조합은 1.4D, 1.2D + 1.6L처럼 널리 쓰는 형태만 예로 든다. 기준값은 "현행 기준을 확인할 것"을 덧붙이고, 이 책의 계산이 설계용이 아님을 밝힌다.

## 장별 설계

| 장 | slug | 접두사 | | 장 | slug | 접두사 |
|---|---|---|---|---|---|---|
| 01 구조물과 하중 | loads | `ld` | | 10 응력 변환과 조합 응력 | transformation | `tf` |
| 02 힘의 평형과 지점 | equilibrium | `eq` | | 11 보의 처짐 | deflection | `df` |
| 03 트러스 | truss | `tr` | | 12 에너지 방법 | energy | `en` |
| 04 보의 전단력과 휨모멘트 | beam-forces | `bf` | | 13 기둥과 좌굴 | buckling | `bk` |
| 05 라멘·아치·케이블 | frames-arches | `fa` | | 14 부정정 구조와 응력법 | indeterminate | `fx` |
| 06 영향선과 이동 하중 | influence | `il` | | 15 처짐각법과 모멘트 분배법 | slope-deflection | `sd` |
| 07 응력과 변형률 | stress-strain | `ss` | | 16 매트릭스 구조해석 | matrix | `mx` |
| 08 단면의 성질 | section | `sc` | | 17 용어집 & 종합 퀴즈 | glossary | `gl` |
| 09 휨응력과 전단응력 | bending | `bd` | | | | |

각 장은 아래 절을 모두 다룬다(순서·제목은 다듬어도 된다). 시뮬레이터 아이디어는 최소 목록이다.

**01 구조물과 하중** — 구조물이 하는 일: 하중을 땅까지 옮기는 길(하중 경로: 슬래브 → 보 → 기둥 → 기초) / 하중의 종류(고정·활·풍·지진·적설·온도·지점 침하)와 크기 감각 / 집중·분포·면 하중과 단위(kN, kN/m, kN/m²) / 분포 하중의 합력과 작용점(삼각형·사다리꼴) / 기여 면적과 기여 폭 / 하중 조합과 계수 하중(1.4D, 1.2D + 1.6L) / 모델링: 실제 구조물을 선과 점으로(이상화, 지점·절점) / 기준 건물 B-10과 보도교 T-36 소개, 이 책의 지도. 시뮬: B-10 3D(`CB.orbit`)에서 층·기둥을 골라 하중 경로 따라가기, 분포 하중 모양을 바꾸며 합력 위치 찾기, 기여 면적 계산기(기둥 위치 클릭), 하중 조합 계산기(어느 조합이 지배하나), 단위 감각(사람·차·눈·물의 무게 → kN/m²), 이상화 퀴즈형 시뮬(사진 대신 SVG 장면 → 모델 선택).
**02 힘의 평형과 지점** — 힘 벡터와 분해·합성 / 모멘트와 우력, 바리뇽 정리 / 평형 방정식 ΣFx = ΣFy = ΣM = 0 / 자유물체도 그리는 법 / 지점의 종류(롤러·핀·고정, 스프링)와 반력 / 정정·부정정·불안정 판별(반력 수, 기하학적 불안정) / 평형의 응용: 타워크레인 균형추, 옹벽 전도. 시뮬: 힘 분해(벡터 끌기), 렌치 모멘트(팔 길이·각도), 반력 계산 보(하중 끌기 → 반력 실시간), 자유물체도 완성 게임(빠진 힘 고르기), 지점 바꾸기 → 정정/부정정/불안정 판정(`CB.frame`의 `ok`), 크레인 균형추와 전도 안전율.
**03 트러스** — 트러스의 이상화(핀 절점, 절점 하중, 2력 부재) / 왜 삼각형인가(안정) / 정정 판별 m + r = 2j와 그 한계 / 절점법(한 절점씩) / 단면법(한 번에 세 부재) / 영부재 찾기 / 트러스 형식(프랫·하우·워런·K)과 사재 방향에 따른 인장·압축 / 높이와 부재력의 관계 / T-36 해석과 부재 선택 맛보기. 시뮬: 절점법 단계 실행(절점 클릭 → 힘 다각형), 단면법 커터(자르는 선 끌기 → 세 부재력), 트러스 형식 비교(인장 파랑/압축 빨강, `axialColors`), 영부재 찾기 게임, 높이 슬라이더 → 현재력·사재력·대략 강재량, 불안정 트러스 만들기(부재 지우기).
**04 보의 전단력과 휨모멘트** — 본보기 장(이미 씀).
**05 라멘·아치·케이블** — 정정 라멘(L형·문형, 3힌지 라멘)의 반력과 단면력도(인장측) / 모서리(절점)에서 휨모멘트가 이어지는 방식 / 3힌지 아치: 수평 추력 H = M₀/f / 압력선(퓨니큘러): 하중에 맞는 형태에서는 휨이 사라진다 / 아치 축선과 압력선의 편심 → 휨모멘트 / 케이블: 집중 하중 아래 다각형, 등분포 아래 포물선, 처짐비와 장력 T = wL²/8f / 현수교·사장교 맛보기 / 거꾸로 매단 모형(가우디). 시뮬: 문형 라멘 하중·힌지 위치 → BMD, 3힌지 아치 높이 f → 추력, 하중 여러 개 → 케이블 형상(끄는 하중), 아치 축선 vs 압력선 편심, 처짐비-장력 곡선, 거꾸로 매단 체인 → 뒤집으면 아치.
**06 영향선과 이동 하중** — 이동 하중과 영향선의 정의 / 단순보 반력·전단력·휨모멘트 영향선 / 뮐러-브레슬라우 원리(해제하고 단위 변위) / 게르버보·내민보 영향선 / 트러스 부재력 영향선(T-36) / 집중 하중 열과 등분포 하중의 최대 효과 / 절대 최대 휨모멘트(합력과 축의 중앙) / 연속보 영향선 맛보기(`CB.beam`으로 단위 하중을 옮겨 계산). 시뮬: 단위 하중 끌기 → 영향선 그려짐, 뮐러-브레슬라우 변형 그림, T-36 위 관리 차량 주행 → 부재력 시간 이력, 등분포 하중 배치로 최대 만들기(칠할 구간 고르기), 절대 최대 모멘트 찾기, 연속보 패턴 재하.
**07 응력과 변형률** — 응력은 힘의 밀도(축응력·전단응력·지압) / 변형률(공칭) / 훅의 법칙과 탄성계수, 포아송비 / 응력–변형률 곡선: 강재(항복·변형 경화·네킹), 콘크리트(압축 포물선, εcu ≈ 0.0033), 연성과 취성 / 축하중 부재의 변형 δ = PL/EA, 단계 봉 / 부정정 축부재: 적합 조건, RC 기둥의 철근·콘크리트 하중 분담(n = Es/Ec) / 열변형과 열응력 / 허용응력과 안전율 개념, 응력 집중과 생브낭 원리 맛보기. 시뮬: 인장 시험기(곡선 위 점이 움직이며 시편 변형), 콘크리트 압축 곡선(fck별), 포아송 효과 블록, 단계 봉 변위 계산, 양단 고정 레일 온도 → 열응력·좌굴 경고, RC 기둥 하중 분담.
**08 단면의 성질** — 도심과 단면 1차 모멘트 / 단면 2차 모멘트의 뜻(휨 강성) / 평행축 정리 / 단면계수와 회전반경 / 같은 면적에서 모양이 바꾸는 강성: 직사각형·H형강·상자·원관 / 합성 단면과 구멍 / 상승 모멘트와 주축(모어 원 맛보기) / 형강표 읽기(H-400×200×8×13 등, 필릿 무시를 밝힌다). 시뮬: 직사각형 조각을 끌어 단면 만들기 → 도심·I 실시간(`CB.section.rects`, `CB.drawSection`), 평행축 정리 시각화, 같은 면적 단면 강성 순위, 높이 vs 폭(I ∝ bh³), 주축 회전, H형강 치수 슬라이더 → 무게당 강성.
**09 휨응력과 전단응력** — 순수 휨과 평면 유지 가정, 곡률과 변형률 / 휨 공식 σ = My/I, 중립축 / 단면계수로 설계: σmax = M/S / 전단응력 τ = VQ/(Ib), 직사각형 1.5V/A / H형강 웨브의 전단, 전단 흐름 q = VQ/I(용접·볼트 간격) / 합성 단면과 환산 단면(강–콘크리트, RC 균열 단면 맛보기) / 탄성에서 소성으로: 항복 모멘트와 소성 모멘트, 형상 계수 / B-10 큰보 G1의 응력 검토(교육용). 시뮬: 휘는 보와 곡률 반경, 단면 응력 분포(M 슬라이더, 인장 파랑/압축 빨강), 전단응력 분포(단면 형상별), 전단 흐름과 볼트 간격, 환산 단면 n 바꾸기, 탄성→소성 진행(항복 깊이).
**10 응력 변환과 조합 응력** — 평면 응력 상태 / 경사면의 응력, 변환식 / 주응력과 최대 전단응력 / 모어 원 그리고 읽기 / 축력 + 휨: σ = P/A ± My/I / 편심 하중과 단면의 핵(kern), 기초·기둥의 인장 없는 범위 / 원형 축의 비틀림 τ = Tr/J, 박벽 단면 맛보기 / 보 안의 주응력선과 콘크리트 사인장 균열 / 항복 조건(트레스카·폰 미제스) 맛보기. 시뮬: 응력 요소 회전(각도 끌기 → 응력 변환), 모어 원(점 끌기), 편심 하중 → 응력 분포·인장 발생, 단면 핵 그리기, 비틀림 축, 보의 주응력 궤적.
**11 보의 처짐** — 처짐은 왜 중요한가(사용성, 균열, 진동) / 탄성 곡선 방정식 EI v″ = M / 이중 적분법과 경계 조건 / 모멘트-면적법 / 공액보법 / 중첩법과 처짐 공식표 / 처짐 제한(바닥 L/360 등, 기준 확인)과 EI·L의 영향(L⁴) / B-10 큰보의 처짐(균열 전 단면, 교육용). 시뮬: 처짐 곡선 실시간(하중·지점·EI, `CB.beam`), 이중 적분 단계(M → θ → v), 모멘트-면적법 넓이 끌기, 중첩 조립기, 처짐 제한 검토기, 경간 2배 → 처짐 16배 체감.
**12 에너지 방법** — 외력이 한 일과 변형 에너지(축·휨·전단) / 일-에너지로 처짐 구하기 / 가상일의 원리, 단위하중법(트러스·보·라멘) / 카스틸리아노 정리 / 맥스웰-베티 상반 정리 / 충격 하중과 동적 배율 1 + √(1 + 2h/δst) / 에너지로 보는 구조 효율. 시뮬: 용수철·봉 에너지 막대, 단위하중법 트러스 처짐(부재별 기여 막대 그래프), 가상일 적분(실제 M × 가상 m), 상반 정리 확인(두 점 바꾸기), 낙하 높이 → 동적 배율, 카스틸리아노 기울기.
**13 기둥과 좌굴** — 안정과 불안정(공의 비유, 강체 막대-스프링 모형) / 오일러 좌굴 하중 Pcr = π²EI/(KL)² / 지지 조건과 유효 좌굴 길이 K / 세장비와 좌굴 응력 / 비탄성 좌굴(접선 계수, 존슨 포물선) / 초기 휨과 P–δ 증폭 1/(1 − P/Pcr) / 가새와 횡지지 / 국부 좌굴·횡비틀림 좌굴 맛보기 / T-36 상현재·B-10 기둥 검토(교육용). 시뮬: 막대-스프링 안정 그래프, 길이·단면 → Pcr, 지지 조건 4가지 좌굴 모드 애니메이션, 세장비–응력 곡선(탄성/비탄성), 초기 결함 증폭, 가새 위치 바꾸기.
**14 부정정 구조와 응력법** — 부정정 차수 / 여유력과 적합 조건 / 응력법(유연도법) 단계 / 1단 고정보·2경간 연속보 / 지점 침하와 온도의 영향(부정정에서만 응력이 생긴다) / 강성 비에 따른 힘의 분배 / 여유도: 부재 하나가 끊어질 때. 시뮬: 여유력 고르기 → 적합 조건 그림, 2경간 연속보 하중 이동, 지점 침하 → 모멘트(`settle`), 강성 비 슬라이더, 부재 제거 → 재분배 또는 붕괴, 정정 vs 부정정 처짐 비교.
**15 처짐각법과 모멘트 분배법** — 처짐각 식(M = 2EI/L (2θa + θb − 3ψ) + FEM) / 고정단 모멘트 표 / 절점 평형으로 풀기 / 횡이동이 있는 골조(층 전단 평형) / 모멘트 분배법(크로스법): 강성, 분배율, 전달률 1/2 / 반복과 수렴 / B-10 골조의 연직 하중 해석(교육용). 시뮬: 크로스법 단계 실행 표(분배 → 전달 → 반복, `CB.frame` 결과와 비교), 처짐각법 연립 방정식 풀이, 횡이동 골조 수평 하중, 분배율 감각, 수렴 그래프.
**16 매트릭스 구조해석** — 스프링 하나에서 강성 행렬로 / 트러스 부재 강성 행렬과 좌표 변환 / 보·골조 부재 강성 행렬 / 조립(직접 강성법)과 경계 조건 / 등가 절점 하중 / 해석 프로그램의 입력·출력 읽기 / 모델링 실수(불안정, 단위, 지점)와 검증법(평형 검사, 손계산 대조) / B-10 골조 한 줄의 수평 하중 해석. 시뮬: 스프링 직렬·병렬 강성 행렬, 트러스 강성 행렬 조립 애니메이션(행렬 칸이 채워짐), 경계 조건 적용과 특이 행렬, 직접 모델링 에디터(절점·부재·지점·하중 추가 → `CB.frame`), B-10 골조 층 변위, 평형 검사.
**17 용어집 & 종합 퀴즈** — 공식 한눈표(단순보·캔틸레버 반력·모멘트·처짐, 단면 성질, 좌굴, 처짐각 식), 부호 규약 정리, 용어 검색, 전 범위 종합 퀴즈(장마다 1–2문항).

## 컴포넌트

MathBook·CalculusBook의 컴포넌트를 그대로 쓴다(`.sim`, `.sim-body.side`, `.sim-view`, `.sim-controls`, `.ctrl`, `.seg`, `.btn-row`, `.sim-readout > .stat`, `.sim-note`, `.callout(.tip .warn .deep)`, `.formula`, `.where`, `.table-wrap`, `.quiz-q`, `.origin`, `.problem`, `.uses`, `.keypoints`). 이 책에서 더한 것:

- `.callout.def` — 번호 붙은 정의·원리·정리(접두어 없음). `.callout.deep`은 심화.
- `.callout.site` — 기준 구조물 노트(B-10·T-36). 접두어 "기준 구조물 노트 · "는 CSS가 붙인다.
- 하중·반력·인장·압축 범례: `<span class="key load">하중</span> <span class="key reaction">반력</span> <span class="key tension">인장</span> <span class="key compression">압축</span> <span class="key moment">휨모멘트</span> <span class="key shear">전단력</span> <span class="key deformed">변형</span>`.

```html
<div class="sim" id="sim-bf-cut">
  <div class="sim-head"><span class="sim-tag">SIMULATOR</span><h3>제목</h3></div>
  <div class="sim-body side">
    <div class="sim-view"><canvas id="bf-cv-cut"></canvas></div>
    <div class="sim-controls">
      <label class="ctrl"><span>절단 위치 x <output id="bf-x-out"></output></span><input type="range" id="bf-x" min="0" max="8" step="0.05" value="3"></label>
      <div class="ctrl"><span>하중</span><div class="seg" id="bf-mode"><button data-value="udl" class="on">등분포</button><button data-value="pt">집중</button></div></div>
    </div>
  </div>
  <div class="sim-readout"><div class="stat"><span class="k">V</span><span class="v" id="bf-o-v">—</span></div></div>
  <div class="sim-note">해볼 것: ... · 모델: ...</div>
</div>
```

## JS 헬퍼 (`js/common.js`, 전역 `CB`)

화면·컨트롤·차트·좌표 평면은 MathBook과 같다(`../../../math-books/foundations/CONTRIBUTING.md`의 `MB` API에서 이름만 `CB`): `CB.canvas`, `CB.chart`, `CB.loop`, `CB.throttle`, `CB.range`, `CB.steps`, `CB.seg`, `CB.check`, `CB.stat`, `CB.playButton`, `CB.palette()`(+ `tension`, `compression`), `CB.color`, `CB.onTheme`, `CB.isDark`, `CB.clamp/lerp/map/smooth`, `CB.rng`, `CB.fmt`, `CB.mat`, `CB.rk4`, `CB.normPdf/normCdf`, `CB.colormap`, `CB.rgb`, `CB.plane`(끄는 점이 있는 좌표 평면, `draw(P, api)`의 `P.X/P.Y/P.line/P.arrow/P.poly/P.text/P.curve…`). 소리·FFT·이미지 도구는 없다. `CB.tex`는 쓰지 않는다.

구조 해석(이 책에서 더함):

```js
// 2차원 골조·트러스(직접 강성법). kN·m 단위, E는 kN/m².
const r = CB.frame({
  nodes: [[0, 0], [8, 0]],
  members: [{ i: 0, j: 1, E: 2.75e7, A: 0.28, I: 1.143e-2, hinge: [false, false] /* 끝 모멘트 해제 */ }],   // truss: true면 축력만
  supports: { 0: "pin", 1: "roller" },        // pin roller rollerV fixed slider guide 또는 [ux, uy, rz]
  springs: { 1: [0, 5000, 0] }, loads: [{ node: 1, fx: 0, fy: -50, m: 0 }],
  memberLoads: [{ member: 0, w: [0, -10] }, { member: 0, w: [0, 0], w2: [0, -20], from: 2, to: 6 }, { member: 0, P: [0, -40], a: 3 }, { member: 0, M: 15, a: 2 }],
  settlements: [{ node: 1, dof: 1, value: -0.01 }],
});
r.ok; r.reason;            // "unstable"이면 불안정(기구)
r.d[n];                    // [ux, uy, rz]
r.reactions[n];            // [Rx, Ry, Mz] 또는 null
r.ends[m];                 // { N1, V1, M1, N2, V2, M2 } 단면력(위 부호 규약)
r.sample(m, 60);           // [{ s, x, y, N, V, M, ux, uy }]
r.maxAbs("M");             // "M" | "V" | "N" | "disp"

// 수평 보 편의 함수: 하중은 아래 방향 +, 집중 모멘트는 반시계 +.
const b = CB.beam({ L: 8, EI: 3.14e5, supports: [{ x: 0, type: "pin" }, { x: 8, type: "roller" }], hinges: [], settle: [],
                    loads: [{ type: "udl", w: 100, a: 0, b: 8 }, { type: "lin", w1: 0, w2: 30, a: 0, b: 8 }, { type: "point", P: 50, a: 3 }, { type: "moment", M: 20, a: 5 }] });
b.reactions;               // [{ x, type, R(위 +), H, M(반시계 +) }]
b.at(x, -1 | 1);           // { V, M, v, theta } (불연속점에서 왼쪽/오른쪽 극한)
b.sample(200);             // [{ x, V, M, v }] — 차트용(불연속점은 두 번)
b.extremes();              // { Mmax, Mmin, Vabs, vmin, vmax } 각각 { x, v }

// 트러스 편의 함수: r.N[m] = 부재력(인장 +)
const t = CB.truss({ nodes, bars: [[0, 1], ...], supports: { 0: "pin", 6: "roller" }, loads: [{ node: 3, fy: -60 }], EA: 1e6 });

// 단면 성질(mm 권장): rects([{x, y, b, h, n}]) | rect(b, h) | H(h, b, tw, tf) | tee(b, tf, h, tw) | box(B, H, t) | channel | circle(d) | pipe(D, t)
const s = CB.section.H(400, 200, 8, 13);   // { A, cx, cy, Ix, Iy, I1, I2, ytop, ybot, Stop, Sbot, Sx, rx, ry, Zx, ypna, ... }
CB.section.shear(s, y);                     // { Q, b } → τ = VQ/(I b)

// 그리기: CB.plane의 draw(P) 안에서
CB.drawFrame(P, r, { diagram: "M", deformed: "auto", reactions: true, axialColors: false, loads: true, labels: true, nodeLabels: false, supportSide: { 3: "up" } });
CB.drawSection(ctx, s, { x, y, w, h }, { centroid: true, pna: false });   // → { X, Y, s }
// 3D: CB.orbit("#cv", { yaw, pitch, dist, target: [x, y, z], spin, draw(V) { V.line3(a, b, o); V.poly3(pts, o); V.text3(s, a, o); V.depth(pts); } })
CB.num(-12.34, 1);  // "−12.3"
CB.sig(12345.6);    // "12,346"
```

`CB.frame`은 해석적으로 정확한 등가 절점 하중을 쓰므로 절점 사이 하중도 정확하다. 처짐 곡선은 M/EI를 수치 적분한다(샘플 60개에서 상대 오차 약 10⁻⁴). 불안정 판별은 강성 행렬의 피벗으로 한다. 엔진을 고쳤으면 손계산 대조 검사를 다시 돌린다(`node tools/engine.test.cjs`, `npm test`에 포함).

## head 템플릿

```html
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<title>보의 전단력과 휨모멘트 · MechanicsBook</title>
<meta name="description" content="한 문장 설명(120자 안팎)">
<link rel="stylesheet" href="../css/style.css">
<script src="../js/common.js"></script>
<style> /* 이 장 전용 스타일(최소한, 접두사 붙이기) */ </style>
<link rel="stylesheet" href="../../shared/css/book-shell.css">
<script defer src="../../shared/js/book-shell.js" data-book="mechanics"></script>
</head>
<body data-chapter="beam-forces">
<main class="chapter">
  <header class="chapter-hero">
    <div class="eyebrow">Chapter 04</div>
    <h1 data-no-glossary>보의 전단력과 휨모멘트</h1>
    <p class="lead">...</p>
    <ul class="objectives"><li>...</li></ul>
    <div class="origin"><div class="o-head"><small>이 계산이 없었다면</small><b>...</b></div><div class="o-body"><p>...</p><div class="o-chain"><span>…</span><i>→</i><span class="tool">…</span><i>→</i><span>…</span></div></div></div>
  </header>
  <section id="..."><h2>...</h2> ... </section>
  <section id="uses"><h2>이 계산이 쓰이는 곳</h2><div class="uses">...</div></section>
  <section class="keypoints" id="summary"><h2>핵심 정리</h2><ol><li>...</li></ol></section>
  <section class="quiz-sec" id="quiz"><h2>확인 퀴즈</h2><div class="quiz"> ... </div></section>
</main>
<script> /* 시뮬레이터마다 (function(){ ... })(); */ </script>
</body>
</html>
```

소스에는 `<title>`과 `<meta name="description">`(한 줄)만 쓴다. canonical·Open Graph 태그는 `tools/build.mjs`가 `mechanics/book.json`의 `meta`로 생성하고, 수식은 빌드가 `tools/katex.mjs`로 미리 렌더링한다. 그래서 다음을 지킨다. 어기면 `npm test`나 빌드가 실패한다.

- canonical·`og:` 태그, KaTeX `<link>`/`<script>`를 소스에 넣지 않는다.
- **스크립트가 수식을 DOM에 넣지 않는다.** 인라인 `<script>` 안에 `\(`·`\[`·`$$`가 있으면 검사가 실패한다. 시뮬레이터의 식 출력은 HTML(`<sup>`, `<sub>`, `·`, `−`, `√`, `∫`)로 만든다.
- 수식 안에서 `<` 바로 뒤에 글자가 오면 브라우저가 태그로 읽는다. `a<b` 대신 `a \lt b` 또는 `a < b`(공백).
- 수식 안의 HTML 엔티티는 `&amp; &lt; &gt; &nbsp; &middot; &times; &minus;`와 숫자 엔티티만 쓴다.

## 검사

```bash
npm test                                   # 메타데이터·링크·수식(KaTeX 문법) 검사
npm run build                              # .book-dist/ 생성(수식 미리 렌더링)
node tools/browser-check.cjs mechanics     # (Playwright) 콘솔 오류·가로 넘침 검사
node tools/engine.test.cjs                 # 해석 엔진 손계산 대조
```
