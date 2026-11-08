#!/usr/bin/env python3
"""Generate the shelf (catalog.js) from the books written here and the future-volume roadmap."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
# Books written in this repository. Keep these fields in sync with the book's own book.json.
LOCAL_BOOKS = [{
    'id': 'mechanicsbook', 'code': 'MEC', 'title': 'MechanicsBook', 'subtitle': '구조역학 교과서',
    'headline': '힘이 흐르는 길을 계산한다',
    'description': '하중과 평형, 트러스, 보의 전단력과 휨모멘트, 라멘·아치·케이블, 영향선, 응력과 변형률, 단면의 성질, 휨·전단 응력과 모어 원, 처짐과 에너지 방법, 좌굴, 부정정 구조와 처짐각법, 매트릭스 구조해석까지 — 하중을 끌어 놓고 부재를 바꿔 보며 기준 건물 B-10과 보도교 T-36의 숫자로 익히는 구조역학 교과서.',
    'url': 'https://construction.euiyun.com/mechanics/', 'repo': 'https://github.com/geniuskey/construction-books', 'field': 'construction',
    'status': 'published', 'level': '건축·토목 2학년', 'stage': 'foundations', 'slug': 'mechanics', 'legacyUrl': None,
    'color': '#1d5fa8', 'colorDark': '#74b0f0', 'motif': 'beam',
    'topics': ['하중·평형', '트러스', '전단력·휨모멘트', '영향선', '응력·단면', '처짐·좌굴', '부정정·매트릭스'],
}, {
    'id': 'materialsbook', 'code': 'MAT', 'title': 'MaterialsBook', 'subtitle': '건설재료 교과서',
    'headline': '콘크리트는 어떻게 굳고 강재는 어떻게 버티나',
    'description': '시멘트 수화와 골재, 콘크리트 배합 설계, 굳지 않은 콘크리트와 양생, 강도 시험, 수축·크리프와 내구성, 구조용 강재와 철근, 부식과 방식, 아스팔트, 목재, 조적·유리·단열·방수, 복합재료와 지속 가능한 재료까지 — 배합을 바꾸고 시편을 깨뜨려 보며 기준 배합 M-30과 B-10·T-36의 숫자로 익히는 건설재료 교과서.',
    'url': 'https://construction.euiyun.com/materials/', 'repo': 'https://github.com/geniuskey/construction-books', 'field': 'construction',
    'status': 'published', 'level': '건축·토목 2학년', 'stage': 'foundations', 'slug': 'materials', 'legacyUrl': None,
    'color': '#6b7280', 'colorDark': '#b6bcc6', 'motif': 'concrete',
    'topics': ['시멘트·골재', '배합 설계', '양생·강도', '수축·내구성', '강재·철근', '부식', '아스팔트·목재', '복합재료·탄소'],
}, {
    'id': 'geotechbook', 'code': 'GEO', 'title': 'GeotechBook', 'subtitle': '지반공학 교과서',
    'headline': '모든 구조물은 땅 위에 선다',
    'description': '흙과 지반 조사, 상 관계와 분류, 유효응력과 침투, 지중 응력, 압밀과 연약지반 개량, 전단강도와 토압, 옹벽과 흙막이, 사면 안정, 얕은 기초와 말뚝, 액상화와 암반까지 — 지층을 쌓고 하중을 올려 보며 기준 지반 G-10과 B-10의 굴착·기초 숫자로 익히는 지반공학 교과서.',
    'url': 'https://construction.euiyun.com/geotech/', 'repo': 'https://github.com/geniuskey/construction-books', 'field': 'construction',
    'status': 'published', 'level': '건축·토목 2–3학년', 'stage': 'foundations', 'slug': 'geotech', 'legacyUrl': None,
    'color': '#8a5a2b', 'colorDark': '#d8a06a', 'motif': 'soil',
    'topics': ['지반 조사·분류', '유효응력·침투', '압밀·지반 개량', '전단강도·토압', '흙막이·사면', '지지력·말뚝', '액상화·암반'],
}, {
    'id': 'structurebook', 'code': 'STR', 'title': 'StructureBook', 'subtitle': '건축구조 교과서',
    'headline': '하중은 어떤 길로 땅에 닿는가',
    'description': '설계 하중과 바닥 구조, 모멘트 골조, 전단벽·코어·튜브, 풍하중, 구조 동역학과 내진 설계, 면진과 제진, 강구조·합성 구조·대공간·목구조, 해석 모델링과 사용성, 화재·연쇄 붕괴와 보강까지 — 건물을 흔들고 구조 시스템을 바꿔 보며 기준 건물 B-10의 숫자로 익히는 건축구조 교과서.',
    'url': 'https://construction.euiyun.com/structure/', 'repo': 'https://github.com/geniuskey/construction-books', 'field': 'construction',
    'status': 'published', 'level': '건축공학 3학년', 'stage': 'design', 'slug': 'structure', 'legacyUrl': None,
    'color': '#0b7285', 'colorDark': '#66d9e8', 'motif': 'tower',
    'topics': ['하중·바닥', '골조·코어', '풍하중', '구조 동역학', '내진·면진', '강·합성·대공간', '사용성·보강'],
}, {
    'id': 'concretebook', 'code': 'RCS', 'title': 'ConcreteBook', 'subtitle': '철근콘크리트 구조 교과서',
    'headline': '인장은 철근이, 압축은 콘크리트가',
    'description': '강도 설계와 등가 응력 블록, 단철근·복철근·T형 보의 휨, 전단과 비틀림, 정착과 이음, 처짐과 균열, 슬래브, 기둥 P–M 상관도와 장주, 내진 상세, 기초, 스트럿–타이 모델, 프리스트레스트 콘크리트까지 — 단면을 그리고 철근을 놓아 보며 기준 부재 G1·C1을 직접 설계하는 철근콘크리트 교과서.',
    'url': 'https://construction.euiyun.com/concrete/', 'repo': 'https://github.com/geniuskey/construction-books', 'field': 'construction',
    'status': 'published', 'level': '건축·토목 3학년', 'stage': 'design', 'slug': 'concrete', 'legacyUrl': None,
    'color': '#5c677d', 'colorDark': '#a9b4c8', 'motif': 'rebar',
    'topics': ['응력 블록·휨', '전단·비틀림', '정착·처짐·균열', '슬래브', 'P–M 상관도', '내진 상세', '기초·STM·PSC'],
}, {
    'id': 'civilbook', 'code': 'CIV', 'title': 'CivilBook', 'subtitle': '교량·터널·도로 교과서',
    'headline': '강을 건너고 산을 뚫는 구조물',
    'description': '교량 하중과 영향선, 거더교·아치교·트러스교·사장교·현수교, 하부 구조와 받침, 터널 굴착과 지반 반응 곡선, NATM 지보, TBM과 지표 침하, 교통류와 선형 설계, 토공과 배수, 포장 설계, 철도, 하천, 유지관리까지 — 트럭을 달리게 하고 산을 뚫어 보며 기준 시설 B-130·TN-11·R-60의 숫자로 익히는 토목 교과서.',
    'url': 'https://construction.euiyun.com/civil/', 'repo': 'https://github.com/geniuskey/construction-books', 'field': 'construction',
    'status': 'published', 'level': '토목 3학년', 'stage': 'civil', 'slug': 'civil', 'legacyUrl': None,
    'color': '#2b8a3e', 'colorDark': '#8ce99a', 'motif': 'bridge',
    'topics': ['교량 하중', '거더·아치·케이블', '하부 구조', '터널·지보', 'TBM', '교통·선형', '포장·배수', '철도·하천'],
}, {
    'id': 'sitebook', 'code': 'SIT', 'title': 'SiteBook', 'subtitle': '시공과 건설관리 교과서',
    'headline': '도면이 건물이 되기까지',
    'description': '발주와 계약, 공사 계획과 가설, 토공·기초·골조·철골·마감 시공, CPM 공정표와 PERT 공기 위험, 자원과 공기 단축, 적산과 원가, EVM, 품질·안전·생산성까지 — 공정을 짜고 원가를 따라가 보며 기준 공사 P-B10의 숫자로 익히는 시공·건설관리 교과서.',
    'url': 'https://construction.euiyun.com/site/', 'repo': 'https://github.com/geniuskey/construction-books', 'field': 'construction',
    'status': 'published', 'level': '건축·토목 4학년·현장 신입', 'stage': 'delivery', 'slug': 'site', 'legacyUrl': None,
    'color': '#e8590c', 'colorDark': '#ffa94d', 'motif': 'crane',
    'topics': ['계약·가설', '공종별 시공', 'CPM·PERT', '자원·공기 단축', '적산·원가', 'EVM', '품질·안전', '생산성'],
}, {
    'id': 'bimbook', 'code': 'BIM', 'title': 'BIMBook', 'subtitle': 'BIM·디지털 건설 교과서',
    'headline': '건물을 짓기 전에 컴퓨터 속에서 한 번 짓는다',
    'description': '형상 모델링과 파라메트릭, IFC 데이터 모델과 LOD, 공통 데이터 환경, 간섭 검토, 모델 기반 물량 산출과 설계 분석, 4D 공정·5D 원가, 측량·드론·스캔, 디지털 제작, 시설 관리와 디지털 트윈, GIS와 계산 설계까지 — 모델을 돌리고 데이터를 꺼내 보며 기준 모델 B-10 BIM의 요소 360개로 익히는 BIM·디지털 건설 교과서.',
    'url': 'https://construction.euiyun.com/bim/', 'repo': 'https://github.com/geniuskey/construction-books', 'field': 'construction',
    'status': 'published', 'level': '건축·토목 3–4학년·BIM 실무 입문', 'stage': 'delivery', 'slug': 'bim', 'legacyUrl': None,
    'color': '#5f3dc4', 'colorDark': '#b197fc', 'motif': 'bim',
    'topics': ['형상·파라메트릭', 'IFC·LOD', 'CDE·정보 관리', '간섭 검토', '물량·분석', '4D·5D', '점군·제작', '디지털 트윈·GIS'],
}]
books = LOCAL_BOOKS
catalog = []
for book in books:
    entry = {k: book[k] for k in ('id', 'title', 'subtitle', 'headline', 'description', 'stage', 'status', 'color', 'colorDark', 'topics', 'motif', 'code', 'legacyUrl', 'slug')}
    entry['url'] = book['slug'] + '/'
    pages = [p for p in (ROOT / book['slug'] / 'chapters').glob('*.html')]
    entry['chapters'] = len(pages)
    entry['simulators'] = sum(p.read_text().count('class="sim"') for p in pages)
    catalog.append(entry)
catalog.extend(json.loads((ROOT / 'roadmap.json').read_text()))
(ROOT / 'catalog.js').write_text('/* Generated by tools/sync-catalog.py. Do not edit by hand. Text: CC BY 4.0. */\nwindow.CONSTRUCTION_BOOKS = ' + json.dumps(catalog, ensure_ascii=False, indent=2) + ';\n')
print(f'Catalog: {len(books)} published, {len(catalog) - len(books)} planned')
