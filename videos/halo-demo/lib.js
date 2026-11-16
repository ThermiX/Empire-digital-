// ---------------------------------------------------------------
// HALO film — tiny deterministic animation engine.
// Everything on screen is a pure function of the frame number:
// no CSS animations, no timers. seek(f) redraws the whole film.
// ---------------------------------------------------------------
const W = 1080, H = 1920, FPS = 30, TOTAL = 720;

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a, b, t) => a + (b - a) * t;

const E = {
  lin: t => t,
  inQuad: t => t * t,
  outQuad: t => 1 - (1 - t) ** 2,
  inOutQuad: t => (t < .5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2),
  inCubic: t => t ** 3,
  outCubic: t => 1 - (1 - t) ** 3,
  inOutCubic: t => (t < .5 ? 4 * t ** 3 : 1 - ((-2 * t + 2) ** 3) / 2),
  inQuart: t => t ** 4,
  outQuart: t => 1 - (1 - t) ** 4,
  inOutQuart: t => (t < .5 ? 8 * t ** 4 : 1 - ((-2 * t + 2) ** 4) / 2),
  outQuint: t => 1 - (1 - t) ** 5,
  inQuint: t => t ** 5,
  inOutQuint: t => (t < .5 ? 16 * t ** 5 : 1 - ((-2 * t + 2) ** 5) / 2),
  inExpo: t => (t <= 0 ? 0 : 2 ** (10 * t - 10)),
  outExpo: t => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)),
  inOutExpo: t => (t <= 0 ? 0 : t >= 1 ? 1 : t < .5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2),
  outBack: (s = 1.70158) => t => 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2,
  inBack: (s = 1.70158) => t => (s + 1) * t ** 3 - s * t ** 2,
};

// progress of frame f between a and b (clamped), optionally eased
const pr = (f, a, b, ease) => {
  const t = clamp((f - a) / (b - a));
  return ease ? ease(t) : t;
};
// value animated from v0 to v1 between frames a and b
const tw = (f, a, b, v0, v1, ease) => mix(v0, v1, pr(f, a, b, ease));

// physical spring 0 -> 1 starting at frame `start`
function spring(f, start, { stiff = 170, damp = 14, mass = 1 } = {}) {
  const t = (f - start) / FPS;
  if (t <= 0) return 0;
  const w0 = Math.sqrt(stiff / mass);
  const z = damp / (2 * Math.sqrt(stiff * mass));
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
}

// multi-keyframe interpolation: keys = [[frame, value, easeToNext?], ...]
function kf(f, keys) {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [fa, va, ease] = keys[i];
    const [fb, vb] = keys[i + 1];
    if (f <= fb) return mix(va, vb, pr(f, fa, fb, ease || E.inOutCubic));
  }
  return keys[keys.length - 1][1];
}

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- DOM helpers ------------------------------------------------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
function css(text) {
  const s = document.createElement('style');
  s.textContent = text;
  document.head.appendChild(s);
}
// wrap every character of an element in an inline-block span
function splitChars(el) {
  const txt = el.textContent;
  el.textContent = '';
  return [...txt].map(ch => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.style.display = 'inline-block';
    s.style.whiteSpace = 'pre';
    s.textContent = ch;
    el.appendChild(s);
    return s;
  });
}
// "mask-up" word: <span class="mw"><span class="mwi">word</span></span>
const mw = (txt, cls = '', icls = '') => `<span class="mw ${cls}"><span class="mwi ${icls}">${txt}</span></span>`;
// reveal a mask word: slides up from below its own clipping box
function reveal(el, f, start, dur = 9, dist = 110) {
  const inner = el.firstElementChild;
  const p = pr(f, start, start + dur, E.outExpo);
  inner.style.transform = `translateY(${(1 - p) * dist}%)`;
  el.style.visibility = f < start ? 'hidden' : 'visible';
}
// 3D extrusion: clone `el` n times behind itself
function extrude(el, n, step, cls = 'ex') {
  const wrap = el.parentElement;
  for (let i = n; i >= 1; i--) {
    const c = el.cloneNode(true);
    c.classList.add(cls);
    c.style.transform = `translateZ(${-i * step}px)`;
    c.style.position = 'absolute';
    c.style.left = '0'; c.style.top = '0';
    wrap.insertBefore(c, el);
  }
}

// ---- scene manager ----------------------------------------------
const scenes = [];
function scene(def) { scenes.push(def); }
let stage;
function boot() {
  stage = document.getElementById('stage');
  scenes.forEach((s, i) => {
    s.el = s.build();
    s.el.classList.add('scene');
    s.el.style.zIndex = s.z ?? i + 1;
    stage.appendChild(s.el);
    s.el.style.display = 'block';            // visible while measuring text
    if (s.ready) s.ready(s.el);
    s.el.style.display = 'none';
  });
}
function seek(f) {
  for (const s of scenes) {
    const on = f >= s.from && f < s.to;
    s.el.style.display = on ? 'block' : 'none';
    if (on) s.update(f, s.el);
  }
  window.__frame = f;
}
window.seek = seek;

// ---- extra text helpers -------------------------------------------
// scale the font-size of an inline-block element so it is exactly `width` px wide
function fit(el, width) {
  el.style.fontSize = '100px';
  const w = el.getBoundingClientRect().width;
  el.style.fontSize = (100 * width / w) + 'px';
}
// split into per-letter masks: each letter can slide in/out of its own box
function maskChars(el) {
  const txt = el.textContent;
  el.textContent = '';
  return [...txt].map(ch => {
    const o = document.createElement('span'); o.className = 'mc';
    const i = document.createElement('span'); i.className = 'mci';
    i.textContent = ch; o.appendChild(i); el.appendChild(o);
    return i;
  });
}
// letters rise in from `tin`, optionally leave upward from `tout`
function charsAnim(chars, f, tin, tout = 1e9, stag = 1, dur = 9) {
  chars.forEach((c, i) => {
    const a = pr(f, tin + i * stag, tin + i * stag + dur, E.outExpo);
    const b = pr(f, tout + i * stag * .6, tout + i * stag * .6 + 6, E.inCubic);
    c.style.transform = `translateY(${(1 - a) * 116 - b * 150}%)`;
  });
}
// whip-pan between S3 and S4
const whipA = f => pr(f, 226, 242, E.inOutExpo);
