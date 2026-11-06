// Copyright (c) 2026 geniuskey and ConstructionBooks contributors. MIT.
// Load geotech/js/common.js with a stub DOM and check the soil models (GeotechBook) against hand calculations.
const fs = require('fs'), vm = require('vm'), path = process.argv[2] || require('path').join(__dirname, '../geotech/js/common.js');
const noop = () => {};
const el = { getAttribute: () => null, setAttribute: noop, removeAttribute: noop, style: {}, classList: { add: noop, toggle: noop } };
const sandbox = { console, Math, Number, Object, Array, Set, Map, JSON, isFinite, Promise, String, Error, Float64Array,
  localStorage: { getItem: () => null, setItem: noop }, matchMedia: () => ({ matches: false, addEventListener: noop }),
  document: { readyState: 'loading', addEventListener: noop, documentElement: el, currentScript: { src: 'http://x/geotech/js/common.js' }, head: { append: noop }, createElement: () => ({}) },
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
const S = CB.soil, d2r = Math.PI / 180;
// Phase relations
const ph = S.phase({ Gs: 2.7, w: 0.55, S: 1 }); near('e = wGs', ph.e, 1.485); near('gsat', ph.gsat, ((2.7 + 1.485) * 9.81) / 2.485); near('gd from e', S.phase({ Gs: 2.65, e: 0.6 }).gd, (2.65 * 9.81) / 1.6);
near('zav', S.zav(0.2, 2.7), (2.7 * 9.81) / 1.54);
// Reference site G-10 stresses
const p = S.site(); near("σ'v at 2 m", p.at(2).s, 36); near("σ'v at 10 m", p.at(10).s, 36 + 4 * (19 - 9.81) + 4 * (16.5 - 9.81)); near('u at 11 m', p.at(11).u, 9 * 9.81);
// Stress distribution
near('point load', S.point(100, 0, 2), (3 * 100) / (2 * Math.PI * 4)); near('strip centre z=B', S.strip(100, 2, 0, 2), 55.0, 2e-3); near('circle', S.circle(100, 1, 1), 100 * (1 - Math.pow(0.5, 1.5)));
near('corner m=n=1', S.cornerI(1, 1, 1), 0.1752, 1e-3); near('rect centre = 4 corners', S.rect(100, 2, 2, 0, 0, 2), 400 * S.cornerI(1, 1, 2)); near('rect outside', S.rect(100, 2, 2, 3, 0, 2), 100 * 2 * (S.cornerI(4, 1, 2) - S.cornerI(2, 1, 2)));
near('2:1', S.twoToOne(100, 2, 2, 2), 25);
// Consolidation
near('U(Tv=0.197)', S.U(0.197), 0.5, 2e-3); near('U(0.848)', S.U(0.848), 0.9, 2e-3); near('Tv(0.9)', S.Tv(0.9), 0.848, 2e-3); near('u ratio mid at small Tv', S.uRatio(1, 0.001), 1, 1e-2); near('u ratio mid Tv=0.2', S.uRatio(1, 0.2), (4 / Math.PI) * Math.exp(-(Math.PI ** 2) / 4 * 0.2) - (4 / (3 * Math.PI)) * Math.exp(-(9 * Math.PI ** 2) / 4 * 0.2), 1e-3);
near('NC settlement', S.settlement({ H: 8, e0: 1.5, Cc: 0.55, s0: 100, ds: 76 }), (0.55 * 8) / 2.5 * Math.log10(1.76)); near('OC settlement', S.settlement({ H: 6, e0: 1, Cc: 0.4, Cr: 0.05, s0: 100, ds: 100, sp: 150 }), 3 * (0.05 * Math.log10(1.5) + 0.4 * Math.log10(200 / 150)));
near('E-4 settlement (reference)', S.settlement({ H: 8, e0: 1.5, Cc: 0.55, Cr: 0.08, s0: p.at(10).s, ds: 76 }), 0.434, 2e-3);
// Strength, earth pressure, bearing
near('tauF', S.tauF(100, 10, 30), 10 + 100 * Math.tan(30 * d2r)); near('sigma1f', S.sigma1f(100, 0, 30), 300);
near('Rankine Ka', S.rankine(30).Ka, 1 / 3); near('Rankine Kp', S.rankine(30).Kp, 3); near('Coulomb = Rankine (δ=α=β=0)', S.coulomb(34, 0, 0, 0).Ka, S.rankine(34).Ka);
near('Coulomb Ka φ30 δ20', S.coulomb(30, 20, 0, 0).Ka, 0.2973, 2e-3); near('K0 Jaky', S.K0(30), 0.5); near('M-O kh=0', S.mononobe(30, 0, 0), 1 / 3);
const N = S.N(30); near('Nq(30)', N.Nq, 18.40, 1e-3); near('Nc(30)', N.Nc, 30.14, 1e-3); near('Ng Vesic(30)', N.Ng, 22.40, 1e-3); near('Nc(0)', S.N(0).Nc, 5.14);
near('bearing strip clay', S.bearing({ B: 2, Df: 0, c: 50, phi: 0, g: 18, depth: false }).qu, 5.14 * 50); near('bearing q term', S.bearing({ B: 2, Df: 1, phi: 30, g: 18, shape: false, depth: false }).terms[1], 18 * 18.401, 1e-3);
// Slopes
near('infinite slope dry', S.infinite({ beta: 30, phi: 35, z: 3 }), Math.tan(35 * d2r) / Math.tan(30 * d2r)); near('infinite slope seepage', S.infinite({ beta: 30, phi: 35, z: 3, m: 1, g: 20, gsat: 20 }), ((20 - 9.81) / 20) * Math.tan(35 * d2r) / Math.tan(30 * d2r));
const bi = S.slopeCircle({ H: 10, beta: 30, c: 15, phi: 25, g: 18, circle: { xc: 8, yc: 20, R: 21 } }), fe = S.slopeCircle({ H: 10, beta: 30, c: 15, phi: 25, g: 18, method: 'fellenius', circle: { xc: 8, yc: 20, R: 21 } });
near('Bishop ≥ Fellenius', bi.FS >= fe.FS ? 1 : 0, 1); near('Bishop plausible', bi.FS > 1 && bi.FS < 4 ? 1 : 0, 1);
// Dynamics, seepage
near('CRR(N=10)', S.CRR(10), 1 / 24 + 10 / 135 + 50 / 145 ** 2 - 0.005); near('rd(5)', S.rd(5), 1 - 0.03825); near('T = 4H/Vs', S.period(20, 200), 0.4);
const k = S.keq([{ H: 1, k: 1e-4 }, { H: 1, k: 1e-8 }]); near('kh', k.kh, 0.5e-4 + 0.5e-8); near('kv', k.kv, 2 / (1e4 + 1e8)); near('ic', S.ic(19.62), 1);
near('Uh Hansbo', S.Uh(3, 0.5, 1.26, 0.05), 1 - Math.exp((-8 * 3 * 0.5) / 1.26 ** 2 / (Math.log(1.26 / 0.05) - 0.75)));
if (fails) { console.error(`${fails} soil check(s) failed`); process.exit(1); }
console.log('Soil models match hand calculations');
