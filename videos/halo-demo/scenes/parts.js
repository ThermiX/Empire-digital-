// Shared building blocks: brand ring, bank card, small decor.
// The ring is cut with a vector clip-path so its edges stay razor sharp at any zoom.
function ringClip(d, t) {
  const R = d / 2, r = R - t;
  return `path(evenodd,'M 0 ${R} A ${R} ${R} 0 1 0 ${d} ${R} A ${R} ${R} 0 1 0 0 ${R} Z M ${t} ${R} A ${r} ${r} 0 1 0 ${d - t} ${R} A ${r} ${r} 0 1 0 ${t} ${R} Z')`;
}
const ringHTML = (d, t, cls = '', style = '') =>
  `<div class="ring ${cls}" style="width:${d}px;height:${d}px;clip-path:${ringClip(d, t)};${style}"></div>`;

const crossHTML = (x, y, col = 'currentColor') =>
  `<svg class="abs" style="left:${x - 14}px;top:${y - 14}px" width="28" height="28" viewBox="0 0 28 28"><path d="M14 0v28M0 14h28" stroke="${col}" stroke-width="2"/></svg>`;

// ---- bank card (portrait, 520 x 824) ------------------------------
css(`
.card{position:absolute;width:520px;height:824px;left:-260px;top:-412px;transform-style:preserve-3d}
.card .face,.card .edge{position:absolute;inset:0;border-radius:46px;overflow:hidden}
.card .edge{background:#2A2440}
.card .front{background:linear-gradient(155deg,#20202F 0%,#0C0C16 55%,#07070D 100%);transform:translateZ(5px)}
.card .back{background:linear-gradient(155deg,#191926 0%,#0A0A12 100%);transform:translateZ(-5px) rotateY(180deg)}
.card .front::after,.card .back::after{content:"";position:absolute;inset:0;border-radius:46px;border:2px solid rgba(255,255,255,.16)}
.card .cring{position:absolute;left:96px;top:420px}
.card .cring2{position:absolute;left:176px;top:500px;opacity:.55}
.card .cwm{position:absolute;left:46px;top:50px;display:flex;align-items:center;gap:3px;font:900 50px/1 "Archivo";font-stretch:125%;color:var(--cream);letter-spacing:-1px}
.card .cnfc{position:absolute;right:44px;top:46px}
.card .chip{position:absolute;left:48px;top:176px;width:96px;height:74px;border-radius:14px;background:linear-gradient(135deg,#FFE7A8,#E0A93B 45%,#FFE9B0 70%,#B9821C);overflow:hidden}
.card .chip i{position:absolute;background:rgba(90,55,0,.55)}
.card .cnum{position:absolute;left:48px;top:300px;font:500 31px/1 "JetBrains Mono";letter-spacing:.14em;color:rgba(243,238,228,.92)}
.card .cname{position:absolute;left:48px;bottom:52px;font:500 24px/1 "JetBrains Mono";letter-spacing:.16em;color:rgba(243,238,228,.9)}
.card .clab{position:absolute;left:48px;bottom:92px;font:500 15px/1 "JetBrains Mono";letter-spacing:.2em;color:rgba(243,238,228,.5)}
.card .cdeb{position:absolute;right:46px;bottom:52px;font:800 24px/1 "Archivo";font-stretch:125%;letter-spacing:.08em;color:var(--cream)}
.card .sheen{position:absolute;inset:0;border-radius:46px;background:linear-gradient(112deg,transparent 30%,rgba(255,255,255,.0) 38%,rgba(255,255,255,.34) 50%,rgba(255,255,255,0) 62%,transparent 70%);background-size:300% 100%;background-repeat:no-repeat;mix-blend-mode:screen}
.card .bstripe{position:absolute;left:0;right:0;top:110px;height:110px;background:#000}
.card .bsig{position:absolute;left:48px;right:150px;top:270px;height:70px;border-radius:8px;background:repeating-linear-gradient(90deg,#E9E3D6 0 8px,#DDD6C6 8px 16px)}
.card .btxt{position:absolute;left:48px;right:48px;bottom:60px;font:500 15px/1.6 "JetBrains Mono";letter-spacing:.1em;color:rgba(243,238,228,.45)}
`);
function cardHTML(extra = '') {
  const edges = [3, 1.5, 0, -1.5, -3].map(z => `<div class="edge" style="transform:translateZ(${z}px)"></div>`).join('');
  return `<div class="card ${extra}">
    <div class="face back"><div class="bstripe"></div><div class="bsig"></div>
      <div class="btxt">HALO — CARTE DE DÉBIT<br>MARQUE FICTIVE · DÉMO</div></div>
    ${edges}
    <div class="face front">
      ${ringHTML(620, 78, 'cring')}
      ${ringHTML(460, 3, 'cring2')}
      <div class="cwm">HAL${ringHTML(37, 10, '', 'margin-left:2px')}</div>
      <svg class="cnfc" width="52" height="58" viewBox="0 0 52 58" fill="none" stroke="#F3EEE4" stroke-width="5" stroke-linecap="round">
        <path d="M10 19c6 6 6 14 0 20"/><path d="M22 11c11 11 11 25 0 36"/><path d="M34 3c16 16 16 36 0 52"/></svg>
      <div class="chip"><i style="left:0;right:0;top:24px;height:2px"></i><i style="left:0;right:0;top:48px;height:2px"></i><i style="left:30px;top:0;bottom:0;width:2px"></i><i style="left:64px;top:0;bottom:0;width:2px"></i></div>
      <div class="cnum">5244 •••• 2026</div>
      <div class="clab">TITULAIRE</div>
      <div class="cname">AWA DIALLO</div>
      <div class="cdeb">DÉBIT</div>
      <div class="sheen"></div>
    </div>
  </div>`;
}
// move the light reflection across a card according to its Y rotation (deg)
function cardSheen(card, rotY) {
  const sh = card.querySelector('.sheen');
  const k = ((rotY % 180) + 180) % 180;            // 0..180
  sh.style.backgroundPosition = `${mix(130, -30, k / 180)}% 0`;
}

// ---- phone (560 x 1160) with the HALO app ---------------------------
css(`
.phone{position:absolute;width:560px;height:1160px;left:-280px;top:-580px;transform-style:preserve-3d}
.phone .pe{position:absolute;inset:0;border-radius:90px;background:#34344A}
.phone .body{position:absolute;inset:0;border-radius:90px;background:#0B0B12;border:3px solid #3A3A50}
.phone .scr{position:absolute;inset:15px;border-radius:76px;background:#F6F2EA;overflow:hidden;color:#0A0A12;font-family:"Inter",sans-serif}
.phone .isl{position:absolute;left:190px;top:18px;width:150px;height:42px;border-radius:22px;background:#000;z-index:9}
.phone .time{position:absolute;left:46px;top:26px;font:700 25px/1 "Inter"}
.phone .stat{position:absolute;right:42px;top:24px}
.phone .hdr{position:absolute;left:30px;top:96px;display:flex;align-items:center;gap:16px}
.phone .av{width:72px;height:72px;border-radius:50%;background:var(--halo);display:flex;align-items:center;justify-content:center;font:800 30px/1 "Inter";color:#fff}
.phone .hi{font:500 22px/1.1 "Inter";color:rgba(10,10,18,.55)}
.phone .nm{font:800 34px/1.1 "Inter";letter-spacing:-.6px}
.phone .bell{position:absolute;right:30px;top:102px;width:60px;height:60px;border-radius:50%;border:2px solid rgba(10,10,18,.16);display:flex;align-items:center;justify-content:center}
.phone .bal{position:absolute;left:22px;top:196px;width:486px;height:252px;border-radius:44px;background:#0A0A12;color:#F3EEE4;overflow:hidden}
.phone .bal .ring{position:absolute;right:-130px;top:-112px}
.phone .bal .lb{position:absolute;left:32px;top:34px;font:500 23px/1 "Inter";color:rgba(243,238,228,.6)}
.phone .bal .am{position:absolute;left:30px;top:76px;font:900 78px/1 "Archivo";font-stretch:100%;letter-spacing:-2px;font-variant-numeric:tabular-nums;white-space:nowrap}
.phone .bal .am small{font:800 28px/1 "Archivo";font-stretch:112%;color:var(--amber);letter-spacing:.04em;margin-left:10px}
.phone .bal .tg{position:absolute;left:30px;bottom:30px;height:48px;border-radius:24px;background:rgba(243,238,228,.12);padding:0 20px;font:600 21px/48px "Inter";white-space:nowrap}
.phone .bal .tg b{color:#7CF2A8;font-weight:700}
.phone .acts{position:absolute;left:22px;top:476px;width:486px;display:flex;justify-content:space-between}
.phone .act{width:108px;text-align:center;font:600 19px/1 "Inter";color:rgba(10,10,18,.75)}
.phone .act i{display:flex;width:88px;height:88px;margin:0 auto 12px;border-radius:50%;border:2px solid rgba(10,10,18,.16);align-items:center;justify-content:center}
.phone .act.on i{background:var(--violet);border-color:var(--violet)}
.phone .sec{position:absolute;left:30px;right:30px;top:640px;display:flex;justify-content:space-between;align-items:baseline;font:800 29px/1 "Inter";letter-spacing:-.4px}
.phone .sec span{font:600 21px/1 "Inter";color:var(--violet)}
.phone .tx{position:absolute;left:22px;width:486px;height:100px;display:flex;align-items:center;gap:18px;padding:0 10px}
.phone .tx .ti{width:66px;height:66px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center}
.phone .tx .a{font:700 25px/1.15 "Inter";letter-spacing:-.3px}
.phone .tx .b{font:500 20px/1.2 "Inter";color:rgba(10,10,18,.5);margin-top:4px}
.phone .tx .v{margin-left:auto;font:800 25px/1 "Inter";white-space:nowrap}
.phone .tx .v.p{color:#12A150}
.phone .bar{position:absolute;left:175px;bottom:14px;width:180px;height:7px;border-radius:4px;background:#0A0A12;z-index:8}
.phone .dim{position:absolute;inset:0;background:#0A0A12}
.phone .sheet{position:absolute;left:0;right:0;bottom:0;height:590px;border-radius:56px 56px 0 0;background:#fff}
.phone .sheet .hd{position:absolute;left:225px;top:16px;width:80px;height:7px;border-radius:4px;background:rgba(10,10,18,.16)}
.phone .pay{position:absolute;inset:0}
.phone .pay .t{position:absolute;left:0;right:0;top:54px;text-align:center;font:600 23px/1 "Inter";color:rgba(10,10,18,.5)}
.phone .pay .m{position:absolute;left:0;right:0;top:100px;display:flex;justify-content:center;align-items:center;gap:14px;font:800 31px/1 "Inter";letter-spacing:-.4px}
.phone .pay .m i{width:54px;height:54px;border-radius:50%;background:var(--coral);display:flex;align-items:center;justify-content:center}
.phone .pay .n{position:absolute;left:0;right:0;top:196px;text-align:center;font:900 92px/1 "Archivo";letter-spacing:-3px}
.phone .pay .n small{display:block;font:800 26px/1 "Archivo";font-stretch:112%;letter-spacing:.08em;color:rgba(10,10,18,.5);margin-top:12px}
.phone .pay .btn{position:absolute;left:34px;right:34px;top:390px;height:108px;border-radius:54px;background:var(--violet);color:#fff;font:800 35px/108px "Inter";text-align:center;overflow:hidden}
.phone .pay .rip{position:absolute;left:50%;top:50%;width:40px;height:40px;margin:-20px;border-radius:50%;background:rgba(255,255,255,.35)}
.phone .okv{position:absolute;inset:0}
.phone .okv .rw{position:absolute;left:156px;top:62px;width:218px;height:218px}
.phone .okv svg{position:absolute;left:156px;top:62px}
.phone .okv .t{position:absolute;left:0;right:0;top:316px;text-align:center;font:900 76px/1 "Archivo";letter-spacing:-2px}
.phone .okv .u{position:absolute;left:0;right:0;top:412px;text-align:center;font:500 25px/1 "Inter";color:rgba(10,10,18,.55)}
.phone .okv .u b{color:#0A0A12;font-weight:800}
.phone .touch{position:absolute;width:86px;height:86px;margin:-43px;border-radius:50%;background:rgba(91,59,255,.28);border:3px solid rgba(91,59,255,.75);z-index:20}
`);
function phoneHTML() {
  const ico = (p, col = '#0A0A12', s = 36) => `<svg width="${s}" height="${s}" viewBox="0 0 36 36" fill="none" stroke="${col}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const txs = [
    ['#FFE2D9', ico('<path d="M8 13h20l-2 15H10z"/><path d="M13 13a5 5 0 0110 0"/>', '#D93A1B', 32), 'Marché Sandaga', 'Aujourd’hui · 10:24', '− 4 500', ''],
    ['#DDF7E7', ico('<path d="M18 27V9"/><path d="M10 17l8-8 8 8"/>', '#12A150', 32), 'Moussa K.', 'Reçu · Hier', '+ 25 000', 'p'],
    ['#E4DEFF', ico('<path d="M6 15c7-7 17-7 24 0"/><path d="M11 20c4-4 10-4 14 0"/><circle cx="18" cy="26" r="1.6"/>', '#5B3BFF', 32), 'Fibre Internet', 'Abonnement · 12 mai', '− 15 000', ''],
  ];
  return `<div class="phone">
    <div class="pe" style="transform:translateZ(-22px)"></div><div class="pe" style="transform:translateZ(-15px)"></div><div class="pe" style="transform:translateZ(-8px)"></div>
    <div class="body"></div>
    <div class="scr">
      <div class="time">9:41</div>
      <svg class="stat" width="92" height="30" viewBox="0 0 92 30" fill="#0A0A12"><rect x="0" y="17" width="6" height="9" rx="1.5"/><rect x="9" y="12" width="6" height="14" rx="1.5"/><rect x="18" y="7" width="6" height="19" rx="1.5"/><rect x="27" y="2" width="6" height="24" rx="1.5"/><rect x="46" y="5" width="40" height="20" rx="6" fill="none" stroke="#0A0A12" stroke-width="2.4"/><rect x="50" y="9" width="28" height="12" rx="3"/><rect x="88" y="11" width="3.5" height="8" rx="1.5"/></svg>
      <div class="isl"></div>
      <div class="ui hdr"><div class="av">A</div><div><div class="hi">Bonjour,</div><div class="nm">Awa Diallo</div></div></div>
      <div class="ui bell">${ico('<path d="M9 26h18l-2.5-4v-7a6.5 6.5 0 00-13 0v7z"/><path d="M15.5 29.5a2.6 2.6 0 005 0"/>', '#0A0A12', 32)}</div>
      <div class="ui bal">${ringHTML(300, 44)}
        <div class="lb">Solde disponible</div>
        <div class="am"><span class="amv">0</span><small>FCFA</small></div>
        <div class="tg"><b>↗ + 25 000</b> &nbsp;cette semaine</div>
      </div>
      <div class="acts">
        <div class="ui act"><i>${ico('<path d="M18 28V8"/><path d="M9 17l9-9 9 9"/>')}</i>Envoyer</div>
        <div class="ui act"><i>${ico('<path d="M18 8v20"/><path d="M9 19l9 9 9-9"/>')}</i>Recevoir</div>
        <div class="ui act on"><i>${ico('<rect x="5" y="9" width="26" height="18" rx="4"/><path d="M5 15h26"/>', '#fff')}</i>Payer</div>
        <div class="ui act"><i>${ico('<path d="M6 27l8-9 6 5 10-13"/><path d="M23 10h7v7"/>')}</i>Épargner</div>
      </div>
      <div class="ui sec">Activité<span>Tout voir</span></div>
      ${txs.map((t, i) => `<div class="tx" style="top:${690 + i * 104}px"><div class="ti" style="background:${t[0]}">${t[1]}</div><div><div class="a">${t[2]}</div><div class="b">${t[3]}</div></div><div class="v ${t[5]}">${t[4]}</div></div>`).join('')}
      <div class="dim"></div>
      <div class="sheet"><div class="hd"></div>
        <div class="pay">
          <div class="t">Paiement sans contact</div>
          <div class="m"><i>${ico('<path d="M8 13h20l-2 15H10z"/><path d="M13 13a5 5 0 0110 0"/>', '#fff', 30)}</i>Boutique Kora</div>
          <div class="n">12 500<small>FCFA</small></div>
          <div class="btn">Payer maintenant<div class="rip"></div></div>
        </div>
        <div class="okv">
          <div class="rw">${ringHTML(218, 26)}</div>
          <svg width="218" height="218" viewBox="0 0 218 218" fill="none" stroke="#0A0A12" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"><path class="chk" d="M70 112l28 28 52-58" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/></svg>
          <div class="t">Payé !</div>
          <div class="u"><b>12 500 FCFA</b> · Boutique Kora</div>
        </div>
      </div>
      <div class="touch"></div>
      <div class="bar"></div>
    </div>
  </div>`;
}
const fmtFR = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
// st: { ui:[..progress per block], bal, tx:[p,p,p], sheet, press, ripple, ok, check, okText, touch:{x,y,a,s} }
function phoneSet(ph, st) {
  const q = ph.__q || (ph.__q = {
    ui: $$('.ui', ph), amv: $('.amv', ph), tx: $$('.tx', ph), dim: $('.dim', ph), sheet: $('.sheet', ph),
    pay: $('.pay', ph), btn: $('.btn', ph), rip: $('.rip', ph), okv: $('.okv', ph), rw: $('.rw', ph), chk: $('.chk', ph),
    okt: $('.okv .t', ph), oku: $('.okv .u', ph), touch: $('.touch', ph),
  });
  q.ui.forEach((u, i) => {
    const p = st.ui[i] ?? 1;
    u.style.transform = `translateY(${(1 - p) * 46}px) scale(${mix(.9, 1, p)})`;
    u.style.opacity = clamp(p * 2.5);
  });
  q.amv.textContent = fmtFR(st.bal);
  q.tx.forEach((t, i) => {
    const p = st.tx[i];
    t.style.transform = `translateX(${(1 - p) * 520}px)`; t.style.opacity = clamp(p * 3);
  });
  q.dim.style.opacity = st.sheet * .42;
  q.sheet.style.transform = `translateY(${(1 - st.sheet) * 640}px)`;
  q.btn.style.transform = `scale(${1 - .05 * st.press})`;
  q.rip.style.transform = `scale(${st.ripple * 26})`; q.rip.style.opacity = st.ripple > 0 ? 1 - st.ripple : 0;
  q.pay.style.opacity = 1 - st.ok; q.pay.style.transform = `scale(${1 - .06 * st.ok})`;
  q.okv.style.opacity = st.ok;
  const a = st.ring * 360;
  q.rw.style.webkitMask = a >= 359.9 ? 'none' : `conic-gradient(from 0deg,#000 ${a}deg,transparent ${a + .5}deg)`;
  q.rw.style.transform = `rotate(${st.ringRot || 0}deg)`;
  q.chk.style.strokeDashoffset = 100 - st.check * 100;
  q.okt.style.transform = `scale(${st.okText})`; q.oku.style.opacity = clamp(st.okText * 1.5 - .5);
  const t = st.touch;
  q.touch.style.opacity = t ? t.a : 0;
  if (t) { q.touch.style.left = t.x + 'px'; q.touch.style.top = t.y + 'px'; q.touch.style.transform = `scale(${t.s})`; }
}
const PHONE_DONE = { ui: [], bal: 232500, tx: [1, 1, 1], sheet: 1, press: 0, ripple: 0, ok: 1, ring: 1, check: 1, okText: 1, touch: null };
