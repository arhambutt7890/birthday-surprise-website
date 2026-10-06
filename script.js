// =========================================
// BIRTHDAY CONFIGURATION (DEMO DATA)
// Change these values to customize the website.
// =========================================
const birthdayMonth = 12;   // DEMO date: December
const birthdayDay = 25;     // DEMO date: 25th (keep in sync with the date text in index.html)
const sitePassword = "surprise";   // DEMO password (not case-sensitive)
const passwordHint = "The demo password is 'surprise'";   // optional hint shown under the box
const glitterDensity = 1;   // 1 = normal, raise for more particles
const NO_MESSAGES = [
  "Nice try 😏", "Are you sure about that? 👀", "Hmm... wrong button 😂",
  "I don't think that's the answer you're looking for 😌", "You really want to choose NO? 🥺",
  "Try again, beautiful ❤️", "The NO button disagrees 😂", "Almost... but nope 😏",
  "You can't escape this question ❤️", "I know your answer already 👀❤️"
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (id) => document.getElementById(id);

// =========================================
// GLITTER / STAR BACKGROUND (canvas)
// =========================================
(function glitter() {
  const canvas = $("glitterCanvas");
  const ctx = canvas.getContext("2d");
  const COLORS = ["255,255,255", "101,186,255", "22,135,255", "255,63,159", "217,44,137", "255,155,210"];
  let w, h, dpr, parts = [], running = true;

  function makeParticle(x, y, big) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x, y, color,
      r: big ? Math.random() * 2.2 + 1.6 : Math.random() * 1.1 + 0.25,
      a: Math.random() * 0.7 + 0.25,
      tw: Math.random() * 0.03 + 0.005, ph: Math.random() * 6.28,
      vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12, big
    };
  }
  function build() {
    parts = [];
    const area = (w * h) / 1000;
    const count = Math.min(520, Math.floor(area * 0.32 * glitterDensity) * (reduceMotion ? 0.4 : 1));
    // Dense clusters (pink and blue) + sparse scatter
    const clusters = Array.from({ length: 6 }, () => ({ x: Math.random() * w, y: Math.random() * h, s: 80 + Math.random() * 160 }));
    for (let i = 0; i < count; i++) {
      if (Math.random() < 0.55) {
        const c = clusters[Math.floor(Math.random() * clusters.length)];
        const ang = Math.random() * 6.28, d = Math.abs((Math.random() + Math.random() - 1)) * c.s;
        parts.push(makeParticle(c.x + Math.cos(ang) * d, c.y + Math.sin(ang) * d, false));
      } else parts.push(makeParticle(Math.random() * w, Math.random() * h, false));
    }
    for (let i = 0; i < 22; i++) parts.push(makeParticle(Math.random() * w, Math.random() * h, true));
  }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build(); draw(0);
  }
  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      if (!reduceMotion) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -5) p.x = w + 5; if (p.x > w + 5) p.x = -5;
        if (p.y < -5) p.y = h + 5; if (p.y > h + 5) p.y = -5;
      }
      const tw = 0.6 + 0.4 * Math.sin(t * p.tw * 0.06 + p.ph);
      const alpha = p.a * tw;
      if (p.big) {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        g.addColorStop(0, `rgba(${p.color},${alpha})`); g.addColorStop(1, `rgba(${p.color},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 6, 0, 6.28); ctx.fill();
      }
      ctx.fillStyle = `rgba(${p.color},${alpha})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
    }
  }
  function loop(t) { if (!running) return; draw(t); requestAnimationFrame(loop); }
  window.addEventListener("resize", resize);
  // Pause when the tab is hidden
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running && !reduceMotion) requestAnimationFrame(loop);
  });
  resize();
  if (!reduceMotion) requestAnimationFrame(loop);
})();

// =========================================
// FLOATING HEARTS & STARS (few DOM nodes)
// =========================================
(function floatingHearts() {
  if (reduceMotion) return;
  const box = $("floatingHearts");
  const icons = ["❤️", "💗", "⭐", "✨", "💙"];
  for (let i = 0; i < 14; i++) {
    const s = document.createElement("span");
    s.textContent = icons[i % icons.length];
    s.style.left = Math.random() * 100 + "%";
    s.style.fontSize = 12 + Math.random() * 16 + "px";
    s.style.animationDuration = 14 + Math.random() * 16 + "s";
    s.style.animationDelay = -Math.random() * 20 + "s";
    box.appendChild(s);
  }
})();

// =========================================
// LIVE COUNTDOWN
// =========================================
(function countdown() {
  const pad = (n) => String(n).padStart(2, "0");
  let celebrated = false;

  function nextBirthday(now) {
    const y = now.getFullYear();
    const today = new Date(y, now.getMonth(), now.getDate());
    let target = new Date(y, birthdayMonth - 1, birthdayDay);
    if (today.getTime() === target.getTime()) return { isToday: true };
    if (target < now) target = new Date(y + 1, birthdayMonth - 1, birthdayDay);
    return { target };
  }
  function tick() {
    const now = new Date();
    const res = nextBirthday(now);
    if (res.isToday) {
      $("countdownGrid").hidden = true;
      $("countdownGrid").style.display = "none";
      $("birthdayArrived").hidden = false;
      if (!celebrated) { celebrated = true; setTimeout(() => burst(90), 600); }
      return;
    }
    $("countdownGrid").style.display = "";
    $("birthdayArrived").hidden = true;
    let s = Math.max(0, Math.floor((res.target - now) / 1000));
    const totalDays = Math.floor(s / 86400);
    $("cdWeeks").textContent = pad(Math.floor(totalDays / 7));
    $("cdDays").textContent = pad(totalDays % 7);
    $("cdHours").textContent = pad(Math.floor((s % 86400) / 3600));
    $("cdMinutes").textContent = pad(Math.floor((s % 3600) / 60));
    $("cdSeconds").textContent = pad(s % 60);
  }
  tick(); setInterval(tick, 1000);
})();

// =========================================
// MUSIC
// =========================================
(function music() {
  const audio = $("birthdayMusic"), btn = $("musicBtn"), label = $("musicLabel"), toast = $("toast");
  let toastTimer;
  function say(msg) {
    toast.textContent = msg; toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  }
  function setUI(on) {
    btn.classList.toggle("playing", on); btn.setAttribute("aria-pressed", on);
    label.textContent = on ? "🎵 Music On" : "🔇 Music Off";
  }
  function play() {
    const p = audio.play();
    if (p && p.then) p.then(() => { setUI(true); say("Playing a little something for you... 🎶"); }).catch(() => setUI(false));
  }
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (audio.paused) play(); else { audio.pause(); setUI(false); }
  });
  // Autoplay is usually blocked, so try once after the first interaction
  let tried = false;
  function firstTry(e) {
    if (tried || btn.contains(e.target)) return; tried = true;
    audio.volume = 0.6; play();
  }
  ["pointerdown", "keydown", "touchstart"].forEach((ev) => document.addEventListener(ev, firstTry, { once: false, passive: true }));
})();

// =========================================
// SCROLL REVEAL
// =========================================
(function reveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || reduceMotion) { els.forEach((e) => e.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  els.forEach((e) => io.observe(e));
})();

// =========================================
// NAVBAR: close mobile menu after choosing a link
// =========================================
document.querySelectorAll(".nav-link").forEach((l) => l.addEventListener("click", () => {
  const menu = $("navMenu");
  if (menu.classList.contains("show") && window.bootstrap) bootstrap.Collapse.getOrCreateInstance(menu).hide();
}));

// =========================================
// LIGHTBOX (reads the photos already in the HTML)
// =========================================
(function lightbox() {
  const cards = [...document.querySelectorAll(".polaroid")];
  const box = $("lightbox"), img = $("lbImg"), cap = $("lbCap");
  let idx = 0, lastFocus = null;

  function show(i) {
    idx = (i + cards.length) % cards.length;
    const src = cards[idx].querySelector("img");
    img.src = src.getAttribute("src"); img.alt = src.alt;
    cap.textContent = cards[idx].querySelector("strong").textContent;
  }
  function open(i) {
    lastFocus = document.activeElement; show(i);
    box.hidden = false; box.classList.add("open"); document.body.style.overflow = "hidden";
    $("lbClose").focus();
  }
  function close() {
    box.hidden = true; box.classList.remove("open"); document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  cards.forEach((c, i) => {
    c.addEventListener("click", () => open(i));
    c.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); } });
  });
  $("lbClose").addEventListener("click", close);
  $("lbPrev").addEventListener("click", () => show(idx - 1));
  $("lbNext").addEventListener("click", () => show(idx + 1));
  box.addEventListener("click", (e) => { if (e.target === box) close(); });
  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
  // Swipe support on touch screens
  let sx = 0;
  box.addEventListener("touchstart", (e) => { sx = e.changedTouches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();

// =========================================
// CONFETTI / GLITTER / HEART BURST (canvas)
// =========================================
const confetti = (function () {
  const cv = $("confettiCanvas"), ctx = cv.getContext("2d");
  let pieces = [], raf = null;
  const colors = ["#ff3f9f", "#d92c89", "#ff9bd2", "#1687ff", "#65baff", "#ffffff"];
  function size() { cv.width = window.innerWidth; cv.height = window.innerHeight; }
  size(); window.addEventListener("resize", size);

  function burst(n) {
    if (reduceMotion) n = Math.min(n, 25);
    const ox = cv.width / 2, oy = cv.height * 0.55;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.28, sp = 3 + Math.random() * 9;
      pieces.push({
        x: ox, y: oy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 4,
        r: 3 + Math.random() * 5, c: colors[Math.floor(Math.random() * colors.length)],
        heart: Math.random() < 0.18, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3, life: 1
      });
    }
    if (!raf) raf = requestAnimationFrame(step);
  }
  function step() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    pieces = pieces.filter((p) => p.life > 0);
    for (const p of pieces) {
      p.vy += 0.17; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.008;
      ctx.save(); ctx.globalAlpha = Math.max(p.life, 0); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.c; ctx.shadowColor = p.c; ctx.shadowBlur = 10;
      if (p.heart) { ctx.font = p.r * 4 + "px serif"; ctx.fillText("❤", -p.r * 2, p.r * 2); }
      else ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      ctx.restore();
    }
    if (pieces.length) raf = requestAnimationFrame(step);
    else { raf = null; ctx.clearRect(0, 0, cv.width, cv.height); }
  }
  return burst;
})();
function burst(n) { confetti(n); }

// =========================================
// DO YOU LOVE ME? (YES + moving NO)
// =========================================
(function loveQuestion() {
  const arena = $("arena"), yes = $("yesBtn"), no = $("noBtn"), msg = $("noMsg"), result = $("yesResult");
  let attempts = 0, done = false, lastMsg = -1;

  function overlaps(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }
  function moveNo() {
    if (done) return;
    attempts++;
    const aw = arena.clientWidth, ah = arena.clientHeight;
    const bw = no.offsetWidth, bh = no.offsetHeight;
    const y = yes.offsetLeft - yes.offsetWidth / 2, yt = yes.offsetTop - yes.offsetHeight / 2;
    const yesBox = { left: y - 12, right: y + yes.offsetWidth + 12, top: yt - 12, bottom: yt + yes.offsetHeight + 12 };
    let x, t, tries = 0;
    do {
      x = Math.random() * (aw - bw - 10) + 5; t = Math.random() * (ah - bh - 10) + 5; tries++;
    } while (tries < 40 && overlaps({ left: x, right: x + bw, top: t, bottom: t + bh }, yesBox));
    // Gets a little quicker with every attempt
    no.style.transitionDuration = Math.max(0.12, 0.4 - attempts * 0.03) + "s";
    no.style.left = x + "px"; no.style.top = t + "px";
    let m; do { m = Math.floor(Math.random() * NO_MESSAGES.length); } while (m === lastMsg);
    lastMsg = m; msg.textContent = NO_MESSAGES[m];
  }
  // Start with NO at a fixed spot in pixels so transitions work
  function place() { no.style.left = arena.clientWidth * 0.62 + "px"; no.style.top = arena.clientHeight / 2 - no.offsetHeight / 2 + "px"; }
  place(); window.addEventListener("resize", () => { if (!attempts) place(); });

  no.addEventListener("pointerenter", moveNo);
  no.addEventListener("pointerdown", (e) => { e.preventDefault(); moveNo(); });
  no.addEventListener("click", (e) => { e.preventDefault(); moveNo(); });
  no.addEventListener("touchstart", (e) => { e.preventDefault(); moveNo(); }, { passive: false });

  yes.addEventListener("click", () => {
    if (done) return; done = true;
    result.hidden = false; no.style.display = "none"; msg.textContent = "";
    yes.textContent = "YES ❤️ 💙";
    document.body.classList.add("pulse-bg");
    burst(160); setTimeout(() => burst(110), 500); setTimeout(() => burst(80), 1100);
    result.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  });
})();

// =========================================
// PASSWORD LOCK SCREEN
// =========================================
(function lock() {
  const screen = $("lockScreen"), form = $("lockForm"), input = $("lockInput"), err = $("lockError");
  $("lockHint").textContent = passwordHint ? "Hint: " + passwordHint : "";
  const norm = (v) => v.trim().toLowerCase();
  function unlock() {
    screen.classList.add("unlocked"); document.body.classList.remove("locked");
    setTimeout(() => { screen.style.display = "none"; }, 900);
  }
  document.body.classList.add("locked");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (norm(input.value) === norm(sitePassword)) { err.textContent = ""; unlock(); }
    else {
      err.textContent = "Hmm, that's not it. Try again ❤️"; input.value = ""; input.focus();
      form.classList.remove("shake"); void form.offsetWidth; form.classList.add("shake");
    }
  });
  input.focus();
})();