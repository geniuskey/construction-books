// Copyright (c) 2026 geniuskey and ConstructionBooks contributors. MIT. Based on the MathBooks og renderer.
// Render the 1200×630 share images: og.png (shelf home), mechanics/og.png, materials/og.png and geotech/og.png.
// Usage: node tools/og.mjs   (rerun after books, chapters or simulators change). Needs Playwright.
// Covers use the same shelf.css and covers.js as the home page; stats are counted like shared/js/shelf.js.
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(root, f), 'utf8');
const window = {};
new Function('window', read('catalog.js'))(window);
const books = window.CONSTRUCTION_BOOKS;
const live = books.filter((b) => b.status !== 'planned');
const chapters = live.reduce((n, b) => n + (b.chapters || 0), 0);
const simulators = live.reduce((n, b) => n + (b.simulators || 0), 0);
const titles = { mechanicsbook: '구조역학', materialsbook: '건설재료', geotechbook: '지반공학', structurebook: '건축구조', concretebook: '철근콘크리트', civilbook: '교량·터널·도로', sitebook: '시공·건설관리', bimbook: 'BIM·디지털' };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// The engine (materials copy = structural solver + materials models), loaded with a stub DOM, computes the art on the book cards.
const noop = () => {};
const stubEl = { getAttribute: () => null, setAttribute: noop, removeAttribute: noop, style: {}, classList: { add: noop, toggle: noop } };
const sandbox = { console, Math, Number, Object, Array, Set, Map, JSON, isFinite, Promise, String, Error, Float64Array, URL,
  localStorage: { getItem: () => null, setItem: noop }, matchMedia: () => ({ matches: false, addEventListener: noop }),
  document: { readyState: 'loading', addEventListener: noop, documentElement: stubEl, currentScript: { src: 'http://x/materials/js/common.js' }, head: { append: noop }, createElement: () => ({}) },
  getComputedStyle: () => ({ getPropertyValue: () => '' }), requestAnimationFrame: noop };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(read('materials/js/common.js'), sandbox);
const CB = sandbox.CB;
// GeotechBook's copy adds the soil models (CB.soil).
const sandbox2 = { ...sandbox, document: { ...sandbox.document, currentScript: { src: 'http://x/geotech/js/common.js' } } };
sandbox2.window = sandbox2;
vm.createContext(sandbox2);
vm.runInContext(read('geotech/js/common.js'), sandbox2);
CB.soil = sandbox2.CB.soil;

const base = `
  html, body { margin:0; width:1200px; height:630px; overflow:hidden; }
  body { position:relative; color:#e6ebf5; font-family:var(--font); word-break:keep-all;
    background: radial-gradient(ellipse 70% 90% at 78% 45%, #1b2640 0%, transparent 70%), linear-gradient(160deg, #111827, #0a0d14); }
  body::before { content:""; position:absolute; inset:0; opacity:.5;
    background-image:linear-gradient(#ffffff08 1px, transparent 1px), linear-gradient(90deg, #ffffff08 1px, transparent 1px); background-size:40px 40px; }
  .left { position:absolute; left:62px; top:70px; width:500px; }
  .brand { display:flex; align-items:center; gap:16px; font-size:29px; font-weight:800; letter-spacing:-.02em; }
  .brand svg { width:48px; height:48px; }
  .eyebrow { margin-top:48px; color:#ffa94d; font:600 13px var(--mono); letter-spacing:.2em; }
  h1 { margin:16px 0 0; font-size:46px; line-height:1.3; font-weight:800; letter-spacing:-.04em; }
  h1 .soft { color:#9cc4f0; } h1 .warm { color:#ffa94d; }
  .lead { margin:22px 0 0; color:#aeb8cc; font-size:17px; line-height:1.65; }
  .stats { display:flex; gap:22px; margin-top:26px; color:#aeb8cc; font-size:14px; }
  .stats b { margin-right:5px; color:#fff; font:700 21px var(--mono); }
  .url { position:absolute; left:62px; bottom:62px; color:#ffa94d; font:600 15px var(--mono); }`;

const shelfCovers = books.map((b) => `<div class="book${b.status === 'planned' ? ' planned' : ''}"><div class="book-stand"><div class="book-cover" style="--c:${b.color}">
    <strong>${esc(titles[b.id] || b.title)}</strong><span class="book-art" data-motif="${esc(b.motif)}"></span><span class="book-foot"></span>
  </div></div></div>`).join('');

const shelf = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${read('shelf.css')}</style><style>${base}
  .case { --gap:22px; position:absolute; left:612px; top:64px; width:540px; display:grid; grid-template-columns:repeat(4,1fr); column-gap:var(--gap); row-gap:40px; }
  .book.planned .book-cover { filter:saturate(.6) brightness(.82); }
  .book-cover { padding:12% 9% 9% 13%; }
  .book-cover strong { margin-top:0; font-size:13.5px; white-space:nowrap; letter-spacing:-.05em; }
  .book-art { margin:6% 0 8%; }
  .book-foot { padding-top:0; }
</style></head><body>
  <div class="left">
    <div class="brand">${read('favicon.svg')}<span>ConstructionBooks</span></div>
    <div class="eyebrow">INTERACTIVE CONSTRUCTION TEXTBOOKS</div>
    <h1>공식을 외우기 전에,<br><span class="soft">하중을 끌어 놓고</span><br><span class="warm">배우는 건설</span></h1>
    <p class="lead">구조역학에서 건설재료, 지반, 건축구조,<br>교량·시공·BIM까지 한 서가에서.</p>
    <div class="stats"><span><b>${live.length}</b>권 공개</span><span><b>${chapters}</b>개 장</span><span><b>${books.length - live.length}</b>권 준비 중</span></div>
  </div>
  <div class="url">construction.euiyun.com</div>
  <div class="case">${shelfCovers}</div>
</body></html>`;

// MechanicsBook: the T-36 Pratt truss coloured by member force (tension blue, compression red) over a beam's BMD.
const mech = (() => {
  const nodes = [], bars = [];
  for (let k = 0; k <= 6; k++) nodes.push([6 * k, 0]);
  for (let k = 1; k <= 5; k++) nodes.push([6 * k, 4.5]);
  const tp = (k) => 6 + k;
  for (let k = 0; k < 6; k++) bars.push([k, k + 1]);
  for (let k = 1; k < 5; k++) bars.push([tp(k), tp(k + 1)]);
  for (let k = 1; k <= 5; k++) bars.push([k, tp(k)]);
  bars.push([0, tp(1)], [tp(5), 6], [tp(1), 2], [tp(2), 3], [tp(4), 3], [tp(5), 4]);
  const t = CB.truss({ nodes, bars, supports: { 0: 'pin', 6: 'roller' }, loads: [1, 2, 3, 4, 5].map((n) => ({ node: n, fy: -60 })), EA: 1e6 });
  const maxN = Math.max(...t.N.map(Math.abs));
  const X = (x) => 60 + x * 13.3, Y = (y) => 250 - y * 26;
  let s = '';
  bars.forEach(([i, j], m) => {
    const N = t.N[m], c = Math.abs(N) < 1e-6 ? '#8b95a7' : N > 0 ? '#5b8cff' : '#ff5f57';
    s += `<line x1="${X(nodes[i][0])}" y1="${Y(nodes[i][1])}" x2="${X(nodes[j][0])}" y2="${Y(nodes[j][1])}" stroke="${c}" stroke-width="${(3 + 7 * Math.abs(N) / maxN).toFixed(1)}" stroke-linecap="round"/>`;
  });
  nodes.forEach(([x, y]) => { s += `<circle cx="${X(x)}" cy="${Y(y)}" r="6" fill="#0f1228" stroke="#fff" stroke-width="2.5"/>`; });
  [1, 2, 3, 4, 5].forEach((n) => { const x = X(nodes[n][0]); s += `<line x1="${x}" y1="${Y(0) + 14}" x2="${x}" y2="${Y(0) + 44}" stroke="#ffa94d" stroke-width="3"/><path d="M${x - 6} ${Y(0) + 34}L${x} ${Y(0) + 46}L${x + 6} ${Y(0) + 34}z" fill="#ffa94d"/>`; });
  s += `<path d="M${X(0)} ${Y(0) + 8}l-14 22h28z" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M${X(36)} ${Y(0) + 8}l-14 20h28z" fill="none" stroke="#fff" stroke-width="2.5"/>`;
  s += `<text x="${X(18)}" y="${Y(4.5) - 22}" text-anchor="middle" fill="#ff5f57" font-family="monospace" font-size="24" font-weight="700">${CB.num(t.N[bars.findIndex(([a, c]) => a === tp(3) && c === tp(4))], 0)} kN</text>`;
  s += `<text x="${X(18)}" y="${Y(0) + 80}" text-anchor="middle" fill="#5b8cff" font-family="monospace" font-size="24" font-weight="700">+${CB.num(t.N[3], 0)} kN</text>`;
  // beam + BMD
  const bx0 = 80, bx1 = 520, by = 420;
  s += `<line x1="${bx0}" y1="${by}" x2="${bx1}" y2="${by}" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`;
  for (let k = 0; k <= 10; k++) { const x = bx0 + ((bx1 - bx0) * k) / 10; s += `<line x1="${x}" y1="${by - 44}" x2="${x}" y2="${by - 10}" stroke="#ffa94d" stroke-width="2"/><path d="M${x - 5} ${by - 16}L${x} ${by - 6}L${x + 5} ${by - 16}z" fill="#ffa94d"/>`; }
  s += `<line x1="${bx0}" y1="${by - 44}" x2="${bx1}" y2="${by - 44}" stroke="#ffa94d" stroke-width="2"/>`;
  let d = `M${bx0} ${by + 4}`; for (let k = 0; k <= 60; k++) { const u = k / 60; d += `L${(bx0 + (bx1 - bx0) * u).toFixed(1)} ${(by + 4 + 110 * 4 * u * (1 - u)).toFixed(1)}`; }
  s += `<path d="${d}Z" fill="#74b0f0" fill-opacity=".25" stroke="#74b0f0" stroke-width="4"/>`;
  s += `<text x="${(bx0 + bx1) / 2}" y="${by + 150}" text-anchor="middle" fill="#74b0f0" font-family="monospace" font-size="28" font-weight="700">M = wL²/8</text>`;
  return `<svg viewBox="0 0 600 600" width="600" height="600"><defs><clipPath id="c"><rect x="20" y="20" width="560" height="560" rx="28"/></clipPath></defs><rect x="20" y="20" width="560" height="560" rx="28" fill="#0f1625" stroke="#26324a"/><g clip-path="url(#c)">${s}</g></svg>`;
})();
const mechanics = books.find((b) => b.id === 'mechanicsbook');
const mechPage = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${read('shelf.css')}</style><style>${base}
  .art { position:absolute; right:40px; top:15px; }
</style></head><body>
  <div class="left">
    <div class="brand">${read('mechanics/favicon.svg')}<span>MechanicsBook</span></div>
    <div class="eyebrow">INTERACTIVE STRUCTURAL MECHANICS</div>
    <h1>힘이 흐르는 길을<br><span class="soft">눈으로 보고</span><br><span class="warm">손으로 계산한다</span></h1>
    <p class="lead">평형과 트러스, 보와 라멘, 응력과 처짐,<br>좌굴과 부정정 구조를 직접 끌며 익히는 구조역학.</p>
    <div class="stats"><span><b>4</b>부</span><span><b>16</b>개 장</span><span><b>${Math.floor(mechanics.simulators / 10) * 10}+</b>시뮬레이터</span></div>
  </div>
  <div class="url">construction.euiyun.com/mechanics/</div>
  <div class="art">${mech}</div>
</body></html>`;


// MaterialsBook: concrete compression curves for several strengths over the M-30 reference mix (1 m³ by volume).
const matArt = (() => {
  let s = '';
  const X = (e) => 70 + (e / 0.0038) * 380, Y = (f) => 290 - f * 3.6;
  s += `<line x1="70" y1="290" x2="550" y2="290" stroke="#4a5670" stroke-width="2"/><line x1="70" y1="290" x2="70" y2="60" stroke="#4a5670" stroke-width="2"/>`;
  const cols = { 24: '#8b95a7', 30: '#93bcd6', 40: '#ffa94d', 60: '#ff5f57' };
  for (const fc of [24, 30, 40, 60]) {
    let d = '';
    for (let k = 0; k <= 120; k++) { const e = (0.0038 * k) / 120; d += (k ? 'L' : 'M') + X(e).toFixed(1) + ' ' + Y(CB.conc.sigma(e, fc)).toFixed(1); }
    s += `<path d="${d}" fill="none" stroke="${cols[fc]}" stroke-width="${fc === 30 ? 6 : 3.5}" stroke-linecap="round"/>`;
    s += `<text x="${X(0.0038) + 8}" y="${Y(CB.conc.sigma(0.0038, fc)) + 6}" fill="${cols[fc]}" font-family="monospace" font-size="18" font-weight="700">${fc} MPa</text>`;
  }
  const m = CB.conc.mix({ fck: 30, s: 3, slump: 150, Gmax: 25, air: 4.5 });
  const parts = [['물', m.vol.W, '#5b8cff', m.W], ['시멘트', m.vol.C, '#c3cad6', m.C], ['공기', m.vol.air, '#4a5670', null], ['잔골재', m.vol.S, '#f5b93a', m.S], ['굵은 골재', m.vol.G, '#93bcd6', m.G]];
  let x = 60; const bw = 480;
  parts.forEach(([name, v, c, kg]) => { const w = v * bw; s += `<rect x="${x.toFixed(1)}" y="380" width="${(w - 3).toFixed(1)}" height="78" rx="6" fill="${c}"/>`;
    if (w > 50) s += `<text x="${(x + w / 2).toFixed(1)}" y="486" text-anchor="middle" fill="#cfd6e4" font-size="16" font-weight="700">${name}</text><text x="${(x + w / 2).toFixed(1)}" y="508" text-anchor="middle" fill="#8b95a7" font-family="monospace" font-size="15">${kg ? Math.round(kg) + ' kg' : ''}</text>`;
    x += w; });
  s += `<text x="300" y="356" text-anchor="middle" fill="#ffa94d" font-family="monospace" font-size="22" font-weight="700">M-30 · W/B ${m.wb.toFixed(2)} · 1 m³</text>`;
  return `<svg viewBox="0 0 600 600" width="600" height="600"><defs><clipPath id="c2"><rect x="20" y="20" width="560" height="560" rx="28"/></clipPath></defs><rect x="20" y="20" width="560" height="560" rx="28" fill="#0f1625" stroke="#26324a"/><g clip-path="url(#c2)">${s}</g></svg>`;
})();
const materials = books.find((b) => b.id === 'materialsbook');
const matPage = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${read('shelf.css')}</style><style>${base}
  .art { position:absolute; right:40px; top:15px; }
</style></head><body>
  <div class="left">
    <div class="brand">${read('materials/favicon.svg')}<span>MaterialsBook</span></div>
    <div class="eyebrow">INTERACTIVE CONSTRUCTION MATERIALS</div>
    <h1>콘크리트는 어떻게 굳고<br><span class="soft">강재는 어떻게</span><br><span class="warm">버티는가</span></h1>
    <p class="lead">시멘트 수화와 배합 설계, 강도와 내구성,<br>강재·철근·아스팔트·목재를 직접 계산하는 건설재료.</p>
    <div class="stats"><span><b>4</b>부</span><span><b>16</b>개 장</span><span><b>${Math.floor(materials.simulators / 10) * 10}+</b>시뮬레이터</span></div>
  </div>
  <div class="url">construction.euiyun.com/materials/</div>
  <div class="art">${matArt}</div>
</body></html>`;

// GeotechBook: the G-10 boring log with total stress, pore pressure and effective stress, and the E-4 time–settlement curve.
const geoArt = (() => {
  let s = '';
  const site = CB.soil.SITE, p = CB.soil.site(), zMax = 24, X0 = 60, W = 120, Y = (z) => 56 + z * 16.5;
  const fills = ['#b08a5a', '#c9a86b', '#6f6a5e', '#a7865a', '#8a6b4a', '#5d5852'];
  site.layers.forEach((l, i) => { const b = Math.min(l.bottom, zMax); if (l.top >= zMax) return; s += `<rect x="${X0}" y="${Y(l.top)}" width="${W}" height="${Y(b) - Y(l.top)}" fill="${fills[i]}" opacity=".9"/>`; s += `<text x="${X0 + W + 10}" y="${(Y(l.top) + Y(b)) / 2 + 5}" fill="#cfd6e4" font-size="15" font-weight="600">${l.name}</text>`; });
  s += `<line x1="${X0 - 14}" y1="${Y(site.gwl)}" x2="${X0 + W}" y2="${Y(site.gwl)}" stroke="#5b8cff" stroke-width="2.5" stroke-dasharray="6 4"/><path d="M${X0 - 22} ${Y(site.gwl) - 14}h16l-8 12z" fill="#5b8cff"/>`;
  const gx = 330, gw = 210, smax = 450, Xs = (v) => gx + (v / smax) * gw;
  s += `<line x1="${gx}" y1="${Y(0)}" x2="${gx}" y2="${Y(zMax)}" stroke="#4a5670" stroke-width="2"/><line x1="${gx}" y1="${Y(0)}" x2="${gx + gw}" y2="${Y(0)}" stroke="#4a5670" stroke-width="2"/>`;
  const line = (key, color, wdt) => { let d = ''; for (let k = 0; k <= 96; k++) { const z = (zMax * k) / 96; d += (k ? 'L' : 'M') + Xs(p.at(z)[key]).toFixed(1) + ' ' + Y(z).toFixed(1); } s += `<path d="${d}" fill="none" stroke="${color}" stroke-width="${wdt}" stroke-linecap="round"/>`; };
  line('sv', '#8b95a7', 3); line('u', '#5b8cff', 3); line('s', '#d8a06a', 5);
  s += `<text x="${Xs(p.at(zMax).sv) - 4}" y="${Y(zMax) + 22}" text-anchor="end" fill="#8b95a7" font-family="monospace" font-size="16" font-weight="700">σ</text><text x="${Xs(p.at(zMax).u)}" y="${Y(zMax) + 22}" text-anchor="middle" fill="#5b8cff" font-family="monospace" font-size="16" font-weight="700">u</text><text x="${Xs(p.at(zMax).s) + 4}" y="${Y(zMax) + 22}" fill="#d8a06a" font-family="monospace" font-size="16" font-weight="700">σ′</text>`;
  // E-4 time–settlement inset
  const S = CB.soil.settlement({ H: 8, e0: 1.5, Cc: 0.55, Cr: 0.08, s0: p.at(10).s, ds: 76 }), ix = 70, iy = 556, iw = 470;
  let d = '';
  for (let k = 0; k <= 80; k++) { const t = (20 * k) / 80, U = CB.soil.U((1.5 * t) / 16); d += (k ? 'L' : 'M') + (ix + (t / 20) * iw).toFixed(1) + ' ' + (iy - 40 + U * 40).toFixed(1); }
  s += `<path d="${d}" fill="none" stroke="#ffa94d" stroke-width="4"/><text x="${ix + iw}" y="${iy - 48}" text-anchor="end" fill="#ffa94d" font-family="monospace" font-size="17" font-weight="700">E-4 성토 침하 ${S.toFixed(2)} m · t90 9년</text>`;
  return `<svg viewBox="0 0 600 600" width="600" height="600"><defs><clipPath id="c3"><rect x="20" y="20" width="560" height="560" rx="28"/></clipPath></defs><rect x="20" y="20" width="560" height="560" rx="28" fill="#0f1625" stroke="#26324a"/><g clip-path="url(#c3)">${s}</g></svg>`;
})();
const geotech = books.find((b) => b.id === 'geotechbook');
const geoPage = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${read('shelf.css')}</style><style>${base}
  .art { position:absolute; right:40px; top:15px; }
</style></head><body>
  <div class="left">
    <div class="brand">${read('geotech/favicon.svg')}<span>GeotechBook</span></div>
    <div class="eyebrow">INTERACTIVE GEOTECHNICAL ENGINEERING</div>
    <h1>모든 구조물은<br><span class="soft">땅 위에</span><br><span class="warm">선다</span></h1>
    <p class="lead">유효응력과 침투, 압밀과 지반 개량, 토압과 흙막이,<br>지지력과 말뚝, 액상화를 직접 계산하는 지반공학.</p>
    <div class="stats"><span><b>4</b>부</span><span><b>16</b>개 장</span><span><b>${Math.floor(geotech.simulators / 10) * 10}+</b>시뮬레이터</span></div>
  </div>
  <div class="url">construction.euiyun.com/geotech/</div>
  <div class="art">${geoArt}</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const [html, out] of [[shelf, 'og.png'], [mechPage, 'mechanics/og.png'], [matPage, 'materials/og.png'], [geoPage, 'geotech/og.png']]) {
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.addScriptTag({ content: read('shared/js/covers.js') });
  await page.evaluate(async () => {
    document.querySelectorAll('[data-motif]').forEach((el) => { el.innerHTML = window.coverArt(el.dataset.motif); });
    await document.fonts.ready;
  });
  await page.screenshot({ path: join(root, out) });
}
await browser.close();
console.log(`og.png: ${live.length} books, ${chapters} chapters, ${simulators} simulators; mechanics/og.png: ${mechanics.simulators}, materials/og.png: ${materials.simulators}, geotech/og.png: ${geotech.simulators} simulators`);
