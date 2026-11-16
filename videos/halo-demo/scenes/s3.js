// S3 — The card (f105–243). Electric violet. A 3D bank card flies in spinning,
// giant type sits behind it, a "0 FCFA" sticker pops, then features stack up.
css(`
.s3{background:#5B3BFF;color:var(--cream)}
.s3 .in{position:absolute;inset:0;transform-origin:540px 960px;background:radial-gradient(circle at 50% 46%,#6C4FFF 0%,#5B3BFF 40%,#4526E6 100%)}
.s3 .dc{position:absolute;border-radius:50%;border:1.5px solid rgba(255,255,255,.16)}
.s3 .bt{position:absolute;left:54px;font:900 100px/.86 "Archivo";font-stretch:62%;white-space:nowrap;display:inline-block;letter-spacing:-2px}
.s3 .persp{position:absolute;inset:0;perspective:1500px;perspective-origin:540px 900px}
.s3 .world{position:absolute;left:540px;top:900px;width:0;height:0}
.s3 .cw{position:absolute;left:0;top:0;width:0;height:0}
.s3 .csh{position:absolute;left:-330px;top:440px;width:660px;height:90px;background:radial-gradient(closest-side,rgba(18,6,90,.5),transparent)}
.s3 .stk{position:absolute;left:316px;top:-64px;width:236px;height:236px;margin:0;border-radius:50%;background:var(--amber);color:var(--ink);transform:translateZ(12px);display:flex;align-items:center;justify-content:center;flex-direction:column}
.s3 .stk b{font:900 128px/.8 "Archivo";font-stretch:100%;display:block;margin-top:6px}
.s3 .stk em{font:800 30px/1 "Archivo";font-stretch:125%;font-style:normal;letter-spacing:.06em;margin-top:6px}
.s3 .stk svg{position:absolute;inset:0}
.s3 .ball{position:absolute}
.s3 .hl{position:absolute;left:0;width:1080px;top:1010px;text-align:center}
.s3 .hl .a{display:block;font-size:112px;line-height:1.05}
.s3 .hl .b{display:block;font:italic 900 132px/1.05 "Archivo";letter-spacing:-2px;color:var(--amber)}
.s3 .row{position:absolute;left:110px;width:860px;height:128px;border-radius:44px;background:var(--cream);color:var(--ink);display:flex;align-items:center;padding:0 26px;gap:26px}
.s3 .row .ic{width:84px;height:84px;border-radius:50%;background:var(--ink);display:flex;align-items:center;justify-content:center;flex:none}
.s3 .row .t1{font:800 38px/1.1 "Inter";letter-spacing:-.6px}
.s3 .row .t2{font:500 27px/1.2 "Inter";color:rgba(10,10,18,.58);margin-top:5px}
.s3 .row .ok{margin-left:auto;width:54px;height:54px;border-radius:50%;background:var(--violet);display:flex;align-items:center;justify-content:center;flex:none}
`);
scene({
  from: 104, to: 244,
  build() {
    const ic = p => `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="#F3EEE4" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
    const ok = `<svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="#F3EEE4" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15.5l6 6L24 9"/></svg>`;
    const rows = [
      [ic('<path d="M12 14c5 5 5 11 0 16"/><path d="M21 9c8 8 8 18 0 26"/><path d="M30 4c11 11 11 25 0 36"/>'), 'Paiement sans contact', 'En boutique et en ligne'],
      [ic('<rect x="9" y="20" width="26" height="18" rx="5"/><path d="M14 20v-6a8 8 0 0116 0v6"/>'), 'Blocage instantané', 'En un geste, depuis l’appli'],
      [ic('<path d="M6 34h32"/><path d="M12 34V22"/><path d="M22 34V10"/><path d="M32 34V17"/>'), 'Plafonds sur mesure', 'C’est toi qui décides'],
    ];
    return h(`<div class="s3"><div class="in">
      <div class="dc" style="left:-60px;top:300px;width:1200px;height:1200px"></div>
      <div class="dc" style="left:-300px;top:60px;width:1680px;height:1680px"></div>
      <div class="dc" style="left:190px;top:550px;width:700px;height:700px"></div>
      <div class="bt a1" style="top:150px">UNE</div>
      <div class="bt a2" style="top:1330px">CARTE.</div>
      <div class="bt b1" style="top:150px">ZÉRO</div>
      <div class="bt b2" style="top:1330px">FRAIS.</div>
      <div class="persp"><div class="world p3">
        <div class="csh"></div>
        <div class="ball amber" style="width:70px;height:70px"></div>
        <div class="ball coral" style="width:110px;height:110px"></div>
        <div class="ball creamb" style="width:46px;height:46px"></div>
        <div class="cw p3">${cardHTML()}</div>
      </div></div>
      <div class="hl"><span class="a se">${mw('Prête en')}</span><span class="b">${mw('30 SECONDES.')}</span></div>
      ${rows.map((r, i) => `<div class="row" style="top:${1330 + i * 150}px"><div class="ic">${r[0]}</div><div><div class="t1">${r[1]}</div><div class="t2">${r[2]}</div></div><div class="ok">${ok}</div></div>`).join('')}
    </div></div>`);
  },
  ready(el) {
    this.inn = $('.in', el);
    const bts = $$('.bt', el);
    fit(bts[1], 972); bts[0].style.fontSize = bts[1].style.fontSize;
    fit(bts[3], 972); bts[2].style.fontSize = bts[3].style.fontSize;
    this.bt = bts.map(b => maskChars(b));
    this.card = $('.card', el); this.cw = $('.cw', el); this.csh = $('.csh', el);
    // sticker lives on the card front so it turns with it
    const stk = h(`<div class="stk"><svg viewBox="0 0 236 236"><defs><path id="stkp" d="M118 118m-94 0a94 94 0 1 1 188 0a94 94 0 1 1-188 0"/></defs>
      <text font-family="JetBrains Mono" font-weight="700" font-size="19" letter-spacing="4.6" fill="#0A0A12"><textPath href="#stkp">SANS FRAIS · SANS FRAIS · SANS FRAIS · SANS FRAIS · </textPath></text></svg><b>0</b><em>FCFA</em></div>`);
    this.card.appendChild(stk); this.stk = stk; this.stkSvg = $('svg', stk);
    this.balls = $$('.ball', el); this.dcs = $$('.dc', el);
    this.hl = $$('.hl .mw', el); this.rows = $$('.row', el); this.hlEl = $('.hl', el);
  },
  update(f, el) {
    // entering through the O of HALO, leaving in a whip-pan
    const P = S2.portal;
    el.style.clipPath = f < 122 ? `circle(${P.r}px at ${P.x}px ${P.y}px)` : 'none';
    el.style.opacity = f < 110 ? P.a : 1;
    const w = whipA(f);
    el.style.transform = w > 0 ? `translateX(${-w * 1180}px)` : 'none';
    this.inn.style.transform = `scale(${tw(f, 106, 126, .45, 1, E.outCubic)})`;
    this.dcs.forEach((d, i) => { d.style.transform = `scale(${1 + .04 * Math.sin((f + i * 30) / 20)})`; });
    // big type behind the card
    charsAnim(this.bt[0], f, 121, 147); charsAnim(this.bt[1], f, 130, 149);
    charsAnim(this.bt[2], f, 152, 177); charsAnim(this.bt[3], f, 161, 179);
    // card choreography
    const pC = pr(f, 180, 200, E.inOutCubic);
    const ent = pr(f, 114, 146, E.outExpo);
    const spin = pr(f, 147, 167, E.inOutCubic);
    const ry = mix(-584, -24, ent) + spin * 408 - pC * 24;
    const rx = mix(34, 9, ent) + pC * 47;
    const rz = mix(-46, -9, ent) + spin * 17 + pC * (-30 + 10 * pr(f, 190, 240));
    const z = mix(-2600, 0, ent), y = mix(620, 0, ent) + Math.sin(f / 9) * 9 * ent - pC * 330;
    const sc = mix(1, .92, pC);
    this.cw.style.transform = `translate3d(0,${y}px,${z}px) rotateX(${rx}deg) rotateZ(${rz}deg) rotateY(${ry}deg) scale(${sc})`;
    cardSheen(this.card, ry + f * 1.3);
    this.csh.style.opacity = ent * .9;
    this.csh.style.transform = `translateY(${-pC * 240}px) scale(${mix(.3, 1, ent) * mix(1, .8, pC)})`;
    // sticker
    const sp = spring(f, 166, { stiff: 230, damp: 11 });
    this.stk.style.transform = `translateZ(12px) scale(${sp}) rotate(${mix(-70, 12, sp)}deg)`;
    this.stkSvg.style.transform = `rotate(${f * 1.6}deg)`;
    // floating balls
    const bp = [[-400, -500, -200, 124], [420, 470, 260, 128], [380, -330, -420, 134]];
    this.balls.forEach((b, i) => {
      const [x, y0, z0, t0] = bp[i];
      const s = spring(f, t0, { stiff: 190, damp: 12 }) * (1 - pr(f, 178, 190, E.inCubic));
      b.style.transform = `translate3d(${x + Math.sin(f / 17 + i) * 26}px,${y0 + Math.cos(f / 13 + i * 2) * 30}px,${z0}px) translate(-50%,-50%) scale(${s})`;
    });
    // phase C: headline + feature rows
    reveal(this.hl[0], f, 184, 10); reveal(this.hl[1], f, 189, 10);
    this.hl[1].firstElementChild.style.fontStretch = mix(62, 100, spring(f, 189, { stiff: 240, damp: 13 })) + '%';
    this.rows.forEach((r, i) => {
      const s = spring(f, 197 + i * 7, { stiff: 200, damp: 15 });
      r.style.transform = `translateX(${(1 - s) * 1100}px) rotate(${(1 - s) * 5}deg)`;
      r.style.visibility = f < 197 + i * 7 ? 'hidden' : 'visible';
    });
  },
});
