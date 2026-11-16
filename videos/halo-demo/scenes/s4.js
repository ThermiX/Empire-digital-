// S4 — The phone (f226–354). Dark. The app comes alive, we push in on a payment.
// S5 — The big zoom-out (f354–425): the phone was inside a tiny universe that is
//      itself the "O" of the word PARTOUT.
css(`
.s4{background:var(--ink);color:var(--cream)}
.s4 .dots{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.15) 1.6px,transparent 2.2px);background-size:60px 60px;background-position:30px 30px}
.s4 .dc{position:absolute;border-radius:50%;border:1.5px solid rgba(255,255,255,.10)}
.s4 .tt{position:absolute;left:0;width:1080px;top:196px;text-align:center}
.s4 .tt .a{display:block;font-size:118px;line-height:1.08}
.s4 .tt .b{display:block;font:italic 900 106px/1.08 "Archivo";letter-spacing:-2px}
.s4 .grad{background:linear-gradient(90deg,#FFB627,#FF5533 55%,#FF3D9A);-webkit-background-clip:text;color:transparent;padding:0 16px}
.s4 .persp{position:absolute;inset:0;perspective:1900px;perspective-origin:540px 960px}
.s4 .world{position:absolute;left:540px;top:960px;width:0;height:0}
.s4 .pw{position:absolute;left:0;top:0;width:0;height:0}
.s4 .cap{position:absolute;left:0;width:1080px;top:1392px;text-align:center}
.s4 .cap .a{display:block;font-size:124px;line-height:1.04}
.s4 .cap .b{display:block;font:italic 900 150px/1.04 "Archivo";letter-spacing:-3px}
.phone.flat,.card.flat{transform-style:flat}
.phone.flat .pe,.phone.flat .touch,.card.flat .edge,.card.flat .back,.card.flat .sheen{display:none}
.card.flat .front{transform:none}
`);
const PH = { s: 1.3, sEnd: 1.35, fy: 900, dy: 270 };       // push-in framing shared by S4 and S5
scene({
  from: 226, to: 354,
  build() {
    return h(`<div class="s4">
      <div class="dots"></div>
      <div class="dc" style="left:-100px;top:420px;width:1280px;height:1280px"></div>
      <div class="dc" style="left:-330px;top:190px;width:1740px;height:1740px"></div>
      <div class="tt"><span class="a se">${mw('Tout')} ${mw('ton')} ${mw('argent.')}</span><span class="b">${mw('DANS TA POCHE.', '', 'grad')}</span></div>
      <div class="persp"><div class="world p3"><div class="pw p3">${phoneHTML()}</div></div></div>
      <div class="cap"><span class="a se">${mw('Payé en')}</span><span class="b">${mw('1 SECONDE.', '', 'grad')}</span></div>
    </div>`);
  },
  ready(el) {
    this.pw = $('.pw', el); this.ph = $('.phone', el); this.pes = $$('.pe', el);
    this.tt = $$('.tt .mw', el); this.cap = $$('.cap .mw', el);
    this.deco = [$('.dots', el), ...$$('.dc', el)];
  },
  update(f, el) {
    const w = whipA(f);
    el.style.transform = w < 1 ? `translateX(${(1 - w) * 1180}px)` : 'none';
    // phone pose
    const e = spring(f, 232, { stiff: 110, damp: 15 });
    const p = pr(f, 278, 297, E.inOutCubic);
    const s = mix(1, PH.s, p) + (PH.sEnd - PH.s) * pr(f, 334, 354, E.inQuad);
    const yIn = PH.fy - PH.dy * s - 960;
    const fl = (1 - p) * e;
    const y = mix(mix(1700, 190, e), yIn, p);
    const ry = (mix(-46, -17, e) + Math.sin(f / 15) * 3) * (1 - p);
    const rx = mix(26, 9, e) * (1 - p), rz = mix(9, 2, e) * (1 - p);
    this.pw.style.transform = `translate3d(0,${y + Math.sin(f / 11) * 8 * fl}px,0) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`;
    this.pes.forEach((pe, i) => { pe.style.transform = `translateZ(${-(22 - i * 7) * (1 - p)}px)`; pe.style.opacity = p >= 1 ? 0 : 1; });
    this.deco.forEach(d => { d.style.opacity = 1 - p; });
    // app state
    const press = pr(f, 299, 301) * (1 - pr(f, 302, 306));
    phoneSet(this.ph, {
      ui: Array.from({ length: 8 }, (_, i) => spring(f, 245 + i * 2.2, { stiff: 210, damp: 17 })),
      bal: 245000 * pr(f, 250, 274, E.outExpo) - 12500 * pr(f, 316, 330, E.outCubic),
      tx: [0, 1, 2].map(i => pr(f, 258 + i * 6, 269 + i * 6, E.outExpo)),
      sheet: clamp(spring(f, 284, { stiff: 150, damp: 19 }), 0, 1.02),
      press, ripple: pr(f, 300, 313, E.outCubic),
      ok: pr(f, 306, 311), ring: pr(f, 307, 318, E.inOutCubic), check: pr(f, 313, 321, E.outCubic),
      okText: spring(f, 315, { stiff: 260, damp: 13 }),
      touch: { x: mix(430, 265, pr(f, 292, 299, E.outCubic)), y: mix(1120, 984, pr(f, 292, 299, E.outCubic)), a: pr(f, 292, 295) * (1 - pr(f, 304, 308)), s: 1 - .28 * press },
    });
    // titles
    [246, 249, 252, 257].forEach((t, i) => {
      reveal(this.tt[i], f, t, 10);
      const out = pr(f, 274 + i, 281 + i, E.inCubic);
      if (out > 0) this.tt[i].firstElementChild.style.transform = `translateY(${-out * 125}%)`;
    });
    this.tt[3].firstElementChild.style.fontStretch = mix(62, 100, spring(f, 257, { stiff: 240, damp: 13 })) + '%';
    [318, 323].forEach((t, i) => {
      reveal(this.cap[i], f, t, 10);
      const out = pr(f, 339 + i * 2, 346 + i * 2, E.inCubic);
      if (out > 0) this.cap[i].firstElementChild.style.transform = `translateY(${-out * 125}%)`;
    });
    this.cap[1].firstElementChild.style.fontStretch = mix(62, 100, spring(f, 323, { stiff: 240, damp: 13 })) + '%';
  },
});

// ------------------------------------------------------------------
css(`
.s5{background:var(--amber);color:var(--ink)}
.s5 .lv2{position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:0 0}
.s5 .wc{position:absolute;border-radius:50%;border:2px solid rgba(10,10,18,.5)}
.s5 .word{position:absolute;left:0;width:1080px;top:880px;display:flex;justify-content:center;align-items:center;font:900 172px/1 "Archivo";letter-spacing:-3px}
.s5 .word span{display:block}
.s5 .hole{width:132px;height:132px;margin:0 8px 0 10px;flex:none}
.s5 .disc{position:absolute;border-radius:50%;background:var(--ink);clip-path:circle(50%)}
.s5 .drim{position:absolute}
.s5 .lv1{position:absolute;left:50%;top:50%;width:0;height:0;transform-origin:0 0}
.s5 .orb{position:absolute;border-radius:50%;border:2.5px solid rgba(243,238,228,.2)}
.s5 .star{position:absolute;border-radius:50%;background:rgba(243,238,228,.7)}
.s5 .it{position:absolute;left:0;top:0;width:0;height:0}
.s5 .coin{position:absolute;width:200px;height:200px;margin:-100px;border-radius:50%;background:radial-gradient(circle at 34% 28%,#FFF1C4,#FFC94A 34%,#F0A51A 72%,#C27C00);display:flex;align-items:center;justify-content:center;font:900 104px/1 "Archivo";color:#8A5600}
.s5 .coin::after{content:"";position:absolute;inset:16px;border-radius:50%;border:6px solid rgba(138,86,0,.45)}
.s5 .np{position:absolute;transform:translate(-50%,-50%);white-space:nowrap;height:128px;border-radius:64px;background:var(--cream);color:var(--ink);font:800 46px/128px "Inter";padding:0 46px 0 28px;display:flex;align-items:center;gap:22px;letter-spacing:-.6px}
.s5 .np i{width:76px;height:76px;border-radius:50%;display:block;flex:none}
.s5 .ball{position:absolute}
.s5 .top{position:absolute;left:0;width:1080px;top:610px;text-align:center;font-size:132px;line-height:1.1}
.s5 .bot{position:absolute;left:0;width:1080px;top:1120px;text-align:center;font-size:26px;color:rgba(10,10,18,.75)}
.s5 .arr{position:absolute;left:497px;top:1560px}
.s5 .band{position:absolute;left:-200px;top:1290px;width:1480px;height:132px;background:var(--ink);color:var(--cream);transform-origin:50% 50%;overflow:hidden;white-space:nowrap;font:800 62px/132px "Archivo";font-stretch:112%;letter-spacing:.02em}
.s5 .band div{display:inline-block}
.s5 .band i{font-style:normal;color:var(--amber);margin:0 26px}
`);
scene({
  from: 354, to: 426,
  build() {
    const R = rng(21);
    let stars = '';
    for (let i = 0; i < 90; i++) {
      const a = R() * 6.283, r = 700 + R() * 1000, d = 6 + R() * 12;
      stars += `<div class="star" style="left:${Math.cos(a) * r}px;top:${Math.sin(a) * r}px;width:${d}px;height:${d}px;opacity:${.3 + R() * .7}"></div>`;
    }
    const miniCard = rot => `<div style="transform:rotate(${rot}deg) scale(.62)">${cardHTML('flat')}</div>`;
    const items = [
      // [orbit radius, start angle, angular speed (deg/frame), html]
      [840, 205, .5, miniCard(-14)],
      [860, 20, .5, `<div class="coin">F</div>`],
      [820, 95, .5, `<div class="ball violet" style="width:150px;height:150px;margin:-75px"></div>`],
      [900, 300, .5, `<div class="np"><i style="background:#12A150"></i>+ 25 000 FCFA</div>`],
      [1200, 40, -.35, miniCard(18)],
      [1230, 250, -.35, `<div class="coin">F</div>`],
      [1190, 165, -.35, `<div class="ball coral" style="width:210px;height:210px;margin:-105px"></div>`],
      [1260, 120, -.35, `<div class="np"><i style="background:var(--violet)"></i>Paiement accepté</div>`],
      [1180, 330, -.35, `<div class="ball amber" style="width:120px;height:120px;margin:-60px"></div>`],
      [1530, 70, .28, `<div class="coin">F</div>`],
      [1500, 200, .28, `<div class="ball magenta" style="width:180px;height:180px;margin:-90px"></div>`],
      [1480, 285, .28, `<div class="np"><i style="background:var(--coral)"></i>Épargne + 5 000</div>`],
      [1540, 140, .28, `<div class="ball creamb" style="width:110px;height:110px;margin:-55px"></div>`],
      [1500, 350, .28, miniCard(-24)],
    ];
    this.items = items;
    return h(`<div class="s5"><div class="lv2">
      <div class="wcs"></div>
      <div class="top se">${mw('Envoie,')} ${mw('reçois,')} ${mw('paie')}</div>
      <div class="word"><span>P</span><span>A</span><span>R</span><span>T</span><div class="hole"></div><span>U</span><span>T</span><span>.</span></div>
      <div class="bot mono">${mw('Halo — sans frontières')}</div>
      <div class="band"><div>${'ABIDJAN<i>✦</i>DAKAR<i>✦</i>LOMÉ<i>✦</i>COTONOU<i>✦</i>BAMAKO<i>✦</i>OUAGA<i>✦</i>'.repeat(3)}</div></div>
      <svg class="arr" width="86" height="86" viewBox="0 0 86 86" fill="none" stroke="#0A0A12" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><circle cx="43" cy="43" r="40"/><path d="M43 24v36M27 45l16 16 16-16"/></svg>
      <div class="disc"><div class="lv1">
        <div class="orb" style="left:-840px;top:-840px;width:1680px;height:1680px"></div>
        <div class="orb" style="left:-1210px;top:-1210px;width:2420px;height:2420px"></div>
        <div class="orb" style="left:-1510px;top:-1510px;width:3020px;height:3020px"></div>
        ${stars}
        ${items.map(it => `<div class="it">${it[3]}</div>`).join('')}
        ${phoneHTML().replace('class="phone"', 'class="phone flat"')}
      </div></div>
      <div class="drim"></div>
    </div></div>`);
  },
  ready(el) {
    this.lv2 = $('.lv2', el); this.lv1 = $('.lv1', el); this.disc = $('.disc', el);
    const hole = $('.hole', el).getBoundingClientRect();
    const ro = hole.width / 2, xo = hole.left + ro, yo = hole.top + ro;
    Object.assign(this, { ro, xo, yo, Rc: 1750 });
    this.k = ro / this.Rc;
    Object.assign(this.disc.style, { left: hole.left + 'px', top: hole.top + 'px', width: 2 * ro + 'px', height: 2 * ro + 'px' });
    this.lv1.style.transform = `scale(${this.k})`;
    const rim = $('.drim', el);
    rim.innerHTML = ringHTML(2 * ro + 20, 13);
    Object.assign(rim.style, { left: hole.left - 10 + 'px', top: hole.top - 10 + 'px' });
    this.rim = rim.firstElementChild;
    // concentric "waves" around the O
    $('.wcs', el).innerHTML = [190, 330, 520, 760, 1060].map(r => `<div class="wc" style="left:${xo - r}px;top:${yo - r}px;width:${2 * r}px;height:${2 * r}px;opacity:${r > 500 ? .22 : .4}"></div>`).join('');
    this.wcs = $$('.wc', el);
    phoneSet($('.phone', el), PHONE_DONE);
    this.its = $$('.it', el); this.letters = $$('.word span', el);
    this.top = $$('.top .mw', el); this.bot = $('.bot .mw', el); this.arr = $('.arr', el);
    this.stars = $$('.star', el); this.orbs = $$('.orb', el); this.band = $('.band', el); this.bandIn = $('.band div', el);
  },
  update(f) {
    const { ro, xo, yo, k } = this;
    // pure exponential zoom-out about a fixed screen point
    const S0 = PH.sEnd / k, c0x = 540, c0y = PH.fy - PH.dy * PH.sEnd;
    const q = pr(f, 354, 400, E.inOutCubic);
    const S = Math.exp((1 - q) * Math.log(S0)) * (1 - .035 * Math.sin(Math.PI * pr(f, 395, 413)));
    const Fx = (c0x - S0 * xo) / (1 - S0), Fy = (c0y - S0 * yo) / (1 - S0);
    const cx = Fx + S * (xo - Fx), cy = Fy + S * (yo - Fy);
    this.lv2.style.transform = `translate(${cx - S * xo}px,${cy - S * yo}px) scale(${S})`;
    // orbiting objects
    this.its.forEach((it, i) => {
      const [r, a0, sp] = this.items[i];
      const a = (a0 + sp * (f - 354)) * Math.PI / 180;
      it.style.transform = `translate(${Math.cos(a) * r}px,${Math.sin(a) * r}px) scale(${spring(f, 355.5 + i * .5, { stiff: 260, damp: 15 })})`;
    });
    const fade = pr(f, 355, 362);
    this.stars.forEach(s => { s.style.visibility = fade > 0 ? 'visible' : 'hidden'; });
    this.orbs.forEach(o => { o.style.opacity = fade; });
    this.rim.style.transform = `rotate(${f * 2}deg)`;
    const bp = spring(f, 399, { stiff: 170, damp: 17 });
    this.band.style.transform = `translateX(${(1 - bp) * 1500}px) rotate(-5deg)`;
    this.bandIn.style.transform = `translateX(${-(f - 395) * 13}px)`;
    this.wcs.forEach((wc, i) => { wc.style.transform = `scale(${1 + .03 * Math.sin((f - i * 9) / 7)})`; });
    // the word assembles around the O
    this.letters.forEach((l, i) => {
      const side = i < 4 ? -1 : 1, dist = i < 4 ? 4 - i : i - 3;
      const st = 381 + dist * 2.2;
      const sp = spring(f, st, { stiff: 230, damp: 15 });
      l.style.transform = `translateX(${(1 - sp) * side * (-130 - dist * 70)}px) scale(${mix(.2, 1, sp)})`;
      l.style.opacity = pr(f, st, st + 3);
    });
    [395, 398, 401].forEach((t, i) => reveal(this.top[i], f, t, 9));
    reveal(this.bot, f, 402, 9);
    const ap = spring(f, 404, { stiff: 220, damp: 13 });
    this.arr.style.transform = `scale(${ap}) translateY(${Math.sin(f / 4) * 6}px)`;
  },
});
