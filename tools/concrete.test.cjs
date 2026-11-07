// Copyright (c) 2026 geniuskey and ConstructionBooks contributors. MIT.
// Load concrete/js/common.js with a stub DOM and check the reinforced-concrete design functions (ConcreteBook) against hand calculations.
const fs = require('fs'), vm = require('vm'), path = process.argv[2] || require('path').join(__dirname, '../concrete/js/common.js');
const noop = () => {};
const el = { getAttribute: () => null, setAttribute: noop, removeAttribute: noop, style: {}, classList: { add: noop, toggle: noop } };
const sandbox = { console, Math, Number, Object, Array, Set, Map, JSON, isFinite, Promise, String, Error, Float64Array,
  localStorage: { getItem: () => null, setItem: noop }, matchMedia: () => ({ matches: false, addEventListener: noop }),
  document: { readyState: 'loading', addEventListener: noop, documentElement: el, currentScript: { src: 'http://x/concrete/js/common.js' }, head: { append: noop }, createElement: () => ({}) },
  getComputedStyle: () => ({ getPropertyValue: () => '' }), URL, requestAnimationFrame: noop };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path, 'utf8'), sandbox);
const CB = sandbox.CB;
let fails = 0;
const near = (name, got, want, rel = 1e-3) => {
  const ok = Math.abs(got - want) <= rel * Math.max(1, Math.abs(want));
  if (!ok) fails++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: ${Number(got).toPrecision(6)} (want ${Number(want).toPrecision(6)})`);
};
const R = CB.rc;
// Stress block and phi
near('block 30', R.block(30).beta1, 0.8); near('block 60 beta1', R.block(60).beta1, 0.76); near('phi tension', R.phi(0.01, 500), 0.85); near('phi compression', R.phi(0.001, 500), 0.65); near('phi transition', R.phi((0.0025 + 0.00625) / 2, 500), 0.75);
// Singly reinforced beam vs hand formula
const As = R.bars(7, 'D25'), f = R.flexure({ b: 400, h: 700, fck: 30, fy: 500, layers: [{ d: 630, As }] }), a = (As * 500) / (0.85 * 30 * 400);
near('a', f.a, a); near('Mn', f.Mn, (As * 500 * (630 - a / 2)) / 1e6); near('c = a/β1', f.c, a / 0.8);
const q = R.asReq(460, 400, 610, 30, 500); near('asReq inverse', R.flexure({ b: 400, h: 700, fck: 30, fy: 500, layers: [{ d: 610, As: q }] }).Mn * 0.85, 460, 2e-3);
near('rho_b', R.rhoB(30, 500), ((0.85 * 30 * 0.8) / 500) * (0.0033 / (0.0033 + 0.0025)));
// Doubly reinforced: compression steel adds capacity
const fd = R.flexure({ b: 400, h: 700, fck: 30, fy: 500, layers: [{ d: 60, As: R.bars(3, 'D25') }, { d: 630, As }] }); near('doubly ≥ singly', fd.Mn >= f.Mn ? 1 : 0, 1);
// T-beam with deep flange behaves like rectangle of width bf
const ft = R.flexure({ b: 400, h: 700, fck: 30, fy: 500, bf: 2000, hf: 210, layers: [{ d: 630, As }] }), ar = (As * 500) / (0.85 * 30 * 2000);
near('T-beam a in flange', ft.a, ar); near('T-beam Mn', ft.Mn, (As * 500 * (630 - ar / 2)) / 1e6);
// Shear, development
near('Vc', R.Vc(30, 400, 610), (Math.sqrt(30) * 400 * 610) / 6 / 1000); near('Vs', R.Vs(253.4, 400, 610, 150), (253.4 * 400 * 610) / 150 / 1000); near('ldb', R.ldb(25.4, 500, 30), (0.6 * 25.4 * 500) / Math.sqrt(30));
// Cracked section: neutral axis balances first moments
const cr = R.crack({ b: 400, h: 700, d: 610, As, fck: 30 }); near('kd first moment', (400 * cr.kd ** 2) / 2, cr.n * As * (610 - cr.kd), 1e-6); near('Ie limits', R.Ie(cr.Mcr, cr.Mcr * 0.5, cr.Ig, cr.Icr), cr.Ig);
// P-M: pure compression and pure bending ends
const L = [{ d: 60, As: R.bars(5, 'D25') }, { d: 740, As: R.bars(5, 'D25') }], pm = R.pm({ b: 800, h: 800, fck: 30, fy: 500, layers: L });
near('P0', pm.P0, (0.85 * 30 * (640000 - 10 * 506.7) + 500 * 10 * 506.7) / 1000); near('PnMax tied', pm.PnMax, 0.8 * pm.P0);
const low = pm.pts[pm.pts.length - 1]; near('tension end has small P', Math.abs(low.Pn) < 0.25 * pm.P0 ? 1 : 0, 1);
const mg = R.magnifier({ fck: 30, Ig: 800 ** 4 / 12, k: 1, Lu: 4300, Pu: 9000 }); near('magnifier formula', mg.delta, 1 / (1 - 9000 / (0.75 * mg.Pc)));
if (fails) { console.error(`${fails} RC check(s) failed`); process.exit(1); }
console.log('RC design functions match hand calculations');
