(() => {
  const FRAME_DIR = "assets/frames/";
  // Hard-coded so the page also works when opened straight from disk (file://),
  // where fetching manifest.json is blocked.
  const FRAME_COUNT = 193;
  const framePath = (i) => `${FRAME_DIR}frame_${String(i + 1).padStart(4, "0")}.webp`;

  const section = document.getElementById("pour");
  const canvas = document.getElementById("pour-canvas");
  const ctx = canvas.getContext("2d");
  const loaderEl = document.getElementById("loader");
  const loaderBar = document.getElementById("loader-bar");
  const dot = document.getElementById("progress-dot");
  const beats = [...document.querySelectorAll(".beat")];
  const nav = document.getElementById("nav");

  let frames = [];
  let frameCount = 0;
  let target = 0;   // frame the scroll position asks for
  let current = 0;  // eased frame actually drawn
  let lastDrawn = -1;

  // ---------- Canvas sizing ----------
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    lastDrawn = -1;
    draw(Math.round(current));
  }

  // Cover-fit on landscape; on portrait screens keep the bottle and plate
  // (which sit either side of centre) in view instead of cropping them off.
  function draw(index) {
    const img = nearestLoaded(index);
    if (!img) return;
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const cover = Math.max(cw / iw, ch / ih);
    const contain = Math.min(cw / iw, ch / ih);
    const portrait = cw / ch < 1;
    const scale = portrait ? Math.max(contain * 1.9, Math.min(cover, contain * 2.4)) : cover;
    const w = iw * scale, h = ih * scale;
    const focusX = 0.52;
    let x = cw / 2 - w * focusX;
    x = Math.min(0, Math.max(cw - w, x));
    const y = (ch - h) / 2;
    ctx.fillStyle = "#1f2610";
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, x, y, w, h);

    // Soften the letterbox edges when the frame doesn't fill the screen.
    if (y > 1) {
      const f = Math.min(h * 0.18, y + 40);
      const top = ctx.createLinearGradient(0, y, 0, y + f);
      top.addColorStop(0, "#1f2610");
      top.addColorStop(1, "rgba(31,38,16,0)");
      ctx.fillStyle = top;
      ctx.fillRect(0, y, cw, f);
      const bot = ctx.createLinearGradient(0, y + h - f, 0, y + h);
      bot.addColorStop(0, "rgba(31,38,16,0)");
      bot.addColorStop(1, "#1f2610");
      ctx.fillStyle = bot;
      ctx.fillRect(0, y + h - f, cw, f);
    }
  }

  function nearestLoaded(i) {
    if (frames[i] && frames[i].complete && frames[i].naturalWidth) return frames[i];
    for (let d = 1; d < frameCount; d++) {
      const a = frames[i - d], b = frames[i + d];
      if (a && a.complete && a.naturalWidth) return a;
      if (b && b.complete && b.naturalWidth) return b;
    }
    return null;
  }

  // ---------- Frame preloading ----------
  function load(i) {
    return new Promise((res) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = img.onerror = () => res(img);
      img.src = framePath(i);
      frames[i] = img;
    });
  }

  async function preload() {
    // Load a coarse pass first (every 8th frame) so scrubbing works quickly,
    // then fill in the rest.
    const order = [];
    const seen = new Set();
    for (const step of [8, 4, 2, 1]) {
      for (let i = 0; i < frameCount; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
    }
    let done = 0;
    const CONCURRENCY = 6;
    let cursor = 0;
    async function worker() {
      while (cursor < order.length) {
        const i = order[cursor++];
        await load(i);
        done++;
        loaderBar.style.width = `${(done / frameCount) * 100}%`;
        if (i === 0 || Math.abs(i - Math.round(current)) < 3) { lastDrawn = -1; }
      }
    }
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    loaderEl.classList.add("done");
  }

  // ---------- Scroll → frame ----------
  function progress() {
    const rect = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    return Math.min(1, Math.max(0, -rect.top / total));
  }

  function updateBeats(p) {
    for (const el of beats) {
      const a = parseFloat(el.dataset.in), b = parseFloat(el.dataset.out);
      const fade = 0.05;
      let o = 0;
      if (p >= a && p <= b) {
        o = Math.min(1, (p - a) / fade + (a === 0 ? 1 : 0), (b - p) / fade);
      }
      o = Math.max(0, Math.min(1, o));
      el.style.opacity = o;
      el.style.transform = `translateY(${(1 - o) * 30}px)`;
      el.classList.toggle("on", o > 0.5);
    }
  }

  function onScroll() {
    const p = progress();
    target = p * (frameCount - 1);
    dot.style.top = `${p * 100}%`;
    // Draw immediately as well, so the video tracks scrolling even if
    // animation frames are throttled; the rAF loop then eases between frames.
    if (Math.abs(target - current) > 6) {
      current = target;
      const idx = Math.round(current);
      draw(idx);
      lastDrawn = idx;
    }
    updateBeats(p);
    nav.classList.toggle("solid", window.scrollY > section.offsetHeight - window.innerHeight * 0.9);
  }

  // Ease toward the target each animation frame. If frames arrive slowly
  // (throttled tab, heavy page), jump straight to the target instead.
  let lastTick = performance.now();
  function tick(now) {
    const dt = now - lastTick;
    lastTick = now;
    const k = dt > 100 ? 1 : 1 - Math.pow(1 - 0.18, dt / 16.7);
    current += (target - current) * k;
    if (Math.abs(target - current) < 0.01) current = target;
    const idx = Math.round(current);
    if (idx !== lastDrawn) {
      draw(idx);
      lastDrawn = idx;
    }
    requestAnimationFrame(tick);
  }

  // ---------- Reveal-on-scroll + parallax ----------
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  const bannerBg = document.querySelector(".banner-bg");
  function parallax() {
    if (!bannerBg) return;
    const r = bannerBg.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    const t = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
    bannerBg.style.transform = `translateY(${t * -12}%)`;
  }

  // ---------- Boot ----------
  async function init() {
    frameCount = FRAME_COUNT;
    frames = new Array(frameCount);
    await load(0);
    resize();
    onScroll();
    requestAnimationFrame(tick);
    preload();
  }

  window.addEventListener("resize", resize);
  window.addEventListener("scroll", () => { onScroll(); parallax(); }, { passive: true });
  init();
})();
