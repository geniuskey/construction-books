// Copyright (c) 2026 geniuskey and ConstructionBooks contributors. MIT.
// Load civil/js/common.js with a stub DOM and check the civil infrastructure models (CivilBook) against hand calculations.
const fs = require('fs'), vm = require('vm'), path = process.argv[2] || require('path').join(__dirname, '../civil/js/common.js');
const noop = () => {};
const el = { getAttribute: () => null, setAttribute: noop, removeAttribute: noop, style: {}, classList: { add: noop, toggle: noop } };
const sandbox = { console, Math, Number, Object, Array, Set, Map, JSON, isFinite, Promise, String, Error, Float64Array,
  localStorage: { getItem: () => null, setItem: noop }, matchMedia: () => ({ matches: false, addEventListener: noop }),
  document: { readyState: 'loading', addEventListener: noop, documentElement: el, currentScript: { src: 'http://x/civil/js/common.js' }, head: { append: noop }, createElement: () => ({}) },
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
const C = CB.civ;
// Influence lines and truck scan: single 100 kN axle reproduces PL/4
const one = { axles: [{ x: 0, P: 100 }] }; near('single axle mid moment', C.truckScan(20, C.ilSimple(20, 'M', 10), one, 0.05).max, 100 * 20 / 4, 1e-3);
near('IL reaction at x=0', C.ilSimple(10, 'RA')(0), 1); near('impact cap', C.impact(5), 0.3);
// Cables
const cb = C.cable(100, 400, 40); near('H = wL²/8f', cb.H, 100 * 160000 / 320); near('Tmax', cb.Tmax, cb.H * Math.sqrt(1 + 16 * 0.01)); near('stay T', C.stay(1000, 30).T, 2000);
// Kirsch
near('Kirsch K=1 wall', C.kirsch(1, 1, 5, 5, 30).st, 2); near('Kirsch K=0 springline', C.kirsch(1, 0, 5, 5, 0).st, 3); near('Kirsch K=0 crown', C.kirsch(1, 0, 5, 5, 90).st, -1); near('Kirsch K=1 r=2a', C.kirsch(1, 1, 5, 10, 0).st, 1.25); near('Kirsch radial at wall', C.kirsch(1, 0.5, 5, 5, 40).sr, 0, 1e-9);
// Ground reaction curve: elastic part u = a(p0 − pi)/2G
const g = C.grc({ p0: 1.44, E: 2000, nu: 0.25, c: 0.35, phi: 33, a: 5.5 }), G = 2000 / 2.5; near('GRC elastic', g.at(1.2).u, (5.5 * 0.24) / (2 * G)); near('GRC pcr', g.pcr, (2 * 1.44 - g.scm) / (1 + g.k)); near('GRC continuity at pcr', g.at(g.pcr - 1e-9).u, g.ucr, 1e-4);
// Roads
near('SSD', C.ssd(60), 60 * 2.5 / 3.6 + 3600 / (254 * 0.33)); near('Rmin', C.rMin(60, 0.06, 0.15), 3600 / (127 * 0.21)); near('curve T', C.curve(200, 30).T, 200 * Math.tan(Math.PI / 12)); near('curve Lc', C.curve(200, 90).Lc, 100 * Math.PI);
const vc = C.vcurve(4, -2, 200, 100); near('vcurve end slope', (vc.elev(200) - vc.elev(199.99)) / 0.01 * 100, -2, 1e-3); near('vcurve turn', vc.xTurn, 4 / 6 * 200, 1e-6);
near('greenshields capacity', C.greenshields(60).qmax, 80 * 120 / 4);
// Pavement
near('ESAL 4th power', C.esal(160), 16); near('SN inverse', C.w18(C.sn(5e6)), 5e6, 1e-6); near('SN layers', C.snLayers([{ a: 0.44, D: 4 }, { a: 0.14, D: 8, m: 1 }]), 1.76 + 1.12);
// Hydraulics
const mn = C.manning({ b: 10, y: 2, z: 0, n: 0.02, S: 0.001 }); near('manning V', mn.V, (Math.pow(20 / 14, 2 / 3) * Math.sqrt(0.001)) / 0.02); near('normal depth inverse', C.normalDepth(mn.Q, { b: 10, z: 0, n: 0.02, S: 0.001 }), 2, 1e-6); near('rational', C.rational(0.5, 36, 2), 10);
if (fails) { console.error(`${fails} civil check(s) failed`); process.exit(1); }
console.log('Civil models match hand calculations');
