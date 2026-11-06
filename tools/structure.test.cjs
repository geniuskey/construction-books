// Copyright (c) 2026 geniuskey and ConstructionBooks contributors. MIT.
// Load structure/js/common.js with a stub DOM and check the dynamics and wind models (StructureBook) against hand calculations.
const fs = require('fs'), vm = require('vm'), path = process.argv[2] || require('path').join(__dirname, '../structure/js/common.js');
const noop = () => {};
const el = { getAttribute: () => null, setAttribute: noop, removeAttribute: noop, style: {}, classList: { add: noop, toggle: noop } };
const sandbox = { console, Math, Number, Object, Array, Set, Map, JSON, isFinite, Promise, String, Error, Float64Array,
  localStorage: { getItem: () => null, setItem: noop }, matchMedia: () => ({ matches: false, addEventListener: noop }),
  document: { readyState: 'loading', addEventListener: noop, documentElement: el, currentScript: { src: 'http://x/structure/js/common.js' }, head: { append: noop }, createElement: () => ({}) },
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
const D = CB.dyn, W = CB.wind;
// SDOF
const s = D.sdof(10, 1000, 0.05); near('omega', s.omega, 10); near('T', s.T, 2 * Math.PI / 10); near('Rd static', D.Rd(0, 0.05).Rd, 1); near('Rd resonance', D.Rd(1, 0.05).Rd, 10); near('TR r=√2', D.TR(Math.SQRT2, 0.1), 1);
const st = D.newmark({ T: 1, zeta: 0, p: Array(2001).fill(1), dt: 0.005 }); near('step load peak = 2× static', Math.max(...st.u), 2 / (4 * Math.PI ** 2), 1e-3);
const fv = D.newmark({ T: 0.5, zeta: 0.05, p: Array(3001).fill(1), dt: 0.002 }); near('damped step settles to static', fv.u[3000], 1 / (4 * Math.PI ** 2 / 0.25), 2e-2);
// Eigen: 2-storey shear building m = 1, k = 1 → ω² = (3 ∓ √5)/2
const sb = D.shearBuilding([1, 1], [1, 1]), md = D.modes(sb.K, sb.M); near('2DOF ω1²', md[0].omega ** 2, (3 - Math.sqrt(5)) / 2); near('2DOF ω2²', md[1].omega ** 2, (3 + Math.sqrt(5)) / 2);
near('mass participation sums to 1', md.reduce((a, m) => a + m.ratio, 0), 1);
const J = D.jacobi([[4, 1], [1, 3]]); near('jacobi λ1', J.values[0], (7 - Math.sqrt(5)) / 2);
// Uniform 10-storey: ω1 = 2√(k/m) sin(π/42)
const b = D.B10, bb = D.shearBuilding(b.m, b.k), m10 = D.modes(bb.K, bb.M); near('B-10 T1 (uniform-k closed form, unequal roof mass)', m10[0].T, 1.005, 5e-3);
const un = D.modes(D.shearBuilding(Array(10).fill(1), Array(10).fill(1)).K, Array(10).fill(1)); near('uniform ω1 closed form', un[0].omega, 2 * Math.sin(Math.PI / 42));
// Design spectrum & ELS
near('Sa plateau', D.designSa(0.3, 0.5, 0.29), 0.5); near('Sa at 0', D.designSa(0, 0.5, 0.29), 0.2); near('Sa 1/T', D.designSa(1, 0.5, 0.29), 0.29); near('Sa long', D.designSa(6, 0.5, 0.29), 0.29 * 5 / 36);
near('Ta other', D.Ta(41), 0.0488 * Math.pow(41, 0.75)); near('Ta rcmf', D.Ta(30, 'rcmf'), 0.0466 * Math.pow(30, 0.9));
const e = D.els({ W: b.W, SDS: 0.5, SD1: 0.29, R: 6, Ie: 1.2, T: D.Ta(41), w: b.w, h: b.h });
near('ELS Cs', e.Cs, 0.29 / (5 * D.Ta(41))); near('ELS V', e.V, e.Cs * 68100); near('ELS forces sum', e.F.reduce((a, x) => a + x, 0), e.V); near('ELS base shear = Vx[0]', e.Vx[0], e.V);
near('ELS Cs floor', D.els({ W: 100, SDS: 0.5, SD1: 0.05, R: 8, Ie: 1, T: 5, w: [100], h: [10] }).Cs, 0.044 * 0.5);
// Wind
near('wind speed at 10 m', W.speed(10, 26), 26); near('velocity pressure', W.q(30), 0.5 * 1.22 * 900 / 1000); near('vortex', W.vortexFreq(20, 4, 0.12), 0.6);
// TMD
const t = D.tmdOpt(0.02); near('Den Hartog f', t.fRatio, 1 / 1.02); near('Den Hartog ζ', t.zeta, Math.sqrt(0.06 / (8 * 1.02 ** 3)));
near('no-TMD resonance 1/(2ζ)', D.tmdResponse(1, 1e-9, 3, 0, 0.02), 25, 1e-3);
if (fails) { console.error(`${fails} dynamics check(s) failed`); process.exit(1); }
console.log('Dynamics models match hand calculations');
