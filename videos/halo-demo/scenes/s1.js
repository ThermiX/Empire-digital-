// S1 — Intro (f0–62). Dark. The ring draws itself, the hook lands word by word,
// then the camera dives through the ring into the next scene.
css(`
.s1{background:radial-gradient(circle at 50% 48.5%,#1D1547 0%,#0E0B22 34%,#0A0A12 66%)}
.s1 .cam{position:absolute;inset:0;transform-origin:540px 940px}
.s1 .dots{position:absolute;inset:-600px;background-image:radial-gradient(rgba(255,255,255,.16) 1.6px,transparent 2.2px);background-size:60px 60px;background-position:30px 30px}
.s1 .o{position:absolute;border-radius:50%;border:1.5px solid rgba(255,255,255,.10)}
.s1 .rm{position:absolute;left:60px;top:460px;width:960px;height:960px}
.s1 .spark{position:absolute;width:26px;height:26px;margin:-13px;border-radius:50%;background:#fff;box-shadow:0 0 18px 6px rgba(255,190,130,.9),0 0 60px 18px rgba(255,90,60,.55)}
.s1 .txt{position:absolute;left:0;width:1080px;top:588px;text-align:center;color:var(--cream)}
.s1 .l{display:block;font-size:106px;line-height:1.1}
.s1 .big{display:block;font:italic 900 168px/1 "Archivo";letter-spacing:-3px;margin:6px 0 2px}
.s1 .big span{display:block}
.s1 .big span{background:linear-gradient(90deg,#FFB627,#FF5533 45%,#FF3D9A 80%);-webkit-background-clip:text;color:transparent;padding:0 20px;margin:0 -8px}
.s1 .streak{position:absolute;left:0;height:3px;border-radius:3px;background:linear-gradient(90deg,transparent,rgba(243,238,228,.9))}
.s1 .hud{position:absolute;top:92px;font-size:25px;color:rgba(243,238,228,.55)}
`);
const S1 = { cx: 540, cy: 940, rin: 466, scale: 1, portalR: 0 };
scene({
  from: 0, to: 63,
  build() {
    const R = rng(7);
    let streaks = '';
    for (let i = 0; i < 16; i++) {
      const y = 640 + R() * 600, w = 260 + R() * 520, t0 = 27 + R() * 16, d = 7 + R() * 5, hgt = 2 + R() * 4;
      streaks += `<div class="streak" data-t0="${t0}" data-d="${d}" data-w="${w}" style="top:${y}px;width:${w}px;height:${hgt}px"></div>`;
    }
    return h(`<div class="s1">
      <div class="cam">
        <div class="dots"></div>
        <div class="o" style="left:-50px;top:350px;width:1180px;height:1180px"></div>
        <div class="o" style="left:-200px;top:200px;width:1480px;height:1480px"></div>
        <div class="rm">${ringHTML(960, 13)}</div>
        <div class="spark"></div>
        <div class="streaks">${streaks}</div>
        <div class="txt">
          <span class="l se">${mw('Et si')} ${mw('ton')} ${mw('argent')}</span>
          <span class="l se">${mw('allait')}</span>
          <span class="big"><span class="w1">PLUS</span> <span class="w2">VITE</span></span>
          <span class="l se">${mw('que toi ?')}</span>
        </div>
      </div>
      <div class="hud mono" style="left:84px">● HALO</div>
      <div class="hud mono" style="right:84px">Néobanque · 2026</div>
    </div>`);
  },
  ready(el) {
    this.words = $$('.mw', el);
    this.cam = $('.cam', el); this.rm = $('.rm', el); this.ring = $('.ring', el);
    this.spark = $('.spark', el); this.streaks = $$('.streak', el);
    this.w1 = $('.w1', el); this.w2 = $('.w2', el); this.txt = $('.txt', el);
    this.os = $$('.o', el); this.huds = $$('.hud', el); this.dots = $('.dots', el);
  },
  update(f) {
    // camera: slow push, then dive
    const dive = Math.exp(Math.log(18) * pr(f, 49, 62, E.inCubic));
    const sc = tw(f, 0, 50, 1, 1.07) * dive;
    S1.scale = sc;
    this.cam.style.transform = `scale(${sc})`;
    this.dots.style.transform = `scale(${tw(f, 0, 62, 1, 1.12)})`;
    // ring draws itself
    const a = tw(f, 1, 21, 0, 360, E.inOutCubic);
    this.rm.style.webkitMask = a >= 359.9 ? 'none' : `conic-gradient(from -90deg,#000 ${a}deg,transparent ${a + .5}deg)`;
    this.ring.style.transform = `rotate(${f * 1.1}deg) scale(${tw(f, 0, 22, .86, 1, E.outCubic)})`;
    this.rm.style.transform = `scale(1)`;
    const th = (a - 90) * Math.PI / 180, rr = 473 * tw(f, 0, 22, .86, 1, E.outCubic);
    this.spark.style.left = (540 + rr * Math.sin(th)) + 'px';
    this.spark.style.top = (940 - rr * Math.cos(th)) + 'px';
    this.spark.style.opacity = pr(f, 1, 3) * (1 - pr(f, 20, 25));
    this.spark.style.transform = `scale(${1 + .25 * Math.sin(f * 2.1)})`;
    this.os.forEach((o, i) => {
      const p = pr(f, 4 + i * 5, 26 + i * 5, E.outExpo);
      o.style.transform = `scale(${mix(.6, 1, p)})`; o.style.opacity = p;
    });
    // words
    const t = [5, 10, 13, 21, 43];
    this.words.forEach((w, i) => reveal(w, f, t[i], 10));
    // PLUS / VITE slam in from both sides, the font width stretches on impact
    const slam = (el, start, dir) => {
      const p = pr(f, start, start + 8, E.outExpo);
      const wd = f < start + 8 ? mix(62, 125, pr(f, start, start + 8, E.outCubic)) : mix(125, 108, spring(f, start + 8, { stiff: 300, damp: 16 }));
      el.style.transform = `translateX(${(1 - p) * 1300 * dir}px) skewX(${(1 - p) * -26 * dir}deg)`;
      el.style.fontStretch = wd + '%';
      el.style.visibility = f < start ? 'hidden' : 'visible';
    };
    slam(this.w1, 29, -1); slam(this.w2, 34, 1);
    this.streaks.forEach(s => {
      const t0 = +s.dataset.t0, d = +s.dataset.d, w = +s.dataset.w;
      const p = pr(f, t0, t0 + d);
      s.style.transform = `translateX(${mix(-w - 100, 1180, p)}px)`;
      s.style.opacity = p <= 0 || p >= 1 ? 0 : .8;
    });
    this.txt.style.opacity = 1 - pr(f, 51, 57);
    this.huds.forEach(hd => { hd.style.opacity = pr(f, 2, 10) * (1 - pr(f, 48, 53)); });
    // portal radius (in screen px) used by S2 to open through the ring
    S1.portalR = S1.rin * sc * pr(f, 47.5, 54, E.outCubic);
  },
});
