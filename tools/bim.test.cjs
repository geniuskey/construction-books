// Copyright (c) 2026 geniuskey and ConstructionBooks contributors. MIT.
// Load bim/js/common.js with a stub DOM and check the BIM and digital-construction models (BIMBook) against hand calculations.
const fs = require('fs'), vm = require('vm'), path = process.argv[2] || require('path').join(__dirname, '../bim/js/common.js');
const noop = () => {};
const el = { getAttribute: () => null, setAttribute: noop, removeAttribute: noop, style: {}, classList: { add: noop, toggle: noop } };
const sandbox = { console, Math, Number, Object, Array, Set, Map, JSON, isFinite, Promise, String, Error, Float64Array,
  localStorage: { getItem: () => null, setItem: noop }, matchMedia: () => ({ matches: false, addEventListener: noop }),
  document: { readyState: 'loading', addEventListener: noop, documentElement: el, currentScript: { src: 'http://x/bim/js/common.js' }, head: { append: noop }, createElement: () => ({}) },
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
const B = CB.bim;
// Model and clashes
const m = B.model(); near('element count', m.length, 360); const q = B.qto(m); near('columns', q.IfcColumn.count, 200); near('slab volume per floor', q.IfcSlab.volume / 10, 32.8 * 24.8 * 0.21);
near('duct–beam hard clashes', B.clashes(m, ['IfcDuctSegment'], ['IfcBeam']).filter((c) => c.type === 'hard').length, 30);
near('duct lowered clears beams', B.clashes(B.model({ ductDrop: 0.95 }), ['IfcDuctSegment'], ['IfcBeam']).length, 0);
const ov = B.overlap([0, 0, 0, 2, 2, 2], [1, 1, 1, 3, 3, 3]); near('overlap volume', ov.volume, 1); near('overlap depth', ov.depth, 1);
const so = B.overlap([0, 0, 0, 1, 1, 1], [1.02, 0, 0, 2, 1, 1], 0.05); near('soft clash', so.soft ? 1 : 0, 1); near('gap', so.gap, 0.02);
near('guid length', B.guid('a').length, 22); near('guid deterministic', B.guid('B-10') === B.guid('B-10') ? 1 : 0, 1);
// Geometry
const bm = B.boxMesh([0, 0, 0, 2, 3, 4]); near('mesh volume', B.meshVolume(bm.V, bm.F), 24); near('mesh area', B.meshArea(bm.V, bm.F), 52);
const M = B.mat.mul(B.mat.T(10, 0, 0), B.mat.Rz(90)); const pp = B.mat.apply(M, [1, 0, 0]); near('Rz then T x', pp[0], 10, 1e-9); near('Rz then T y', pp[1], 1, 1e-9);
const mp = B.toMap(10, 5), back = B.toLocal(mp.E, mp.N); near('georef round trip x', back.x, 10, 1e-9); near('georef round trip y', back.y, 5, 1e-9); near('georef origin', B.toMap(0, 0).E, 203450);
// Registration, plane fit, Kalman, STEP
const rg = B.rigid2D([[0, 0], [1, 0], [0, 1]], [[1, 1], [1, 2], [0, 1]]); near('rigid theta', rg.theta, 90, 1e-9); near('rigid tx', rg.tx, 1, 1e-9);
const pf = B.planeFit([[0, 0, 2], [1, 0, 2], [0, 1, 2], [1, 1, 2]]); near('plane normal z', Math.abs(pf.n[2]), 1, 1e-9); near('plane d', Math.abs(pf.d), 2, 1e-9);
const kf = B.kalman1D(Array(200).fill(5), 0, 1, 0, 100); near('kalman converges', kf.x[199], 5, 1e-3);
const st = B.parseStep("#1=IFCPROJECT('g',$,'B-10',$,$,$,$,(#2),#3);"); near('step refs', st[1].refs.length, 2); near('step args', st[1].args.length, 9);
if (fails) { console.error(`${fails} BIM check(s) failed`); process.exit(1); }
console.log('BIM models match hand calculations');
