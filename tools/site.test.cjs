// Copyright (c) 2026 geniuskey and ConstructionBooks contributors. MIT.
// Load site/js/common.js with a stub DOM and check the construction-management models (SiteBook) against hand calculations.
const fs = require('fs'), vm = require('vm'), path = process.argv[2] || require('path').join(__dirname, '../site/js/common.js');
const noop = () => {};
const el = { getAttribute: () => null, setAttribute: noop, removeAttribute: noop, style: {}, classList: { add: noop, toggle: noop } };
const sandbox = { console, Math, Number, Object, Array, Set, Map, JSON, isFinite, Promise, String, Error, Float64Array,
  localStorage: { getItem: () => null, setItem: noop }, matchMedia: () => ({ matches: false, addEventListener: noop }),
  document: { readyState: 'loading', addEventListener: noop, documentElement: el, currentScript: { src: 'http://x/site/js/common.js' }, head: { append: noop }, createElement: () => ({}) },
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
const P = CB.pm;
// Textbook CPM: A(3) → B(4), A → C(2), B,C → D(5); T = 12, C has 2 float
const t = P.cpm([{ id: 'A', d: 3 }, { id: 'B', d: 4, pred: ['A'] }, { id: 'C', d: 2, pred: ['A'] }, { id: 'D', d: 5, pred: ['B', 'C'] }]);
near('CPM T', t.T, 12); near('C total float', t.acts.C.TF, 2); near('C free float', t.acts.C.FF, 2); near('B critical', t.acts.B.critical ? 1 : 0, 1);
const ss = P.cpm([{ id: 'A', d: 10 }, { id: 'B', d: 6, pred: [{ id: 'A', type: 'SS', lag: 2 }] }]); near('SS lag', ss.acts.B.ES, 2); near('SS T', ss.T, 10); near('SS float', ss.acts.B.TF, 2);
const ff = P.cpm([{ id: 'A', d: 10 }, { id: 'B', d: 4, pred: [{ id: 'A', type: 'FF', lag: 2 }] }]); near('FF', ff.acts.B.EF, 12);
near('cycle detected', P.cpm([{ id: 'A', d: 1, pred: ['B'] }, { id: 'B', d: 1, pred: ['A'] }]).ok ? 0 : 1, 1);
// Reference project P-B10
const r = P.cpm(P.B10); near('P-B10 duration', r.T, 93); near('P-B10 BAC', P.B10.reduce((s, a) => s + a.cost, 0), 244); near('G2 float', r.acts.G2.TF, 1); near('I float', r.acts.I.TF, 21);
const sp = P.spread(P.B10, r, 'cost', 'ES'); near('spread total = BAC', sp.cum[sp.cum.length - 1], 244, 1e-9);
const rs = P.spread(P.B10, r, 'res', 'ES'); near('resource rate week 0', rs.per[0], 15);
// PERT, EVM, productivity
const pe = P.pert(2, 4, 12); near('PERT te', pe.te, 5); near('PERT sd', pe.sd, 10 / 6); near('prob at mean', P.prob(10, 10, 2), 0.5, 1e-6);
let u = 0, sm = 0; for (let k = 1; k < 1000; k++) { u = k / 1000; sm += P.tri(0, 5, 10, u); } near('tri mean', sm / 999, 5, 2e-3);
const e = P.evm({ BAC: 100, PV: 50, EV: 40, AC: 50 }); near('SPI', e.SPI, 0.8); near('CPI', e.CPI, 0.8); near('EAC', e.EAC, 125); near('TCPI', e.TCPI, 60 / 50);
near('excavator', P.excavator(1, 1, 1, 1, 36), 100); near('learning 80% doubling', P.learning(100, 0.8, 2), 80); near('npv', P.npv([-100, 110], 0.1), 0, 1e-9); near('irr', P.irr([-100, 110]), 0.1, 1e-6);
near('safety rates', P.rates(2, 30, 1e6).freq, 2);
if (fails) { console.error(`${fails} management check(s) failed`); process.exit(1); }
console.log('Construction management models match hand calculations');
