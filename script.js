const email = "marom.yahav1@gmail.com";
const statusEl = document.getElementById("status");
const copyBtn = document.getElementById("copy");

if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    let msg;
    try {
      await navigator.clipboard.writeText(email);
      msg = "Email copied.";
    } catch {
      msg = "Couldn't copy automatically. My email is " + email;
    }
    if (statusEl) statusEl.textContent = msg;
  });
}

/* Galleries: circular swipe. Missing images are dropped; a clone of the last
   image sits before the first and a clone of the first after the last, and we
   silently jump to the real slide once scrolling settles on a clone. */
document.querySelectorAll(".gallery").forEach((g) => {
  const track = g.querySelector(".track");
  const count = g.querySelector(".count");
  const imgs = [...track.querySelectorAll("img")];
  let pending = imgs.length, n = 0, timer;

  const w = () => track.clientWidth;
  const pos = () => Math.round(track.scrollLeft / w());

  const show = () => {
    if (n < 2) return;
    count.textContent = ((((pos() - 1) % n) + n) % n) + 1 + " / " + n;
  };

  const wrap = () => {
    const p = pos();
    if (Math.abs(track.scrollLeft - p * w()) > 2) return; /* still moving */
    if (p === 0) track.scrollLeft = n * w();
    else if (p === n + 1) track.scrollLeft = w();
  };

  const init = () => {
    const real = [...track.querySelectorAll("img")];
    n = real.length;
    if (n === 0) { g.remove(); return; }
    if (n === 1) { g.classList.add("single"); return; }
    const first = real[0].cloneNode();
    const last = real[n - 1].cloneNode();
    [first, last].forEach((c) => { c.alt = ""; c.setAttribute("aria-hidden", "true"); });
    track.prepend(last);
    track.append(first);
    track.scrollLeft = w();
    show();
  };

  const settle = () => { if (--pending === 0) init(); };
  imgs.forEach((img) => {
    if (img.complete) { if (!img.naturalWidth) img.remove(); settle(); }
    else {
      img.addEventListener("load", settle);
      img.addEventListener("error", () => { img.remove(); settle(); });
    }
  });

  const go = (d) => track.scrollBy({ left: d * w(), behavior: "smooth" });
  g.querySelector(".prev").addEventListener("click", () => go(-1));
  g.querySelector(".next").addEventListener("click", () => go(1));
  /* Mouse drag (touch and trackpads already scroll natively) */
  let down = false, startX = 0, startL = 0;
  track.addEventListener("dragstart", (e) => e.preventDefault());
  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    down = true; startX = e.clientX; startL = track.scrollLeft;
    track.classList.add("drag");
  });
  addEventListener("pointermove", (e) => {
    if (down) track.scrollLeft = startL - (e.clientX - startX);
  });
  addEventListener("pointerup", () => {
    if (!down) return;
    down = false;
    track.classList.remove("drag");
    track.scrollTo({ left: pos() * w(), behavior: "smooth" });
  });

  track.addEventListener("scroll", () => {
    show();
    clearTimeout(timer);
    timer = setTimeout(wrap, 120);
  }, { passive: true });
});

/* Starry night: a few white stars that slowly fade between dim and soft */
(() => {
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let stars = [], w = 0, h = 0;

  const build = () => {
    const dpr = window.devicePixelRatio || 1;
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.max(22, Math.min(45, Math.round((w * h) / 30000)));
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: 0.6 + Math.random() * 1.1,
      speed: 0.4 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
    }));
  };

  const draw = (t) => {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const k = 0.5 + 0.5 * Math.sin(t / 1000 * s.speed + s.phase);
      ctx.globalAlpha = 0.15 + 0.5 * k; /* 0.15 (faint) to 0.65 (soft), never full white */
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!still) requestAnimationFrame(draw);
  };

  build();
  addEventListener("resize", () => { build(); if (still) draw(0); });
  requestAnimationFrame(draw);
})();