/* Copyright (c) 2026 geniuskey and ConstructionBooks contributors. MIT (see ../../LICENSE-MIT).
   Cover frame and motion approach from geniuskey/books (MIT). The construction drawings are new. */
/* 책 표지 일러스트. 카탈로그의 motif 이름 → SVG 문자열(viewBox 0 0 200 130, 흰 선 위주).
   움직임은 ../css/cover-animations.css의 .cs-* 클래스가 맡고, 멈춘 첫 프레임도 완성된 그림이다. */
(function () {
  "use strict";
  const W = "currentColor", Y = "#ffd43b";
  const svg = (body) => `<svg class="cover-art" viewBox="0 0 200 130" aria-hidden="true" focusable="false">${body}</svg>`;
  const f = (v) => +v.toFixed(1);
  const range = (n) => Array.from({ length: n }, (_, i) => i);

  const M = {
    // 구조역학: 등분포 하중이 내리누르는 단순보와 그 아래 포물선 휨모멘트도(wL²/8).
    beam() {
      const x0 = 22, x1 = 178, y = 58;
      let s = `<g class="cs-press">`;
      range(9).forEach((i) => { const x = f(x0 + ((x1 - x0) * i) / 8); s += `<path d="M${x} 22V${y - 6}" stroke="${W}" stroke-width="1.6"/><path d="M${x - 3.5} ${y - 9}L${x} ${y - 3}L${x + 3.5} ${y - 9}" fill="${W}"/>`; });
      s += `<path d="M${x0} 22H${x1}" stroke="${W}" stroke-width="1.6"/></g>`;
      s += `<path d="M${x0} ${y}H${x1}" stroke="${W}" stroke-width="4.5" stroke-linecap="round"/>`;
      s += `<path d="M${x0} ${y + 2}l-8 13h16z" fill="none" stroke="${W}" stroke-width="1.8"/><path d="M${x1} ${y + 2}l-8 11h16z" fill="none" stroke="${W}" stroke-width="1.8"/><circle cx="${x1 - 4}" cy="${y + 16}" r="2.4" fill="none" stroke="${W}" stroke-width="1.4"/><circle cx="${x1 + 4}" cy="${y + 16}" r="2.4" fill="none" stroke="${W}" stroke-width="1.4"/>`;
      const pts = range(41).map((i) => { const t = i / 40, x = x0 + (x1 - x0) * t; return `${f(x)},${f(y + 24 + 34 * 4 * t * (1 - t))}`; }).join(" ");
      s += `<path d="M${x0} ${y + 24}H${x1}" stroke="${W}" stroke-opacity=".45"/>`;
      s += `<polygon class="cs-bmd" points="${x0},${y + 24} ${pts} ${x1},${y + 24}" fill="${Y}" fill-opacity=".28" stroke="${Y}" stroke-width="2"/>`;
      s += `<text x="100" y="${y + 52}" text-anchor="middle" fill="${W}" font-size="10" font-family="monospace">M = wL²/8</text>`;
      return svg(s);
    },
    // 건설재료: 공시체 압축 시험. 위아래 가압판이 누르고 원기둥에 사선 균열이 번쩍인다.
    concrete() {
      let s = `<g class="cs-squeeze"><rect x="62" y="12" width="76" height="9" rx="2" fill="${W}" fill-opacity=".85"/><path d="M100 2V12" stroke="${W}" stroke-width="3"/></g>`;
      s += `<rect x="62" y="110" width="76" height="9" rx="2" fill="${W}" fill-opacity=".85"/>`;
      s += `<rect x="72" y="22" width="56" height="88" rx="4" fill="${W}" fill-opacity=".1" stroke="${W}" stroke-width="2"/>`;
      const rnd = ((seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647))(7);
      range(26).forEach(() => { const x = 76 + rnd() * 48, y = 27 + rnd() * 78, r = 1.4 + rnd() * 3; s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${W}" fill-opacity="${f(0.25 + rnd() * 0.35)}"/>`; });
      s += `<path class="cs-crack" d="M84 30L96 52L90 66L104 88L100 104M118 34L108 58L116 78" fill="none" stroke="${Y}" stroke-width="2" stroke-linejoin="round"/>`;
      s += `<text x="150" y="70" fill="${W}" font-size="10" font-family="monospace">f<tspan font-size="7" dy="2">ck</tspan></text>`;
      return svg(s);
    },
    // 지반공학: 흙의 층 위에 놓인 기초가 내려앉고, 그 아래로 압력 구근이 퍼진다.
    soil() {
      let s = "";
      [56, 76, 98].forEach((y, k) => { s += `<path d="M8 ${y}${range(8).map((i) => `Q${12 + i * 24} ${y - 4 + (k % 2) * 3} ${20 + i * 24} ${y}`).join("")}" fill="none" stroke="${W}" stroke-opacity="${0.55 - k * 0.12}" stroke-width="1.4"/>`; });
      const rnd = ((seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647))(3);
      range(40).forEach(() => { s += `<circle cx="${f(10 + rnd() * 180)}" cy="${f(60 + rnd() * 64)}" r="${f(0.8 + rnd() * 1.4)}" fill="${W}" fill-opacity=".35"/>`; });
      [[16, 10], [30, 19], [46, 30]].forEach(([ry, dy], k) => { s += `<ellipse class="cs-bulb" style="animation-delay:${-k * 0.5}s" cx="100" cy="${52 + dy}" rx="${f(ry * 1.25)}" ry="${ry}" fill="none" stroke="${Y}" stroke-width="1.6" stroke-opacity="${0.9 - k * 0.22}"/>`; });
      s += `<g class="cs-settle"><rect x="78" y="34" width="44" height="18" fill="${W}" fill-opacity=".9"/><path d="M100 4V30" stroke="${W}" stroke-width="2.4"/><path d="M95 24L100 33L105 24" fill="${W}"/></g>`;
      s += `<path d="M8 52H78M122 52H192" stroke="${W}" stroke-width="2"/>`;
      return svg(s);
    },
    // 건축구조: 바람을 받아 흔들리는 고층 라멘 골조와 코어.
    tower() {
      let s = `<g class="cs-wind">`;
      [30, 52, 74].forEach((y, k) => { s += `<path d="M6 ${y}H44" stroke="${W}" stroke-opacity=".6" stroke-width="1.6" stroke-dasharray="7 5"/><path d="M40 ${y - 4}L47 ${y}L40 ${y + 4}" fill="none" stroke="${W}" stroke-opacity=".6" stroke-width="1.6"/>`; });
      s += `</g><g class="cs-sway">`;
      const xs = [70, 100, 130], ys = range(11).map((i) => 120 - i * 10.5);
      ys.forEach((y) => { s += `<path d="M70 ${f(y)}H130" stroke="${W}" stroke-width="1.6"/>`; });
      xs.forEach((x) => { s += `<path d="M${x} 120V${f(ys[10])}" stroke="${W}" stroke-width="2.2"/>`; });
      s += `<rect x="92" y="${f(ys[10])}" width="16" height="${f(120 - ys[10])}" fill="${Y}" fill-opacity=".3" stroke="${Y}" stroke-width="1.4"/>`;
      s += `</g><path d="M50 121H150" stroke="${W}" stroke-width="2.4"/>`;
      s += `<path d="M152 120Q160 70 172 18" fill="none" stroke="${W}" stroke-opacity=".5" stroke-dasharray="3 3"/><text x="156" y="12" fill="${W}" font-size="9" font-family="monospace">Δ</text>`;
      return svg(s);
    },
    // 철근콘크리트: 보 단면의 철근·스터럽과 압축측 등가 응력 블록.
    rebar() {
      let s = `<rect x="56" y="12" width="64" height="106" rx="2" fill="${W}" fill-opacity=".1" stroke="${W}" stroke-width="2.2"/>`;
      s += `<rect x="63" y="19" width="50" height="92" rx="5" fill="none" stroke="${W}" stroke-width="1.6" stroke-opacity=".8"/>`;
      [70, 82, 94, 106].forEach((x) => { s += `<circle cx="${x}" cy="103" r="4.6" fill="${W}"/>`; });
      s += `<circle cx="70" cy="27" r="3" fill="${W}" fill-opacity=".8"/><circle cx="106" cy="27" r="3" fill="${W}" fill-opacity=".8"/>`;
      s += `<path d="M132 12V118" stroke="${W}" stroke-opacity=".5"/>`;
      s += `<rect class="cs-block" x="132" y="12" width="30" height="30" fill="${Y}" fill-opacity=".35" stroke="${Y}" stroke-width="1.6"/>`;
      s += `<path d="M132 103H176" stroke="${W}" stroke-width="2"/><path d="M170 99L177 103L170 107" fill="${W}"/>`;
      s += `<text x="140" y="56" fill="${W}" font-size="9" font-family="monospace">0.85f<tspan font-size="6.5" dy="2">ck</tspan></text><text x="150" y="96" fill="${W}" font-size="9" font-family="monospace">T</text>`;
      return svg(s);
    },
    // 교량: 사장교. 주탑에서 내려온 케이블이 상판을 잡고, 차 한 대가 건너간다.
    bridge() {
      let s = `<path d="M4 92H196" stroke="${W}" stroke-width="4" stroke-linecap="round"/>`;
      s += `<path d="M100 92V14M100 92V122" stroke="${W}" stroke-width="5"/>`;
      range(6).forEach((i) => { const d = 14 + i * 14; s += `<path d="M100 ${20 + i * 4}L${100 - d * 1.15} 92M100 ${20 + i * 4}L${100 + d * 1.15} 92" stroke="${W}" stroke-width="1.2" stroke-opacity=".85"/>`; });
      s += `<path d="M4 118Q50 108 100 118T196 118" fill="none" stroke="${W}" stroke-opacity=".35" stroke-width="1.4"/>`;
      s += `<g class="cs-drive"><rect x="8" y="80" width="20" height="9" rx="3" fill="${Y}"/><circle cx="13" cy="90" r="2.4" fill="${W}"/><circle cx="23" cy="90" r="2.4" fill="${W}"/></g>`;
      return svg(s);
    },
    // 시공: 타워크레인의 트롤리가 지브를 오가고 갈고리가 부재를 들어 올린다.
    crane() {
      let s = `<path d="M58 124V22M70 124V22" stroke="${W}" stroke-width="2"/>`;
      range(10).forEach((i) => { const y = 124 - i * 10.2; s += `<path d="M58 ${f(y)}L70 ${f(y - 10.2)}M70 ${f(y)}L58 ${f(y - 10.2)}" stroke="${W}" stroke-width="1" stroke-opacity=".7"/>`; });
      s += `<path d="M30 22H190M30 30H190" stroke="${W}" stroke-width="2"/>`;
      range(16).forEach((i) => { const x = 30 + i * 10; s += `<path d="M${x} 30L${x + 10} 22" stroke="${W}" stroke-width="1" stroke-opacity=".7"/>`; });
      s += `<path d="M64 22L64 6L30 22M64 6L190 22" stroke="${W}" stroke-width="1.2" stroke-opacity=".8"/>`;
      s += `<rect x="30" y="32" width="18" height="12" fill="${W}" fill-opacity=".8"/>`;
      s += `<g class="cs-trolley"><rect x="118" y="30" width="12" height="5" fill="${W}"/><path class="cs-hoist" d="M124 35V78" stroke="${W}" stroke-width="1.2"/><g class="cs-load"><path d="M118 80H130L124 74z" fill="${W}"/><rect x="104" y="80" width="40" height="7" fill="${Y}"/></g></g>`;
      s += `<path d="M20 125H180" stroke="${W}" stroke-width="2.4"/>`;
      return svg(s);
    },
    // BIM·디지털 건설: 아이소메트릭 건물 모델의 층이 차례로 켜지고 스캔선이 지나간다.
    bim() {
      const iso = (x, y, z) => [100 + (x - y) * 0.87 * 1, 104 + (x + y) * 0.5 - z];
      const P = (x, y, z) => iso(x, y, z).map(f).join(",");
      let s = "";
      const w = 44, d = 34;
      range(5).forEach((k) => {
        const z = k * 16;
        s += `<polygon class="cs-floor" style="animation-delay:${k * 0.35}s" points="${P(0, 0, z)} ${P(w, 0, z)} ${P(w, d, z)} ${P(0, d, z)}" fill="${Y}" fill-opacity=".12" stroke="${W}" stroke-width="1.3"/>`;
      });
      [[0, 0], [w, 0], [w, d], [0, d]].forEach(([x, y]) => { s += `<path d="M${P(x, y, 0)}L${P(x, y, 64)}" stroke="${W}" stroke-width="1.8"/>`; });
      s += `<polygon points="${P(14, 10, 0)} ${P(28, 10, 0)} ${P(28, 22, 0)} ${P(14, 22, 0)}" fill="${W}" fill-opacity=".25"/>`;
      s += `<path class="cs-scan" d="M18 70H182" stroke="${Y}" stroke-width="2" stroke-opacity=".9"/>`;
      s += `<text x="150" y="18" fill="${W}" font-size="9" font-family="monospace">IFC</text>`;
      return svg(s);
    },
  };

  window.coverArt = (motif) => (M[motif] || M.beam)();
})();
