# ConstructionBooks · 건설 교과서 서가

하중을 끌어 놓고 부재를 바꿔 보며 배우는 한국어 인터랙티브 건설·건축 교과서를 한 저장소에서 관리합니다. 홈은 SemiBooks·MathBooks의 책장·검색·분야 필터·실습·읽는 순서 구성을 따릅니다.

서비스 주소(예정): **https://construction.euiyun.com/** · 책 한 권의 홈은 **`/{slug}/`**, 각 장은 **`/{slug}/chapters/{chapter}.html`**입니다.

## 수록 책

| 경로 | 책 | 상태 |
|---|---|---|
| `/mechanics/` | MechanicsBook · 구조역학 | 공개, 4부 16장 + 용어집 |
| `/materials/` | MaterialsBook · 건설재료 | 공개, 4부 16장 + 용어집 |
| `/geotech/` | GeotechBook · 지반공학 | 공개, 4부 16장 + 용어집 |
| `/structure/` | StructureBook · 건축구조 | 공개, 4부 16장 + 용어집 |
| `/concrete/` | ConcreteBook · 철근콘크리트 구조 | 공개, 4부 16장 + 용어집 |
| `/civil/` | CivilBook · 교량·터널·도로 | 공개, 4부 16장 + 용어집 |
| `/site/` | SiteBook · 시공과 건설관리 | 공개, 4부 16장 + 용어집 |
| `/bim/` | BIMBook · BIM·디지털 건설 | 공개, 4부 16장 + 용어집 |

서가의 여덟 권이 모두 공개되었습니다. 새 책을 준비할 때는 `roadmap.json`에 적고, 공개할 때 그 항목을 지우고 `tools/sync-catalog.py`의 `LOCAL_BOOKS`에 옮깁니다.

MechanicsBook(`mechanics/`)은 math-books의 CalculusBook 엔진(`MB`)을 물려받아 전역 객체 이름을 `CB`로 바꾸고 구조 해석 모듈을 더했습니다. 2차원 골조·트러스 강성법 해석기(`CB.frame`, `CB.truss`, `CB.beam`), 단면 성질(`CB.section`), 구조물·하중·단면력도 그리기(`CB.drawFrame`, `CB.beamDiagrams`, `CB.drawSection`), 끌어서 돌리는 3D 보기(`CB.orbit`)입니다. 다음 책들(건축구조·철근콘크리트·교량)도 이 엔진을 복사해 씁니다. MaterialsBook(`materials/`)은 같은 엔진에 재료 모델(`CB.conc` 배합·강도·내구성, `CB.agg` 골재, `CB.steel` 강재·철근, `CB.asph` 아스팔트, `CB.wall` 열관류)을 더했고, 기준 배합 **M-30**과 기준 포장 **P-13**을 더해 씁니다. 집필 규칙은 [materials/CONTRIBUTING.md](materials/CONTRIBUTING.md)를 참고하세요. GeotechBook(`geotech/`)은 재료 모델 대신 지반 모델(`CB.soil`: 상 관계, 응력 단면, 부시네스크 지중 응력, 압밀·연직 배수, 토압, 지지력, 사면, 액상화)과 기준 지반 **G-10**을 더했습니다([geotech/CONTRIBUTING.md](geotech/CONTRIBUTING.md)). StructureBook(`structure/`)은 구조 동역학·횡하중 모델(`CB.dyn`: 1자유도·뉴마크·응답 스펙트럼·모드 해석·설계 스펙트럼·등가 정적 해석·TMD, `CB.wind`)을 더했습니다([structure/CONTRIBUTING.md](structure/CONTRIBUTING.md)). ConcreteBook(`concrete/`)은 MaterialsBook 엔진에 RC 설계 함수(`CB.rc`: 응력 블록·φ·변형률 적합 휨강도·전단·정착·균열 단면·P–M 상관도·모멘트 확대)를 더했습니다([concrete/CONTRIBUTING.md](concrete/CONTRIBUTING.md)). CivilBook(`civil/`)은 지반 엔진에 토목 모델(`CB.civ`)을, SiteBook(`site/`)은 공사 관리 모델(`CB.pm`: CPM·PERT·몬테카를로·EVM·작업량)과 기준 공사 **P-B10**을 더했습니다. 마지막 권 BIMBook(`bim/`)은 SiteBook 엔진에 BIM·디지털 건설 모델(`CB.bim`: 기준 모델 B-10 BIM 요소 360개 생성, 상자 간섭 검토, 물량 산출, 4 × 4 변환 행렬, 지리 참조, 메시 부피, 강체 정합, 최소 제곱·RANSAC 평면, 칼만 필터, IFC STEP 해석기)을 더했습니다([bim/CONTRIBUTING.md](bim/CONTRIBUTING.md)). 모든 장은 가상의 기준 구조물 두 개, 10층 RC 업무시설 **B-10**과 36 m 강 트러스 보도교 **T-36**의 숫자를 함께 씁니다. 집필 규칙·부호 규약·기준 구조물 표·엔진 API는 [mechanics/CONTRIBUTING.md](mechanics/CONTRIBUTING.md)를 참고하세요.

## 구성

```text
index.html                             서가 홈: 책장·분야 필터·검색, 대표 실험, 읽는 순서
shelf.css                              서가 홈 스타일(공통 파일, 직접 수정하지 않음)
catalog.js                            생성된 책 목록(직접 수정하지 않음)
catalog.json                          생성된 책 목록과 서가 지도(books.euiyun.com이 읽음, 직접 수정하지 않음)
book.json                             서가 메타데이터, 각 책의 book.json 목록
roadmap.json                          준비 중인 책(지금은 비어 있음)
shared/js/shelf.js                    서가 홈의 책장·필터·지도·실험 덱(공통 파일, 직접 수정하지 않음)
shared/js/covers.js                   SVG 책 표지(건설 서가 8권)
shared/css/cover-animations.css       표지 애니메이션(동작 줄이기 지원)
shared/js/book-shell.js               모든 책 상단 바의 ‘건설 서가’ 연결
shared/img/sims/                      홈 ‘직접 해보기’의 시뮬레이터 화면(tools/sim-shots.mjs로 생성)
{slug}/                               각 책의 본문, 실습 엔진, 용어 데이터
tools/sync-catalog.py                 catalog.js·catalog.json 생성(LOCAL_BOOKS + roadmap.json + book.json의 map)
tools/sync-sitemap.py                 루트 사이트맵 생성
tools/build.mjs                       정적 배포물(.book-dist/) 생성, meta가 있는 책의 SEO 태그와 수식 미리 렌더링
tools/katex.mjs, katex.test.mjs       빌드 시 수식 렌더링과 회귀 검사
tools/engine.test.cjs                 구조 해석 엔진을 손계산 공식과 대조(단순보·캔틸레버·연속보·게르버보·트러스·라멘·단면)
tools/materials.test.cjs              재료 모델(배합·강도·내구성·강재·아스팔트·열관류)을 손계산과 대조
tools/geotech.test.cjs                지반 모델(응력·압밀·토압·지지력·사면·액상화)을 손계산과 대조
tools/structure.test.cjs              동역학·풍하중 모델(모드·뉴마크·스펙트럼·등가 정적·TMD)을 손계산과 대조
tools/concrete.test.cjs               RC 설계 함수(휨·T형·전단·정착·균열 단면·P–M·모멘트 확대)를 손계산과 대조
tools/civil.test.cjs                  토목 모델(영향선·케이블·커쉬·지반 반응 곡선·선형·포장·수리)을 손계산과 대조
tools/site.test.cjs                   공사 관리 모델(CPM·PERT·EVM·작업량·학습 곡선·NPV)을 손계산과 대조
tools/bim.test.cjs                    BIM 모델(요소 생성·간섭·물량·변환 행렬·지리 참조·메시·정합·평면·칼만·STEP)을 손계산과 대조
tools/merge-glossary.py               장별 용어 파일 {slug}/js/glossary/*.json → glossary-data.js
tools/check.py                        메타데이터·링크 정적 검사
tools/browser-check.cjs               데스크톱·모바일 브라우저 검사(Playwright)
tools/og.mjs                          공유 이미지 og.png, mechanics/og.png, materials/og.png, geotech/og.png, structure/og.png, concrete/og.png, civil/og.png, site/og.png, bim/og.png 생성(Playwright)
tools/sim-shots.mjs                   홈 실험 카드 이미지 생성(Playwright)
```

## 실행과 배포

```bash
npm ci
npm test                                   # 수식·해석 엔진·링크 검사
npm run build                              # .book-dist/ 생성
python3 -m http.server 8000 --directory .book-dist
node tools/browser-check.cjs --offline mechanics materials geotech structure concrete civil site bim   # Playwright 필요
```

배포물은 `.book-dist/`입니다. GitHub Pages의 Source를 GitHub Actions로 설정하고 커스텀 도메인과 DNS를 연결하면 `main`에 push할 때 Deploy Book 워크플로가 검사·빌드 후 배포합니다. `CNAME`의 `construction.euiyun.com`은 예정 주소이며, 이 파일만으로 DNS나 GitHub 설정이 바뀌지는 않습니다.

`book.json`에 `meta`가 있는 책은 소스에 canonical·Open Graph·KaTeX 태그를 두지 않습니다. 빌드가 태그를 생성하고 수식을 미리 렌더링해 KaTeX 스타일시트만 붙입니다.

책·장·시뮬레이터 수가 바뀌면 `npm run catalog`, `npm run sitemap`, `node tools/og.mjs`로 목록과 공유 이미지를 갱신합니다. 서가 지도(분야 버튼과 ‘읽는 순서’ 위의 지도)는 `book.json`의 `map`에서 고칩니다. 묶음 `id`는 책의 `stage`와 같고, 모든 책은 한 묶음에 들어가야 합니다. 바꾼 뒤 books 저장소에서 `python3 tools/sync-books.py`를 실행하면 books.euiyun.com 지식 지도에도 반영됩니다. `shelf.css`와 `shared/js/shelf.js`는 books 저장소 `tools/shelf-kit/`의 공통 파일을 `python3 tools/sync-shelf-kit.py`로 복사한 것입니다. 서가마다 다른 값(제목·주소·표지의 짧은 이름 `coverTitles`·지도 `map`)은 `book.json`에 둡니다. 홈의 실험 카드를 바꾸면 `node tools/sim-shots.mjs`로 이미지를 다시 찍습니다.

## 라이선스

코드는 MIT, 교육 콘텐츠는 CC BY 4.0입니다. [라이선스 안내](LICENSE.md)와 각 책의 저작권 표시를 참고하세요. 시뮬레이터의 수치는 교육용 근사 모델이며 실제 구조물의 설계·시공·안전 판단에 쓰지 않습니다.
