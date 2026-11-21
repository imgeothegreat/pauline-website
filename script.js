/* ============================================================
   EDIT YOUR CONTENT HERE
   ============================================================ */

// When you became official (year, month 0-11, day). Nov = 10.
const START_DATE = new Date(2026, 10, 14);

// Our story — add/remove chapters freely.
const TIMELINE = [
  {
    date: "A few weeks ago",
    title: "We started talking",
    text: "I didn’t know it yet, but everything was about to change.",
    photo: "Unknown-7.jpg",
    caption: "the beginning",
  },
  {
    date: "Our first date",
    title: "Lawud Cafe",
    text: "Our first date. I still think about it.",
    photo: "Unknown-9.jpg",
    caption: "Lawud, first date",
  },
  {
    date: "November 14",
    title: "Officially us",
    text: "The day you became mine.",
    photo: "Unknown-10.jpg",
    caption: "officially us",
  },
  {
    date: "My birthday",
    title: "You spent it with me",
    text: "The best birthday gift was having you there.",
    photo: "Unknown-12.jpg",
    caption: "best gift ever",
  },
];

// Photo wall — file name + a little handwritten caption.
const PHOTOS = [
  { src: "Unknown.jpg", caption: "coffee & you" },
  { src: "Unknown-2.jpg", caption: "devil mode" },
  { src: "Unknown-4.jpg", caption: "that stare" },
  { src: "Unknown-8.jpg", caption: "hide & seek" },
  { src: "Unknown-6.jpg", caption: "shh" },
  { src: "Unknown-11.jpg", caption: "string lights" },
  { src: "Unknown-5.jpg", caption: "sleepy pout" },
  { src: "Unknown-3.jpg", caption: "mwah" },
  { src: "Unknown-10.jpg", caption: "golden hour" },
];

// "To be continued" — empty frames for memories you haven't made yet.
// When one happens, move it into TIMELINE (with a photo) and remove it here.
const COMING_SOON = [
  "our first trip",
  "our first Christmas",
  "your birthday",
  "the next one",
];

const REASONS = [
  "You’re so hardworking",
  "You’re so funny",
  "Your beautiful voice",
  "You always have time for me",
  "Your beautiful face",
  "You accept me for who I am",
];

const LETTER = [
  "I just wanted to make you a surprise. Even though we just met, I already know you deserve everything.",
  "Thank you for making me happy, and for making me believe that love really does exist. I really like how we’re already making future plans together.",
  "I love you so much.",
  "I might make mistakes sometimes, but please always remember that I will love you the best I can.",
  "I hope you like my surprise.",
];
// What the intro types out before the flower appears.
const INTRO_LINES = ["Hi, Pau.", "I grew something for you…", "but it’s a little shy."];

// Revealed when she taps her name 5 times.
const SECRET_NOTE = "You’re my favorite person to talk to, every single day.";

const GREETING = "Dear Pau,";
const SIGN_OFF = "Always yours";

/* ============================================================
   Everything below makes the page work — no need to edit.
   ============================================================ */

const $ = (id) => document.getElementById(id);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const HEART_COLORS = ["#F4C6DA", "#CDB6D8", "#B98AD6", "#8B4FB8"];

function heartSvg(size, color) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.setAttribute("aria-hidden", "true");
  svg.style.color = color;
  const use = document.createElementNS(ns, "use");
  use.setAttribute("href", "#heart");
  svg.appendChild(use);
  return svg;
}

// --- Effects ---
function burst(x, y, n = 12) {
  Sound.sfx.pop();
  if (reduceMotion) return;
  for (let i = 0; i < n; i++) {
    let h;
    if (i % 3 === 0) {
      h = document.createElement("span");
      h.innerHTML = flowerSVG(16 + Math.random() * 14, pick(PETAL_COLORS), pick(CENTER_COLORS), 5);
    } else {
      h = heartSvg(14 + Math.random() * 14, HEART_COLORS[i % 4]);
    }
    h.classList.add("burst");
    const a = Math.random() * Math.PI * 2;
    const d = 60 + Math.random() * 120;
    h.style.left = x - 10 + "px";
    h.style.top = y - 10 + "px";
    h.style.setProperty("--dx", Math.cos(a) * d + "px");
    h.style.setProperty("--dy", Math.sin(a) * d + "px");
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1000);
  }
}

function heartRain() {
  if (reduceMotion) return;
  const box = $("rainBox");
  for (let i = 0; i < 50; i++) {
    const h = heartSvg(14 + Math.random() * 26, HEART_COLORS[i % 4]);
    h.classList.add("rain");
    h.style.left = Math.random() * 100 + "%";
    h.style.animationDelay = Math.random() * 2.5 + "s";
    h.style.animationDuration = 2.8 + Math.random() * 2.2 + "s";
    box.appendChild(h);
    setTimeout(() => h.remove(), 8000);
  }
}

// --- Flowers (used everywhere) ---
const PETAL_COLORS = ["#F4C6DA", "#E6D3EC", "#CDB6D8", "#B98AD6", "#FFFFFF", "#F7A8C8"];
const CENTER_COLORS = ["#F2C14E", "#E9B23E", "#8B4FB8", "#F7D77A"];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function flowerSVG(size, petal, center, n = 6) {
  let petals = "";
  for (let i = 0; i < n; i++) {
    petals += `<ellipse cx="50" cy="27" rx="${n > 6 ? 10 : 14}" ry="23" transform="rotate(${(i * 360) / n} 50 50)" fill="${petal}" stroke="rgba(47,26,56,.08)"/>`;
  }
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${petals}<circle cx="50" cy="50" r="12" fill="${center}"/></svg>`;
}

// --- Intro: the surprise ---
const gate = $("gate");
const bud = $("bud");
const ring = $("ringFill");
const budFlower = $("budFlower");
const hint = $("gateHint");
const RING = 2 * Math.PI * 54;
const HOLD_MS = 1500;
ring.style.strokeDasharray = RING;
ring.style.strokeDashoffset = RING;

async function typeLine(el, text) {
  el.textContent = "";
  for (const ch of text) {
    el.textContent += ch;
    if (ch.trim()) Sound.sfx.key();
    await sleep(reduceMotion ? 0 : 55 + Math.random() * 35);
  }
  Sound.sfx.lineDone();
}

// First tap: switches sound on (browsers need a tap before any audio).
const beginBtn = $("beginBtn");
beginBtn.focus({ preventScroll: true });
beginBtn.addEventListener("click", () => {
  Sound.unlock();
  Sound.sfx.chime();
  beginBtn.classList.add("leaving");
  setTimeout(() => { beginBtn.remove(); intro(); }, reduceMotion ? 0 : 500);
}, { once: true });

async function intro() {
  const line = $("gateLine");
  line.hidden = false;
  await sleep(400);
  for (const l of INTRO_LINES) {
    await typeLine(line, l);
    await sleep(reduceMotion ? 300 : 1000);
  }
  line.classList.add("done");
  bud.hidden = false;
  hint.hidden = false;
  bud.focus({ preventScroll: true });
}

let progress = 0, holding = false, raf = null, lastT = 0, bloomed = false;

function holdFrame(t) {
  const dt = lastT ? t - lastT : 16;
  lastT = t;
  progress += ((holding ? 1 : -2.5) * dt) / HOLD_MS;
  progress = Math.min(1, Math.max(0, progress));
  ring.style.strokeDashoffset = RING * (1 - progress);
  Sound.holdSet(progress);
  const shake = holding && progress > 0.45 ? Math.sin(t / 35) * 5 * progress : 0;
  budFlower.style.transform = `scale(${1 + progress * 0.4}) rotate(${shake}deg)`;
  if (progress >= 1) return bloom();
  if (holding || progress > 0) raf = requestAnimationFrame(holdFrame);
  else { raf = null; lastT = 0; }
}
function startHold(e) {
  if (bloomed) return;
  e.preventDefault();
  if (e.pointerId !== undefined) bud.setPointerCapture(e.pointerId);
  Sound.unlock();
  Sound.music.prime();
  Sound.holdStart();
  holding = true;
  hint.textContent = "keep holding…";
  if (!raf) { lastT = 0; raf = requestAnimationFrame(holdFrame); }
}
function endHold() {
  if (!holding || bloomed) return;
  holding = false;
  Sound.holdStop();
  hint.textContent = "almost! hold a little longer";
}
bud.addEventListener("pointerdown", startHold);
bud.addEventListener("pointerup", endHold);
bud.addEventListener("pointercancel", endHold);
bud.addEventListener("contextmenu", (e) => e.preventDefault());
bud.addEventListener("keydown", (e) => {
  if ((e.key === " " || e.key === "Enter") && !e.repeat) startHold(e);
});
bud.addEventListener("keyup", (e) => {
  if (e.key === " " || e.key === "Enter") endHold();
});

function bloom() {
  bloomed = true;
  holding = false;
  cancelAnimationFrame(raf);
  Sound.holdStop();
  Sound.sfx.sparkle();
  Sound.sfx.chime();
  Sound.music.start();
  const r = bud.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, 30);
  bud.classList.add("burst-out");
  hint.hidden = true;

  // the whole screen blooms
  const field = $("gateBloom");
  const n = innerWidth < 760 ? 22 : 40;
  for (let i = 0; i < n; i++) {
    const f = document.createElement("div");
    f.className = "g-flower";
    f.style.left = Math.random() * 100 + "%";
    f.style.top = Math.random() * 100 + "%";
    f.style.animationDelay = i * 45 + Math.random() * 150 + "ms";
    f.innerHTML = flowerSVG(36 + Math.random() * 70, pick(PETAL_COLORS), pick(CENTER_COLORS), pick([5, 6, 8]));
    field.appendChild(f);
  }

  const line = $("gateLine");
  line.textContent = "Surprise.";
  line.classList.add("big");
  $("gateSub").hidden = false;
  setTimeout(openSite, reduceMotion ? 1200 : 2800);
}

function openSite() {
  gate.classList.add("gone");
  document.body.classList.remove("locked");
  startPetals();
  showSoundBtn();
  setTimeout(() => gate.remove(), 950);
}

// --- Hero heart ---
$("heroHeart").addEventListener("click", (e) => burst(e.clientX, e.clientY, 16));

// --- Counter ---
const pad = (n) => String(n).padStart(2, "0");
function tick() {
  let s = Math.max(0, Math.floor((Date.now() - START_DATE) / 1000));
  $("cDays").textContent = Math.floor(s / 86400);
  $("cHours").textContent = pad(Math.floor((s % 86400) / 3600));
  $("cMins").textContent = pad(Math.floor((s % 3600) / 60));
  $("cSecs").textContent = pad(s % 60);
}
tick();
setInterval(tick, 1000);

// --- Story ---
TIMELINE.forEach((t, i) => {
  const li = document.createElement("li");
  li.className = "chapter reveal";
  li.innerHTML = `
    <figure class="pol"><span class="tape"></span><img loading="lazy"><figcaption></figcaption></figure>
    <div class="chapter-text">
      <span class="chapter-num"></span>
      <p class="chapter-date"></p>
      <h3></h3>
      <p class="t"></p>
    </div>`;
  const img = li.querySelector("img");
  img.src = t.photo;
  img.alt = t.title;
  li.querySelector("figcaption").textContent = t.caption || "";
  li.querySelector(".chapter-num").textContent = pad(i + 1);
  li.querySelector(".chapter-date").textContent = t.date;
  li.querySelector("h3").textContent = t.title;
  li.querySelector(".t").textContent = t.text;
  $("timeline").appendChild(li);
});

// --- Photo wall + lightbox ---
let lbIndex = 0;
let lastFocus = null;
const tiles = PHOTOS.map((p, i) => {
  const b = document.createElement("button");
  b.className = "tile reveal";
  b.setAttribute("aria-label", "Open photo: " + p.caption);
  b.innerHTML = `<img loading="lazy" alt=""><span></span>`;
  b.querySelector("img").src = p.src;
  b.querySelector("span").textContent = p.caption;
  b.addEventListener("click", () => openLightbox(i));
  return b;
});
// Lay the photos out in real columns (CSS columns make hovered photos blink).
let galleryCols = 0;
function layoutGallery() {
  const n = innerWidth >= 1000 ? 4 : innerWidth >= 760 ? 3 : 2;
  if (n === galleryCols) return;
  galleryCols = n;
  const g = $("gallery");
  g.textContent = "";
  const cols = Array.from({ length: n }, () => {
    const c = document.createElement("div");
    c.className = "gcol";
    g.appendChild(c);
    return c;
  });
  tiles.forEach((t, i) => cols[i % n].appendChild(t));
}
layoutGallery();
addEventListener("resize", layoutGallery);

function showPhoto(i) {
  lbIndex = (i + PHOTOS.length) % PHOTOS.length;
  Sound.sfx.tap();
  const p = PHOTOS[lbIndex];
  $("lbImg").src = p.src;
  $("lbImg").alt = p.caption;
  $("lbCap").textContent = p.caption;
  const fig = $("lbFig");
  fig.classList.remove("pop");
  void fig.offsetWidth;
  fig.classList.add("pop");
}
function openLightbox(i) {
  lastFocus = document.activeElement;
  showPhoto(i);
  $("lightbox").hidden = false;
  document.body.style.overflow = "hidden";
  $("lbClose").focus();
}
function closeLightbox() {
  $("lightbox").hidden = true;
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
}
$("lbClose").addEventListener("click", closeLightbox);
$("lbPrev").addEventListener("click", () => showPhoto(lbIndex - 1));
$("lbNext").addEventListener("click", () => showPhoto(lbIndex + 1));
$("lightbox").addEventListener("click", (e) => { if (e.target === $("lightbox")) closeLightbox(); });
document.addEventListener("keydown", (e) => {
  if ($("lightbox").hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") showPhoto(lbIndex - 1);
  if (e.key === "ArrowRight") showPhoto(lbIndex + 1);
});
// swipe on phones
let touchX = null;
$("lightbox").addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
$("lightbox").addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) showPhoto(lbIndex + (dx < 0 ? 1 : -1));
  touchX = null;
});

// --- To be continued ---
COMING_SOON.forEach((cap) => {
  const b = document.createElement("button");
  b.className = "slot reveal";
  b.setAttribute("aria-label", "Future memory: " + cap);
  b.innerHTML = `<span class="slot-frame">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.3 3 4.5 6.6 4.5c2 0 3.6 1.1 5.4 3 1.8-1.9 3.4-3 5.4-3 3.6 0 5.7 3.8 4.2 7.3C19.5 16.4 12 21 12 21z"/></svg>
      <small>photo coming soon</small>
    </span><span class="slot-cap"></span>`;
  b.querySelector(".slot-cap").textContent = cap;
  const label = b.querySelector("small");
  let t;
  b.addEventListener("click", (e) => {
    clearTimeout(t);
    b.classList.remove("peek");
    void b.offsetWidth;
    b.classList.add("peek");
    label.textContent = "shh… not yet";
    Sound.sfx.nope();
    burst(e.clientX, e.clientY, 6);
    t = setTimeout(() => { b.classList.remove("peek"); label.textContent = "photo coming soon"; }, 1600);
  });
  $("slots").appendChild(b);
});

// --- Reasons ---
const opened = new Set();
function updateOpened() {
  $("openedLabel").textContent =
    opened.size === REASONS.length
      ? "all six — and there are so many more"
      : `${opened.size} of ${REASONS.length} opened`;
}
REASONS.forEach((r, i) => {
  const c = document.createElement("button");
  c.className = "rcard reveal";
  c.setAttribute("aria-pressed", "false");
  c.setAttribute("aria-label", "Reason " + (i + 1));
  c.innerHTML = `<span class="rinner">
      <span class="rface rfront"><b>No. ${i + 1}</b><small>Tap to open</small></span>
      <span class="rface rback"><svg width="26" height="26" aria-hidden="true"><use href="#heart"/></svg><span></span></span>
    </span>`;
  c.querySelector(".rback span").textContent = r;
  c.addEventListener("click", (e) => {
    const on = c.classList.toggle("on");
    c.setAttribute("aria-pressed", on);
    Sound.sfx.flip(on ? i : i + 3);
    if (on) {
      opened.add(i);
      burst(e.clientX, e.clientY, 10);
    }
    updateOpened();
  });
  $("reasonsGrid").appendChild(c);
});
updateOpened();

// --- Letter ---
const letterEl = $("letterEl");
const addP = (text, cls) => {
  const p = document.createElement("p");
  p.textContent = text;
  if (cls) p.className = cls;
  letterEl.appendChild(p);
};
addP(GREETING, "hi");
LETTER.forEach((t) => addP(t));
addP(SIGN_OFF, "sign");

$("envelope").addEventListener("click", (e) => {
  const env = $("envelope");
  if (env.classList.contains("open")) return;
  env.classList.add("open");
  Sound.sfx.paper();
  burst(e.clientX, e.clientY, 18);
  setTimeout(() => {
    env.hidden = true;
    letterEl.hidden = false;
    letterEl.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, reduceMotion ? 0 : 750);
});

// --- Finale ---
$("finaleBtn").addEventListener("click", () => {
  $("finaleBtn").hidden = true;
  $("finaleMsg").hidden = false;
  $("finaleMsg").classList.add("pop");
  heartRain();
  Sound.sfx.win();
});

// --- Fade-in on scroll ---
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// --- Loves me, loves me not ---
const daisy = $("daisy");
const daisyText = $("daisyText");
const PETALS = 13; // odd, so it always ends on "she loves me"
let plucked = 0;

function growDaisy() {
  daisy.querySelectorAll(".petal").forEach((p) => p.remove());
  plucked = 0;
  daisyText.textContent = "pluck a petal…";
  daisyText.classList.remove("win");
  $("daisyReset").hidden = true;
  const center = daisy.querySelector(".daisy-center");
  for (let i = 0; i < PETALS; i++) {
    const b = document.createElement("button");
    b.className = "petal";
    b.style.rotate = (i * 360) / PETALS + "deg";
    b.setAttribute("aria-label", "Pluck petal " + (i + 1));
    b.addEventListener("click", pluck);
    daisy.insertBefore(b, center);
  }
}
function pluck(e) {
  const b = e.currentTarget;
  b.classList.add("gone");
  b.disabled = true;
  plucked++;
  if (plucked === PETALS) {
    daisyText.textContent = "She loves me. Always — I checked every petal.";
    daisyText.classList.add("win");
    Sound.sfx.win();
    const r = daisy.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 24);
    $("daisyReset").hidden = false;
  } else {
    if (plucked % 2) Sound.sfx.lovesMe(); else Sound.sfx.lovesMeNot();
    daisyText.textContent = plucked % 2 ? "she loves me…" : "she loves me not…";
  }
}
$("daisyReset").addEventListener("click", growDaisy);
growDaisy();

// --- Plant a flower (remembered on her phone) ---
const garden = $("garden");
const GARDEN_KEY = "pau-garden-v1";
const MAX_PLANTS = 60;
let plants = [];
try { plants = JSON.parse(localStorage.getItem(GARDEN_KEY)) || []; } catch (_) { plants = []; }
if (!plants.length) {
  plants = [12, 30, 52, 70, 88].map((x, i) => ({
    x, h: 90 + ((i * 47) % 110), s: 40 + (i % 3) * 10,
    c: PETAL_COLORS[i % PETAL_COLORS.length], k: CENTER_COLORS[i % 4], n: [5, 6, 8][i % 3], d: -i,
  }));
}
function saveGarden() {
  try { localStorage.setItem(GARDEN_KEY, JSON.stringify(plants)); } catch (_) {}
}
function updateCount() {
  $("plantCount").textContent = plants.length === 1 ? "1 flower" : plants.length + " flowers and counting";
}
function drawPlant(p, animate) {
  const el = document.createElement("div");
  el.className = "plant" + (animate ? "" : " still");
  el.style.left = p.x + "%";
  el.style.setProperty("--h", p.h + "px");
  el.style.setProperty("--d", p.d + "s");
  el.innerHTML = `<div class="sway"><span class="stem"></span><span class="leaf"></span><span class="leaf l2"></span><span class="fhead">${flowerSVG(p.s, p.c, p.k, p.n)}</span></div>`;
  garden.appendChild(el);
}
function plantAt(xPct, height) {
  const p = {
    x: Math.min(96, Math.max(4, xPct)),
    h: Math.round(height),
    s: Math.round(34 + Math.random() * 26),
    c: pick(PETAL_COLORS), k: pick(CENTER_COLORS), n: pick([5, 6, 8]),
    d: -(Math.random() * 4).toFixed(2),
  };
  plants.push(p);
  if (plants.length > MAX_PLANTS) {
    plants.shift();
    garden.querySelector(".plant")?.remove();
  }
  drawPlant(p, true);
  Sound.sfx.plant();
  saveGarden();
  updateCount();
  garden.querySelector(".garden-hint")?.remove();
}
plants.forEach((p) => drawPlant(p, false));
updateCount();

garden.addEventListener("click", (e) => {
  const r = garden.getBoundingClientRect();
  const h = Math.max(50, Math.min(r.height - 60, r.bottom - e.clientY - 18));
  plantAt(((e.clientX - r.left) / r.width) * 100, h);
});
$("plantBtn").addEventListener("click", () => {
  const r = garden.getBoundingClientRect();
  plantAt(5 + Math.random() * 90, 60 + Math.random() * (r.height - 140));
});
$("clearGarden").addEventListener("click", () => {
  garden.querySelectorAll(".plant").forEach((p) => p.remove());
  plants = [];
  saveGarden();
  updateCount();
});

// --- Drifting petals + cursor trail ---
function petalColor() { return pick(["#F4C6DA", "#F7A8C8", "#E6D3EC", "#CDB6D8"]); }
function startPetals() {
  if (reduceMotion) return;
  const bg = $("petalsBg");
  const n = innerWidth < 760 ? 8 : 14;
  for (let i = 0; i < n; i++) {
    const p = document.createElement("span");
    p.className = "fall-petal";
    const s = 9 + Math.random() * 10;
    p.style.width = s + "px";
    p.style.height = s * 0.8 + "px";
    p.style.left = Math.random() * 100 + "%";
    p.style.background = petalColor();
    p.style.animationDuration = 12 + Math.random() * 10 + "s";
    p.style.animationDelay = -Math.random() * 20 + "s";
    bg.appendChild(p);
  }
}
let lastTrail = 0;
document.addEventListener("pointermove", (e) => {
  if (reduceMotion || e.pointerType !== "mouse" || document.body.classList.contains("locked")) return;
  const now = performance.now();
  if (now - lastTrail < 80) return;
  lastTrail = now;
  const p = document.createElement("span");
  p.className = "trail";
  const s = 6 + Math.random() * 6;
  p.style.width = s + "px";
  p.style.height = s * 0.8 + "px";
  p.style.left = e.clientX + "px";
  p.style.top = e.clientY + "px";
  p.style.background = petalColor();
  p.style.setProperty("--tx", (Math.random() * 40 - 20).toFixed(0) + "px");
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 1200);
});

// --- Secret: tap her name 5 times ---
let nameTaps = 0;
const herName = $("herName");
herName.addEventListener("click", (e) => {
  nameTaps++;
  herName.classList.remove("wig");
  void herName.offsetWidth;
  herName.classList.add("wig");
  burst(e.clientX, e.clientY, 5);
  if (nameTaps >= 5) {
    nameTaps = 0;
    $("secretText").textContent = SECRET_NOTE;
    $("secret").hidden = false;
    Sound.sfx.sparkle();
    burst(innerWidth / 2, innerHeight - 120, 24);
  }
});
$("secretClose").addEventListener("click", () => ($("secret").hidden = true));

// --- Sound toggle ---
const soundBtn = $("soundBtn");
function renderSoundBtn() {
  const m = Sound.isMuted();
  soundBtn.classList.toggle("muted", m);
  soundBtn.setAttribute("aria-pressed", String(!m));
  soundBtn.setAttribute("aria-label", m ? "Turn sound on" : "Turn sound off");
  soundBtn.querySelector(".sound-label").textContent = m ? "sound off" : "music on";
}
function showSoundBtn() {
  soundBtn.hidden = false;
  renderSoundBtn();
}
soundBtn.addEventListener("click", () => Sound.toggle());
document.addEventListener("sound:state", renderSoundBtn);
