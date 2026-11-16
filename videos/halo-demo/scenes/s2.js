// S2 — Wordmark (f48–124). Cream. Extruded 3D letters drop in while the camera
// orbits, then we fly through the "O" of HALO into the next scene.
css(`
.s2{background:var(--cream);color:var(--ink)}
.s2 .zoom{position:absolute;inset:0}
.s2 .dc{position:absolute;border-radius:50%;border:1.5px solid rgba(10,10,18,.11)}
.s2 .hud{position:absolute;font-size:24px;color:rgba(10,10,18,.55)}
.s2 .persp{position:absolute;left:0;top:0;width:1080px;height:1920px;perspective:1700px;perspective-origin:540px 800px}
.s2 .world{position:absolute;left:540px;top:790px;width:0;height:0}
.s2 .wm{position:absolute;left:0;top:0;display:flex;align-items:center;white-space:nowrap}
.s2 .lt{position:relative;display:block;font:900 280px/0.9 "Archivo";font-stretch:125%;letter-spacing:0;margin:0 -3px}
.s2 .lt .face{display:block;position:relative;color:var(--ink)}
.s2 .lt .ex{color:#5B3BFF}
.s2 .lo{position:relative;display:block;margin-left:12px}
.s2 .lo .ring.ex{background:#4A2BE0}
.s2 .shadow{position:absolute;left:-520px;top:150px;width:1040px;height:70px;background:radial-gradient(closest-side,rgba(30,16,90,.22),transparent)}
.s2 .ball{position:absolute}
.s2 .tag{position:absolute;left:0;width:1080px;top:1068px;text-align:center}
.s2 .tag .l{display:block;font-size:124px;line-height:1.1}
.s2 .tag .v{font:italic 900 122px/1 "Archivo";font-stretch:112%;color:var(--violet);letter-spacing:-2px}
.s2 .pill{position:absolute;left:250px;top:1424px;width:580px;height:84px;border-radius:44px;border:2.5px solid var(--ink);font-size:24px;white-space:nowrap;display:flex;align-items:center;justify-content:center;gap:14px}
.s2 .flat,.s2 .flat *{transform-style:flat !important}
.s2 .flat .ex{display:none}
.s2 .pill i{width:14px;height:14px;border-radius:50%;background:var(--coral)}
`);
const S2 = { portal: { x: 0, y: 0, r: 0, a: 0 } };
scene({
  from: 47, to: 123,
  build() {
    const balls = [
      { cls: 'coral', d: 96, R: 560, tilt: -16, sp: 3.1, ph: 200, y: -40, t0: 66 },
      { cls: 'violet', d: 60, R: 470, tilt: 22, sp: -2.3, ph: 20, y: 60, t0: 70 },
      { cls: 'amber', d: 44, R: 640, tilt: 8, sp: 2.2, ph: 100, y: -150, t0: 74 },
    ];
    this.ballDefs = balls;
    return h(`<div class="s2">
      <div class="zoom">
        <div class="dc" style="left:50px;top:300px;width:980px;height:980px"></div>
        <div class="dc" style="left:-150px;top:100px;width:1380px;height:1380px"></div>
        <svg class="abs dash" style="left:-30px;top:220px" width="1140" height="1140" viewBox="0 0 1140 1140"><circle cx="570" cy="570" r="568" fill="none" stroke="rgba(10,10,18,.28)" stroke-width="2" stroke-dasharray="3 22"/></svg>
        ${crossHTML(96, 150, '#0A0A12')}${crossHTML(984, 150, '#0A0A12')}${crossHTML(96, 1770, '#0A0A12')}${crossHTML(984, 1770, '#0A0A12')}
        <div class="hud mono" style="left:128px;top:138px">Halo — 01</div>
        <div class="hud mono" style="right:128px;top:138px">Néobanque</div>
        <div class="hud mono" style="left:128px;top:1758px">FCFA · XOF</div>
        <div class="hud mono" style="right:128px;top:1758px">2026</div>
        <div class="persp"><div class="world p3">
          <div class="shadow"></div>
          <div class="wm p3">
            <span class="lt p3"><span class="face">H</span></span>
            <span class="lt p3"><span class="face">A</span></span>
            <span class="lt p3"><span class="face">L</span></span>
            <span class="lo p3">${ringHTML(204, 57, 'face')}</span>
          </div>
          ${balls.map(b => `<div class="ball ${b.cls}" style="width:${b.d}px;height:${b.d}px;left:${-b.d / 2}px;top:${-b.d / 2}px"></div>`).join('')}
        </div></div>
        <div class="tag">
          <span class="l se">${mw('La')} ${mw('néobanque')}</span>
          <span class="l se">${mw('à ta')} ${mw('VITESSE.', 'v')}</span>
        </div>
        <div class="pill mono"><i></i>Sans frais · Sans attente</div>
      </div>
    </div>`);
  },
  ready(el) {
    this.zoom = $('.zoom', el); this.world = $('.world', el); this.wm = $('.wm', el);
    this.lts = $$('.lt, .lo', el);
    // 3D extrusion (violet sides)
    $$('.lt', el).forEach(l => {
      extrude($('.face', l), 13, 5);
      $$('.ex', l).forEach((c, i) => { c.style.color = `rgb(${mix(52, 91, i / 12)},${mix(30, 59, i / 12)},${mix(170, 255, i / 12)})`; });
    });
    extrude($('.lo .face', el), 13, 5);
    this.oface = $('.lo .face:not(.ex)', el);
    this.exs = $$('.ex', el).map(c => ({ c, z: parseFloat(c.style.transform.slice(11)) }));
    this.persp = $('.persp', el);
    // centre the wordmark on the world origin
    const w = this.wm.offsetWidth, hh = this.wm.offsetHeight;
    this.wm.style.left = -w / 2 + 'px'; this.wm.style.top = -hh / 2 + 'px';
    this.balls = $$('.ball', el); this.words = $$('.mw', el);
    this.dcs = $$('.dc', el); this.dash = $('.dash', el); this.pill = $('.pill', el); this.shadow = $('.shadow', el);
  },
  update(f, el) {
    // --- entering through the ring of S1
    el.style.clipPath = f < 62.5 ? `circle(${S1.portalR}px at ${S1.cx}px ${S1.cy}px)` : 'none';
    // --- camera orbit
    // (the orbit ends face-on at f104: from there the scene is flattened to 2D so the
    //  fly-through of the O is rasterised at full resolution by the browser)
    const flat = f >= 104;
    const ry = kf(f, [[56, -30, E.outCubic], [84, -4, E.inOutQuad], [96, 9, E.inOutCubic], [104, 0]]);
    const rx = kf(f, [[56, 16, E.outCubic], [94, 6, E.inOutCubic], [104, 0]]);
    this.persp.style.perspective = flat ? 'none' : '1700px';
    this.world.classList.toggle('flat', flat);
    const depth = 1 - pr(f, 97, 104, E.inOutCubic);
    if (!flat) this.exs.forEach(e => { e.c.style.transform = `translateZ(${e.z * depth}px)`; });
    const sc = tw(f, 50, 110, .9, 1.03, E.outCubic);
    this.world.style.transform = `scale(${sc}) rotateX(${rx}deg) rotateY(${ry}deg)`;
    // --- letters
    this.lts.forEach((l, i) => {
      const st = 59 + i * 3.5;
      const sp = spring(f, st, { stiff: 210, damp: 14 });
      const isO = i === 3;
      l.style.opacity = pr(f, st, st + 2);
      l.style.transform = flat ? 'none' : isO
        ? `translateY(${(1 - sp) * -320}px) translateZ(${(1 - sp) * 500}px) rotateZ(${(1 - sp) * -260}deg) rotateY(${(1 - sp) * 120}deg)`
        : `translateY(${(1 - sp) * -300}px) translateZ(${(1 - sp) * 380}px) rotateX(${(1 - sp) * -100}deg)`;
    });
    this.oface.style.transform = `rotate(${(f - 60) * 2.2}deg)`;
    this.shadow.style.opacity = pr(f, 62, 74) * (1 - pr(f, 98, 104));
    // --- orbiting balls (billboarded so they stay round)
    this.balls.forEach((b, i) => {
      const d = this.ballDefs[i];
      const th = (d.ph + f * d.sp) * Math.PI / 180;
      const x = d.R * Math.cos(th), z = d.R * Math.sin(th) * .8, y = d.y + z * Math.tan(d.tilt * Math.PI / 180);
      const s = spring(f, d.t0, { stiff: 200, damp: 13 }) * (1 - pr(f, 96, 103, E.inCubic));
      b.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateY(${-ry}deg) rotateX(${-rx}deg) scale(${s})`;
    });
    // --- decor
    this.dcs.forEach((d, i) => { const p = pr(f, 56 + i * 4, 80 + i * 4, E.outExpo); d.style.transform = `scale(${mix(.5, 1, p)})`; d.style.opacity = p; });
    this.dash.style.transform = `rotate(${f * .5}deg)`;
    this.dash.style.opacity = pr(f, 60, 70);
    // --- tagline
    const t = [79, 82, 89, 93];
    this.words.forEach((w, i) => reveal(w, f, t[i], 10));
    const vp = spring(f, 93, { stiff: 260, damp: 12 });
    this.words[3].firstElementChild.style.fontStretch = mix(62, 112, vp) + '%';
    const pp = spring(f, 98, { stiff: 220, damp: 15 });
    this.pill.style.transform = `translateY(${(1 - pp) * 60}px) scale(${mix(.8, 1, pp)})`;
    this.pill.style.opacity = pr(f, 98, 102);
    // --- zoom through the O
    this.zoom.style.transform = 'none';
    if (f >= 104) {
      const r = this.oface.getBoundingClientRect();
      const ox = r.left + r.width / 2, oy = r.top + r.height / 2;
      const rin = r.width / 2 * (1 - 57 / 102);
      const s = Math.exp(Math.log(46) * pr(f, 105, 121, E.inQuad));
      this.zoom.style.transformOrigin = `${ox}px ${oy}px`;
      this.zoom.style.transform = `scale(${s})`;
      S2.portal = { x: ox, y: oy, r: rin * s * 1.03, a: pr(f, 105, 109), s };
    } else S2.portal = { x: 0, y: 0, r: 0, a: 0, s: 1 };
  },
});
