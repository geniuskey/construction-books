/* ==========================================================================
   StructureBook 공통 스크립트 — 전역 객체 CB (ConstructionBooks 엔진, MathBook 엔진 기반)
   - 레이아웃(상단바, 검색, 목차, 이전/다음, 테마) 자동 생성
   - 시뮬레이터 헬퍼: canvas, chart, plane(드래그 가능한 좌표 평면), orbit(돌려 보는 3D), range, seg, check, 포맷/난수
   - 수학: 행렬(CB.mat), ODE(CB.rk4), 통계 분포, 색 지도
   - 구조 해석: CB.frame(2차원 골조·트러스 강성법), CB.section(단면 성질), CB.drawFrame(구조물·하중·단면력도 그리기)
   이 파일은 <head>에서 defer 없이 로드된다. 페이지 스크립트는 </body> 직전에 둔다.
   ========================================================================== */
(function () {
  "use strict";

  // planned: true인 장은 목차에만 보이고 링크·검색·이전/다음에서 빠진다(집필 예정).
  const CHAPTERS = [
    { slug: "overview",         num: "01", part: "제1부 구조 시스템", title: "건축 구조의 이해",                desc: "건물의 뼈대가 하는 일. 구조 형식의 분류, 구조 계획의 순서, 한계상태와 강도 설계, 기준 건물 B-10의 구조 계획과 이 책의 지도.", tags: ["구조 계획", "sim"] },
    { slug: "loads",            num: "02", part: "제1부 구조 시스템", title: "설계 하중과 하중 조합",          desc: "무엇을 얼마나 견뎌야 하나. 고정·활하중과 활하중 저감, 적설·풍·지진 하중의 개요, 하중 조합과 계수, 신뢰도와 안전율.", tags: ["하중", "sim"] },
    { slug: "floors",           num: "03", part: "제1부 구조 시스템", title: "바닥 구조",                      desc: "하중이 처음 닿는 곳. 1방향·2방향 슬래브, 플랫 플레이트와 펀칭, 데크 합성 슬래브, 보 배치, 바닥 진동과 처짐.", tags: ["바닥", "sim"] },
    { slug: "frames",           num: "04", part: "제1부 구조 시스템", title: "모멘트 골조",                    desc: "기둥과 보가 함께 휜다. 수평 하중 아래 골조 거동, 포털법·캔틸레버법, 층 강성과 층간 변위, 강기둥–약보, P–Δ 효과.", tags: ["골조", "sim"] },
    { slug: "walls",            num: "05", part: "제1부 구조 시스템", title: "전단벽·코어·튜브",               desc: "높아질수록 벽이 필요하다. 전단벽과 코어, 벽–골조 상호작용, 아웃리거와 벨트 트러스, 튜브 구조, 높이에 따른 구조 시스템.", tags: ["전단벽", "sim"] },
    { slug: "wind",             num: "06", part: "제2부 횡하중과 동역학", title: "풍하중과 바람의 영향",       desc: "바람은 건물을 밀고 흔든다. 기본 풍속과 높이 분포, 속도압과 풍압 계수, 가스트, 와류 진동, 건물 가속도와 거주성, 풍동 실험.", tags: ["바람", "sim"] },
    { slug: "dynamics",         num: "07", part: "제2부 횡하중과 동역학", title: "구조 동역학",                desc: "흔들리는 건물의 수학. 1자유도 진동과 감쇠, 공진, 지진 응답과 응답 스펙트럼, 다자유도 모드 해석, B-10의 고유 주기.", tags: ["진동", "sim"] },
    { slug: "seismic",          num: "08", part: "제2부 횡하중과 동역학", title: "내진 설계",                  desc: "지진에 버티는 법. 설계 응답 스펙트럼, 반응수정계수와 연성, 등가 정적 해석, 층간 변위, 비정형성, 내진 상세, 성능 기반 설계.", tags: ["내진", "sim"] },
    { slug: "isolation",        num: "09", part: "제2부 횡하중과 동역학", title: "면진과 제진",                desc: "흔들림을 피하고 흡수한다. 면진의 주기 이동, 적층 고무 받침, 점성·마찰·이력 감쇠기, 동조 질량 감쇠기, 성능 비교.", tags: ["면진·제진", "sim"] },
    { slug: "steel-structures", num: "10", part: "제3부 구조 형식", title: "강구조 시스템",                    desc: "가볍고 강한 뼈대. 강구조 골조 형식, 인장·압축·휨 부재의 설계 개념, 볼트·용접 접합, 가새 골조, 좌굴 보강, 내화 피복.", tags: ["강구조", "sim"] },
    { slug: "composite",        num: "11", part: "제3부 구조 형식", title: "합성 구조와 프리캐스트",            desc: "두 재료가 함께 일한다. 합성보와 전단 연결재, 유효 폭, CFT 기둥, SRC, 프리캐스트 콘크리트와 접합, 프리스트레스 개념.", tags: ["합성", "sim"] },
    { slug: "long-span",        num: "12", part: "제3부 구조 형식", title: "대공간 구조",                      desc: "기둥 없이 넓게. 트러스와 스페이스 프레임, 아치와 볼트, 쉘과 돔, 케이블·막 구조, 형태 저항과 깊이–경간 비.", tags: ["대공간", "sim"] },
    { slug: "timber-modular",   num: "13", part: "제3부 구조 형식", title: "목구조와 모듈러 건축",              desc: "공장에서 만들어 현장에서 세운다. 경골 목구조와 매스 팀버, CLT 벽식 구조, 접합부, 모듈러 유닛의 구조와 운송·양중.", tags: ["목구조", "sim"] },
    { slug: "modeling",         num: "14", part: "제4부 설계와 성능", title: "구조 해석 모델링",               desc: "건물을 컴퓨터에 옮기는 법. 3차원 모델, 강막 가정, 질량 중심과 강성 중심, 비틀림, 해석 결과 검증과 흔한 실수.", tags: ["모델링", "sim"] },
    { slug: "serviceability",   num: "15", part: "제4부 설계와 성능", title: "사용성",                         desc: "무너지지 않아도 불편하면 실패다. 처짐과 균열, 보행 진동과 보도교 진동, 기둥 축소, 신축 이음, 거주성 기준.", tags: ["사용성", "sim"] },
    { slug: "assessment",       num: "16", part: "제4부 설계와 성능", title: "화재·연쇄 붕괴와 보강",            desc: "예상 밖의 상황에서. 화재와 내화 설계, 연쇄 붕괴와 대체 하중 경로, 안전 진단과 내력 평가, 보수·보강 공법.", tags: ["안전", "sim"] },
    { slug: "glossary",         num: "17", part: "부록", title: "용어집 & 종합 퀴즈",                                desc: "건축구조 용어를 검색하고, 공식·수치 한눈표와 장별 종합 문제로 실력을 점검하자.", tags: ["정리"] },
  ];

  const CB = (window.CB = {});
  CB.CHAPTERS = CHAPTERS;
  const LIVE = CHAPTERS.filter((c) => !c.planned);
  CB.LIVE_CHAPTERS = LIVE;


  /* ------------------------------------------------------------ math utils */
  CB.clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  CB.lerp = (a, b, t) => a + (b - a) * t;
  CB.map = (x, a, b, c, d) => c + ((x - a) * (d - c)) / (b - a);
  CB.smooth = (a, b, x) => { const t = CB.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  CB.randn = function () {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  CB.poisson = function (lambda) {
    if (lambda <= 0) return 0;
    if (lambda > 40) return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * CB.randn()));
    const L = Math.exp(-lambda);
    let k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > L);
    return k - 1;
  };
  /** 시드 고정 난수 (장면 텍스처가 매번 같게) */
  CB.rng = function (seed = 1) {
    let s = seed >>> 0 || 1;
    const r = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    r.range = (a, b) => a + (b - a) * r();
    r.pick = (arr) => arr[Math.floor(r() * arr.length)];
    return r;
  };
  /** 숫자 포맷: 유효 자리 */
  CB.fmt = function (x, digits = 3) {
    if (!isFinite(x)) return "—";
    if (x === 0) return "0";
    const a = Math.abs(x);
    if (a >= 1e6 || a < 1e-3) return x.toExponential(digits - 1).replace("e+", "e");
    return Number(x.toPrecision(digits)).toLocaleString("en-US", { maximumFractionDigits: 6 });
  };
  /** 부호 포함 (±) 포맷 */
  CB.signed = (x, d = 1) => (x > 0.0001 ? "+" : x < -0.0001 ? "−" : "±") + Math.abs(x).toFixed(d);

  /* ------------------------------------------------------------ theme */
  const themeCbs = [];
  CB.onTheme = (cb) => themeCbs.push(cb);
  CB.isDark = function () {
    const t = document.documentElement.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  };
  CB.color = function (name) {
    return getComputedStyle(document.documentElement).getPropertyValue("--" + name).trim();
  };
  CB.palette = function () {
    const c = CB.color;
    return {
      bg: c("canvas-bg"), text: c("text"), dim: c("text-dim"), faint: c("text-faint"),
      grid: c("grid"), axis: c("axis"), border: c("border"), surface: c("surface"), elev: c("bg-elev"),
      accent: c("accent"), accent2: c("accent-2"), ok: c("ok"), warn: c("warn"), bad: c("bad"),
      red: c("red"), green: c("green"), blue: c("blue"),
      tension: c("tension"), compression: c("compression"),
      series: [c("accent"), c("accent-2"), c("warn"), c("ok"), c("bad"), c("text-dim")],
    };
  };
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
    themeCbs.forEach((cb) => { try { cb(); } catch (e) { console.error(e); } });
  }
  try { const saved = localStorage.getItem("construction-theme"); if (saved) document.documentElement.setAttribute("data-theme", saved); } catch (e) {}
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
      if (!document.documentElement.getAttribute("data-theme")) applyTheme(null);
    });
  }

  /* ------------------------------------------------------------ canvas helper */
  /**
   * HiDPI 캔버스. 폭은 부모 폭을 따르고 높이는 aspect(높이/폭) 또는 height(px)로 결정.
   *   const cv = CB.canvas(el, (ctx,w,h)=>{...}, {aspect:0.5, maxHeight: 420});  aspect는 폭→비율 함수도 가능
   */
  CB.canvas = function (canvas, draw, opts = {}) {
    if (typeof canvas === "string") canvas = document.querySelector(canvas);
    const ctx = canvas.getContext("2d");
    const st = { ctx, w: 0, h: 0, canvas, dpr: 1 };
    function resize() {
      const parent = canvas.parentElement;
      const w = Math.max(200, Math.floor(opts.width || parent.clientWidth || 600));
      let h = opts.height || Math.round(w * (typeof opts.aspect === "function" ? opts.aspect(w) : opts.aspect || 0.5));
      if (opts.minHeight) h = Math.max(h, opts.minHeight);
      if (opts.maxHeight) h = Math.min(h, opts.maxHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      st.w = w; st.h = h; st.dpr = dpr;
      st.redraw();
    }
    st.redraw = function () {
      if (!st.w) return;
      ctx.save();
      ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
      if (!opts.noClear) {
        ctx.clearRect(0, 0, st.w, st.h);
        ctx.fillStyle = CB.color("canvas-bg");
        ctx.fillRect(0, 0, st.w, st.h);
      }
      try { draw && draw(ctx, st.w, st.h); } finally { ctx.restore(); }
    };
    st.resize = resize;
    if (window.ResizeObserver) {
      let lastW = -1;
      new ResizeObserver(() => { const w = canvas.parentElement.clientWidth; if (w !== lastW) { lastW = w; resize(); } }).observe(canvas.parentElement);
    } else window.addEventListener("resize", resize);
    CB.onTheme(() => st.redraw());
    resize();
    return st;
  };

  /** 화면에 보일 때만 도는 애니메이션 루프. fn(dt초, t초) */
  CB.loop = function (el, fn) {
    let raf = 0, last = 0, t = 0, visible = true, running = true;
    function frame(ts) {
      raf = 0;
      if (!running || !visible) return;
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016;
      last = ts; t += dt;
      fn(dt, t);
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && running && visible) { last = 0; raf = requestAnimationFrame(frame); } }
    if (window.IntersectionObserver && el) {
      new IntersectionObserver((es) => { visible = es[0].isIntersecting; kick(); }).observe(el);
    }
    kick();
    return {
      start() { running = true; kick(); },
      stop() { running = false; },
      get running() { return running; },
      toggle() { running ? (running = false) : ((running = true), kick()); return running; },
    };
  };

  /** 다음 프레임에 한 번만 실행 (슬라이더 입력 폭주 방지) */
  CB.throttle = function (fn) {
    let pending = false;
    return function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => { pending = false; fn(); });
    };
  };

  /* ------------------------------------------------------------ chart helper */
  /**
   * 간단한 선 그래프. box = {x,y,w,h}(생략 시 캔버스 전체에 여백 자동)
   * opts: { x:[min,max], y:[min,max], logX, logY, xLabel, yLabel, xTicks, yTicks,
   *         xFmt, yFmt, series:[{data:[[x,y],...], color, width, dash, fill}],
   *         vlines:[{x,color,label,dash}], hlines:[{y,color,label,dash}], points:[{x,y,color,r,label}],
   *         bands:[{x0,x1,color}] }
   */
  CB.chart = function (ctx, box, opts) {
    const P = CB.palette();
    const dpr = (ctx.getTransform && ctx.getTransform().a) || 1;
    const W = ctx.canvas.width / dpr, H = ctx.canvas.height / dpr;
    if (!box) box = { x: 58, y: 16, w: W - 58 - 18, h: H - 16 - 46 };
    const [x0, x1] = opts.x, [y0, y1] = opts.y;
    const lx = (v) => (opts.logX ? Math.log10(v) : v);
    const ly = (v) => (opts.logY ? Math.log10(v) : v);
    const X = (v) => box.x + ((lx(v) - lx(x0)) / (lx(x1) - lx(x0))) * box.w;
    const Y = (v) => box.y + box.h - ((ly(v) - ly(y0)) / (ly(y1) - ly(y0))) * box.h;
    const ticks = (a, b, log, n) => {
      if (log) { const out = []; for (let e = Math.ceil(Math.log10(a) - 1e-9); e <= Math.log10(b) + 1e-9; e++) out.push(Math.pow(10, e)); return out; }
      const span = b - a, raw = span / (n || 5), mag = Math.pow(10, Math.floor(Math.log10(raw)));
      const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= (n || 5) + 0.5) || raw;
      const out = []; for (let v = Math.ceil(a / step - 1e-9) * step; v <= b + step * 1e-6; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
      return out;
    };
    const defFmt = (v) => (Math.abs(v) >= 1e5 || (Math.abs(v) < 1e-2 && v !== 0) ? v.toExponential(0).replace("e+", "e") : String(Number(v.toPrecision(4))));
    const xFmt = opts.xFmt || defFmt, yFmt = opts.yFmt || defFmt;
    ctx.save();
    ctx.font = "11px " + getComputedStyle(document.body).getPropertyValue("--mono");
    ctx.lineWidth = 1;
    (opts.bands || []).forEach((b) => { ctx.fillStyle = b.color; ctx.fillRect(X(b.x0), box.y, X(b.x1) - X(b.x0), box.h); });
    const xt = opts.xTicks || ticks(x0, x1, opts.logX, 6);
    const yt = opts.yTicks || ticks(y0, y1, opts.logY, 5);
    ctx.strokeStyle = P.grid; ctx.fillStyle = P.dim;
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    xt.forEach((v) => { const px = X(v); if (px < box.x - 1 || px > box.x + box.w + 1) return; ctx.beginPath(); ctx.moveTo(px, box.y); ctx.lineTo(px, box.y + box.h); ctx.stroke(); ctx.fillText(xFmt(v), px, box.y + box.h + 6); });
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    yt.forEach((v) => { const py = Y(v); if (py < box.y - 1 || py > box.y + box.h + 1) return; ctx.beginPath(); ctx.moveTo(box.x, py); ctx.lineTo(box.x + box.w, py); ctx.stroke(); ctx.fillText(yFmt(v), box.x - 6, py); });
    ctx.strokeStyle = P.axis;
    ctx.beginPath(); ctx.moveTo(box.x, box.y); ctx.lineTo(box.x, box.y + box.h); ctx.lineTo(box.x + box.w, box.y + box.h); ctx.stroke();
    ctx.fillStyle = P.dim; ctx.font = "12px " + getComputedStyle(document.body).getPropertyValue("--font");
    if (opts.xLabel) { ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillText(opts.xLabel, box.x + box.w / 2, box.y + box.h + 40); }
    if (opts.yLabel) { ctx.save(); ctx.translate(14, box.y + box.h / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(opts.yLabel, 0, 0); ctx.restore(); }
    ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y - 2, box.w + 2, box.h + 4); ctx.clip();
    (opts.series || []).forEach((s, i) => {
      if (!s.data || !s.data.length) return;
      ctx.strokeStyle = s.color || P.series[i % P.series.length];
      ctx.lineWidth = s.width || 2; ctx.setLineDash(s.dash || []);
      ctx.beginPath();
      let started = false;
      s.data.forEach(([x, y]) => { if (!isFinite(y) || (opts.logY && y <= 0) || (opts.logX && x <= 0)) { started = false; return; } const px = X(x), py = Y(y); started ? ctx.lineTo(px, py) : ctx.moveTo(px, py); started = true; });
      ctx.stroke();
      if (s.fill) {
        ctx.lineTo(X(s.data[s.data.length - 1][0]), Y(opts.logY ? y0 : Math.max(y0, 0)));
        ctx.lineTo(X(s.data[0][0]), Y(opts.logY ? y0 : Math.max(y0, 0)));
        ctx.closePath(); ctx.fillStyle = s.fill; ctx.fill();
      }
      ctx.setLineDash([]);
    });
    (opts.vlines || []).forEach((l) => { ctx.strokeStyle = l.color || P.faint; ctx.setLineDash(l.dash || [4, 4]); ctx.lineWidth = l.width || 1.2; ctx.beginPath(); ctx.moveTo(X(l.x), box.y); ctx.lineTo(X(l.x), box.y + box.h); ctx.stroke(); ctx.setLineDash([]); if (l.label) { ctx.fillStyle = l.color || P.dim; ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillText(l.label, X(l.x) + 4, box.y + 4); } });
    (opts.hlines || []).forEach((l) => { ctx.strokeStyle = l.color || P.faint; ctx.setLineDash(l.dash || [4, 4]); ctx.lineWidth = l.width || 1.2; ctx.beginPath(); ctx.moveTo(box.x, Y(l.y)); ctx.lineTo(box.x + box.w, Y(l.y)); ctx.stroke(); ctx.setLineDash([]); if (l.label) { ctx.fillStyle = l.color || P.dim; ctx.textAlign = "right"; ctx.textBaseline = "bottom"; ctx.fillText(l.label, box.x + box.w - 4, Y(l.y) - 3); } });
    (opts.points || []).forEach((p) => { ctx.fillStyle = p.color || P.accent; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), p.r || 4, 0, Math.PI * 2); ctx.fill(); if (p.label) { ctx.fillStyle = P.text; ctx.textAlign = "left"; ctx.textBaseline = "bottom"; ctx.fillText(p.label, X(p.x) + 6, Y(p.y) - 4); } });
    ctx.restore();
    ctx.restore();
    return { X, Y, box };
  };

  /* ------------------------------------------------------------ controls */
  /**
   * range 입력 바인딩. output은 id+"-out" 요소.
   *   const get = CB.range('ev', v => v+' EV', v => redraw());  get() → 현재 값(Number)
   */
  CB.range = function (id, fmt, onInput) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    const out = document.getElementById(el.id + "-out") || document.querySelector(`output[for="${el.id}"]`);
    const update = (fire) => {
      const v = Number(el.value);
      const pct = ((v - Number(el.min || 0)) / (Number(el.max || 100) - Number(el.min || 0))) * 100;
      el.style.setProperty("--fill", pct + "%");
      if (out) out.textContent = fmt ? fmt(v) : String(v);
      if (fire && onInput) onInput(v);
    };
    el.addEventListener("input", () => update(true));
    update(false);
    const get = () => Number(el.value);
    get.set = (v, fire = true) => { el.value = v; update(fire); };
    get.el = el;
    return get;
  };
  /**
   * 이산 값 목록 슬라이더(조리개·셔터·ISO 눈금). HTML은 <input type="range" id="..."> 만 두면 된다.
   *   const N = CB.steps('ap', CB.APERTURES, CB.fmtN, 5.6, v => redraw());  N() → 값
   */
  CB.steps = function (id, list, fmt, initial, onInput) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    el.min = 0; el.max = list.length - 1; el.step = 1;
    el.value = initial != null ? CB.nearest(list, initial) : 0;
    const r = CB.range(el, (i) => (fmt ? fmt(list[i]) : String(list[i])), (i) => onInput && onInput(list[i]));
    const get = () => list[r()];
    get.set = (v, fire = true) => r.set(CB.nearest(list, v), fire);
    get.index = r;
    get.el = el;
    return get;
  };
  /** 세그먼트 버튼: <div class="seg" id="mode"><button data-value="a" class="on">A</button>...</div> */
  CB.seg = function (id, onChange) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    const btns = [...el.querySelectorAll("button")];
    let cur = (btns.find((b) => b.classList.contains("on")) || btns[0]).dataset.value;
    const set = (v, fire = true) => {
      cur = v;
      btns.forEach((b) => { const on = b.dataset.value === v; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
      if (fire && onChange) onChange(v);
    };
    btns.forEach((b) => b.addEventListener("click", () => set(b.dataset.value)));
    set(cur, false);
    const get = () => cur;
    get.set = set;
    return get;
  };
  /** 체크박스 바인딩 */
  CB.check = function (id, onChange) {
    const el = document.getElementById(id);
    el.addEventListener("change", () => onChange && onChange(el.checked));
    const get = () => el.checked;
    get.set = (v) => { el.checked = v; onChange && onChange(v); };
    return get;
  };
  CB.stat = function (id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; };

  CB.nearest = function (list, v, log = false) {
    let bi = 0, bd = Infinity;
    list.forEach((x, i) => { const d = log ? Math.abs(Math.log(x) - Math.log(v)) : Math.abs(x - v); if (d < bd) { bd = d; bi = i; } });
    return bi;
  };
  CB.mod = (n, m) => ((n % m) + m) % m;

  /* ==================================================================== statistics */
  /** 정규분포 확률밀도 */
  CB.normPdf = (x, mu = 0, s = 1) => Math.exp(-0.5 * ((x - mu) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
  /** 오차 함수(Abramowitz–Stegun 7.1.26, 오차 < 1.5e-7) */
  CB.erf = function (x) {
    const s = Math.sign(x), a = Math.abs(x), t = 1 / (1 + 0.3275911 * a);
    const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);
    return s * y;
  };
  /** 정규분포 누적분포 */
  CB.normCdf = (x, mu = 0, s = 1) => 0.5 * (1 + CB.erf((x - mu) / (s * Math.SQRT2)));
  /** ln Γ(x) (Lanczos) */
  CB.lgamma = function (x) {
    const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - CB.lgamma(1 - x);
    x -= 1; let a = c[0]; const t = x + g + 0.5;
    for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  };
  /** 포아송 확률질량 P(K=k) */
  CB.poissonPmf = (k, lam) => (k < 0 ? 0 : Math.exp(k * Math.log(Math.max(lam, 1e-300)) - lam - CB.lgamma(k + 1)));
  /** 이항 확률질량 P(K=k) */
  CB.binomPmf = (k, n, p) => (k < 0 || k > n ? 0 : Math.exp(CB.lgamma(n + 1) - CB.lgamma(k + 1) - CB.lgamma(n - k + 1) + k * Math.log(Math.max(p, 1e-300)) + (n - k) * Math.log(Math.max(1 - p, 1e-300))));
  CB.mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  CB.std = (a) => { const m = CB.mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, a.length - 1)); };
  /**
   * 히스토그램. → {counts, edges, width}
   *   CB.histogram(data, 40, [lo, hi])
   */
  CB.histogram = function (data, bins = 30, range) {
    const lo = range ? range[0] : Math.min(...data), hi = range ? range[1] : Math.max(...data);
    const w = (hi - lo) / bins || 1, counts = new Array(bins).fill(0);
    for (const x of data) { const i = Math.floor((x - lo) / w); if (i >= 0 && i < bins) counts[i]++; else if (x === hi) counts[bins - 1]++; }
    return { counts, edges: counts.map((_, i) => lo + i * w).concat([hi]), width: w };
  };

  /* ==================================================================== complex numbers */
  /** 복소수는 [re, im] 배열로 다룬다. */
  CB.cx = {
    of: (re, im = 0) => [re, im],
    polar: (r, th) => [r * Math.cos(th), r * Math.sin(th)],
    add: (a, b) => [a[0] + b[0], a[1] + b[1]],
    sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
    mul: (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]],
    div: (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; },
    scale: (a, s) => [a[0] * s, a[1] * s],
    conj: (a) => [a[0], -a[1]],
    abs: (a) => Math.hypot(a[0], a[1]),
    arg: (a) => Math.atan2(a[1], a[0]),
    exp: (a) => { const e = Math.exp(a[0]); return [e * Math.cos(a[1]), e * Math.sin(a[1])]; },
    /** e^{iθ} */
    cis: (th) => [Math.cos(th), Math.sin(th)],
    sqrt: (a) => { const r = Math.sqrt(Math.hypot(a[0], a[1])), th = Math.atan2(a[1], a[0]) / 2; return [r * Math.cos(th), r * Math.sin(th)]; },
    str: (a, d = 2) => { const re = +a[0].toFixed(d), im = +a[1].toFixed(d); return im === 0 ? String(re) : re === 0 ? `${im}i` : `${re} ${im < 0 ? "−" : "+"} ${Math.abs(im)}i`; },
  };

  /* ==================================================================== linear algebra */
  /** 행렬은 행 배열의 배열([[a,b],[c,d]]), 벡터는 배열. */
  CB.mat = {
    identity: (n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))),
    mul: (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0))),
    apply: (A, v) => A.map((row) => row.reduce((s, a, k) => s + a * v[k], 0)),
    transpose: (A) => A[0].map((_, j) => A.map((r) => r[j])),
    det: function (A) {
      const n = A.length;
      if (n === 1) return A[0][0];
      if (n === 2) return A[0][0] * A[1][1] - A[0][1] * A[1][0];
      const M = A.map((r) => r.slice()); let d = 1;
      for (let i = 0; i < n; i++) {
        let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
        if (Math.abs(M[p][i]) < 1e-14) return 0;
        if (p !== i) { [M[p], M[i]] = [M[i], M[p]]; d = -d; }
        d *= M[i][i];
        for (let r = i + 1; r < n; r++) { const f = M[r][i] / M[i][i]; for (let c = i; c < n; c++) M[r][c] -= f * M[i][c]; }
      }
      return d;
    },
    /** 가우스–조르단 역행렬(특이하면 null) */
    inv: function (A) {
      const n = A.length, M = A.map((r, i) => r.concat(CB.mat.identity(n)[i]));
      for (let i = 0; i < n; i++) {
        let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
        if (Math.abs(M[p][i]) < 1e-12) return null;
        [M[p], M[i]] = [M[i], M[p]];
        const d = M[i][i]; for (let c = 0; c < 2 * n; c++) M[i][c] /= d;
        for (let r = 0; r < n; r++) if (r !== i) { const f = M[r][i]; for (let c = 0; c < 2 * n; c++) M[r][c] -= f * M[i][c]; }
      }
      return M.map((r) => r.slice(n));
    },
    /** 연립방정식 A x = b */
    solve: (A, b) => { const Ai = CB.mat.inv(A); return Ai ? CB.mat.apply(Ai, b) : null; },
    /**
     * 2×2 고유값·고유벡터. → {values:[λ1,λ2] (실수) | null, complex:[re, im] | null, vectors:[[x,y],[x,y]]}
     * 고유값이 복소수이면 values=null, complex=[실부, 허부(+)]
     */
    eig2: function (A) {
      const [[a, b], [c, d]] = A, tr = a + d, det = a * d - b * c, disc = tr * tr / 4 - det;
      if (disc < -1e-12) return { values: null, complex: [tr / 2, Math.sqrt(-disc)], vectors: [] };
      const s = Math.sqrt(Math.max(0, disc)), l1 = tr / 2 + s, l2 = tr / 2 - s;
      const vec = (l) => {
        let v = Math.abs(b) > 1e-12 ? [b, l - a] : Math.abs(c) > 1e-12 ? [l - d, c] : (Math.abs(l - a) < 1e-12 ? [1, 0] : [0, 1]);
        const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n];
      };
      let v1 = vec(l1), v2 = vec(l2);
      if (Math.abs(disc) < 1e-12 && Math.abs(b) < 1e-12 && Math.abs(c) < 1e-12) { v1 = [1, 0]; v2 = [0, 1]; }
      return { values: [l1, l2], complex: null, vectors: [v1, v2] };
    },
    /**
     * 대칭 행렬 고유분해(야코비 회전). → {values:[...](내림차순), vectors:[[...]...](각 열 대신 각 원소가 고유벡터)}
     */
    eigSym: function (A, iters = 100) {
      const n = A.length, M = A.map((r) => r.slice()), V = CB.mat.identity(n);
      for (let sweep = 0; sweep < iters; sweep++) {
        let off = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += M[i][j] * M[i][j];
        if (off < 1e-20) break;
        for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
          if (Math.abs(M[p][q]) < 1e-15) continue;
          const th = (M[q][q] - M[p][p]) / (2 * M[p][q]);
          const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
          for (let k = 0; k < n; k++) { const mkp = M[k][p], mkq = M[k][q]; M[k][p] = c * mkp - s * mkq; M[k][q] = s * mkp + c * mkq; }
          for (let k = 0; k < n; k++) { const mpk = M[p][k], mqk = M[q][k]; M[p][k] = c * mpk - s * mqk; M[q][k] = s * mpk + c * mqk; }
          for (let k = 0; k < n; k++) { const vkp = V[k][p], vkq = V[k][q]; V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq; }
        }
      }
      const idx = [...Array(n).keys()].sort((i, j) => M[j][j] - M[i][i]);
      return { values: idx.map((i) => M[i][i]), vectors: idx.map((i) => V.map((r) => r[i])) };
    },
    /**
     * 특이값 분해(단측 야코비). A: m×n 행 배열(또는 Float64Array 평면 + m,n).
     * → {U: m×r, S: r, V: n×r (모두 행 배열), rank 순 내림차순}
     * 64×64 이미지 정도까지 브라우저에서 즉시 계산된다.
     */
    svd: function (A) {
      const m = A.length, n = A[0].length;
      const U = A.map((r) => Float64Array.from(r)); // m×n, 열을 직교화
      const V = Array.from({ length: n }, (_, i) => { const r = new Float64Array(n); r[i] = 1; return r; });
      for (let sweep = 0; sweep < 60; sweep++) {
        let rot = 0;
        for (let p = 0; p < n - 1; p++) for (let q = p + 1; q < n; q++) {
          let al = 0, be = 0, ga = 0;
          for (let i = 0; i < m; i++) { const up = U[i][p], uq = U[i][q]; al += up * up; be += uq * uq; ga += up * uq; }
          if (Math.abs(ga) <= 1e-12 * Math.sqrt(al * be) || ga === 0) continue;
          rot++;
          const z = (be - al) / (2 * ga), t = Math.sign(z || 1) / (Math.abs(z) + Math.sqrt(1 + z * z)), c = 1 / Math.sqrt(1 + t * t), s = c * t;
          for (let i = 0; i < m; i++) { const up = U[i][p], uq = U[i][q]; U[i][p] = c * up - s * uq; U[i][q] = s * up + c * uq; }
          for (let i = 0; i < n; i++) { const vp = V[i][p], vq = V[i][q]; V[i][p] = c * vp - s * vq; V[i][q] = s * vp + c * vq; }
        }
        if (!rot) break;
      }
      const S = []; for (let j = 0; j < n; j++) { let s = 0; for (let i = 0; i < m; i++) s += U[i][j] * U[i][j]; S.push(Math.sqrt(s)); }
      const order = [...Array(n).keys()].sort((a, b) => S[b] - S[a]);
      const Uo = U.map((r) => order.map((j) => (S[j] > 1e-15 ? r[j] / S[j] : 0)));
      const Vo = V.map((r) => order.map((j) => r[j]));
      return { U: Uo, S: order.map((j) => S[j]), V: Vo };
    },
  };

  /* ==================================================================== ODE */
  /**
   * 룽게–쿠타 4차. f(t, y[]) → dy[], 반환: [[t, y[]], ...] (n+1개)
   *   CB.rk4((t,y)=>[y[1], -y[0]], [1,0], 0, 0.01, 1000)
   */
  CB.rk4 = function (f, y0, t0, dt, n) {
    const out = [[t0, y0.slice()]]; let y = y0.slice(), t = t0;
    const add = (a, b, s) => a.map((v, i) => v + b[i] * s);
    for (let k = 0; k < n; k++) {
      const k1 = f(t, y), k2 = f(t + dt / 2, add(y, k1, dt / 2)), k3 = f(t + dt / 2, add(y, k2, dt / 2)), k4 = f(t + dt, add(y, k3, dt));
      y = y.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])); t += dt;
      out.push([t, y.slice()]);
    }
    return out;
  };
  /** 오일러 전진법(비교용). 형식은 CB.rk4와 같다. */
  CB.euler = function (f, y0, t0, dt, n) {
    const out = [[t0, y0.slice()]]; let y = y0.slice(), t = t0;
    for (let k = 0; k < n; k++) { const d = f(t, y); y = y.map((v, i) => v + dt * d[i]); t += dt; out.push([t, y.slice()]); }
    return out;
  };

  /* ==================================================================== color maps
  /** 색 지도: t(0..1) → [r,g,b]. "viridis"(순차) | "diverge"(파랑–흰–빨강, 0.5가 흰색) | "phase"(색상환, 위상 표시) */
  CB.colormap = function (t, name = "viridis") {
    t = CB.clamp(t, 0, 1);
    if (name === "diverge") {
      const a = [33, 102, 172], m = [247, 247, 247], b = [178, 24, 43];
      return t < 0.5 ? a.map((v, i) => Math.round(v + (m[i] - v) * t * 2)) : m.map((v, i) => Math.round(v + (b[i] - v) * (t - 0.5) * 2));
    }
    if (name === "phase") {
      const h = t * 6, c = 220, x = c * (1 - Math.abs((h % 2) - 1)), o = 30;
      const k = Math.floor(h) % 6; const tbl = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][k];
      return tbl.map((v) => Math.round(v + o));
    }
    const S = [[68, 1, 84], [72, 40, 120], [62, 74, 137], [49, 104, 142], [38, 130, 142], [31, 158, 137], [53, 183, 121], [109, 205, 89], [180, 222, 44], [253, 231, 37]];
    const f = t * (S.length - 1), i = Math.min(S.length - 2, Math.floor(f)), u = f - i;
    return S[i].map((v, k) => Math.round(v + (S[i + 1][k] - v) * u));
  };
  CB.rgb = (a) => `rgb(${a[0]},${a[1]},${a[2]})`;

  /* ==================================================================== coordinate plane */
  /**
   * 3Blue1Brown식 좌표 평면. 캔버스 위에 수학 좌표계를 깔고, 드래그 가능한 점을 다룬다.
   *   const pl = CB.plane("#cv", {x:[-5,5], y:[-3,3] | null(가로세로 같은 축척), aspect:0.6, grid:true, axes:true,
   *                              draw(P, api){...}  ← 생성 중에도 동기 호출되므로 pl 대신 api.points를 쓴다, points:[{x,y,color,r,label,snap,lock:"x"|"y",constrain(p)}], onDrag(pt,i)});
   *   P: {X(x)→px, Y(y)→py, ix(px)→x, iy(py)→y, unit(px/단위), ctx, w, h, P(팔레트),
   *       line(x1,y1,x2,y2,o), arrow(x1,y1,x2,y2,o), dot(x,y,o), poly(pts,o), circle(x,y,r,o), text(s,x,y,o), curve(fn,o), param(fn,t0,t1,o), grid(o), axes(o)}
   *   o 공통: {color, width, dash, fill, alpha, label, font, align, baseline, r, head}
   *   pl.redraw(), pl.points(배열, 직접 수정 가능), pl.view({x:[..], y:[..]}) 범위 변경
   */
  CB.plane = function (el, o = {}) {
    const st = { points: o.points || [], o };
    let view = { x: (o.x || [-5, 5]).slice(), y: o.y ? o.y.slice() : null };
    const api = { P: null };
    Object.defineProperty(api, "points", { get: () => st.points, set: (v) => { st.points = v; } });
    const cv = CB.canvas(el, (ctx, w, h) => {
      const pal = CB.palette();
      const [x0, x1] = view.x;
      let y0, y1;
      if (view.y) [y0, y1] = view.y; else { const half = ((x1 - x0) * h) / w / 2, cy = o.cy || 0; y0 = cy - half; y1 = cy + half; }
      const X = (x) => ((x - x0) / (x1 - x0)) * w, Y = (y) => h - ((y - y0) / (y1 - y0)) * h;
      const ix = (px) => x0 + (px / w) * (x1 - x0), iy = (py) => y0 + ((h - py) / h) * (y1 - y0);
      const unit = w / (x1 - x0);
      const style = (op, def) => { ctx.strokeStyle = op.color || def || pal.text; ctx.fillStyle = op.fill || op.color || def || pal.text; ctx.lineWidth = op.width || 2; ctx.setLineDash(op.dash || []); ctx.globalAlpha = op.alpha != null ? op.alpha : 1; };
      const reset = () => { ctx.setLineDash([]); ctx.globalAlpha = 1; };
      const P = {
        ctx, w, h, X, Y, ix, iy, unit, P: pal, x0, x1, y0, y1,
        line(a, b, c, d, op = {}) { style(op, pal.dim); ctx.beginPath(); ctx.moveTo(X(a), Y(b)); ctx.lineTo(X(c), Y(d)); ctx.stroke(); reset(); },
        arrow(a, b, c, d, op = {}) {
          style(op, pal.accent);
          const px = X(a), py = Y(b), qx = X(c), qy = Y(d), L = Math.hypot(qx - px, qy - py), hd = Math.min(op.head || 11, L * 0.45);
          if (L < 0.5) { reset(); return; }
          const ux = (qx - px) / L, uy = (qy - py) / L;
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(qx - ux * hd * 0.8, qy - uy * hd * 0.8); ctx.stroke();
          ctx.setLineDash([]);
          ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(qx - ux * hd - uy * hd * 0.45, qy - uy * hd + ux * hd * 0.45); ctx.lineTo(qx - ux * hd + uy * hd * 0.45, qy - uy * hd - ux * hd * 0.45); ctx.closePath(); ctx.fillStyle = op.color || pal.accent; ctx.fill();
          if (op.label) P.text(op.label, c, d, { color: op.color || pal.accent, dx: 8 * Math.sign(ux || 1), dy: -8, bold: true, font: op.font });
          reset();
        },
        dot(x, y, op = {}) { style(op, pal.accent); ctx.beginPath(); ctx.arc(X(x), Y(y), op.r || 4, 0, Math.PI * 2); ctx.fill(); if (op.stroke) { ctx.strokeStyle = op.stroke; ctx.lineWidth = 2; ctx.stroke(); } if (op.label) P.text(op.label, x, y, { color: op.labelColor || pal.text, dx: 8, dy: -8, font: op.font }); reset(); },
        circle(x, y, r, op = {}) { style(op, pal.dim); ctx.beginPath(); ctx.arc(X(x), Y(y), r * unit, 0, Math.PI * 2); if (op.fill) ctx.fill(); if (op.stroke !== false) ctx.stroke(); reset(); },
        poly(pts, op = {}) {
          if (!pts.length) return; style(op, pal.accent); ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))));
          if (op.close !== false) ctx.closePath();
          if (op.fill) { ctx.fillStyle = op.fill; ctx.fill(); }
          if (op.stroke !== false) { ctx.strokeStyle = op.color || pal.accent; ctx.stroke(); }
          reset();
        },
        text(s, x, y, op = {}) {
          ctx.save(); ctx.fillStyle = op.color || pal.text; ctx.globalAlpha = op.alpha != null ? op.alpha : 1;
          ctx.font = op.font || `${op.bold ? "700 " : ""}${op.size || 13}px ${getComputedStyle(document.body).getPropertyValue("--font")}`;
          ctx.textAlign = op.align || "left"; ctx.textBaseline = op.baseline || "middle";
          ctx.fillText(s, X(x) + (op.dx || 0), Y(y) + (op.dy || 0)); ctx.restore();
        },
        curve(fn, op = {}) {
          style(op, pal.accent); ctx.beginPath(); let started = false;
          const a = op.from != null ? op.from : x0, b = op.to != null ? op.to : x1, N = op.n || Math.max(100, Math.round(w));
          for (let i = 0; i <= N; i++) { const x = a + ((b - a) * i) / N, y = fn(x); if (!isFinite(y) || Math.abs(Y(y)) > 1e5) { started = false; continue; } started ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)); started = true; }
          ctx.stroke(); reset();
        },
        param(fn, t0, t1, op = {}) {
          style(op, pal.accent); ctx.beginPath(); const N = op.n || 400;
          for (let i = 0; i <= N; i++) { const [x, y] = fn(t0 + ((t1 - t0) * i) / N); i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)); }
          if (op.close) ctx.closePath(); if (op.fill) { ctx.fillStyle = op.fill; ctx.fill(); } ctx.stroke(); reset();
        },
        grid(op = {}) {
          const step = op.step || 1;
          ctx.strokeStyle = op.color || pal.grid; ctx.lineWidth = op.width || 1; ctx.globalAlpha = op.alpha != null ? op.alpha : 1;
          ctx.beginPath();
          for (let x = Math.ceil(x0 / step) * step; x <= x1; x += step) { ctx.moveTo(X(x), 0); ctx.lineTo(X(x), h); }
          for (let y = Math.ceil(y0 / step) * step; y <= y1; y += step) { ctx.moveTo(0, Y(y)); ctx.lineTo(w, Y(y)); }
          ctx.stroke(); ctx.globalAlpha = 1;
        },
        axes(op = {}) {
          ctx.strokeStyle = op.color || pal.axis; ctx.lineWidth = 1.2; ctx.beginPath();
          ctx.moveTo(0, Y(0)); ctx.lineTo(w, Y(0)); ctx.moveTo(X(0), 0); ctx.lineTo(X(0), h); ctx.stroke();
          if (op.labels !== false) {
            const step = op.step || 1; ctx.fillStyle = pal.faint; ctx.font = "10px " + getComputedStyle(document.body).getPropertyValue("--mono");
            ctx.textAlign = "center"; ctx.textBaseline = "top";
            for (let x = Math.ceil(x0 / step) * step; x <= x1; x += step) if (Math.abs(x) > 1e-9) ctx.fillText(+x.toFixed(3), X(x), Math.min(h - 12, Math.max(2, Y(0) + 3)));
            ctx.textAlign = "right"; ctx.textBaseline = "middle";
            for (let y = Math.ceil(y0 / step) * step; y <= y1; y += step) if (Math.abs(y) > 1e-9) ctx.fillText(+y.toFixed(3), Math.max(24, Math.min(w - 2, X(0) - 4)), Y(y));
          }
        },
      };
      api.P = P;
      if (o.grid !== false && !o.noGrid) P.grid({ step: o.gridStep || 1 });
      if (o.axes !== false) P.axes({ step: o.gridStep || 1, labels: o.axisLabels });
      o.draw && o.draw(P, api);
      st.points.forEach((p) => { if (p.hidden) return; P.dot(p.x, p.y, { r: p.r || 7, color: p.color || pal.accent, stroke: pal.bg, label: p.label }); });
    }, { aspect: o.aspect || 0.62, maxHeight: o.maxHeight || 520, minHeight: o.minHeight || 220, height: o.height });
    api.cv = cv;
    api.redraw = () => cv.redraw();
    api.view = (v) => { if (v.x) view.x = v.x.slice(); if (v.y !== undefined) view.y = v.y ? v.y.slice() : null; cv.redraw(); };
    const canvas = cv.canvas;
    if (o.points || o.onDrag || o.onPointer) {
      canvas.classList.add("drag");
      let drag = -1;
      const pos = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      canvas.addEventListener("pointerdown", (e) => {
        const P = api.P; if (!P) return; const [mx, my] = pos(e);
        let best = -1, bd = e.pointerType === "touch" ? 30 : 18;
        st.points.forEach((p, i) => { if (p.hidden || p.fixed) return; const d = Math.hypot(P.X(p.x) - mx, P.Y(p.y) - my); if (d < bd) { bd = d; best = i; } });
        if (best < 0 && o.onPointer) { o.onPointer(P.ix(mx), P.iy(my), "down"); return; }
        if (best < 0) return;
        drag = best; canvas.setPointerCapture(e.pointerId); canvas.classList.add("dragging"); e.preventDefault();
      });
      canvas.addEventListener("pointermove", (e) => {
        const P = api.P; if (!P) return; const [mx, my] = pos(e);
        if (drag < 0) { if (o.onPointer && e.buttons) o.onPointer(P.ix(mx), P.iy(my), "move"); return; }
        const p = st.points[drag];
        let x = P.ix(mx), y = P.iy(my);
        if (p.snap) { x = Math.round(x / p.snap) * p.snap; y = Math.round(y / p.snap) * p.snap; }
        if (p.lock !== "x") p.x = CB.clamp(x, P.x0, P.x1);
        if (p.lock !== "y") p.y = CB.clamp(y, P.y0, P.y1);
        if (p.constrain) p.constrain(p);
        o.onDrag && o.onDrag(p, drag);
        cv.redraw();
      });
      const up = (e) => { if (drag >= 0) { drag = -1; canvas.classList.remove("dragging"); o.onDragEnd && o.onDragEnd(); } else if (o.onPointer && api.P) { const [mx, my] = pos(e); o.onPointer(api.P.ix(mx), api.P.iy(my), "up"); } };
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);
    }
    return api;
  };

  /** 재생/정지 토글 버튼 바인딩: CB.playButton("btn-id", onStart, onStop) → {set(playing)} */
  CB.playButton = function (id, onStart, onStop, labels = ["▶ 재생", "■ 정지"]) {
    const b = document.getElementById(id);
    let on = false;
    const set = (v) => { on = v; b.textContent = labels[on ? 1 : 0]; b.classList.toggle("playing", on); };
    b.addEventListener("click", () => { if (on) { set(false); onStop && onStop(); } else { set(true); onStart && onStart(); } });
    set(false);
    return { set, get on() { return on; }, el: b };
  };
  /* ==================================================================== number helpers (structures) */
  /** 부호와 반올림을 정리한 숫자 문자열: 음수는 진짜 빼기표(−), −0은 0. CB.num(-12.345, 1) → "−12.3" */
  CB.num = function (v, d = 1) {
    if (!isFinite(v)) return "—";
    const r = Number(v.toFixed(d));
    return (Object.is(r, -0) || r === 0 ? (0).toFixed(d) : r.toFixed(d)).replace("-", "−");
  };
  /** 유효 자리 기준 숫자 문자열(큰 수에는 천 단위 쉼표). CB.sig(12345.6) → "12,346" */
  CB.sig = function (v, digits = 3) {
    if (!isFinite(v)) return "—";
    if (v === 0) return "0";
    const a = Math.abs(v), d = Math.max(0, digits - 1 - Math.floor(Math.log10(a)));
    const s = a >= 1000 ? Math.round(a).toLocaleString("en-US") : a.toFixed(Math.min(d, 6));
    return (v < 0 ? "−" : "") + s;
  };

  /* ==================================================================== 3D view */
  /**
   * 끌어서 돌려 보는 3D 투시 보기(WebGL 없이 캔버스 2D). z가 연직 위쪽이다.
   *   const v = CB.orbit("#cv", { yaw: -0.7, pitch: 0.45, dist: 60, target: [x, y, z], fov: 0.9, aspect: 0.6, spin: 0.15, draw(V) { ... } });
   *   V: { p([x,y,z]) → [px, py, depth] | null, line3(a, b, o), poly3(pts, o), dot3(a, o), text3(s, a, o), depth(pts), ctx, w, h, P }
   *   면은 깊이(V.depth)가 큰 것부터(먼 것부터) 칠한다. v.redraw(), v.set({yaw, pitch, dist, target}).
   *   마우스는 가로·세로로 끌어 돌리고, 터치는 가로로 끌어 돌린다(세로 끌기는 쪽 스크롤).
   */
  CB.orbit = function (el, o = {}) {
    const st = { yaw: o.yaw != null ? o.yaw : -0.7, pitch: o.pitch != null ? o.pitch : 0.45, dist: o.dist || 50, target: (o.target || [0, 0, 0]).slice(), fov: o.fov || 0.9 };
    const api = {};
    const cv = CB.canvas(el, (ctx, w, h) => {
      const P = CB.palette();
      const cy = Math.cos(st.yaw), sy = Math.sin(st.yaw), cp = Math.cos(st.pitch), sp = Math.sin(st.pitch);
      const F = (Math.min(w, h * 1.6) / 2) / Math.tan(st.fov / 2);
      const p = ([x, y, z]) => {
        const X0 = x - st.target[0], Y0 = y - st.target[1], Z0 = z - st.target[2];
        const x1 = cy * X0 - sy * Y0, y1 = sy * X0 + cy * Y0;
        const depth = cp * y1 - sp * Z0, up = sp * y1 + cp * Z0, zc = st.dist + depth;
        if (zc < 0.05) return null;
        return [w / 2 + (F * x1) / zc, h / 2 - (F * up) / zc, zc];
      };
      const style = (op, def) => { ctx.strokeStyle = op.color || def; ctx.lineWidth = op.width || 1.5; ctx.setLineDash(op.dash || []); ctx.globalAlpha = op.alpha != null ? op.alpha : 1; };
      const reset = () => { ctx.setLineDash([]); ctx.globalAlpha = 1; };
      const V = {
        ctx, w, h, P, p, st,
        depth: (pts) => pts.reduce((s, q) => s + (p(q) || [0, 0, 1e9])[2], 0) / pts.length,
        line3(a, b, op = {}) { const A = p(a), B = p(b); if (!A || !B) return; style(op, P.text); ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); reset(); },
        poly3(pts, op = {}) {
          const q = pts.map(p); if (q.some((v) => !v)) return;
          ctx.beginPath(); q.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
          if (op.fill) { ctx.globalAlpha = op.fillAlpha != null ? op.fillAlpha : 1; ctx.fillStyle = op.fill; ctx.fill(); ctx.globalAlpha = 1; }
          if (op.stroke !== false) { style(op, op.color || P.dim); ctx.stroke(); reset(); }
        },
        dot3(a, op = {}) { const A = p(a); if (!A) return; ctx.fillStyle = op.color || P.accent; ctx.beginPath(); ctx.arc(A[0], A[1], op.r || 4, 0, Math.PI * 2); ctx.fill(); },
        text3(s, a, op = {}) {
          const A = p(a); if (!A) return;
          ctx.save(); ctx.fillStyle = op.color || P.text; ctx.font = `${op.bold ? "700 " : ""}${op.size || 12}px ${getComputedStyle(document.body).getPropertyValue("--font")}`;
          ctx.textAlign = op.align || "center"; ctx.textBaseline = op.baseline || "middle"; ctx.fillText(s, A[0] + (op.dx || 0), A[1] + (op.dy || 0)); ctx.restore();
        },
      };
      o.draw && o.draw(V, api);
    }, { aspect: o.aspect || 0.62, maxHeight: o.maxHeight || 520, minHeight: o.minHeight || 240, height: o.height });
    api.cv = cv; api.st = st;
    api.redraw = () => cv.redraw();
    api.set = (v) => { Object.assign(st, v); cv.redraw(); };
    const canvas = cv.canvas;
    canvas.style.touchAction = "pan-y";
    canvas.classList.add("drag");
    let last = null, touched = false;
    canvas.addEventListener("pointerdown", (e) => { last = [e.clientX, e.clientY]; touched = true; canvas.setPointerCapture(e.pointerId); canvas.classList.add("dragging"); });
    canvas.addEventListener("pointermove", (e) => {
      if (!last) return;
      const dx = e.clientX - last[0], dy = e.clientY - last[1]; last = [e.clientX, e.clientY];
      st.yaw -= dx * 0.008;
      if (e.pointerType !== "touch") st.pitch = CB.clamp(st.pitch + dy * 0.006, -0.15, 1.45);
      cv.redraw();
    });
    const up = () => { last = null; canvas.classList.remove("dragging"); };
    canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
    if (o.spin) CB.loop(canvas, (dt) => { if (touched) return; st.yaw += o.spin * dt; cv.redraw(); });
    return api;
  };

  /* ==================================================================== structural analysis */
  /*
   * 2차원 골조·트러스 강성법(직접 강성법) 해석기. 단위는 kN, m, kN·m (E는 kN/m² = kPa, A는 m², I는 m⁴).
   * 전역 좌표: x 오른쪽, y 위쪽, 회전·모멘트는 반시계 방향이 +. 부재 국부 좌표: x는 i → j, y는 x를 반시계로 90° 돌린 방향.
   *
   *   const r = CB.frame({
   *     nodes: [[0, 0], [8, 0], ...],
   *     members: [{ i: 0, j: 1, E: 2.75e7, A: 0.28, I: 1.14e-2, hinge: [false, true] }, { i: 1, j: 2, truss: true, E, A }],
   *     supports: { 0: "pin", 2: "roller", 5: "fixed", 7: [1, 0, 0] },   // pin roller rollerV fixed slider guide 또는 [ux, uy, rz] 구속
   *     springs: { 3: [0, 5000, 0] },                                     // 지점 스프링(kN/m, kN/m, kN·m/rad)
   *     loads: [{ node: 1, fx: 0, fy: -50, m: 0 }],                         // 절점 하중(전역)
   *     memberLoads: [{ member: 0, w: [0, -10] },                           // 등분포(전역 성분, 부재 길이당 kN/m)
   *                   { member: 0, w: [0, 0], w2: [0, -20], from: 2, to: 6 }, // 선형 분포(시작값 w, 끝값 w2), 일부 구간
   *                   { member: 1, P: [0, -40], a: 3 },                     // 부재 위 집중 하중(i단에서 거리 a)
   *                   { member: 1, M: 15, a: 2 },                           // 부재 위 집중 모멘트(반시계 +)
   *                   { member: 2, w: [0, -5], local: true }],              // local: true면 [축 방향, 직각 방향] 국부 성분
   *     settlements: [{ node: 2, dof: 1, value: -0.01 }],                   // 지점 침하(구속된 자유도에 강제 변위)
   *   });
   *   r.ok(false면 r.reason: "unstable"), r.d[n] = [ux, uy, rz], r.reactions[n] = [Rx, Ry, Mz] | null,
   *   r.ends[m] = { N1, V1, M1, N2, V2, M2 } (단면력: N 인장 +, V·M은 국부 좌표의 보 부호 규약, M은 처짐 아래로 볼록(새깅) +),
   *   r.sample(m, n) → [{ s, x, y, N, V, M, ux, uy }] (s: i단에서의 거리, ux·uy 전역 변위), r.maxAbs("M"|"V"|"N"|"disp").
   */
  const SUPPORTS = { pin: [1, 1, 0], roller: [0, 1, 0], rollerV: [1, 0, 0], fixed: [1, 1, 1], slider: [0, 1, 1], guide: [1, 0, 1], free: [0, 0, 0] };
  CB.SUPPORTS = SUPPORTS;
  const GAUSS3 = [[-Math.sqrt(3 / 5), 5 / 9], [0, 8 / 9], [Math.sqrt(3 / 5), 5 / 9]];
  const hermite = (xi, L) => [1 - 3 * xi * xi + 2 * xi ** 3, L * (xi - 2 * xi * xi + xi ** 3), 3 * xi * xi - 2 * xi ** 3, L * (-xi * xi + xi ** 3)];
  const hermiteD = (xi, L) => [(-6 * xi + 6 * xi * xi) / L, 1 - 4 * xi + 3 * xi * xi, (6 * xi - 6 * xi * xi) / L, -2 * xi + 3 * xi * xi];
  function kLocal(E, A, I, L) {
    const a = (E * A) / L, b = (12 * E * I) / L ** 3, c = (6 * E * I) / L ** 2, d4 = (4 * E * I) / L, d2 = (2 * E * I) / L;
    return [[a, 0, 0, -a, 0, 0], [0, b, c, 0, -b, c], [0, c, d4, 0, -c, d2], [-a, 0, 0, a, 0, 0], [0, -b, -c, 0, b, -c], [0, c, d2, 0, -c, d4]];
  }
  /** 가우스 소거(부분 피벗). 특이하면 null */
  function solveDense(K, b, tol) {
    const n = b.length, M = K.map((r, i) => [...r, b[i]]);
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      if (Math.abs(M[p][c]) < tol) return null;
      if (p !== c) [M[p], M[c]] = [M[c], M[p]];
      for (let r = c + 1; r < n; r++) {
        const f = M[r][c] / M[c][c]; if (!f) continue;
        for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
      }
    }
    const x = new Array(n).fill(0);
    for (let r = n - 1; r >= 0; r--) { let s = M[r][n]; for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k]; x[r] = s / M[r][r]; }
    return x;
  }
  CB.solve = (K, b) => solveDense(K, b, 1e-12 * Math.max(1e-300, ...K.map((r, i) => Math.abs(r[i]))));

  CB.frame = function (model) {
    const nodes = model.nodes, nn = nodes.length, ndof = nn * 3;
    const fixed = new Array(ndof).fill(false), presc = new Array(ndof).fill(0), spring = new Array(ndof).fill(0);
    Object.entries(model.supports || {}).forEach(([k, v]) => {
      const r = typeof v === "string" ? SUPPORTS[v] : v;
      if (!r) throw new Error("CB.frame: unknown support " + v);
      r.forEach((on, d) => { if (on) fixed[+k * 3 + d] = true; });
    });
    Object.entries(model.springs || {}).forEach(([k, v]) => v.forEach((kv, d) => { spring[+k * 3 + d] += kv || 0; }));
    (model.settlements || []).forEach((s) => { presc[s.node * 3 + s.dof] = s.value; });

    const els = model.members.map((m) => {
      const [x1, y1] = nodes[m.i], [x2, y2] = nodes[m.j];
      const L = Math.hypot(x2 - x1, y2 - y1), c = (x2 - x1) / L, s = (y2 - y1) / L;
      const E = m.E != null ? m.E : model.E != null ? model.E : 2.1e8;
      const A = m.A != null ? m.A : model.A != null ? model.A : 0.01;
      let I = m.I != null ? m.I : model.I != null ? model.I : 1e-4;
      const rel = m.truss ? [true, true] : (m.hinge || [false, false]).slice();
      if (m.truss && !(I > 0)) I = 1e-6;
      return { m, i: m.i, j: m.j, L, c, s, E, A, I, rel, dist: [], pts: [], mom: [], f: new Array(6).fill(0) };
    });
    // 부재 하중 → 국부 성분
    (model.memberLoads || []).forEach((ld) => {
      const e = els[ld.member];
      const toLocal = (v) => (ld.local ? [v[0], v[1]] : [e.c * v[0] + e.s * v[1], -e.s * v[0] + e.c * v[1]]);
      if (ld.w) {
        const w1 = toLocal(ld.w), w2 = toLocal(ld.w2 || ld.w);
        const s0 = CB.clamp(ld.from != null ? ld.from : 0, 0, e.L), s1 = CB.clamp(ld.to != null ? ld.to : e.L, 0, e.L);
        if (s1 > s0) e.dist.push({ s0, s1, a0: w1[0], a1: w2[0], t0: w1[1], t1: w2[1] });
      }
      if (ld.P) { const p = toLocal(ld.P); e.pts.push({ a: CB.clamp(ld.a, 0, e.L), pa: p[0], pt: p[1] }); }
      if (ld.M) e.mom.push({ a: CB.clamp(ld.a, 0, e.L), M: ld.M });
    });
    const P = new Array(ndof).fill(0);
    (model.loads || []).forEach((ld) => { P[ld.node * 3] += ld.fx || 0; P[ld.node * 3 + 1] += ld.fy || 0; P[ld.node * 3 + 2] += ld.m || 0; });

    const K = Array.from({ length: ndof }, () => new Array(ndof).fill(0));
    els.forEach((e) => {
      const { L } = e, f = e.f;
      e.dist.forEach((q) => {
        const h = (q.s1 - q.s0) / 2, mid = (q.s1 + q.s0) / 2;
        GAUSS3.forEach(([g, wt]) => {
          const sx = mid + g * h, t = (sx - q.s0) / (q.s1 - q.s0), xi = sx / L, W = wt * h;
          const qa = q.a0 + (q.a1 - q.a0) * t, qt = q.t0 + (q.t1 - q.t0) * t, N = hermite(xi, L);
          f[0] += (1 - xi) * qa * W; f[3] += xi * qa * W;
          f[1] += N[0] * qt * W; f[2] += N[1] * qt * W; f[4] += N[2] * qt * W; f[5] += N[3] * qt * W;
        });
      });
      e.pts.forEach((p) => {
        const xi = p.a / L, N = hermite(xi, L);
        f[0] += (1 - xi) * p.pa; f[3] += xi * p.pa;
        f[1] += N[0] * p.pt; f[2] += N[1] * p.pt; f[4] += N[2] * p.pt; f[5] += N[3] * p.pt;
      });
      e.mom.forEach((p) => {
        const D = hermiteD(p.a / L, L);
        f[1] += D[0] * p.M; f[2] += D[1] * p.M; f[4] += D[2] * p.M; f[5] += D[3] * p.M;
      });
      const k = kLocal(e.E, e.A, e.I, L);
      e.k = k;
      // 힌지(모멘트 해제): 정적 응축
      const R = [e.rel[0] ? 2 : -1, e.rel[1] ? 5 : -1].filter((v) => v >= 0);
      let kc = k.map((r) => r.slice()), fc = f.slice(), rr = null;
      if (R.length) {
        const krr = R.map((a) => R.map((b) => k[a][b]));
        rr = R.length === 1 ? [[1 / krr[0][0]]] : (() => { const d = krr[0][0] * krr[1][1] - krr[0][1] * krr[1][0]; return [[krr[1][1] / d, -krr[0][1] / d], [-krr[1][0] / d, krr[0][0] / d]]; })();
        for (let a = 0; a < 6; a++) {
          for (let b = 0; b < 6; b++) { let sum = 0; R.forEach((r1, x) => R.forEach((r2, y) => { sum += k[a][r1] * rr[x][y] * k[r2][b]; })); kc[a][b] = k[a][b] - sum; }
          let sf = 0; R.forEach((r1, x) => R.forEach((r2, y) => { sf += k[a][r1] * rr[x][y] * f[r2]; })); fc[a] = f[a] - sf;
        }
        R.forEach((r1) => { fc[r1] = 0; for (let a = 0; a < 6; a++) { kc[r1][a] = 0; kc[a][r1] = 0; } });
      }
      e.R = R; e.rr = rr; e.kc = kc; e.fc = fc;
      const { c, s } = e, T = [[c, s, 0, 0, 0, 0], [-s, c, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0], [0, 0, 0, c, s, 0], [0, 0, 0, -s, c, 0], [0, 0, 0, 0, 0, 1]];
      e.T = T;
      const dofs = [e.i * 3, e.i * 3 + 1, e.i * 3 + 2, e.j * 3, e.j * 3 + 1, e.j * 3 + 2];
      e.dofs = dofs;
      // Kg = Tᵀ kc T, Fg = Tᵀ fc
      const kT = kc.map((row) => T[0].map((_, b) => row.reduce((sum, v, q) => sum + v * T[q][b], 0)));
      for (let a = 0; a < 6; a++) {
        let fa = 0; for (let q = 0; q < 6; q++) fa += T[q][a] * fc[q];
        P[dofs[a]] += fa;
        for (let b = 0; b < 6; b++) { let v = 0; for (let q = 0; q < 6; q++) v += T[q][a] * kT[q][b]; K[dofs[a]][dofs[b]] += v; }
      }
    });
    for (let d = 0; d < ndof; d++) K[d][d] += spring[d];
    // 강성이 없는 회전 자유도(모든 부재가 힌지로 모인 절점)는 자동으로 고정한다.
    const maxDiag = Math.max(1e-300, ...K.map((r, i) => Math.abs(r[i])));
    const auto = [];
    for (let n = 0; n < nn; n++) {
      const d = n * 3 + 2;
      if (!fixed[d] && Math.abs(K[d][d]) < 1e-12 * maxDiag) {
        if (Math.abs(P[d]) > 1e-12) return { ok: false, reason: "unstable", model, detail: "모든 부재가 힌지로 모인 절점에 모멘트가 걸렸다" };
        auto.push(d); fixed[d] = true;
      }
    }
    const free = [], sup = [];
    for (let d = 0; d < ndof; d++) (fixed[d] ? sup : free).push(d);
    const D = presc.slice();
    if (free.length) {
      const Kff = free.map((a) => free.map((b) => K[a][b]));
      const rhs = free.map((a) => P[a] - sup.reduce((sum, b) => sum + K[a][b] * D[b], 0));
      const tol = 1e-9 * Math.max(1e-300, ...free.map((a) => Math.abs(K[a][a])));
      const x = solveDense(Kff, rhs, tol);
      if (!x) return { ok: false, reason: "unstable", model };
      free.forEach((d, i) => { D[d] = x[i]; });
      const span = Math.max(1, ...nodes.flat().map(Math.abs));
      if (x.some((v, i) => !isFinite(v) || (free[i] % 3 !== 2 && Math.abs(v) > 1e3 * span))) return { ok: false, reason: "unstable", model };
    }
    const reactions = new Array(nn).fill(null);
    for (let n = 0; n < nn; n++) {
      let has = false; const r = [0, 0, 0];
      for (let q = 0; q < 3; q++) {
        const d = n * 3 + q;
        if (fixed[d] && !auto.includes(d)) { has = true; r[q] = K[d].reduce((sum, v, b) => sum + v * D[b], 0) - P[d]; }
        else if (spring[d]) { has = true; r[q] = -spring[d] * D[d]; }
      }
      if (has) reactions[n] = r;
    }
    // 부재 끝 힘(국부, 절점이 부재에 가하는 힘)
    els.forEach((e) => {
      const dg = e.dofs.map((d) => D[d]);
      const dl = e.T.map((row) => row.reduce((sum, v, q) => sum + v * dg[q], 0));
      const fe = e.kc.map((row, a) => row.reduce((sum, v, b) => sum + v * dl[b], 0) - e.fc[a]);
      e.R.forEach((r1) => { fe[r1] = 0; });
      // 해제된 끝의 부재 회전각 복원: d_r = k_rr⁻¹ (f_r − k_ra d_a)
      if (e.R.length) {
        const A = [0, 1, 2, 3, 4, 5].filter((a) => !e.R.includes(a));
        const rhs = e.R.map((r1) => e.f[r1] - A.reduce((sum, a) => sum + e.k[r1][a] * dl[a], 0));
        e.R.forEach((r1, x) => { dl[r1] = e.rr[x].reduce((sum, v, y) => sum + v * rhs[y], 0); });
      }
      e.dl = dl; e.fe = fe;
    });
    const ends = els.map((e) => ({ N1: -e.fe[0], V1: e.fe[1], M1: -e.fe[2], N2: e.fe[3], V2: -e.fe[4], M2: e.fe[5], f: e.fe.slice() }));

    function forcesAt(e, x) {
      const fe = e.fe;
      let N = -fe[0], V = fe[1], M = -fe[2] + x * fe[1];
      e.dist.forEach((q) => {
        const s0 = q.s0, s1 = Math.min(x, q.s1);
        if (s1 <= s0) return;
        const qa = (t) => q.a0 + ((q.a1 - q.a0) * (t - q.s0)) / (q.s1 - q.s0), qt = (t) => q.t0 + ((q.t1 - q.t0) * (t - q.s0)) / (q.s1 - q.s0), m = (s0 + s1) / 2, h = s1 - s0;
        N -= ((qa(s0) + qa(s1)) / 2) * h;
        V += ((qt(s0) + qt(s1)) / 2) * h;
        M += (h / 6) * ((x - s0) * qt(s0) + 4 * (x - m) * qt(m) + (x - s1) * qt(s1));
      });
      e.pts.forEach((p) => { if (p.a < x) { N -= p.pa; V += p.pt; M += p.pt * (x - p.a); } });
      e.mom.forEach((p) => { if (p.a < x) M -= p.M; });
      return { N, V, M };
    }
    function sample(mi, n = 60) {
      const e = els[mi], L = e.L, eps = L * 1e-6;
      const ss = new Set();
      for (let k = 0; k <= n; k++) ss.add((L * k) / n);
      e.pts.forEach((p) => { ss.add(Math.max(0, p.a - eps)); ss.add(Math.min(L, p.a + eps)); });
      e.mom.forEach((p) => { ss.add(Math.max(0, p.a - eps)); ss.add(Math.min(L, p.a + eps)); });
      e.dist.forEach((q) => { ss.add(q.s0); ss.add(q.s1); });
      const sv = [...ss].sort((a, b) => a - b);
      const out = sv.map((s) => Object.assign({ s }, forcesAt(e, s)));
      // 처짐: v'' = M/EI, u' = N/EA (i단의 국부 변위·회전에서 적분, 끝 오차는 선형 보정)
      const [u1, v1, th1, u2, v2] = e.dl, EI = e.E * e.I, EA = e.E * e.A;
      let th = th1, v = v1, u = u1;
      out[0].v = v; out[0].u = u; out[0].th = th;
      for (let k = 1; k < out.length; k++) {
        const ds = out[k].s - out[k - 1].s;
        const k0 = out[k - 1].M / EI, k1 = out[k].M / EI;
        v += th * ds + ((2 * k0 + k1) / 6) * ds * ds;
        th += ((k0 + k1) / 2) * ds;
        u += ((out[k - 1].N + out[k].N) / 2 / EA) * ds;
        out[k].v = v; out[k].u = u; out[k].th = th;
      }
      const ev = v2 - out[out.length - 1].v, eu = u2 - out[out.length - 1].u;
      const [x1, y1] = nodes[e.i];
      out.forEach((p) => {
        p.v += (ev * p.s) / L; p.u += (eu * p.s) / L; p.th += ev / L;
        p.x = x1 + e.c * p.s; p.y = y1 + e.s * p.s;
        p.ux = e.c * p.u - e.s * p.v; p.uy = e.s * p.u + e.c * p.v;
      });
      return out;
    }
    const cache = {};
    const res = {
      ok: true, model, els, ends, reactions, auto,
      d: nodes.map((_, n) => [D[n * 3], D[n * 3 + 1], D[n * 3 + 2]]),
      sample(mi, n = 60) { const key = mi + ":" + n; return cache[key] || (cache[key] = sample(mi, n)); },
      at(mi, s) { return forcesAt(els[mi], s); },
      maxAbs(key) {
        let best = 0;
        els.forEach((_, mi) => res.sample(mi).forEach((p) => { const v = key === "disp" ? Math.hypot(p.ux, p.uy) : Math.abs(p[key]); if (v > best) best = v; }));
        return best;
      },
    };
    return res;
  };

  /** 트러스 편의 함수: bars: [[i, j], ...], EA(kN) 하나 또는 배열. CB.frame 결과 + r.N[m](부재력, 인장 +) */
  CB.truss = function (o) {
    const members = o.bars.map(([i, j], k) => ({ i, j, truss: true, E: 1, A: Array.isArray(o.EA) ? o.EA[k] : o.EA || 1e6 }));
    const r = CB.frame({ nodes: o.nodes, members, supports: o.supports, loads: o.loads, springs: o.springs, settlements: o.settlements });
    if (r.ok) r.N = r.ends.map((e) => e.N1);
    return r;
  };

  /**
   * 수평 보(단순보·연속보·캔틸레버·게르버보) 편의 함수. 하중은 아래 방향이 +, 집중 모멘트는 반시계 방향이 +.
   *   const b = CB.beam({ L: 10, supports: [{ x: 0, type: "pin" }, { x: 10, type: "roller" }],   // pin | roller | fixed | slider | { type: "spring", k }
   *                       hinges: [6], EI: 2e5, EA: 1e7,
   *                       loads: [{ type: "udl", w: 10, a: 0, b: 10 }, { type: "lin", w1: 0, w2: 20, a: 0, b: 6 },
   *                               { type: "point", P: 50, a: 4 }, { type: "moment", M: 20, a: 3 }],
   *                       settle: [{ x: 10, dy: -0.01 }] });
   *   b.ok, b.reactions → [{ x, type, R(위 +), M(반시계 +) }], b.at(x, side) → { V, M, v, theta } (side: -1 왼쪽 극한, +1 오른쪽),
   *   b.sample(n) → [{ x, V, M, v }] (불연속점은 두 번 들어간다), b.extremes() → { Mmax, Mmin, Vmax, vmin, ... 위치 포함 }
   */
  CB.beam = function (o) {
    const L = o.L, EI = o.EI || 1e5, EA = o.EA || 1e8, tol = L * 1e-9;
    const xs = new Set([0, L]);
    (o.supports || []).forEach((s) => xs.add(s.x));
    (o.hinges || []).forEach((h) => xs.add(h));
    (o.nodes || []).forEach((h) => xs.add(h));
    const X = [...xs].sort((a, b) => a - b).filter((v, i, a) => i === 0 || v - a[i - 1] > tol);
    const nodeAt = (x) => X.findIndex((v) => Math.abs(v - x) <= tol);
    const nodes = X.map((x) => [x, 0]);
    const members = [];
    for (let k = 0; k < X.length - 1; k++) members.push({ i: k, j: k + 1, E: 1, A: EA, I: EI, hinge: [false, false] });
    (o.hinges || []).forEach((h) => { const n = nodeAt(h); if (n > 0) members[n - 1].hinge[1] = true; });
    const supports = {}, springs = {}, settlements = [];
    (o.supports || []).forEach((s) => {
      const n = nodeAt(s.x);
      if (s.type === "spring") { springs[n] = [0, s.k || 1e4, s.kr || 0]; if (s.fixX !== false) supports[n] = [1, 0, 0]; }
      else supports[n] = s.type || "pin";
    });
    (o.settle || []).forEach((s) => settlements.push({ node: nodeAt(s.x), dof: 1, value: s.dy }));
    const loads = [], memberLoads = [];
    const memberOf = (x) => { for (let k = 0; k < members.length; k++) if (x >= X[k] - tol && x <= X[k + 1] + tol) return k; return members.length - 1; };
    (o.loads || []).forEach((ld) => {
      if (ld.type === "point" || ld.type === "moment") {
        const n = nodeAt(ld.a);
        if (n >= 0) { if (ld.type === "point") loads.push({ node: n, fy: -ld.P }); else loads.push({ node: n, m: ld.M }); return; }
        const k = memberOf(ld.a);
        if (ld.type === "point") memberLoads.push({ member: k, P: [0, -ld.P], a: ld.a - X[k] });
        else memberLoads.push({ member: k, M: ld.M, a: ld.a - X[k] });
      } else {
        const a = ld.a != null ? ld.a : 0, bb = ld.b != null ? ld.b : L;
        const w1 = ld.type === "udl" ? ld.w : ld.w1, w2 = ld.type === "udl" ? ld.w : ld.w2;
        const wAt = (x) => w1 + ((w2 - w1) * (x - a)) / (bb - a);
        for (let k = 0; k < members.length; k++) {
          const s0 = Math.max(a, X[k]), s1 = Math.min(bb, X[k + 1]);
          if (s1 - s0 <= tol) continue;
          memberLoads.push({ member: k, w: [0, -wAt(s0)], w2: [0, -wAt(s1)], from: s0 - X[k], to: s1 - X[k] });
        }
      }
    });
    const r = CB.frame({ nodes, members, supports, springs, loads, memberLoads, settlements });
    const out = { ok: r.ok, reason: r.reason, frame: r, X, L, EI };
    if (!r.ok) return out;
    out.reactions = (o.supports || []).map((s) => { const R = r.reactions[nodeAt(s.x)] || [0, 0, 0]; return { x: s.x, type: s.type, R: R[1], H: R[0], M: R[2] }; });
    out.at = function (x, side = 1) {
      let k = memberOf(x);
      if (side < 0) { for (let q = 0; q < members.length; q++) if (x > X[q] + tol && x <= X[q + 1] + tol) { k = q; break; } }
      else { for (let q = 0; q < members.length; q++) if (x >= X[q] - tol && x < X[q + 1] - tol) { k = q; break; } }
      const s = CB.clamp(x - X[k], 0, X[k + 1] - X[k]);
      const f = r.at(k, side < 0 ? s : s + 1e-12);
      const pts = r.sample(k, 80);
      let v = 0, theta = 0;
      // 처짐각은 곡률 적분값(국부 회전각)을 보간한다. 수평 보이므로 국부 = 전역.
      for (let q = 1; q < pts.length; q++) if (pts[q].s >= s) { const t = (s - pts[q - 1].s) / Math.max(1e-12, pts[q].s - pts[q - 1].s); v = pts[q - 1].uy + t * (pts[q].uy - pts[q - 1].uy); theta = pts[q - 1].th + t * (pts[q].th - pts[q - 1].th); break; }
      return { V: f.V, M: f.M, v, theta };
    };
    out.sample = function (n = 200) {
      const res = [];
      members.forEach((_, k) => {
        const per = Math.max(8, Math.round((n * (X[k + 1] - X[k])) / L));
        r.sample(k, per).forEach((p) => res.push({ x: X[k] + p.s, V: p.V, M: p.M, v: p.uy, N: p.N }));
      });
      return res;
    };
    out.extremes = function () {
      const pts = out.sample(400);
      const pick = (key, f) => pts.reduce((b, p) => (f(p[key], b[key]) ? p : b), pts[0]);
      const Mmax = pick("M", (a, b) => a > b), Mmin = pick("M", (a, b) => a < b), Vmax = pick("V", (a, b) => Math.abs(a) > Math.abs(b)), vmin = pick("v", (a, b) => a < b), vmax = pick("v", (a, b) => a > b);
      return { Mmax: { x: Mmax.x, v: Mmax.M }, Mmin: { x: Mmin.x, v: Mmin.M }, Vabs: { x: Vmax.x, v: Vmax.V }, vmin: { x: vmin.x, v: vmin.v }, vmax: { x: vmax.x, v: vmax.v } };
    };
    return out;
  };

  /* ==================================================================== cross sections */
  /**
   * 단면 성질. 단위는 호출하는 쪽이 정한다(mm 권장). 직사각형 조각의 합으로 계산한다.
   *   CB.section.rects([{ x, y, b, h, n }])  x, y = 조각의 왼쪽 아래 모서리, n = 환산 계수(구멍은 −1, 합성 단면은 탄성계수비)
   *   CB.section.rect(b, h), .H(h, b, tw, tf), .tee(b, tf, h, tw), .box(B, H, t), .channel(h, b, tw, tf), .circle(d), .pipe(D, t)
   *   → { A, cx, cy, Ix, Iy, Ixy, I1, I2, theta, ytop, ybot, Stop, Sbot, Sx(작은 쪽), Sy, rx, ry, Zx, ypna, xmin, xmax, ymin, ymax, rects | circle }
   *   CB.section.shear(sec, y) → { Q, b } : 높이 y 위쪽 면적의 도심축에 대한 1차 모멘트와 그 높이의 폭(τ = VQ/(Ib))
   */
  CB.section = {
    rects(list) {
      const pos = list.filter((r) => (r.n == null ? 1 : r.n) > 0);
      let A = 0, Sx = 0, Sy = 0;
      list.forEach((r) => { const n = r.n == null ? 1 : r.n, a = n * r.b * r.h; A += a; Sx += a * (r.y + r.h / 2); Sy += a * (r.x + r.b / 2); });
      const cy = Sx / A, cx = Sy / A;
      let Ix = 0, Iy = 0, Ixy = 0;
      list.forEach((r) => {
        const n = r.n == null ? 1 : r.n, a = n * r.b * r.h, dy = r.y + r.h / 2 - cy, dx = r.x + r.b / 2 - cx;
        Ix += (n * r.b * r.h ** 3) / 12 + a * dy * dy; Iy += (n * r.h * r.b ** 3) / 12 + a * dx * dx; Ixy += a * dx * dy;
      });
      const ymin = Math.min(...pos.map((r) => r.y)), ymax = Math.max(...pos.map((r) => r.y + r.h));
      const xmin = Math.min(...pos.map((r) => r.x)), xmax = Math.max(...pos.map((r) => r.x + r.b));
      const avg = (Ix + Iy) / 2, R = Math.hypot((Ix - Iy) / 2, Ixy);
      // 소성 중립축: 위아래 (환산) 면적이 같아지는 높이
      const above = (y) => list.reduce((sum, r) => sum + (r.n == null ? 1 : r.n) * r.b * CB.clamp(r.y + r.h - Math.max(y, r.y), 0, r.h), 0);
      let lo = ymin, hi = ymax;
      for (let k = 0; k < 60; k++) { const mid = (lo + hi) / 2; if (above(mid) > A / 2) lo = mid; else hi = mid; }
      const yp = (lo + hi) / 2;
      let Zx = 0;
      list.forEach((r) => {
        const n = r.n == null ? 1 : r.n, y0 = r.y, y1 = r.y + r.h;
        const up0 = Math.max(y0, yp), dn1 = Math.min(y1, yp);
        if (y1 > up0) Zx += (n * r.b * ((y1 - yp) ** 2 - (up0 - yp) ** 2)) / 2;
        if (dn1 > y0) Zx += (n * r.b * ((yp - y0) ** 2 - (yp - dn1) ** 2)) / 2;
      });
      const ytop = ymax - cy, ybot = cy - ymin;
      return { A, cx, cy, Ix, Iy, Ixy, I1: avg + R, I2: avg - R, theta: 0.5 * Math.atan2(-2 * Ixy, Ix - Iy), ytop, ybot,
        Stop: Ix / ytop, Sbot: Ix / ybot, Sx: Ix / Math.max(ytop, ybot), Sy: Iy / Math.max(xmax - cx, cx - xmin),
        rx: Math.sqrt(Ix / A), ry: Math.sqrt(Iy / A), Zx, ypna: yp, xmin, xmax, ymin, ymax, rects: list };
    },
    rect: (b, h) => CB.section.rects([{ x: -b / 2, y: 0, b, h }]),
    H: (h, b, tw, tf) => CB.section.rects([{ x: -b / 2, y: 0, b, h: tf }, { x: -tw / 2, y: tf, b: tw, h: h - 2 * tf }, { x: -b / 2, y: h - tf, b, h: tf }]),
    tee: (b, tf, h, tw) => CB.section.rects([{ x: -tw / 2, y: 0, b: tw, h: h - tf }, { x: -b / 2, y: h - tf, b, h: tf }]),
    box: (B, H, t) => CB.section.rects([{ x: -B / 2, y: 0, b: B, h: H }, { x: -B / 2 + t, y: t, b: B - 2 * t, h: H - 2 * t, n: -1 }]),
    channel: (h, b, tw, tf) => CB.section.rects([{ x: 0, y: 0, b, h: tf }, { x: 0, y: tf, b: tw, h: h - 2 * tf }, { x: 0, y: h - tf, b, h: tf }]),
    circle(d) {
      const A = (Math.PI * d * d) / 4, I = (Math.PI * d ** 4) / 64;
      return { A, cx: 0, cy: d / 2, Ix: I, Iy: I, Ixy: 0, I1: I, I2: I, theta: 0, ytop: d / 2, ybot: d / 2, Stop: I / (d / 2), Sbot: I / (d / 2), Sx: I / (d / 2), Sy: I / (d / 2), rx: d / 4, ry: d / 4, Zx: d ** 3 / 6, ypna: d / 2, xmin: -d / 2, xmax: d / 2, ymin: 0, ymax: d, circle: { D: d, d: 0 }, J: (Math.PI * d ** 4) / 32 };
    },
    pipe(D, t) {
      const d = D - 2 * t, A = (Math.PI * (D * D - d * d)) / 4, I = (Math.PI * (D ** 4 - d ** 4)) / 64;
      return { A, cx: 0, cy: D / 2, Ix: I, Iy: I, Ixy: 0, I1: I, I2: I, theta: 0, ytop: D / 2, ybot: D / 2, Stop: I / (D / 2), Sbot: I / (D / 2), Sx: I / (D / 2), Sy: I / (D / 2), rx: Math.sqrt(I / A), ry: Math.sqrt(I / A), Zx: (D ** 3 - d ** 3) / 6, ypna: D / 2, xmin: -D / 2, xmax: D / 2, ymin: 0, ymax: D, circle: { D, d }, J: (Math.PI * (D ** 4 - d ** 4)) / 32 };
    },
    shear(sec, y) {
      if (sec.circle) {
        // 원·원관: 높이 y 위쪽 원 조각들로 수치 적분
        const R = sec.circle.D / 2, r = sec.circle.d / 2, yc = y - sec.cy, width = (rad, h) => (Math.abs(h) < rad ? 2 * Math.sqrt(rad * rad - h * h) : 0);
        let Q = 0; const n = 200;
        for (let k = 0; k < n; k++) { const h0 = yc + ((R - yc) * (k + 0.5)) / n, dh = (R - yc) / n; Q += (width(R, h0) - width(r, h0)) * h0 * dh; }
        return { Q, b: width(R, yc) - width(r, yc) };
      }
      let Q = 0, b = 0;
      sec.rects.forEach((r) => {
        const n = r.n == null ? 1 : r.n, y0 = Math.max(r.y, y), y1 = r.y + r.h;
        if (y1 > y0) Q += n * r.b * (y1 - y0) * ((y0 + y1) / 2 - sec.cy);
        if (y >= r.y && y <= r.y + r.h) b += n * r.b;
      });
      return { Q, b };
    },
  };

  /* ==================================================================== drawing structures */
  /**
   * CB.plane의 draw(P) 안에서 CB.frame 결과를 그린다.
   *   CB.drawFrame(P, r, { diagram: "M"|"V"|"N"|null, diagramScale(px/단위, 생략 시 최댓값 = diagramPx), diagramPx: 46, labels: true,
   *                        deformed: false | 배율 | "auto", deformPx: 28, axialColors: false, loads: true, loadPx: 42, reactions: false,
   *                        supports: true, memberColor(mi), memberWidth: 3.5, nodeLabels: false, supportSide: { n: "up"|"down"|"left"|"right" } })
   *   단면력도: M은 인장측에 그린다(새깅이면 보 아래쪽). V·N은 국부 +y 쪽이 +.
   *   색: 하중 accent2, 반력 ok, 인장 tension(파랑), 압축 compression(빨강), 변형 accent 점선.
   */
  CB.drawFrame = function (P, r, o = {}) {
    const pal = P.P, ctx = P.ctx, model = r.model, nodes = model.nodes;
    const tension = CB.color("tension"), compression = CB.color("compression");
    const mono = getComputedStyle(document.body).getPropertyValue("--mono");
    const font = getComputedStyle(document.body).getPropertyValue("--font");
    const label = (s, px, py, op = {}) => {
      ctx.save(); ctx.font = `${op.bold === false ? "" : "600 "}${op.size || 11.5}px ${op.mono === false ? font : mono}`;
      ctx.textAlign = op.align || "center"; ctx.textBaseline = op.baseline || "middle";
      if (op.halo !== false) { ctx.lineWidth = 3.5; ctx.strokeStyle = pal.bg; ctx.lineJoin = "round"; ctx.strokeText(s, px, py); }
      ctx.fillStyle = op.color || pal.text; ctx.fillText(s, px, py); ctx.restore();
    };
    const arrowPx = (x0, y0, x1, y1, color, width = 2, head = 9) => {
      const L = Math.hypot(x1 - x0, y1 - y0); if (L < 1) return;
      const ux = (x1 - x0) / L, uy = (y1 - y0) / L;
      ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * head * 0.7, y1 - uy * head * 0.7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * head - uy * head * 0.45, y1 - uy * head + ux * head * 0.45); ctx.lineTo(x1 - ux * head + uy * head * 0.45, y1 - uy * head - ux * head * 0.45); ctx.closePath(); ctx.fill();
      ctx.restore();
    };
    const momentPx = (cx, cy, M, color, rad = 15) => {
      const ccw = M > 0, a0 = ccw ? 0.35 * Math.PI : 0.65 * Math.PI, a1 = ccw ? 1.85 * Math.PI : -0.85 * Math.PI;
      ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, rad, -a0, -a1, ccw); ctx.stroke();
      const ex = cx + rad * Math.cos(-a1), ey = cy + rad * Math.sin(-a1), tx = ccw ? Math.sin(-a1) : -Math.sin(-a1), ty = ccw ? -Math.cos(-a1) : Math.cos(-a1);
      ctx.beginPath(); ctx.moveTo(ex + tx * 7, ey + ty * 7); ctx.lineTo(ex - ty * 4.5, ey + tx * 4.5); ctx.lineTo(ex + ty * 4.5, ey - tx * 4.5); ctx.closePath(); ctx.fill();
      ctx.restore();
    };
    const els = r.els || model.members.map((m) => { const [x1, y1] = nodes[m.i], [x2, y2] = nodes[m.j], L = Math.hypot(x2 - x1, y2 - y1); return { m, i: m.i, j: m.j, L, c: (x2 - x1) / L, s: (y2 - y1) / L, rel: m.truss ? [true, true] : m.hinge || [false, false] }; });
    const NX = (n) => P.X(nodes[n][0]), NY = (n) => P.Y(nodes[n][1]);

    // 단면력도
    if (o.diagram && r.ok) {
      const key = o.diagram, maxv = r.maxAbs(key) || 1;
      const scale = o.diagramScale || (o.diagramPx || 46) / maxv;
      const color = o.diagramColor || (key === "M" ? pal.accent : key === "V" ? pal.accent2 : pal.warn);
      els.forEach((e, mi) => {
        const pts = r.sample(mi);
        const sign = key === "M" ? -1 : 1;
        const nx = -e.s, ny = e.c; // 국부 +y(수학 좌표)
        const line = pts.map((p) => [P.X(p.x) + sign * nx * p[key] * scale, P.Y(p.y) - sign * ny * p[key] * scale]);
        ctx.save();
        ctx.beginPath(); ctx.moveTo(P.X(pts[0].x), P.Y(pts[0].y)); line.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(P.X(pts[pts.length - 1].x), P.Y(pts[pts.length - 1].y)); ctx.closePath();
        ctx.globalAlpha = 0.16; ctx.fillStyle = color; ctx.fill(); ctx.globalAlpha = 1;
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); line.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
        ctx.restore();
        if (o.labels !== false) {
          // 부재마다 끝값과 최댓값을 적는다(전체 최댓값의 4 % 이하는 생략)
          const cand = [pts[0], pts[pts.length - 1], pts.reduce((b, p) => (Math.abs(p[key]) > Math.abs(b[key]) ? p : b), pts[0])];
          const used = [];
          cand.forEach((p) => {
            if (Math.abs(p[key]) < 0.04 * maxv) return;
            if (used.some((q) => Math.abs(q.s - p.s) < e.L * 0.12 && Math.abs(q[key] - p[key]) < 0.08 * maxv)) return;
            used.push(p);
            const off = p[key] * scale * sign, ox = P.X(p.x) + nx * off, oy = P.Y(p.y) - ny * off, dirx = nx * Math.sign(off || 1), diry = -ny * Math.sign(off || 1);
            label(CB.num(p[key], Math.abs(p[key]) >= 100 ? 0 : 1), ox + dirx * 12, oy + diry * 10, { color, size: 11 });
          });
        }
      });
    }
    // 변형 형상
    if (o.deformed && r.ok) {
      const md = r.maxAbs("disp") || 1;
      const k = o.deformed === "auto" || o.deformed === true ? (o.deformPx || 28) / (md * P.unit) : o.deformed;
      ctx.save(); ctx.strokeStyle = o.axialColors ? pal.dim : pal.accent; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      els.forEach((e, mi) => { const pts = r.sample(mi); ctx.beginPath(); pts.forEach((p, q) => { const x = P.X(p.x + k * p.ux), y = P.Y(p.y + k * p.uy); q ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); });
      ctx.restore();
    }
    // 부재
    const maxN = o.axialColors && r.ok ? Math.max(1e-9, ...r.ends.map((e) => Math.abs(e.N1))) : 1;
    els.forEach((e, mi) => {
      let color = (o.memberColor && o.memberColor(mi)) || pal.text, width = o.memberWidth || (e.m.truss ? 2.6 : 3.5);
      if (o.axialColors && r.ok) {
        const N = r.ends[mi].N1, t = Math.abs(N) / maxN;
        color = Math.abs(N) < 1e-6 * maxN ? pal.faint : N > 0 ? tension : compression;
        width = 1.6 + 4.4 * t;
      }
      ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(NX(e.i), NY(e.i)); ctx.lineTo(NX(e.j), NY(e.j)); ctx.stroke(); ctx.restore();
      if (o.memberLabels) {
        const t = o.memberLabels(mi);
        if (t) label(t, (NX(e.i) + NX(e.j)) / 2 - e.s * 0, (NY(e.i) + NY(e.j)) / 2, { color, size: 11 });
      }
      // 부재 끝 힌지
      e.rel.forEach((rel, end) => {
        if (!rel || e.m.truss) return;
        const n = end ? e.j : e.i, dir = end ? -1 : 1;
        const hx = NX(n) + dir * e.c * 7, hy = NY(n) - dir * e.s * 7;
        ctx.save(); ctx.fillStyle = pal.bg; ctx.strokeStyle = pal.text; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(hx, hy, 4.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
      });
    });
    // 절점(트러스는 작은 원)
    nodes.forEach((_, n) => {
      const truss = els.some((e) => (e.i === n || e.j === n) && e.m.truss);
      if (!truss) return;
      ctx.save(); ctx.fillStyle = pal.bg; ctx.strokeStyle = pal.text; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(NX(n), NY(n), 3.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
    });
    // 지점
    if (o.supports !== false) {
      Object.entries(model.supports || {}).forEach(([k, v]) => {
        const n = +k, x = NX(n), y = NY(n), sz = o.supportSize || 13;
        const rr = typeof v === "string" ? SUPPORTS[v] : v;
        const type = typeof v === "string" ? v : rr[0] && rr[1] && rr[2] ? "fixed" : rr[0] && rr[1] ? "pin" : rr[1] && rr[2] ? "slider" : rr[0] && rr[2] ? "guide" : rr[1] ? "roller" : rr[0] ? "rollerV" : "free";
        // 방향: 연결 부재의 반대쪽(기본은 아래)
        let side = (o.supportSide && o.supportSide[n]) || null;
        if (!side) {
          let ax = 0, ay = 0;
          els.forEach((e) => { if (e.i === n) { ax += e.c; ay += e.s; } if (e.j === n) { ax -= e.c; ay -= e.s; } });
          if (type === "rollerV" || type === "guide") side = ax >= 0 ? "left" : "right";
          else if (type === "fixed") side = Math.abs(ay) >= Math.abs(ax) * 0.9 ? (ay >= 0 ? "down" : "up") : ax >= 0 ? "left" : "right";
          else side = ay < -0.7 && Math.abs(ax) < 0.5 ? "up" : "down";
        }
        const rot = { down: 0, up: Math.PI, left: Math.PI / 2, right: -Math.PI / 2 }[side];
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
        ctx.strokeStyle = pal.text; ctx.fillStyle = pal.surface; ctx.lineWidth = 1.6;
        const hatch = (yy, w) => { ctx.beginPath(); ctx.moveTo(-w, yy); ctx.lineTo(w, yy); ctx.stroke(); ctx.save(); ctx.lineWidth = 1; ctx.strokeStyle = pal.dim; for (let q = -w + 3; q <= w; q += 5) { ctx.beginPath(); ctx.moveTo(q, yy); ctx.lineTo(q - 5, yy + 6); ctx.stroke(); } ctx.restore(); };
        if (type === "fixed") { ctx.lineWidth = 2.6; hatch(0, sz * 1.1); }
        else if (type === "pin") { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-sz * 0.8, sz * 1.2); ctx.lineTo(sz * 0.8, sz * 1.2); ctx.closePath(); ctx.fill(); ctx.stroke(); hatch(sz * 1.2, sz); }
        else if (type === "roller" || type === "rollerV") {
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-sz * 0.8, sz * 0.95); ctx.lineTo(sz * 0.8, sz * 0.95); ctx.closePath(); ctx.fill(); ctx.stroke();
          [-sz * 0.45, sz * 0.45].forEach((cx) => { ctx.beginPath(); ctx.arc(cx, sz * 0.95 + 3.4, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
          hatch(sz * 0.95 + 6.8, sz);
        } else if (type === "slider" || type === "guide") {
          ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-sz * 0.9, 0); ctx.lineTo(sz * 0.9, 0); ctx.stroke();
          ctx.lineWidth = 1.6; [-sz * 0.5, sz * 0.5].forEach((cx) => { ctx.beginPath(); ctx.arc(cx, 3.6, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
          hatch(7.4, sz);
        }
        ctx.restore();
      });
      Object.entries(model.springs || {}).forEach(([k, v]) => {
        if (!v[1]) return;
        const x = NX(+k), y = NY(+k);
        ctx.save(); ctx.strokeStyle = pal.text; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y);
        for (let q = 1; q <= 8; q++) ctx.lineTo(x + (q % 2 ? 6 : -6), y + q * 3.2);
        ctx.lineTo(x, y + 30); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 12, y + 30); ctx.lineTo(x + 12, y + 30); ctx.stroke(); ctx.restore();
      });
    }
    // 하중
    if (o.loads !== false) {
      const loadColor = o.loadColor || pal.accent2, Lp = o.loadPx || 42;
      const ml = model.memberLoads || [];
      const wmax = Math.max(1e-9, ...ml.filter((q) => q.w).map((q) => Math.max(Math.hypot(...q.w), Math.hypot(...(q.w2 || q.w)))));
      ml.forEach((q) => {
        const e = els[q.member], [x1, y1] = nodes[e.i];
        const glob = (v) => (q.local ? [e.c * v[0] - e.s * v[1], e.s * v[0] + e.c * v[1]] : v);
        if (q.w) {
          const wa = glob(q.w), wb = glob(q.w2 || q.w), s0 = q.from != null ? q.from : 0, s1 = q.to != null ? q.to : e.L;
          const mag = (v) => Math.hypot(v[0], v[1]), dir = mag(wa) > mag(wb) ? wa : wb, dm = mag(dir) || 1;
          const ux = dir[0] / dm, uy = dir[1] / dm; // 수학 좌표 방향
          const segPx = Math.hypot(P.X(x1 + e.c * s1) - P.X(x1 + e.c * s0), P.Y(y1 + e.s * s1) - P.Y(y1 + e.s * s0));
          const nArr = Math.max(2, Math.round(segPx / 20) + 1);
          const tails = [];
          for (let k = 0; k < nArr; k++) {
            const t = k / (nArr - 1), s = s0 + (s1 - s0) * t, w = mag(wa) + (mag(wb) - mag(wa)) * t;
            const hx = P.X(x1 + e.c * s), hy = P.Y(y1 + e.s * s), len = 10 + (Lp * 0.75 * w) / wmax;
            const tx = hx - ux * len, ty = hy + uy * len;
            tails.push([tx, ty]);
            if (w > 1e-9) arrowPx(tx, ty, hx, hy, loadColor, 1.5, 7);
          }
          ctx.save(); ctx.strokeStyle = loadColor; ctx.lineWidth = 1.5; ctx.beginPath(); tails.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
          if (o.loadLabels !== false) {
            const mid = tails[Math.floor(tails.length / 2)], same = Math.abs(mag(wa) - mag(wb)) < 1e-9;
            label(same ? `${CB.num(mag(wa), mag(wa) < 10 ? 1 : 0)} kN/m` : `${CB.num(mag(wa), 0)}→${CB.num(mag(wb), 0)} kN/m`, mid[0] - ux * 2, mid[1] + uy * 2 - 9, { color: loadColor, size: 11 });
          }
        }
        if (q.P) {
          const v = glob(q.P), m = Math.hypot(v[0], v[1]) || 1, hx = P.X(x1 + e.c * q.a), hy = P.Y(y1 + e.s * q.a);
          arrowPx(hx - (v[0] / m) * Lp, hy + (v[1] / m) * Lp, hx, hy, loadColor, 2.4, 10);
          if (o.loadLabels !== false) label(`${CB.num(m, m < 10 ? 1 : 0)} kN`, hx - (v[0] / m) * (Lp + 10), hy + (v[1] / m) * (Lp + 10), { color: loadColor });
        }
        if (q.M) {
          const hx = P.X(x1 + e.c * q.a), hy = P.Y(y1 + e.s * q.a);
          momentPx(hx, hy, q.M, loadColor);
          if (o.loadLabels !== false) label(`${CB.num(Math.abs(q.M), 0)} kN·m`, hx, hy - 26, { color: loadColor });
        }
      });
      (model.loads || []).forEach((ld) => {
        const x = NX(ld.node), y = NY(ld.node), fx = ld.fx || 0, fy = ld.fy || 0, m = Math.hypot(fx, fy);
        if (m > 1e-9) {
          arrowPx(x - (fx / m) * Lp, y + (fy / m) * Lp, x, y, loadColor, 2.4, 10);
          if (o.loadLabels !== false) label(`${CB.num(m, m < 10 ? 1 : 0)} kN`, x - (fx / m) * (Lp + 11), y + (fy / m) * (Lp + 11), { color: loadColor });
        }
        if (ld.m) { momentPx(x, y, ld.m, loadColor); if (o.loadLabels !== false) label(`${CB.num(Math.abs(ld.m), 0)} kN·m`, x, y - 26, { color: loadColor }); }
      });
    }
    // 반력
    if (o.reactions && r.ok) {
      const color = o.reactionColor || pal.ok, Lp = o.reactionPx || 34;
      r.reactions.forEach((R, n) => {
        if (!R) return;
        const x = NX(n), y = NY(n), gap = 18;
        if (Math.abs(R[1]) > 1e-6) { const d = Math.sign(R[1]); arrowPx(x, y + d * (gap + Lp), x, y + d * gap, color, 2.2, 9); label(`${CB.num(Math.abs(R[1]), Math.abs(R[1]) < 100 ? 1 : 0)}`, x + 4, y + d * (gap + Lp + 9), { color, align: "center" }); }
        if (Math.abs(R[0]) > 1e-6) { const d = Math.sign(R[0]); arrowPx(x - d * (gap + Lp), y + gap * 0.6, x - d * gap, y + gap * 0.6, color, 2.2, 9); label(`${CB.num(Math.abs(R[0]), Math.abs(R[0]) < 100 ? 1 : 0)}`, x - d * (gap + Lp + 14), y + gap * 0.6, { color }); }
        if (Math.abs(R[2]) > 1e-6) { momentPx(x, y, R[2], color, 22); label(`${CB.num(Math.abs(R[2]), 0)} kN·m`, x + 30, y - 22, { color, align: "left" }); }
      });
    }
    if (o.nodeLabels) nodes.forEach((_, n) => { const t = typeof o.nodeLabels === "function" ? o.nodeLabels(n) : String.fromCharCode(65 + n); if (t) label(t, NX(n) - 10, NY(n) - 12, { color: pal.dim, size: 11.5 }); });
  };

  /**
   * CB.beam 결과의 단면력도·처짐도를 위아래로 쌓아 그린다(보 아래 그래프: 양(+)이 위).
   *   CB.beamDiagrams(ctx, w, h, b, { keys: ["V", "M"] | ["M", "v"] ..., cursor: x, labels: true, top: 8, padL: 64, n: 240, y: { M: [lo, hi] } })
   *   → { rows: [{ key, box, X, Y }], X }  키: V(kN) · M(kN·m) · v(처짐, mm) · N(kN)
   */
  CB.beamDiagrams = function (ctx, w, h, b, o = {}) {
    const pal = CB.palette(), keys = o.keys || ["V", "M"], pts = o.points || b.sample(o.n || 240), L = b.L;
    const meta = {
      V: { label: "V (kN)", color: pal.accent2, soft: CB.color("accent-2-soft"), f: (p) => p.V, d: 1 },
      M: { label: "M (kN·m)", color: pal.accent, soft: CB.color("accent-soft"), f: (p) => p.M, d: 1 },
      v: { label: "v (mm)", color: pal.accent, soft: CB.color("accent-soft"), f: (p) => p.v * 1000, d: 2 },
      N: { label: "N (kN)", color: pal.warn, soft: CB.color("accent-2-soft"), f: (p) => p.N || 0, d: 1 },
    };
    const padL = o.padL || 64, padR = o.padR || 16, top = o.top != null ? o.top : 8, gap = 30, bottom = 24;
    const rowH = Math.max(40, (h - top - bottom - gap * (keys.length - 1)) / keys.length);
    const mono = getComputedStyle(document.body).getPropertyValue("--mono");
    const rows = keys.map((k, i) => {
      const m = meta[k], vals = pts.map(m.f).filter(isFinite);
      let lo = Math.min(0, ...vals), hi = Math.max(0, ...vals);
      if (o.y && o.y[k]) [lo, hi] = o.y[k];
      if (hi - lo < 1e-9) { hi += 1; lo -= 1; }
      const pad = (hi - lo) * 0.16;
      const box = { x: padL, y: top + i * (rowH + gap), w: w - padL - padR, h: rowH };
      const c = CB.chart(ctx, box, { x: [0, L], y: [lo - pad, hi + pad], yLabel: m.label, xFmt: (v) => String(+v.toFixed(2)),
        series: [{ data: pts.map((p) => [p.x, m.f(p)]), color: m.color, width: 2.2, fill: m.soft }], hlines: [{ y: 0, color: pal.axis, dash: [] }] });
      if (o.labels !== false) {
        const imax = vals.indexOf(Math.max(...vals)), imin = vals.indexOf(Math.min(...vals));
        const mark = (idx, above) => {
          const p = pts[idx], v = m.f(p);
          if (Math.abs(v) < 1e-6 * (Math.abs(hi) + Math.abs(lo))) return;
          ctx.save(); ctx.fillStyle = m.color; ctx.beginPath(); ctx.arc(c.X(p.x), c.Y(v), 3.2, 0, Math.PI * 2); ctx.fill();
          ctx.font = "600 11px " + mono; ctx.textAlign = c.X(p.x) > box.x + box.w - 60 ? "right" : c.X(p.x) < box.x + 40 ? "left" : "center"; ctx.textBaseline = above ? "bottom" : "top";
          ctx.lineWidth = 3; ctx.strokeStyle = pal.bg; const t = CB.num(v, Math.abs(v) >= 100 ? 0 : m.d);
          ctx.strokeText(t, c.X(p.x), c.Y(v) + (above ? -5 : 5)); ctx.fillText(t, c.X(p.x), c.Y(v) + (above ? -5 : 5)); ctx.restore();
        };
        mark(imax, true); if (imin !== imax) mark(imin, false);
      }
      return { key: k, box, X: c.X, Y: c.Y };
    });
    if (o.cursor != null) {
      const X = rows[0].X(o.cursor);
      ctx.save(); ctx.strokeStyle = pal.dim; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X, rows[0].box.y); ctx.lineTo(X, rows[rows.length - 1].box.y + rows[rows.length - 1].box.h); ctx.stroke(); ctx.restore();
    }
    ctx.save(); ctx.fillStyle = pal.dim; ctx.font = "12px " + getComputedStyle(document.body).getPropertyValue("--font"); ctx.textAlign = "right"; ctx.textBaseline = "bottom";
    ctx.fillText("x (m)", padL - 10, h - 2); ctx.restore();
    return { rows, X: rows[0].X };
  };

  /**
   * 단면 그리기: 캔버스 상자 안에 CB.section 결과를 맞춰 그린다. 반환값 { X(x), Y(y), s(px/단위) }로 응력 분포 등을 겹친다.
   *   CB.drawSection(ctx, sec, { x, y, w, h }, { fill, stroke, centroid: true, pna: false })
   */
  CB.drawSection = function (ctx, sec, box, o = {}) {
    const pal = CB.palette();
    const W = sec.xmax - sec.xmin, H = sec.ymax - sec.ymin, s = Math.min(box.w / W, box.h / H) * (o.fit || 0.92);
    const ox = box.x + box.w / 2 - ((sec.xmin + sec.xmax) / 2) * s, oy = box.y + box.h / 2 + ((sec.ymin + sec.ymax) / 2) * s;
    const X = (x) => ox + x * s, Y = (y) => oy - y * s;
    ctx.save();
    ctx.fillStyle = o.fill || CB.color("accent-soft"); ctx.strokeStyle = o.stroke || pal.accent; ctx.lineWidth = 1.6;
    if (sec.circle) {
      ctx.beginPath(); ctx.arc(X(0), Y(sec.cy), (sec.circle.D / 2) * s, 0, Math.PI * 2);
      if (sec.circle.d) ctx.arc(X(0), Y(sec.cy), (sec.circle.d / 2) * s, 0, Math.PI * 2, true);
      ctx.fill("evenodd"); ctx.stroke();
    } else {
      sec.rects.filter((r) => (r.n == null ? 1 : r.n) > 0).forEach((r) => { ctx.fillStyle = r.fill || o.fill || CB.color("accent-soft"); ctx.fillRect(X(r.x), Y(r.y + r.h), r.b * s, r.h * s); ctx.strokeRect(X(r.x), Y(r.y + r.h), r.b * s, r.h * s); });
      sec.rects.filter((r) => (r.n == null ? 1 : r.n) < 0).forEach((r) => { ctx.fillStyle = pal.bg; ctx.fillRect(X(r.x), Y(r.y + r.h), r.b * s, r.h * s); ctx.strokeRect(X(r.x), Y(r.y + r.h), r.b * s, r.h * s); });
    }
    if (o.centroid !== false) {
      ctx.strokeStyle = pal.accent2; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(X(sec.xmin) - 14, Y(sec.cy)); ctx.lineTo(X(sec.xmax) + 14, Y(sec.cy)); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = pal.accent2; ctx.beginPath(); ctx.arc(X(sec.cx), Y(sec.cy), 3.5, 0, Math.PI * 2); ctx.fill();
    }
    if (o.pna) { ctx.strokeStyle = pal.warn; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(sec.xmin) - 14, Y(sec.ypna)); ctx.lineTo(X(sec.xmax) + 14, Y(sec.ypna)); ctx.stroke(); }
    ctx.restore();
    return { X, Y, s };
  };

  /* ------------------------------------------------------------ structural dynamics & lateral loads (StructureBook) */
  // 단위: 질량 t(= kN·s²/m), 강성 kN/m, 힘 kN, 길이 m, 시간 s, 가속도 g 배수(이름에 밝힘) 또는 m/s². 교육용 모델. 기준값은 현행 KDS 41을 확인할 것.
  const G0 = 9.81;
  /** 대칭 행렬의 야코비 고유값 분해 → { values, vectors(열 = 고유벡터) } (오름차순) */
  function jacobi(A0) {
    const n = A0.length, A = A0.map((r) => r.slice()), V = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
    for (let sweep = 0; sweep < 100; sweep++) {
      let off = 0;
      for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += A[p][q] * A[p][q];
      if (off < 1e-22) break;
      for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
        if (Math.abs(A[p][q]) < 1e-300) continue;
        const th = (A[q][q] - A[p][p]) / (2 * A[p][q]), t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < n; k++) { const akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq; }
        for (let k = 0; k < n; k++) { const apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk; }
        for (let k = 0; k < n; k++) { const vkp = V[k][p], vkq = V[k][q]; V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq; }
      }
    }
    const idx = [...Array(n).keys()].sort((a, b) => A[a][a] - A[b][b]);
    return { values: idx.map((i) => A[i][i]), vectors: idx.map((i) => V.map((r) => r[i])) };
  }
  CB.dyn = {
    g: G0,
    jacobi,
    /** 1자유도: ωn = √(k/m), T = 2π/ωn, f = 1/T, 감쇠 고유 진동수 ωd */
    sdof(m, k, zeta = 0.05) { const w = Math.sqrt(k / m); return { omega: w, T: (2 * Math.PI) / w, f: w / (2 * Math.PI), omegaD: w * Math.sqrt(Math.max(0, 1 - zeta * zeta)), c: 2 * zeta * m * w }; },
    /** 정상 상태 동적 증폭 계수 Rd = 1/√((1 − r²)² + (2ζr)²), r = ω/ωn, 위상각 */
    Rd(r, zeta) { const d = Math.sqrt((1 - r * r) ** 2 + (2 * zeta * r) ** 2); return { Rd: 1 / d, phase: Math.atan2(2 * zeta * r, 1 - r * r) }; },
    /** 지반 운동 전달률 TR = √(1 + (2ζr)²) / √((1 − r²)² + (2ζr)²) (면진 효과) */
    TR(r, zeta) { return Math.sqrt(1 + (2 * zeta * r) ** 2) / Math.sqrt((1 - r * r) ** 2 + (2 * zeta * r) ** 2); },
    /**
     * 1자유도 시간 이력(뉴마크 평균 가속도법). o: { T, zeta, ag: [m/s²] 또는 p: [kN], dt, m(기본 1) } → { t, u, v, a(상대), at(절대) }
     */
    newmark(o) {
      const m = o.m ?? 1, w = (2 * Math.PI) / o.T, k = m * w * w, c = 2 * (o.zeta ?? 0.05) * m * w, dt = o.dt;
      const load = o.p ? o.p : o.ag.map((x) => -m * x), n = load.length;
      const u = new Float64Array(n), v = new Float64Array(n), a = new Float64Array(n);
      a[0] = (load[0] - c * v[0] - k * u[0]) / m;
      const kh = k + (2 * c) / dt + (4 * m) / (dt * dt);
      for (let i = 0; i < n - 1; i++) {
        const dp = load[i + 1] - load[i] + m * ((4 / dt) * v[i] + 2 * a[i]) + 2 * c * v[i];
        const du = dp / kh, dv = (2 / dt) * du - 2 * v[i];
        u[i + 1] = u[i] + du; v[i + 1] = v[i] + dv;
        a[i + 1] = (load[i + 1] - c * v[i + 1] - k * u[i + 1]) / m;
      }
      const t = Array.from({ length: n }, (_, i) => i * dt);
      const at = o.ag ? Array.from(a, (x, i) => x + o.ag[i]) : Array.from(a);
      return { t, u: Array.from(u), v: Array.from(v), a: Array.from(a), at };
    },
    /** 응답 스펙트럼: 주기 배열마다 최대 |u| → { T, Sd (m), PSv (m/s), PSa (m/s²) } */
    spectrum(ag, dt, periods, zeta = 0.05) {
      return periods.map((T) => {
        if (T <= 0) { const pga = Math.max(...ag.map(Math.abs)); return { T, Sd: 0, PSv: 0, PSa: pga }; }
        const r = CB.dyn.newmark({ T, zeta, ag, dt }), Sd = Math.max(...r.u.map(Math.abs)), w = (2 * Math.PI) / T;
        return { T, Sd, PSv: w * Sd, PSa: w * w * Sd };
      });
    },
    /** 교육용 인공 지진파(감쇠 포락선 × 여러 주기의 사인 합, 시드 고정). pga g 배수 → m/s² 배열 */
    quake(o = {}) {
      const dur = o.dur ?? 20, dt = o.dt ?? 0.01, pga = o.pga ?? 0.22, r = CB.rng(o.seed ?? 7), n = Math.round(dur / dt), comps = [];
      for (let i = 0; i < 40; i++) comps.push({ f: 0.3 + r() * (o.fmax ?? 8), ph: r() * 2 * Math.PI, a: 0.5 + r() });
      const raw = Array.from({ length: n }, (_, i) => { const t = i * dt, env = t < 2 ? (t / 2) ** 2 : Math.exp(-0.25 * (t - (o.strong ?? 6)) * (t > (o.strong ?? 6) ? 1 : 0)); return env * comps.reduce((s, c) => s + c.a * Math.sin(2 * Math.PI * c.f * t + c.ph), 0); });
      const mx = Math.max(...raw.map(Math.abs)) || 1;
      return raw.map((x) => (x / mx) * pga * G0);
    },
    /** 전단 건물 모형: 층 질량 m[i](t), 층 강성 k[i](kN/m), i = 0이 1층 → { K, M } */
    shearBuilding(m, k) {
      const n = m.length, K = Array.from({ length: n }, () => new Array(n).fill(0));
      for (let i = 0; i < n; i++) { K[i][i] += k[i]; if (i + 1 < n) { K[i][i] += k[i + 1]; K[i][i + 1] -= k[i + 1]; K[i + 1][i] -= k[i + 1]; } }
      return { K, M: m.slice() };
    },
    /**
     * 모드 해석(대각 질량). K φ = ω² M φ → [{ omega, T, f, phi (지붕 = 1로 정규화), Gamma, Meff, ratio }] 차수 오름차순
     */
    modes(K, mDiag) {
      const n = mDiag.length, s = mDiag.map((x) => 1 / Math.sqrt(x));
      const A = K.map((r, i) => r.map((v, j) => v * s[i] * s[j]));
      const { values, vectors } = jacobi(A), Mt = mDiag.reduce((a, b) => a + b, 0);
      return values.map((lam, idx) => {
        let phi = vectors[idx].map((v, i) => v * s[i]);
        const top = phi[n - 1] || phi.reduce((a, b) => (Math.abs(b) > Math.abs(a) ? b : a), 0);
        phi = phi.map((v) => v / top);
        const L = phi.reduce((a, p, i) => a + mDiag[i] * p, 0), Mn = phi.reduce((a, p, i) => a + mDiag[i] * p * p, 0);
        const omega = Math.sqrt(Math.max(0, lam)), Gamma = L / Mn, Meff = (L * L) / Mn;
        return { omega, T: omega > 0 ? (2 * Math.PI) / omega : Infinity, f: omega / (2 * Math.PI), phi, Gamma, Meff, ratio: Meff / Mt };
      });
    },
    /** 모드 조합 SRSS */
    srss(vals) { return Math.sqrt(vals.reduce((s, v) => s + v * v, 0)); },
    /**
     * 설계 응답 스펙트럼(KDS 41 17 00 형태, g 배수). SDS, SD1, TL(기본 5 s).
     * T < T0: SDS(0.4 + 0.6T/T0), T0 ≤ T ≤ TS: SDS, TS < T ≤ TL: SD1/T, T > TL: SD1·TL/T²; T0 = 0.2TS, TS = SD1/SDS
     */
    designSa(T, SDS, SD1, TL = 5) {
      const TS = SD1 / SDS, T0 = 0.2 * TS;
      if (T < T0) return SDS * (0.4 + (0.6 * T) / T0);
      if (T <= TS) return SDS;
      if (T <= TL) return SD1 / T;
      return (SD1 * TL) / (T * T);
    },
    /** 근사 고유 주기 Ta = Ct hn^x. type: "rcmf"(RC 모멘트 골조 0.0466, 0.9), "smf"(강 모멘트 골조 0.0724, 0.8), "ebf"(0.0731, 0.75), "other"(0.0488, 0.75) */
    Ta(hn, type = "other") { const t = { rcmf: [0.0466, 0.9], smf: [0.0724, 0.8], ebf: [0.0731, 0.75], other: [0.0488, 0.75] }[type] || [0.0488, 0.75]; return t[0] * Math.pow(hn, t[1]); },
    /**
     * 등가 정적 해석(KDS 41 17 00 형태). o: { W (kN), SDS, SD1, R, Ie, T, w: [층 중량], h: [층 높이(지반에서)] }
     * Cs = SD1/((R/Ie)T) ≤ SDS/(R/Ie), ≥ max(0.044 SDS Ie, 0.01). k = 1 (T ≤ 0.5), 2 (T ≥ 2.5), 사이 보간.
     * → { Cs, V, k, F: [층 지진력], Vx: [층 전단력], Mot (전도 모멘트) }
     */
    els(o) {
      const RI = o.R / (o.Ie ?? 1), T = Math.max(1e-3, o.T);
      let Cs = Math.min(o.SD1 / (RI * T), o.SDS / RI);
      Cs = Math.max(Cs, 0.044 * o.SDS * (o.Ie ?? 1), 0.01);
      const W = o.W ?? o.w.reduce((a, b) => a + b, 0), V = Cs * W;
      const k = T <= 0.5 ? 1 : T >= 2.5 ? 2 : 1 + (T - 0.5) / 2;
      const wh = o.w ? o.w.map((w, i) => w * Math.pow(o.h[i], k)) : [], S = wh.reduce((a, b) => a + b, 0);
      const F = wh.map((x) => (V * x) / S), Vx = F.map((_, i) => F.slice(i).reduce((a, b) => a + b, 0));
      const Mot = F.reduce((s, f, i) => s + f * o.h[i], 0);
      return { Cs, V, k, F, Vx, Mot, W };
    },
    /** 덴 하르톡 최적 TMD: 질량비 μ → { fRatio, zeta } */
    tmdOpt(mu) { return { fRatio: 1 / (1 + mu), zeta: Math.sqrt((3 * mu) / (8 * (1 + mu) ** 3)) }; },
    /** 2자유도(주 구조 + TMD) 정상 상태 주 구조 증폭 |X1|/(F/k1). r = ω/ω1 */
    tmdResponse(r, mu, fRatio, zetaT, zeta1 = 0) {
      const w1 = 1, k1 = 1, m1 = 1, m2 = mu, w2 = fRatio * w1, k2 = m2 * w2 * w2, c2 = 2 * zetaT * m2 * w2, c1 = 2 * zeta1 * m1 * w1, w = r;
      const re = (a, b) => ({ re: a, im: b });
      const A = re(k1 + k2 - m1 * w * w, (c1 + c2) * w), B = re(-k2, -c2 * w), D = re(k2 - m2 * w * w, c2 * w);
      const mul = (x, y) => re(x.re * y.re - x.im * y.im, x.re * y.im + x.im * y.re);
      const det = (() => { const ad = mul(A, D), bb = mul(B, B); return re(ad.re - bb.re, ad.im - bb.im); })();
      const X1 = (() => { const num = D, den = det, d2 = den.re * den.re + den.im * den.im; return re((num.re * den.re + num.im * den.im) / d2, (num.im * den.re - num.re * den.im) / d2); })();
      return Math.hypot(X1.re, X1.im) * k1;
    },
  };
  CB.wind = {
    rho: 1.22,
    /** 높이 z의 평균 풍속(멱법칙, 교육용): V(z) = V0 (z / 10)^α, z ≥ 5 m. V0는 그 부지 노풍도에서의 높이 10 m 풍속이다(지역 기본 풍속을 노풍도로 이미 보정한 값). 따라서 노풍도 사이에서는 높이 10 m 기준의 분포 모양(V/V10)만 비교한다. 멱지수 A 0.33, B 0.22, C 0.15, D 0.10 */
    ALPHA: { A: 0.33, B: 0.22, C: 0.15, D: 0.1 },
    speed(z, V0, rough = "B") { const a = CB.wind.ALPHA[rough] ?? 0.22; return V0 * Math.pow(Math.max(z, 5) / 10, a); },
    /** 속도압 q = ½ρV² (kN/m²) */
    q(V) { return (0.5 * CB.wind.rho * V * V) / 1000; },
    /** 층 풍하중(교육용): 층 높이 구간 [z1, z2], 폭 B, 풍압 계수 합 Cp(풍상 + 풍하), 가스트 계수 G → 힘(kN) */
    storyForce(z1, z2, B, V0, rough = "B", Cp = 1.3, G = 2.0) {
      const n = 8; let F = 0;
      for (let i = 0; i < n; i++) { const z = z1 + ((i + 0.5) * (z2 - z1)) / n; F += CB.wind.q(CB.wind.speed(z, V0, rough)) * G * Cp * B * ((z2 - z1) / n); }
      return F;
    },
    /** 와류 방출 진동수 fs = St V / D, 공진 풍속 Vcr = f D / St */
    vortexFreq(V, D, St = 0.12) { return (St * V) / D; },
  };

  /** 기준 건물 B-10의 동적 모형(Y 방향, 교육용). CONTRIBUTING.md 표와 같다. */
  CB.dyn.B10 = (() => {
    const h = [5]; for (let i = 1; i < 10; i++) h.push(h[i - 1] + 4);
    const w = h.map((_, i) => (i === 9 ? 6000 : 6900));
    const m = w.map((x) => x / G0), k = h.map(() => 1.2e6);
    return { h, w, m, k, W: w.reduce((a, b) => a + b, 0), SDS: 0.5, SD1: 0.29, R: 6, Ie: 1.2, hn: 41, V0: 26, rough: "B" };
  })();

  /* ------------------------------------------------------------ layout build */
  const LOGO = `<svg class="mark" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="mbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent-2)"/></linearGradient></defs><rect x="2" y="2" width="28" height="28" rx="8" fill="url(#mbg)"/><path d="M9 26V8h14v18M9 14h14M9 20h14M16 8v18" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 8l7 6 7-6" fill="none" stroke="#fff" stroke-width="1.3" opacity=".6"/></svg>`;
  const ICON_MENU = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`;
  const ICON_MOON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`;
  const ICON_SUN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;

  function build() {
    const body = document.body;
    const root = body.dataset.root != null ? body.dataset.root : body.dataset.chapter ? "../" : "";
    const curSlug = body.dataset.chapter || "";
    const href = (slug) => (slug ? `${root}chapters/${slug}.html` : `${root}index.html`);
    const feedbackUrl = "https://books.euiyun.com/feedback.html?book=structurebook&page=" + encodeURIComponent(location.href);

    const bar = document.createElement("header");
    bar.className = "sb-topbar";
    bar.innerHTML = `
      <button class="sb-btn icon" id="sb-menu" aria-label="챕터 목록">${ICON_MENU}</button>
      <a class="sb-logo" href="${href("")}">${LOGO}<span>StructureBook <small>건축구조 교과서</small></span></a>
      <span class="spacer"></span>
      <a class="sb-btn series-link" href="https://books.euiyun.com/" aria-label="전체 책 보기" title="전체 책 보기"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5h6v14H4zM10 5.5h6v14h-6zM17 7l3-1 2 13-3 1z"/></svg><span>전체 책</span></a>
      <button class="sb-btn icon" id="sb-theme" aria-label="테마 전환"></button>
      <div class="sb-progress" id="sb-progress"></div>`;
    const feedbackButton = document.createElement("a");
    feedbackButton.className = bar.className.replace("-topbar", "-btn") + " icon feedback-button";
    feedbackButton.href = feedbackUrl;
    feedbackButton.target = "_blank";
    feedbackButton.rel = "noopener";
    feedbackButton.setAttribute("aria-label", "독자 의견 보내기");
    feedbackButton.title = "독자 의견 보내기";
    feedbackButton.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 4V6a2 2 0 0 1 2-2z"/><path d="M8 9h8M8 13h5"/></svg>';
    bar.querySelector("[id$='-theme']").before(feedbackButton);
    body.prepend(bar);

    // Search chapter metadata immediately; load section and visual titles on demand.
    const progressBar = bar.querySelector("[id$='-progress']");
    const spacer = bar.querySelector(".spacer");
    const leftNav = document.createElement("div");
    leftNav.className = "book-nav-left";
    leftNav.append(bar.querySelector("[id$='-menu']"), bar.querySelector("a[class$='-logo']"));
    const rightNav = document.createElement("div");
    rightNav.className = "book-nav-right";
    [...bar.children].filter((el) => el !== spacer && el !== progressBar).forEach((el) => rightNav.appendChild(el));
    spacer.remove();
    const search = document.createElement("div");
    search.className = "book-search";
    search.innerHTML = '<svg class="book-search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg><input type="search" aria-label="이 책의 챕터, 섹션, 시뮬레이터, 그림 검색" placeholder="이 책 검색" autocomplete="off"><div class="book-search-results" aria-live="polite"></div>';
    bar.prepend(leftNav);
    bar.insertBefore(search, progressBar);
    bar.insertBefore(rightNav, progressBar);
    const searchInput = search.querySelector("input");
    const searchResults = search.querySelector(".book-search-results");
    const closeSearch = () => { search.classList.remove("open"); searchResults.replaceChildren(); };
    let detailEntries = [];
    let detailsLoaded = false;
    let detailPromise;
    function loadDetails() {
      if (detailPromise) return detailPromise;
      detailPromise = Promise.all(LIVE.map(async (chapter) => {
        try {
          const response = await fetch(href(chapter.slug));
          if (!response.ok) return [];
          const doc = new DOMParser().parseFromString(await response.text(), "text/html");
          const main = doc.querySelector("main.chapter");
          if (!main) return [];
          // 미리 렌더링된 수식은 TeX 원문으로 되돌려 검색어와 맞춘다.
          main.querySelectorAll(".katex").forEach((k) => k.replaceWith(k.querySelector("annotation")?.textContent || k.textContent));
          const entries = [];
          [...main.querySelectorAll("section > h2")].forEach((heading, i) => {
            entries.push({ type: "섹션", title: heading.textContent.trim(), chapter, hash: heading.parentElement.id || `s${i + 1}` });
          });
          [...main.querySelectorAll(".sim")].filter((sim) => sim.querySelector(".sim-head h3")).forEach((sim, i) => {
            entries.push({ type: "시뮬레이터", title: sim.querySelector(".sim-head h3").textContent.trim(), chapter, hash: sim.id || `search-sim-${i + 1}` });
          });
          [...main.querySelectorAll("figure")].filter((figure) => figure.querySelector("figcaption")).forEach((figure, i) => {
            const caption = figure.querySelector("figcaption").textContent.replace(/\s+/g, " ").trim();
            entries.push({ type: "그림", title: caption.slice(0, 140), chapter, hash: figure.id || `search-fig-${i + 1}` });
          });
          return entries;
        } catch (error) { return []; }
      })).then((parts) => { detailEntries = parts.flat(); detailsLoaded = true; renderSearch(); });
      return detailPromise;
    }
    function renderSearch() {
      const words = searchInput.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
      searchResults.replaceChildren();
      if (!words.length) { closeSearch(); return; }
      const includesWords = (value) => words.every((word) => value.toLocaleLowerCase().includes(word));
      const chapterMatches = LIVE.filter((c) => includesWords([c.num, c.title, c.desc, ...(c.tags || [])].join(" ")))
        .map((c) => ({ type: "챕터", title: c.title, chapter: c, hash: "" }));
      const detailMatches = detailEntries.filter((entry) => includesWords(entry.title));
      const matches = [
        ...chapterMatches.slice(0, 4),
        ...detailMatches.filter((entry) => entry.type === "섹션").slice(0, 5),
        ...detailMatches.filter((entry) => entry.type === "시뮬레이터").slice(0, 4),
        ...detailMatches.filter((entry) => entry.type === "그림").slice(0, 4),
      ];
      matches.forEach((entry) => {
        const link = document.createElement("a");
        link.href = href(entry.chapter.slug) + (entry.hash ? `#${entry.hash}` : "");
        const title = document.createElement("strong");
        title.textContent = entry.title;
        const context = document.createElement("small");
        context.textContent = `${entry.chapter.num} · ${entry.chapter.title} · ${entry.type}`;
        link.append(title, context);
        searchResults.appendChild(link);
      });
      if (chapterMatches.length + detailMatches.length > matches.length) {
        const more = document.createElement("p");
        more.textContent = `상위 ${matches.length}개 표시 · 검색어를 더 구체적으로 입력해 보세요`;
        searchResults.appendChild(more);
      }
      if (detailPromise && !detailsLoaded) {
        const status = document.createElement("p");
        status.textContent = "섹션·시뮬레이터·그림 목록을 불러오는 중…";
        searchResults.appendChild(status);
      } else if (!matches.length) {
        const empty = document.createElement("p");
        empty.textContent = "검색 결과가 없습니다";
        searchResults.appendChild(empty);
      }
      search.classList.add("open");
    }
    searchInput.addEventListener("input", () => { if (searchInput.value.trim()) loadDetails(); renderSearch(); });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeSearch(); searchInput.blur(); }
      else if (e.key === "ArrowDown") { const first = searchResults.querySelector("a"); if (first) { e.preventDefault(); first.focus(); } }
      else if (e.key === "Enter") { const first = searchResults.querySelector("a"); if (first) { e.preventDefault(); first.click(); } }
    });
    searchResults.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeSearch(); searchInput.focus(); }
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const links = [...searchResults.querySelectorAll("a")];
        const next = links.indexOf(document.activeElement) + (e.key === "ArrowDown" ? 1 : -1);
        e.preventDefault();
        (links[next] || searchInput).focus();
      }
    });
    document.addEventListener("pointerdown", (e) => { if (!search.contains(e.target)) closeSearch(); });


    const drawer = document.createElement("nav");
    drawer.className = "sb-drawer";
    drawer.innerHTML = `<h4>Chapters</h4><ul class="sb-chlist">
      <li><a href="${href("")}" class="${curSlug ? "" : "active"}"><span class="num">00</span><span>홈 · 로드맵</span></a></li>
      ${CHAPTERS.map((c) => c.planned ? `<li><span class="planned" title="집필 예정"><span class="num">${c.num}</span><span>${c.title}</span></span></li>` : `<li><a href="${href(c.slug)}" class="${c.slug === curSlug ? "active" : ""}"><span class="num">${c.num}</span><span>${c.title}</span></a></li>`).join("")}
    </ul>
    <h4 style="margin-top:22px">함께 읽기</h4><ul class="sb-chlist">
      <li><a href="${root}../mechanics/"><span class="num">↗</span><span>MechanicsBook · 구조역학</span></a></li>
      <li><a href="${root}../materials/"><span class="num">↗</span><span>MaterialsBook · 건설재료</span></a></li>
      <li><a href="${root}../geotech/"><span class="num">↗</span><span>GeotechBook · 지반공학</span></a></li>
      <li><a href="https://books.euiyun.com/"><span class="num">↗</span><span>전체 책 · books.euiyun.com</span></a></li>
      <li><a href="${root}../"><span class="num">↗</span><span>건설 서가</span></a></li>
    </ul>`;
    const backdrop = document.createElement("div");
    backdrop.className = "sb-drawer-backdrop";
    body.append(backdrop, drawer);
    const toggleDrawer = (o) => body.classList.toggle("drawer-open", o);
    bar.querySelector("#sb-menu").addEventListener("click", () => toggleDrawer(true));
    backdrop.addEventListener("click", () => toggleDrawer(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggleDrawer(false); });

    const tbtn = bar.querySelector("#sb-theme");
    const setIcon = () => (tbtn.innerHTML = CB.isDark() ? ICON_SUN : ICON_MOON);
    setIcon();
    tbtn.addEventListener("click", () => {
      const next = CB.isDark() ? "light" : "dark";
      try { localStorage.setItem("construction-theme", next); } catch (e) {}
      applyTheme(next); setIcon();
    });

    const prog = bar.querySelector("#sb-progress");
    const onScroll = () => { const h = document.documentElement.scrollHeight - innerHeight; prog.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%"; };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();

    const main = document.querySelector("main.chapter");
    if (main) {
      // Give search results stable anchors even when the source has no id.
      [...main.querySelectorAll(".sim")].filter((sim) => sim.querySelector(".sim-head h3")).forEach((sim, i) => { if (!sim.id) sim.id = `search-sim-${i + 1}`; });
      [...main.querySelectorAll("figure")].filter((figure) => figure.querySelector("figcaption")).forEach((figure, i) => { if (!figure.id) figure.id = `search-fig-${i + 1}`; });
      if (/^#(?:s\d+|search-(?:sim|fig)-)/.test(location.hash)) {
        requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
      }
      const layout = document.createElement("div");
      layout.className = "sb-layout";
      main.parentNode.insertBefore(layout, main);
      layout.appendChild(main);
      const toc = document.createElement("aside");
      toc.className = "sb-toc";
      const h2s = [...main.querySelectorAll("section > h2")];
      let n = 0;
      toc.innerHTML = "<h4>ON THIS PAGE</h4>" + h2s.map((h, i) => {
        const sec = h.parentElement;
        if (!sec.id) sec.id = "s" + (i + 1);
        const numbered = !sec.classList.contains("keypoints") && !sec.classList.contains("quiz-sec") && !sec.hasAttribute("data-nonum");
        if (numbered && !h.querySelector(".h-num")) { n++; h.insertAdjacentHTML("afterbegin", `<span class="h-num">${String(n).padStart(2, "0")}</span>`); }
        // 제목 텍스트를 쓰되, 빌드가 렌더링한 수식은 마크업 그대로 옮긴다.
        const label = [...h.childNodes].filter((node) => !node.classList?.contains("h-num"))
          .map((node) => (node.querySelector?.(".katex") ? node.outerHTML : node.textContent)).join("").trim();
        return `<a href="#${sec.id}">${label}</a>`;
      }).join("");
      layout.appendChild(toc);
      const links = [...toc.querySelectorAll("a")];
      if (window.IntersectionObserver && h2s.length) {
        const io = new IntersectionObserver((es) => {
          es.forEach((e) => { if (e.isIntersecting) { links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id)); } });
        }, { rootMargin: "-20% 0px -70% 0px" });
        h2s.forEach((h) => io.observe(h.parentElement));
      }

      const idx = LIVE.findIndex((c) => c.slug === curSlug);
      const prev = idx > 0 ? LIVE[idx - 1] : null;
      const next = idx >= 0 && idx < LIVE.length - 1 ? LIVE[idx + 1] : null;
      const pager = document.createElement("nav");
      pager.className = "sb-pager";
      pager.innerHTML =
        (prev ? `<a class="prev" href="${href(prev.slug)}"><small>← 이전 · ${prev.num}</small>${prev.title}</a>` : `<a class="prev" href="${href("")}"><small>← 처음으로</small>홈 · 로드맵</a>`) +
        (next ? `<a class="next" href="${href(next.slug)}"><small>다음 · ${next.num} →</small>${next.title}</a>` : "");
      layout.after(pager);
    }
    const foot = document.createElement("footer");
    foot.className = "sb-foot";
    foot.innerHTML = `StructureBook — 건물을 흔들고 구조 시스템을 바꿔 보며 배우는 건축구조 교과서 · 시뮬레이터의 수치는 브라우저에서 바로 계산하는 교육용 모델이며, 실제 구조 설계·안전 판단에 쓰지 않습니다.
      <br>함께 읽기: <a href="${root}../mechanics/">MechanicsBook · 구조역학</a> · <a href="${root}../materials/">MaterialsBook · 건설재료</a> · <a href="${root}../geotech/">GeotechBook · 지반공학</a> · <a href="https://semi.euiyun.com/infra/chapters/build.html">InfraBook · 팹 건설</a> · <a href="${root}../">건설 서가</a> · <a href="https://books.euiyun.com/">books.euiyun.com</a>
      <br>© 2026 geniuskey · 교재 콘텐츠 <a href="https://creativecommons.org/licenses/by/4.0/deed.ko">CC BY 4.0</a> ·
      코드 <a href="https://github.com/geniuskey/construction-books/blob/main/LICENSE-MIT">MIT</a> ·
      <a href="https://github.com/geniuskey/construction-books/blob/main/structure/LICENSE.md">라이선스 안내</a>`;
    const feedbackLink = document.createElement("a");
    feedbackLink.href = feedbackUrl;
    feedbackLink.target = "_blank";
    feedbackLink.rel = "noopener";
    feedbackLink.textContent = "독자 의견";
    foot.append(" · ", feedbackLink);
    body.appendChild(foot);

    document.querySelectorAll(".quiz-q").forEach((q) => {
      const opts = [...q.querySelectorAll("button.opt")];
      opts.forEach((b) => b.addEventListener("click", () => {
        opts.forEach((o) => { o.disabled = true; if (o.hasAttribute("data-correct")) o.classList.add("right"); });
        if (!b.hasAttribute("data-correct")) b.classList.add("wrong");
        q.classList.add("done");
        q.dispatchEvent(new CustomEvent("answered", { bubbles: true, detail: { correct: b.hasAttribute("data-correct") } }));
      }));
    });

    // KaTeX: 배포물의 수식은 빌드(tools/katex.mjs)가 미리 렌더링한다. 소스 파일을 바로 열었을 때만 CDN에서 불러와 렌더링한다.
    if (!document.querySelector(".katex") && /\\\(|\\\[|\$\$/.test(document.body.innerText)) {
      const KATEX = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/";
      const load = (tag, props) => new Promise((resolve, reject) => {
        const el = Object.assign(document.createElement(tag), props, { onload: resolve, onerror: reject });
        document.head.insertBefore(el, tag === "link" ? document.head.querySelector('link[rel="stylesheet"]') : null);
      });
      Promise.all([load("link", { rel: "stylesheet", href: KATEX + "katex.min.css" }), load("script", { src: KATEX + "katex.min.js" })])
        .then(() => load("script", { src: KATEX + "contrib/auto-render.min.js" }))
        .then(() => renderMathInElement(document.body, {
          delimiters: [{ left: "$$", right: "$$", display: true }, { left: "\\(", right: "\\)", display: false }, { left: "\\[", right: "\\]", display: true }],
          throwOnError: false,
          ignoredClasses: ["no-math"],
        }))
        .catch(() => {});
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();

// Simulator deep links: add a shareable # link to each simulator heading.
(function () {
  function addSimulatorLinks() {
    document.querySelectorAll(".sim[id] > .sim-head").forEach((head) => {
      if (head.querySelector(".sim-link")) return;
      const link = document.createElement("a");
      link.className = "sim-link";
      link.href = "#" + head.parentElement.id;
      link.textContent = "#";
      link.title = "이 시뮬레이터로 가는 링크";
      link.setAttribute("aria-label", "이 시뮬레이터로 가는 링크");
      head.appendChild(link);
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addSimulatorLinks, { once: true });
  } else {
    addSimulatorLinks();
  }
})();

// Series glossary tooltips (same runtime across independently deployed books).
(function () {
  const base = new URL(".", document.currentScript.src);
  window.BOOK_GLOSSARY_CONFIG = { dataUrl: new URL("glossary-data.js", base).href };
  const script = document.createElement("script");
  script.src = new URL("glossary-tooltips.js", base).href;
  document.head.append(script);
})();
