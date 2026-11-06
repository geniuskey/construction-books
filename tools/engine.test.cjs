// Copyright (c) 2026 geniuskey and ConstructionBooks contributors. MIT.
// Load mechanics/js/common.js with a stub DOM and check the structural solver against closed-form results. Usage: node tools/engine.test.cjs [common.js]
const fs = require('fs'), vm = require('vm'), path = process.argv[2] || require('path').join(__dirname, '../mechanics/js/common.js');
const noop = () => {};
const el = { getAttribute: () => null, setAttribute: noop, removeAttribute: noop, style: {}, classList: { add: noop, toggle: noop } };
const sandbox = { console, Math, Number, Object, Array, Set, Map, JSON, isFinite, Promise, String, Error, Float64Array,
  localStorage: { getItem: () => null, setItem: noop },
  matchMedia: () => ({ matches: false, addEventListener: noop }),
  document: { readyState: 'loading', addEventListener: noop, documentElement: el, currentScript: { src: 'http://x/mechanics/js/common.js' }, head: { append: noop }, createElement: () => ({}) },
  getComputedStyle: () => ({ getPropertyValue: () => '' }), URL, requestAnimationFrame: noop };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path, 'utf8'), sandbox);
const CB = sandbox.CB;
let fails = 0;
const near = (name, got, want, rel = 1e-6) => {
  const ok = Math.abs(got - want) <= rel * Math.max(1, Math.abs(want));
  if (!ok) fails++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: ${got.toPrecision(7)} (want ${want.toPrecision(7)})`);
};
const EI = 1e5;
// 1 simple beam UDL
let b = CB.beam({ L: 8, EI, supports: [{ x: 0, type: 'pin' }, { x: 8, type: 'roller' }], loads: [{ type: 'udl', w: 10 }] });
near('simple UDL R', b.reactions[0].R, 40); near('simple UDL Mmid', b.at(4).M, 80); near('simple UDL defl', b.at(4).v, -5 * 10 * 8 ** 4 / (384 * EI));
near('simple UDL end slope', b.at(0, 1).theta, -10 * 8 ** 3 / (24 * EI), 1e-3); near('simple UDL V(0+)', b.at(0, 1).V, 40); near('simple UDL V(8-)', b.at(8, -1).V, -40);
// 2 cantilever tip load
b = CB.beam({ L: 4, EI, supports: [{ x: 0, type: 'fixed' }], loads: [{ type: 'point', P: 10, a: 4 }] });
near('cantilever M(0)', b.at(0, 1).M, -40); near('cantilever tip slope', b.at(4).theta, -10 * 16 / (2 * EI), 1e-3); near('cantilever tip', b.at(4).v, -10 * 64 / (3 * EI)); near('cantilever reaction M', b.reactions[0].M, 40);
// 3 propped cantilever UDL
b = CB.beam({ L: 6, EI, supports: [{ x: 0, type: 'fixed' }, { x: 6, type: 'roller' }], loads: [{ type: 'udl', w: 12 }] });
near('propped R_B', b.reactions[1].R, 3 * 12 * 6 / 8); near('propped M_A', b.at(0, 1).M, -12 * 36 / 8);
// 4 two equal spans UDL
b = CB.beam({ L: 16, EI, supports: [{ x: 0, type: 'pin' }, { x: 8, type: 'roller' }, { x: 16, type: 'roller' }], loads: [{ type: 'udl', w: 10 }] });
near('2-span mid R', b.reactions[1].R, 1.25 * 10 * 8); near('2-span M_B', b.at(8).M, -10 * 64 / 8);
// 5 midspan point load
b = CB.beam({ L: 10, EI, supports: [{ x: 0, type: 'pin' }, { x: 10, type: 'roller' }], loads: [{ type: 'point', P: 100, a: 5 }] });
near('point mid M', b.at(5).M, 250); near('point mid defl', b.at(5).v, -100 * 1000 / (48 * EI));
// 6 off-centre point load on member (not at a node) and linear load
b = CB.beam({ L: 10, EI, supports: [{ x: 0, type: 'pin' }, { x: 10, type: 'roller' }], loads: [{ type: 'point', P: 60, a: 3 }] });
near('point a=3 R_A', b.reactions[0].R, 60 * 7 / 10); near('point a=3 M', b.at(3).M, 60 * 3 * 7 / 10);
b = CB.beam({ L: 9, EI, supports: [{ x: 0, type: 'pin' }, { x: 9, type: 'roller' }], loads: [{ type: 'lin', w1: 0, w2: 30, a: 0, b: 9 }] });
near('triangle R_A', b.reactions[0].R, 30 * 9 / 6); near('triangle Mmax', b.extremes().Mmax.v, 30 * 81 / (9 * Math.sqrt(3)), 1e-4);
// 7 Gerber beam: fixed at 0, hinge at 4, roller at 10, UDL 10
b = CB.beam({ L: 10, EI, supports: [{ x: 0, type: 'fixed' }, { x: 10, type: 'roller' }], hinges: [4], loads: [{ type: 'udl', w: 10 }] });
near('gerber R_C', b.reactions[1].R, 30); near('gerber M(hinge)', b.at(4).M, 0); near('gerber M_A', b.at(0, 1).M, -(30 * 4 + 10 * 16 / 2));
// 8 instability: two rollers, and a hinge-mechanism
b = CB.beam({ L: 6, EI, supports: [{ x: 0, type: 'roller' }, { x: 6, type: 'roller' }], loads: [{ type: 'udl', w: 5 }] });
console.log(b.ok ? 'FAIL two rollers should be unstable' : 'ok   two rollers unstable'); if (b.ok) fails++;
b = CB.beam({ L: 6, EI, supports: [{ x: 0, type: 'pin' }, { x: 6, type: 'roller' }], hinges: [3], loads: [{ type: 'udl', w: 5 }] });
console.log(b.ok ? 'FAIL hinged simple beam should be unstable' : 'ok   hinged simple beam unstable'); if (b.ok) fails++;
// 9 fixed-fixed settlement
b = CB.beam({ L: 5, EI, supports: [{ x: 0, type: 'fixed' }, { x: 5, type: 'fixed' }], settle: [{ x: 5, dy: -0.01 }] });
near('settlement M_A', Math.abs(b.at(0, 1).M), 6 * EI * 0.01 / 25);
// 10 truss: 2-bar triangle with apex load
let t = CB.truss({ nodes: [[0, 0], [4, 3], [8, 0]], bars: [[0, 1], [1, 2], [0, 2]], supports: { 0: 'pin', 2: 'roller' }, loads: [{ node: 1, fy: -60 }], EA: 1e6 });
near('truss diag N', t.N[0], -50); near('truss chord N', t.N[2], 40);
// 11 Pratt truss T-36 (6 panels of 6 m, h = 4.5 m), 60 kN at each interior bottom node
const nodes = [], bars = [];
for (let k = 0; k <= 6; k++) nodes.push([6 * k, 0]);
for (let k = 1; k <= 5; k++) nodes.push([6 * k, 4.5]);
const top = (k) => 6 + k; // top node index for k = 1..5
for (let k = 0; k < 6; k++) bars.push([k, k + 1]);
for (let k = 1; k < 5; k++) bars.push([top(k), top(k + 1)]);
for (let k = 1; k <= 5; k++) bars.push([k, top(k)]);
bars.push([0, top(1)]); bars.push([top(5), 6]);
bars.push([top(1), 2]); bars.push([top(2), 3]); bars.push([top(4), 3]); bars.push([top(5), 4]);
t = CB.truss({ nodes, bars, supports: { 0: 'pin', 6: 'roller' }, loads: [1, 2, 3, 4, 5].map((n) => ({ node: n, fy: -60 })), EA: 1e6 });
const R = 150, Mmid = R * 18 - 60 * (12 + 6);
near('pratt top chord at middle', t.N[bars.findIndex(([a, c]) => a === top(3) && c === top(4))], -Mmid / 4.5);
near('pratt end diagonal', t.N[bars.findIndex(([a, c]) => a === 0 && c === top(1))], -R / (4.5 / Math.hypot(6, 4.5)));
// 12 three-hinged portal: columns 0-1 (0,0)-(0,4), beam 1-2-3 with hinge at mid (node 2), column 3-4; UDL 10 on beam (span 8)
let f = CB.frame({ nodes: [[0, 0], [0, 4], [4, 4], [8, 4], [8, 0]],
  members: [{ i: 0, j: 1 }, { i: 1, j: 2, hinge: [false, true] }, { i: 2, j: 3 }, { i: 3, j: 4 }], E: 2e8, A: 0.01, I: 1e-4,
  supports: { 0: 'pin', 4: 'pin' }, memberLoads: [{ member: 1, w: [0, -10] }, { member: 2, w: [0, -10] }] });
near('3-hinge thrust H', Math.abs(f.reactions[0][0]), 10 * 64 / (8 * 4)); near('3-hinge V', f.reactions[0][1], 40);
near('3-hinge M knee', Math.abs(f.ends[0].M2), 10 * 64 / 8);
// 13 sections
let s = CB.section.rect(300, 600); near('rect I', s.Ix, 300 * 600 ** 3 / 12); near('rect Z', s.Zx, 300 * 600 ** 2 / 4);
s = CB.section.H(400, 200, 8, 13); near('H-400x200 A (no fillet)', s.A, 2 * 200 * 13 + 8 * 374); near('H I', s.Ix, (200 * 400 ** 3 - 192 * 374 ** 3) / 12);
s = CB.section.tee(200, 20, 220, 12); const A = 200 * 20 + 12 * 200, yb = (12 * 200 * 100 + 200 * 20 * 210) / A; near('tee centroid', s.cy, yb);
let q = CB.section.shear(CB.section.rect(100, 200), 100); near('rect Q at NA', q.Q, 100 * 100 * 50); near('rect b', q.b, 100);
console.log(fails ? `\n${fails} FAILED` : '\nall passed');
process.exit(fails ? 1 : 0);
