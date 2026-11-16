// S7 — Manifesto (f534–604). Coral. Four giant extruded lines slam in on the beat
// with camera shake while the camera orbits. Leaves through a closing iris.
css(`
.s7{background:var(--coral);color:var(--cream)}
.s7 .bgc{position:absolute;border-radius:50%;border:2px solid rgba(10,10,18,.16)}
.s7 .shake{position:absolute;inset:0}
.s7 .persp{position:absolute;inset:0;perspective:1500px;perspective-origin:540px 960px}
.s7 .blk{position:absolute;left:540px;top:960px;width:0;height:0}
.s7 .ln{position:absolute;left:-470px;white-space:nowrap}
.s7 .ln .face{display:inline-block;position:relative;font:900 100px/.8 "Archivo";font-stretch:62%;letter-spacing:-.01em}
.s7 .ln .ex{color:#A3220B}
.s7 .ln.k .face{color:var(--ink)}
.s7 .ln.k .ex{color:#6E1404}
.s7 .ball{position:absolute}
.s7 .hud{position:absolute;font-size:25px;color:rgba(10,10,18,.7)}
`);
const S7 = { cx: 0, cy: 0 };
scene({
  from: 534, to: 603, z: 20,
  build() {
    return h(`<div class="s7">
      <div class="bgc" style="left:-60px;top:360px;width:1200px;height:1200px"></div>
      <div class="bgc" style="left:-330px;top:90px;width:1740px;height:1740px"></div>
      <div class="hud mono" style="left:84px;top:92px">● Halo</div>
      <div class="hud mono" style="right:84px;top:92px">Manifeste</div>
      <div class="shake"><div class="persp"><div class="blk p3">
        <div class="ln p3"><span class="face">TON</span></div>
        <div class="ln k p3"><span class="face">ARGENT.</span></div>
        <div class="ln p3"><span class="face">TES</span></div>
        <div class="ln k p3"><span class="face">RÈGLES.</span></div>
        <div class="ball creamb" style="width:120px;height:120px;margin:-60px"></div>
        <div class="ball violet" style="width:170px;height:170px;margin:-85px"></div>
        <div class="ball amber" style="width:84px;height:84px;margin:-42px"></div>
      </div></div></div>
    </div>`);
  },
  ready(el) {
    this.blk = $('.blk', el); this.shake = $('.shake', el);
    this.lns = $$('.ln', el);
    // every line is fitted to the same width, like a poster
    let y = 0; const gap = 36, tops = [];
    this.lns.forEach((ln, i) => {
      const face = $('.face', ln);
      fit(face, 940);
      const fs = parseFloat(face.style.fontSize);
      const capH = fs * .70, acc = i === 3 ? fs * .19 : 0;
      y += acc; tops.push(y - fs * .05); y += capH + gap;
      extrude(face, 12, 6);
      $$('.ex', ln).forEach(c => { c.style.fontSize = face.style.fontSize; });
    });
    const total = y - gap;
    this.lns.forEach((ln, i) => { ln.style.top = (tops[i] - total / 2) + 'px'; });
    this.balls = $$('.ball', el);
  },
  update(f, el) {
    // iris in (from the hub of the bento) / iris out (towards the logo ring)
    const rin = pr(f, 534, 546, E.inCubic) * 1400;
    const out = pr(f, 587, 601.5, E.inOutCubic);
    const rout = mix(1400, S8.r, out);
    const cx = mix(540, S8.x, out), cy = mix(960, S8.y, out);
    el.style.clipPath = f < 546 ? `circle(${rin}px at 540px 960px)` : f >= 587 ? `circle(${rout}px at ${cx}px ${cy}px)` : 'none';
    // camera orbit + shake on every impact
    const hits = [541.5, 549, 556.5, 564];
    let sx = 0, sy = 0;
    hits.forEach((t, i) => {
      const d = f - t - 6;
      if (d >= 0 && d < 9) { const a = (1 - d / 9) ** 2 * 26; sx += Math.sin(d * 2.9 + i) * a; sy += Math.cos(d * 3.7 + i * 2) * a; }
    });
    this.shake.style.transform = `translate(${sx}px,${sy}px)`;
    const ry = kf(f, [[538, -30, E.outCubic], [566, -12, E.inOutQuad], [590, 12]]);
    const rx = kf(f, [[538, 16, E.outCubic], [570, 8, E.inOutQuad], [596, 2]]);
    const sc = tw(f, 538, 590, .78, .87) * mix(1, .12, out);
    this.blk.style.transform = `translate(${(cx - 540) * out}px,${(cy - 960) * out}px) scale(${sc}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${-4 + out * -30}deg)`;
    this.lns.forEach((ln, i) => {
      const p = pr(f, hits[i], hits[i] + 6, E.inCubic);
      ln.style.transform = `translateZ(${(1 - p) * 1380}px)`;
      ln.style.opacity = pr(f, hits[i], hits[i] + 2);
    });
    const bp = [[-520, -640, 240, 552], [560, 250, -360, 560], [470, -420, 420, 568]];
    this.balls.forEach((b, i) => {
      const [x, y, z, t0] = bp[i];
      const s = spring(f, t0, { stiff: 200, damp: 12 });
      b.style.transform = `translate3d(${x + Math.sin(f / 15 + i) * 30}px,${y + Math.cos(f / 12 + i) * 34}px,${z}px) rotateY(${-ry}deg) rotateX(${-rx}deg) scale(${s})`;
    });
  },
});
