(() => {
  const section = document.getElementById("pour");
  const canvas = document.getElementById("pour-canvas");
  if (!section || !canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const toggle = document.getElementById("motion-toggle");
  const dot = document.getElementById("progress-dot");
  const beats = [...document.querySelectorAll(".beat")];
  const nav = document.getElementById("nav");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = matchMedia("(max-width: 900px)").matches;
  const folder = mobile ? "mobile" : "web";
  // Half-rate source frames preserve the pour, with a small bounded decoded cache.
  const count = 97;
  const cache = new Map();
  const pending = new Set();
  const failed = new Set();
  let queue = [];
  let activeLoads = 0;
  let target = 0;
  let motion = !reduceMotion.matches && !navigator.connection?.saveData;
  let scheduled = false;
  const framePath = i => `assets/frames/${folder}/frame_${String(i * 2 + 1).padStart(4, "0")}.webp`;

  function draw(index) {
    let closest = index;
    if (!cache.has(index)) {
      const keys = [...cache.keys()];
      if (!keys.length) return;
      closest = keys.reduce((a, b) => Math.abs(a - index) < Math.abs(b - index) ? a : b);
    }
    const image = cache.get(closest);
    if (!image?.naturalWidth) return;
    const cw = canvas.width, ch = canvas.height;
    const cover = Math.max(cw / image.naturalWidth, ch / image.naturalHeight);
    const contain = Math.min(cw / image.naturalWidth, ch / image.naturalHeight);
    const portrait = cw < ch;
    const scale = portrait ? Math.min(cover, contain * 1.55) : cover;
    const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
    const x = Math.min(0, Math.max(cw - w, cw / 2 - w * (portrait ? .48 : .52)));
    const y = (ch - h) * (portrait ? .30 : .5);
    ctx.fillStyle = "#1f2610";
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(image, x, y, w, h);
    canvas.classList.add("ready");
  }

  function pump() {
    while (motion && activeLoads < 3 && queue.length) {
      const index = queue.shift();
      if (cache.has(index) || pending.has(index) || failed.has(index)) continue;
      activeLoads++;
      pending.add(index);
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        cache.set(index, image);
        // Remove frames furthest from the current view to bound memory use.
        while (cache.size > 18) {
          const farthest = [...cache.keys()].reduce((a,b) => Math.abs(a-target) > Math.abs(b-target) ? a : b);
          cache.delete(farthest);
        }
        finish();
      };
      image.onerror = () => { failed.add(index); finish(); };
      function finish() {
        activeLoads--;
        pending.delete(index);
        if (motion) draw(target);
        pump();
      }
      image.src = framePath(index);
    }
  }

  function requestFrame(index) {
    // Replace stale queued work after a fast scroll instead of downloading the full sequence.
    queue = (index === 0 ? [0] : [index, index + 1, index - 1, index + 2])
      .filter(i => i >= 0 && i < count && !cache.has(i) && !pending.has(i) && !failed.has(i));
    pump();
    draw(index);
  }

  function updateCaptions(progress) {
    beats.forEach((el, index) => {
      const start = Number(el.dataset.in), end = Number(el.dataset.out);
      const opacity = !motion ? (index === 0 ? 1 : 0) : progress >= start && progress <= end
        ? Math.max(0, Math.min(1, (progress-start)/.05+(start===0?1:0), (end-progress)/.05)) : 0;
      el.style.opacity = opacity;
      el.style.transform = motion ? `translateY(${(1-opacity)*30}px)` : "none";
      el.classList.toggle("on", opacity > .5);
      // Keep the page's H1 in the accessibility tree; hide later inactive captions.
      if (index > 0) { el.inert = opacity <= .5; el.setAttribute("aria-hidden", String(opacity <= .5)); }
      el.querySelectorAll("a").forEach(link => { link.tabIndex = opacity > .5 ? 0 : -1; });
    });
  }

  function update() {
    scheduled = false;
    const rect = section.getBoundingClientRect();
    nav.classList.toggle("solid", rect.bottom <= window.innerHeight * .9);
    if (!motion) { updateCaptions(0); return; }
    const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, section.offsetHeight-window.innerHeight)));
    target = Math.round(progress*(count-1));
    dot.style.top = `${progress*100}%`;
    updateCaptions(progress);
    if (rect.bottom > 0 && rect.top < window.innerHeight) requestFrame(target);
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2);
    canvas.width = Math.round(canvas.clientWidth*dpr);
    canvas.height = Math.round(canvas.clientHeight*dpr);
    schedule();
  }
  function applyMotion() {
    document.body.classList.toggle("motion-enabled", motion);
    toggle.textContent = motion ? "Pause animation" : "Play animation";
    if (!motion) { queue = []; canvas.classList.remove("ready"); }
    resize();
  }
  toggle.hidden = false;
  toggle.addEventListener("click", () => { motion = !motion; applyMotion(); });
  reduceMotion.addEventListener("change", () => { motion = !reduceMotion.matches && !navigator.connection?.saveData; applyMotion(); });
  window.addEventListener("scroll", schedule, { passive:true });
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) schedule(); });
  applyMotion();
})();
