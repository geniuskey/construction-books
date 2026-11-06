# ConstructionBooks · 건설 교과서 서가

하중을 끌어 놓고 부재를 바꿔 보며 배우는 한국어 인터랙티브 건설·건축 교과서를 한 저장소에서 관리합니다. 홈은 SemiBooks·MathBooks의 책장·검색·분야 필터·실습·읽는 순서 구성을 따릅니다.

서비스 주소(예정): **https://construction.euiyun.com/** · 책 한 권의 홈은 **`/{slug}/`**, 각 장은 **`/{slug}/chapters/{chapter}.html`**입니다.

## 수록 책

| 경로 | 책 | 상태 |
|---|---|---|
| `/mechanics/` | MechanicsBook · 구조역학 | 공개, 4부 16장 + 용어집 |
| `/materials/` | MaterialsBook · 건설재료 | 준비 예정 |
| `/geotech/` | GeotechBook · 지반공학 | 준비 예정 |
| `/structure/` | StructureBook · 건축구조 | 준비 예정 |
| `/concrete/` | ConcreteBook · 철근콘크리트 구조 | 준비 예정 |
| `/civil/` | CivilBook · 교량·터널·도로 | 준비 예정 |
| `/site/` | SiteBook · 시공과 건설관리 | 준비 예정 |
| `/bim/` | BIMBook · BIM·디지털 건설 | 준비 예정 |

준비 중인 책은 `roadmap.json`에 적습니다. 공개할 때 그 항목을 지우고 `tools/sync-catalog.py`의 `LOCAL_BOOKS`에 옮깁니다.

MechanicsBook(`mechanics/`)은 math-books의 CalculusBook 엔진(`MB`)을 물려받아 전역 객체 이름을 `CB`로 바꾸고 구조 해석 모듈을 더했습니다. 2차원 골조·트러스 강성법 해석기(`CB.frame`, `CB.truss`, `CB.beam`), 단면 성질(`CB.section`), 구조물·하중·단면력도 그리기(`CB.drawFrame`, `CB.beamDiagrams`, `CB.drawSection`), 끌어서 돌리는 3D 보기(`CB.orbit`)입니다. 다음 책들(건축구조·철근콘크리트·교량)도 이 엔진을 복사해 씁니다. 모든 장은 가상의 기준 구조물 두 개, 10층 RC 업무시설 **B-10**과 36 m 강 트러스 보도교 **T-36**의 숫자를 함께 씁니다. 집필 규칙·부호 규약·기준 구조물 표·엔진 API는 [mechanics/CONTRIBUTING.md](mechanics/CONTRIBUTING.md)를 참고하세요.

## 구성

```text
index.html, shelf.css                  서가 홈: 책장·분야 필터·검색, 대표 실험, 읽는 순서
catalog.js                            생성된 책 목록(직접 수정하지 않음)
book.json                             서가 메타데이터, 각 책의 book.json 목록
roadmap.json                          준비 중인 책
shared/js/shelf.js                    서가 홈의 책장 렌더링·필터·실험 덱
shared/js/covers.js                   SVG 책 표지(건설 서가 8권)
shared/css/cover-animations.css       표지 애니메이션(동작 줄이기 지원)
shared/js/book-shell.js               모든 책 상단 바의 ‘건설 서가’ 연결
shared/img/sims/                      홈 ‘직접 해보기’의 시뮬레이터 화면(tools/sim-shots.mjs로 생성)
{slug}/                               각 책의 본문, 실습 엔진, 용어 데이터
tools/sync-catalog.py                 catalog.js 생성(LOCAL_BOOKS + roadmap.json)
tools/sync-sitemap.py                 루트 사이트맵 생성
tools/build.mjs                       정적 배포물(.book-dist/) 생성, meta가 있는 책의 SEO 태그와 수식 미리 렌더링
tools/katex.mjs, katex.test.mjs       빌드 시 수식 렌더링과 회귀 검사
tools/engine.test.cjs                 구조 해석 엔진을 손계산 공식과 대조(단순보·캔틸레버·연속보·게르버보·트러스·라멘·단면)
tools/check.py                        메타데이터·링크 정적 검사
tools/browser-check.cjs               데스크톱·모바일 브라우저 검사(Playwright)
tools/og.mjs                          공유 이미지 og.png, mechanics/og.png 생성(Playwright)
tools/sim-shots.mjs                   홈 실험 카드 이미지 생성(Playwright)
```

## 실행과 배포

```bash
npm ci
npm test                                   # 수식·해석 엔진·링크 검사
npm run build                              # .book-dist/ 생성
python3 -m http.server 8000 --directory .book-dist
node tools/browser-check.cjs --offline mechanics   # Playwright 필요
```

배포물은 `.book-dist/`입니다. GitHub Pages의 Source를 GitHub Actions로 설정하고 커스텀 도메인과 DNS를 연결하면 `main`에 push할 때 Deploy Book 워크플로가 검사·빌드 후 배포합니다. `CNAME`의 `construction.euiyun.com`은 예정 주소이며, 이 파일만으로 DNS나 GitHub 설정이 바뀌지는 않습니다.

`book.json`에 `meta`가 있는 책은 소스에 canonical·Open Graph·KaTeX 태그를 두지 않습니다. 빌드가 태그를 생성하고 수식을 미리 렌더링해 KaTeX 스타일시트만 붙입니다.

책·장·시뮬레이터 수가 바뀌면 `npm run catalog`, `npm run sitemap`, `node tools/og.mjs`로 목록과 공유 이미지를 갱신합니다. 홈의 실험 카드를 바꾸면 `node tools/sim-shots.mjs`로 이미지를 다시 찍습니다.

## 라이선스

코드는 MIT, 교육 콘텐츠는 CC BY 4.0입니다. [라이선스 안내](LICENSE.md)와 각 책의 저작권 표시를 참고하세요. 시뮬레이터의 수치는 교육용 근사 모델이며 실제 구조물의 설계·시공·안전 판단에 쓰지 않습니다.
