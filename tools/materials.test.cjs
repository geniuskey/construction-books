// Copyright (c) 2026 geniuskey and ConstructionBooks contributors. MIT.
// Load materials/js/common.js with a stub DOM and check the materials models (MaterialsBook) against hand calculations.
const fs = require('fs'), vm = require('vm'), path = process.argv[2] || require('path').join(__dirname, '../materials/js/common.js');
const noop = () => {};
const el = { getAttribute: () => null, setAttribute: noop, removeAttribute: noop, style: {}, classList: { add: noop, toggle: noop } };
const sandbox = { console, Math, Number, Object, Array, Set, Map, JSON, isFinite, Promise, String, Error, Float64Array,
  localStorage: { getItem: () => null, setItem: noop }, matchMedia: () => ({ matches: false, addEventListener: noop }),
  document: { readyState: 'loading', addEventListener: noop, documentElement: el, currentScript: { src: 'http://x/materials/js/common.js' }, head: { append: noop }, createElement: () => ({}) },
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
// Concrete properties (KDS forms)
near('fcm(30)', CB.conc.fcm(30), 34); near('fcm(50)', CB.conc.fcm(50), 55); near('Ec(30)', CB.conc.Ec(30), 8500 * Math.cbrt(34), 2e-3);
near('fr(30)', CB.conc.fr(30), 0.63 * Math.sqrt(30)); near('beta(28)', CB.conc.beta(28), 1); near('beta(7,N)', CB.conc.beta(7), Math.exp(0.25 * (1 - 2)));
near('PR peak', CB.conc.sigma(0.0025, 30, { model: 'pr' }), 30); near('PR half', CB.conc.sigma(0.001, 30, { model: 'pr' }), 30 * 0.75);
near('Hognestad peak', CB.conc.sigma((2 * 30) / CB.conc.Ec(30), 30), 30);
// Required strength (KCS form) and mix design M-30 (reference mix)
near('fcr s=3', CB.conc.fcr(30, 3), 34.02); near('fcr s=5', CB.conc.fcr(30, 5), 30 - 3.5 + 2.33 * 5); near('fcr no record', CB.conc.fcr(30), 38.5); near('fcr 40 no record', CB.conc.fcr(40), 49);
const m = CB.conc.mix({ fck: 30, s: 3, slump: 150, Gmax: 25, air: 4.5 });
near('M-30 W/B', m.wb, 21.1 / (34.02 + 13.8)); near('M-30 W', m.W, 170 * 1.084 * 0.95); near('M-30 B', m.B, m.W / m.wb);
near('M-30 volume = 1', m.vol.W + m.vol.C + m.vol.air + m.vol.S + m.vol.G, 1, 1e-9);
near('M-30 S/a', (100 * m.vol.S) / (m.vol.S + m.vol.G), m.sa, 1e-9);
const f = CB.conc.fieldMix(m, { sm: 5, sa: 1.5, gm: 1, ga: 0.8 });
near('field mix water + surface water', f.W + m.S * 0.035 + m.G * 0.002, m.W); near('field mix total mass kept', f.W + f.C + f.S + f.G, m.W + m.C + m.S + m.G);
// Durability
near('carbonation time (40/4)^2', CB.conc.carbonationTime(40, 4), 100); near('carbonation depth', CB.conc.carbonation(25, 4), 20);
near('chloride surface', CB.conc.chloride(0, 10, 6, 1e-12), 6); const tc = CB.conc.chlorideTime(50, 6, 1e-12, 1.2); near('chloride time inverse', CB.conc.chloride(50, tc, 6, 1e-12), 1.2, 1e-6);
near('maturity', CB.conc.maturity([{ dt: 1, T: 20 }, { dt: 2, T: 0 }]), 30 + 20); near('equivalent age at 20C', CB.conc.equivalentAge([{ dt: 3, T: 20 }]), 3);
// Aggregate: FM of a sand (cumulative retained 2, 12, 32, 57, 82, 97 % on 5…0.15 mm)
const sv = CB.agg.sieve({ 5: 2, 2.5: 10, 1.2: 20, 0.6: 25, 0.3: 25, 0.15: 15, pan: 3 });
near('FM sand', sv.FM, (2 + 12 + 32 + 57 + 82 + 97) / 100); near('absorption', CB.agg.moisture(500, 510, 525).absorption, 2);
// Steel
near('steel elastic', CB.steel.sigma(0.001, { fy: 500 }), 200); near('steel plateau', CB.steel.sigma(0.005, { fy: 500 }), 500); near('steel fu', CB.steel.sigma(0.1, { fy: 500, fu: 620 }), 620);
near('steel symmetric', CB.steel.sigma(-0.005), -500); near('Ceq', CB.steel.ceq({ C: 0.18, Mn: 1.2, Cr: 0.1, Ni: 0.15 }), 0.18 + 0.2 + 0.02 + 0.01);
near('D25 area', CB.steel.BARS.D25.A, Math.PI * 25.4 ** 2 / 4, 2e-3); near('D25 mass', CB.steel.BARS.D25.m, CB.steel.BARS.D25.A * 1e-6 * 7850, 2e-3);
near('fatigue N at dsc', CB.steel.fatigueLife(80, 80), 2e6); near('fatigue m=3', CB.steel.fatigueLife(40, 80, 3, 0), 1.6e7);
// Asphalt, composites, wall
const v = CB.asph.volumetrics({ Gmb: 2.35, Gmm: 2.45, Gsb: 2.65, Pb: 5.5 });
near('Va', v.Va, (100 * 0.1) / 2.45); near('VMA', v.VMA, 100 - (2.35 * 94.5) / 2.65); near('VFA', v.VFA, (100 * (v.VMA - v.Va)) / v.VMA);
const r = CB.mixRule(0.6, 230000, 3500); near('Voigt', r.voigt, 0.6 * 230000 + 0.4 * 3500); near('Reuss', r.reuss, 1 / (0.6 / 230000 + 0.4 / 3500));
const w = CB.wall([{ t: 0.2, k: 1.6 }, { t: 0.1, k: 0.035 }]); near('wall U', w.U, 1 / (0.11 + 0.043 + 0.125 + 0.1 / 0.035));
near('wall temps end', w.temps(20, -10).T.slice(-1)[0], -10, 1e-9); near('dew point 20C 50%', CB.dewPoint(20, 50), 9.26, 5e-3);
if (fails) { console.error(`${fails} materials check(s) failed`); process.exit(1); }
console.log('Materials models match hand calculations');
