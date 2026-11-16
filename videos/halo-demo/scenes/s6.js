// S6 — Features bento (f416–546). The camera visits three full-screen tiles with
// whip-pans, then pulls back to reveal that they form a 2x2 grid.
css(`
.s6{background:#07070C}
.s6 .bento{position:absolute;left:0;top:0;width:0;height:0}
.s6 .tile{position:absolute;width:1080px;height:1920px;border-radius:110px;overflow:hidden}
.s6 .lab{position:absolute;left:96px;top:120px;font-size:27px}
.s6 .labr{position:absolute;right:96px;top:106px}
/* A — 0 FCFA */
.s6 .tA{left:0;top:0;background:var(--cream);color:var(--ink)}
.s6 .slot{position:absolute;left:0;width:1080px;top:250px;height:800px;overflow:hidden}
.s6 .strip{position:absolute;left:0;width:1080px;top:0;text-align:center;font:900 1000px/800px "Archivo"}
.s6 .strip span{display:block;height:800px}
.s6 .orbA{position:absolute;left:150px;top:300px;width:780px;height:700px;border-radius:50%;border:2.5px solid rgba(10,10,18,.3);transform:rotate(-24deg)}
.s6 .tA .t1{position:absolute;left:0;width:1080px;top:1090px;text-align:center;font:900 190px/1 "Archivo";font-stretch:125%;letter-spacing:-4px}
.s6 .tA .t2{position:absolute;left:0;width:1080px;top:1268px;text-align:center;font-size:176px;line-height:1.05;color:var(--violet)}
.s6 .chipA{position:absolute;left:250px;top:1560px;width:580px;height:92px;border-radius:46px;border:2.5px solid var(--ink);font-size:26px;display:flex;align-items:center;justify-content:center;gap:14px;white-space:nowrap}
.s6 .chipA i{width:14px;height:14px;border-radius:50%;background:var(--coral)}
/* B — 1 s */
.s6 .tB{left:1150px;top:0;background:#12121C;color:var(--cream)}
.s6 .rwB{position:absolute;left:200px;top:300px;width:680px;height:680px}
.s6 .one{position:absolute;left:0;width:1080px;top:412px;text-align:center;font:900 440px/1 "Archivo";letter-spacing:-10px;white-space:nowrap}
.s6 .one em{font:italic 400 300px/1 "Instrument Serif";letter-spacing:0;margin-left:14px}
.s6 .tB .t1{position:absolute;left:0;width:1080px;top:1090px;text-align:center;font-size:170px;line-height:1.05}
.s6 .tB .t2{position:absolute;left:0;width:1080px;top:1270px;text-align:center;font:italic 900 196px/1.05 "Archivo";letter-spacing:-4px}
.s6 .gradB{background:linear-gradient(90deg,#FFB627,#FF5533 55%,#FF3D9A);-webkit-background-clip:text;color:transparent;padding:0 24px}
.s6 .stk{position:absolute;left:0;height:4px;border-radius:3px;background:linear-gradient(90deg,transparent,rgba(243,238,228,.85))}
.s6 .tick{position:absolute;left:538px;top:268px;width:4px;height:26px;background:rgba(243,238,228,.35);transform-origin:2px 372px}
/* C — savings */
.s6 .tC{left:1150px;top:1990px;background:var(--violet);color:var(--cream)}
.s6 .tC .t1{position:absolute;left:96px;top:232px;font-size:156px;line-height:1.05}
.s6 .tC .t2{position:absolute;left:92px;top:400px;display:inline-block;white-space:nowrap;font:900 200px/1.05 "Archivo";letter-spacing:-.02em;color:var(--amber)}
.s6 .chart{position:absolute;left:90px;top:760px;width:900px;height:760px}
.s6 .gl{position:absolute;left:0;right:0;height:2px;background:rgba(243,238,228,.2)}
.s6 .tip{position:absolute;width:56px;height:56px;margin:-28px;border-radius:50%;background:var(--amber);border:9px solid var(--cream)}
.s6 .tipl{position:absolute;transform:translate(-100%,-150%);white-space:nowrap;height:100px;border-radius:50px;background:var(--cream);color:var(--ink);padding:0 38px;font:900 50px/100px "Archivo";letter-spacing:-1px;font-variant-numeric:tabular-nums}
.s6 .tipl small{font:800 24px/1 "Archivo";font-stretch:112%;letter-spacing:.06em;margin-left:10px;color:var(--violet)}
.s6 .goal{position:absolute;left:96px;right:96px;top:1620px;font-size:26px;display:flex;justify-content:space-between;color:rgba(243,238,228,.85)}
.s6 .gbar{position:absolute;left:96px;right:96px;top:1680px;height:22px;border-radius:11px;background:rgba(243,238,228,.2);overflow:hidden}
.s6 .gbar i{display:block;height:100%;border-radius:11px;background:var(--amber);transform-origin:0 50%}
/* D — 24/7 */
.s6 .tD{left:0;top:1990px;background:var(--coral);color:var(--cream)}
.s6 .tD .big{position:absolute;left:0;width:1080px;top:520px;text-align:center;font:900 420px/1 "Archivo";font-stretch:80%;letter-spacing:-12px}
.s6 .tD .t2{position:absolute;left:0;width:1080px;top:1000px;text-align:center;font-size:170px;line-height:1.05;color:var(--ink)}
.s6 .rt{position:absolute;left:340px;top:1300px;width:400px;height:400px}
.s6 .hub{position:absolute;left:905px;top:1745px;width:420px;height:420px;border-radius:50%;background:#07070C;display:flex;align-items:center;justify-content:center}
.s6 .hub::after{content:"";position:absolute;inset:26px;border-radius:50%;border:3px solid rgba(243,238,228,.22)}
`);
scene({
  from: 416, to: 547,
  build() {
    const R = rng(99);
    let stk = '';
    for (let i = 0; i < 12; i++) {
      const y = 200 + R() * 1500, w = 300 + R() * 600, t0 = 452 + R() * 16, d = 6 + R() * 5;
      stk += `<div class="stk" data-t0="${t0}" data-d="${d}" data-w="${w}" style="top:${y}px;width:${w}px"></div>`;
    }
    let ticks = '';
    for (let i = 0; i < 60; i++) ticks += `<div class="tick" style="transform:rotate(${i * 6}deg);${i % 5 ? '' : 'height:44px;background:rgba(243,238,228,.7)'}"></div>`;
    return h(`<div class="s6"><div class="bento">
      <div class="tile tA">
        <div class="lab mono">01 — Frais</div>
        <div class="orbA"></div>
        <div class="slot"><div class="strip"><span>0</span><span>3</span><span>9</span><span>5</span><span>8</span></div></div>
        <div class="ball coral ba" style="position:absolute;width:92px;height:92px;margin:-46px"></div>
        <div class="t1"></div>
        <div class="t2 se">${mw('de frais.')}</div>
        <div class="chipA mono"><i></i>Ni cachés, ni surprises</div>
      </div>
      <div class="tile tB">
        <div class="lab mono">02 — Vitesse</div>
        ${ticks}
        <div class="rwB">${ringHTML(680, 30)}</div>
        <div class="one">1<em>s</em></div>
        <div class="stks">${stk}</div>
        <div class="t1 se">${mw('Paiement')}</div>
        <div class="t2">${mw('ÉCLAIR.', '', 'gradB')}</div>
      </div>
      <div class="tile tC">
        <div class="lab mono">03 — Épargne</div>
        <div class="t1 se">${mw('Ton épargne')}</div>
        <div class="t2"></div>
        <div class="chart">
          ${[0, 1, 2, 3, 4].map(i => `<div class="gl" style="top:${i * 190}px"></div>`).join('')}
          <svg width="900" height="760" viewBox="0 0 900 760" style="position:absolute;left:0;top:0;overflow:visible">
            <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3EEE4" stop-opacity=".42"/><stop offset="1" stop-color="#F3EEE4" stop-opacity="0"/></linearGradient>
            <clipPath id="ac"><rect class="acr" x="0" y="-40" width="0" height="840"/></clipPath></defs>
            <path clip-path="url(#ac)" fill="url(#ag)" d="M0 700 C90 690 130 600 220 610 S330 520 420 500 S540 380 620 330 S760 240 900 60 V760 H0 Z"/>
            <path class="ln" fill="none" stroke="#F3EEE4" stroke-width="13" stroke-linecap="round" d="M0 700 C90 690 130 600 220 610 S330 520 420 500 S540 380 620 330 S760 240 900 60"/>
          </svg>
          <div class="tip"></div><div class="tipl"><span class="tv">0</span><small>FCFA</small></div>
        </div>
        <div class="goal mono"><span>Objectif 500 000</span><span class="gp">0 %</span></div>
        <div class="gbar"><i></i></div>
      </div>
      <div class="tile tD">
        <div class="lab mono">04 — Support</div>
        <div class="big">24/7</div>
        <div class="t2 se">Toujours là.</div>
        <svg class="rt" viewBox="0 0 400 400"><defs><path id="rtp" d="M200 200m-160 0a160 160 0 1 1 320 0a160 160 0 1 1-320 0"/></defs>
          <text font-family="JetBrains Mono" font-weight="700" font-size="30" letter-spacing="7.5" fill="#F3EEE4"><textPath href="#rtp">JOUR ET NUIT · 7 JOURS SUR 7 · JOUR ET NUIT · </textPath></text>
          <circle cx="200" cy="200" r="92" fill="#0A0A12"/><path d="M200 150v54l34 22" stroke="#F3EEE4" stroke-width="13" stroke-linecap="round" fill="none"/></svg>
      </div>
      <div class="hub">${ringHTML(230, 62)}</div>
    </div></div>`);
  },
  ready(el) {
    this.bento = $('.bento', el);
    this.strip = $('.strip', el); this.ba = $('.ba', el);
    const a1 = $('.tA .t1', el); a1.textContent = 'FCFA'; this.a1 = maskChars(a1);
    this.a2 = $('.tA .t2 .mw', el); this.chipA = $('.chipA', el);
    this.rwB = $('.rwB', el); this.one = $('.one', el); this.stks = $$('.stk', el);
    this.b1 = $('.tB .t1 .mw', el); this.b2 = $('.tB .t2 .mw', el);
    this.c1 = $('.tC .t1 .mw', el);
    const c2 = $('.tC .t2', el); c2.textContent = 'GRANDIT.'; fit(c2, 880); this.c2 = maskChars(c2);
    this.ln = $('.ln', el); this.len = this.ln.getTotalLength();
    this.ln.style.strokeDasharray = this.len;
    this.acr = $('.acr', el); this.tip = $('.tip', el); this.tipl = $('.tipl', el); this.tv = $('.tv', el);
    this.gp = $('.gp', el); this.gb = $('.gbar i', el);
    this.rt = $('.rt', el); this.big = $('.tD .big', el); this.hub = $('.hub', el); this.hubRing = $('.hub .ring', el);
    this.ticks = $$('.tick', el);
  },
  update(f, el) {
    // the whole sheet slides up over PARTOUT
    el.style.transform = `translateY(${(1 - pr(f, 416, 425, E.outExpo)) * 1920}px)`;
    // --- camera
    const pB = pr(f, 445, 455, E.inOutExpo), pC = pr(f, 475, 485, E.inOutExpo), pO = pr(f, 505, 525, E.inOutCubic);
    let cx = 540 + 1150 * pB, cy = 960 + 1990 * pC, s = 1.07;
    cx = mix(cx, 1115, pO); cy = mix(cy, 1955, pO);
    s = mix(s, .435, pO) + .02 * pr(f, 525, 547);
    const rot = Math.sin(Math.PI * pB) * -3 + Math.sin(Math.PI * pC) * 3 + (1 - pO) * 0 + Math.sin(Math.PI * pO) * -4;
    this.bento.style.transform = `translate(540px,960px) rotate(${rot}deg) scale(${s}) translate(${-cx}px,${-cy}px)`;
    // --- A: the 0 lands like a slot machine
    const sa = spring(f, 420, { stiff: 120, damp: 13 });
    this.strip.style.transform = `translateY(${-(1 - sa) * 3200}px)`;
    const th = f * .09;
    this.ba.style.left = (540 + 390 * Math.cos(th) * Math.cos(-.42) - 350 * Math.sin(th) * Math.sin(-.42)) + 'px';
    this.ba.style.top = (650 + 390 * Math.cos(th) * Math.sin(-.42) + 350 * Math.sin(th) * Math.cos(-.42)) + 'px';
    this.ba.style.transform = `scale(${spring(f, 428, { stiff: 200, damp: 12 })})`;
    charsAnim(this.a1, f, 430, 1e9, 1.3, 9);
    reveal(this.a2, f, 436, 10);
    const ca = spring(f, 440, { stiff: 220, damp: 15 });
    this.chipA.style.transform = `translateY(${(1 - ca) * 60}px) scale(${mix(.8, 1, ca)})`; this.chipA.style.opacity = pr(f, 440, 444);
    // --- B: stopwatch ring closes in a flash
    const a = pr(f, 450, 463, E.inOutCubic) * 360;
    this.rwB.style.webkitMask = a >= 359.9 ? 'none' : `conic-gradient(from 0deg,#000 ${a}deg,transparent ${a + .5}deg)`;
    this.rwB.style.transform = `rotate(${(f - 463) * (f > 463 ? 1.2 : 0)}deg)`;
    const so = spring(f, 452, { stiff: 240, damp: 13 });
    this.one.style.transform = `scale(${mix(.4, 1, so)})`; this.one.style.opacity = pr(f, 452, 455);
    this.stks.forEach(st => {
      const t0 = +st.dataset.t0, d = +st.dataset.d, w = +st.dataset.w, p = pr(f, t0, t0 + d);
      st.style.transform = `translateX(${mix(-w - 80, 1160, p)}px)`; st.style.opacity = p <= 0 || p >= 1 ? 0 : .7;
    });
    reveal(this.b1, f, 455, 10); reveal(this.b2, f, 460, 10);
    this.b2.firstElementChild.style.fontStretch = mix(62, 104, spring(f, 460, { stiff: 240, damp: 13 })) + '%';
    this.ticks.forEach((t, i) => { t.style.opacity = pr(f, 449 + i * .2, 452 + i * .2); });
    // --- C: the savings curve draws itself
    reveal(this.c1, f, 480, 10); charsAnim(this.c2, f, 484, 1e9, 1, 9);
    const d = pr(f, 484, 505, E.inOutCubic);
    this.ln.style.strokeDashoffset = this.len * (1 - d);
    const pt = this.ln.getPointAtLength(this.len * d);
    this.acr.setAttribute('width', pt.x);
    this.tip.style.left = pt.x + 'px'; this.tip.style.top = pt.y + 'px';
    this.tip.style.transform = `scale(${spring(f, 484, { stiff: 240, damp: 13 }) * (1 + .12 * Math.sin(f * .8))})`;
    this.tipl.style.left = Math.max(pt.x, 430) + 'px'; this.tipl.style.top = pt.y + 'px';
    this.tipl.style.opacity = pr(f, 486, 490);
    this.tv.textContent = fmtFR(500000 * d);
    this.gp.textContent = Math.round(100 * d) + ' %';
    this.gb.style.transform = `scaleX(${d})`;
    // --- D + hub (seen in the overview)
    this.rt.style.transform = `rotate(${f * 1.4}deg)`;
    const sd = spring(f, 510, { stiff: 200, damp: 13 });
    this.big.style.transform = `scale(${mix(.6, 1, sd)})`;
    const sh = spring(f, 514, { stiff: 210, damp: 12 });
    this.hub.style.transform = `scale(${sh})`;
    this.hubRing.style.transform = `rotate(${f * 4}deg)`;
  },
});
