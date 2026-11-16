// S8 — Outro (f587–720). Dark. The iris closes onto the O of the wordmark,
// the letters unfold, tagline, a search bar types the handle.
css(`
.s8{background:radial-gradient(circle at 50% 44%,#1D1547 0%,#0E0B22 34%,#0A0A12 66%);color:var(--cream)}
.s8 .cam{position:absolute;inset:0;transform-origin:540px 960px}
.s8 .dots{position:absolute;inset:-200px;background-image:radial-gradient(rgba(255,255,255,.15) 1.6px,transparent 2.2px);background-size:60px 60px;background-position:20px 20px}
.s8 .wm{position:absolute;left:0;width:1080px;top:720px;display:flex;justify-content:center;align-items:center;font:900 260px/.9 "Archivo";font-stretch:125%}
.s8 .wm .mc{margin-right:-3px}
.s8 .oh{width:190px;height:190px;margin-left:12px;flex:none}
.s8 .lr{position:absolute}
.s8 .pulse{position:absolute;border-radius:50%;border:2.5px solid rgba(243,238,228,.5)}
.s8 .tag{position:absolute;left:0;width:1080px;top:1010px;text-align:center;font-size:116px;line-height:1.12}
.s8 .tag .br{display:block}
.s8 .tag .v{font:italic 900 128px/1 "Archivo";letter-spacing:-2px}
.s8 .grad{background:linear-gradient(90deg,#FFB627,#FF5533 55%,#FF3D9A);-webkit-background-clip:text;color:transparent;padding:0 16px}
.s8 .bar{position:absolute;left:110px;top:1380px;width:860px;height:148px;border-radius:74px;border:3px solid rgba(243,238,228,.55);display:flex;align-items:center;padding:0 22px 0 44px;gap:26px;font:600 54px/1 "Inter";letter-spacing:-.5px}
.s8 .bar .ty{white-space:pre}
.s8 .bar .car{width:4px;height:62px;background:var(--amber);margin-left:-18px}
.s8 .bar .go{margin-left:auto;width:104px;height:104px;border-radius:50%;background:var(--halo);display:flex;align-items:center;justify-content:center;flex:none}
.s8 .ft{position:absolute;left:0;width:1080px;top:1776px;text-align:center;font-size:23px;color:rgba(243,238,228,.5)}
.s8 .ball{position:absolute}
`);
const S8 = { x: 0, y: 0, r: 0 };
scene({
  from: 587, to: 721, z: 10,
  build() {
    return h(`<div class="s8"><div class="cam">
      <div class="dots"></div>
      <div class="pulse"></div><div class="pulse"></div><div class="pulse"></div>
      <div class="ball coral" style="width:74px;height:74px;margin:-37px"></div>
      <div class="wm"><span class="hal">HAL</span><div class="oh"></div></div>
      <div class="lr"></div>
      <div class="ball violet" style="width:50px;height:50px;margin:-25px"></div>
      <div class="tag se">${mw('L’argent,')} ${mw('à ta')}<span class="br">${mw('VITESSE.', 'v', 'grad')}</span></div>
      <div class="bar">
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none" stroke="#F3EEE4" stroke-width="5.5" stroke-linecap="round"><circle cx="25" cy="25" r="17"/><path d="M38 38l14 14"/></svg>
        <span class="ty"></span><span class="car"></span>
        <div class="go"><svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#0A0A12" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 24h30M26 11l13 13-13 13"/></svg></div>
      </div>
      <div class="ft mono">Marque fictive — démo motion design</div>
    </div></div>`);
  },
  ready(el) {
    this.cam = $('.cam', el);
    const oh = $('.oh', el).getBoundingClientRect();
    S8.r = oh.width / 2; S8.x = oh.left + S8.r; S8.y = oh.top + S8.r;
    const lr = $('.lr', el);
    lr.innerHTML = ringHTML(190, 53);
    Object.assign(lr.style, { left: oh.left + 'px', top: oh.top + 'px' });
    this.lr = lr; this.ring = lr.firstElementChild;
    this.hal = maskChars($('.hal', el));
    this.tag = $$('.tag .mw', el); this.bar = $('.bar', el); this.ty = $('.ty', el); this.car = $('.car', el); this.go = $('.go', el);
    this.ft = $('.ft', el); this.pulses = $$('.pulse', el); this.balls = $$('.ball', el);
    this.wmc = { x: 540, y: oh.top + S8.r };
  },
  update(f) {
    this.cam.style.transform = `scale(${tw(f, 600, 720, 1, 1.06)})`;
    // ring: lands with a bounce when the iris has closed on it
    const sp = f < 601 ? 1 : 1 + .22 * Math.exp(-(f - 601) / 5) * Math.cos((f - 601) * .9);
    this.lr.style.transform = `scale(${sp})`;
    this.lr.style.opacity = pr(f, 596, 600);
    this.ring.style.transform = `rotate(${f * 2.2}deg)`;
    charsAnim([...this.hal].reverse(), f, 603, 1e9, 3, 11);
    // pulses every beat
    this.pulses.forEach((p, i) => {
      const t = ((f - 600 - i * 20) % 60 + 60) % 60 / 60;
      const r = S8.r + t * 520;
      Object.assign(p.style, { left: S8.x - r + 'px', top: S8.y - r + 'px', width: 2 * r + 'px', height: 2 * r + 'px' });
      p.style.opacity = f < 602 + i * 20 ? 0 : (1 - t) * .55;
    });
    // orbiting balls (2D ellipse, swap depth by hiding behind nothing: purely decorative)
    this.balls.forEach((b, i) => {
      const th = f * (i ? -.07 : .055) + i * 2.4;
      const x = this.wmc.x + Math.cos(th) * (i ? 500 : 450), y = this.wmc.y + Math.sin(th) * (i ? 96 : 150) + (i ? 6 : -50);
      b.style.left = x + 'px'; b.style.top = y + 'px';
      b.style.transform = `scale(${spring(f, 612 + i * 6, { stiff: 200, damp: 12 }) * (1 + .18 * Math.sin(th))})`;
    });
    [622, 627, 631].forEach((t, i) => reveal(this.tag[i], f, t, 10));
    this.tag[2].firstElementChild.style.fontStretch = mix(62, 112, spring(f, 631, { stiff: 240, damp: 13 })) + '%';
    // search bar + typing
    const bs = spring(f, 641, { stiff: 190, damp: 16 });
    this.bar.style.transform = `translateY(${(1 - bs) * 90}px) scale(${mix(.86, 1, bs)})`;
    this.bar.style.opacity = pr(f, 641, 646);
    const txt = '@halo.banque';
    const n = Math.floor(clamp((f - 650) / 2.2, 0, txt.length));
    this.ty.textContent = txt.slice(0, n);
    this.car.style.opacity = n < txt.length ? 1 : (Math.floor((f - 650) / 8) % 2 ? 0 : 1);
    const gs = spring(f, 679, { stiff: 240, damp: 11 });
    this.go.style.transform = `scale(${gs * (1 + .05 * Math.sin((f - 679) * .42))})`;
    this.ft.style.opacity = pr(f, 686, 696);
  },
});
