/**
 * Génère les guides PDF gratuits dans public/guides/ à partir de gabarits HTML.
 * Usage : node scripts/generate-guides.mjs
 * Nécessite Playwright (Chromium). Les PDF générés sont versionnés.
 */
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, "public", "guides");

const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";

const css = `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Manrope, Arial, sans-serif; color: #04180C; font-size: 10.5pt; line-height: 1.6; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 210mm; height: 297mm; padding: 18mm 18mm 16mm; position: relative; page-break-after: always; overflow: hidden; }
.page:last-child { page-break-after: auto; }
.cover { background: #04180C; color: #fff; display: flex; flex-direction: column; justify-content: space-between; }
.cover .grid { position: absolute; inset: 0; background-image: linear-gradient(to right, rgba(159,184,168,.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(159,184,168,.08) 1px, transparent 1px); background-size: 14mm 14mm; }
.cover .glow { position: absolute; width: 140mm; height: 140mm; border-radius: 50%; background: #124E30; filter: blur(60px); right: -40mm; top: -30mm; opacity: .8; }
.cover > * { position: relative; }
.brand { display: flex; align-items: center; gap: 3mm; font-weight: 700; font-size: 12pt; letter-spacing: -.02em; }
.brand .mark { width: 9mm; height: 9mm; border-radius: 2.6mm; background: #E4FF1A; display: inline-flex; align-items: center; justify-content: center; }
.brand span.c { color: #9FB8A8; font-weight: 500; }
.eyebrow { font-size: 8pt; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; color: #9FB8A8; }
.cover h1 { font-size: 40pt; line-height: 1.02; letter-spacing: -.045em; font-weight: 700; margin-top: 6mm; }
.cover h1 em { font-style: normal; color: #E4FF1A; }
.cover .lead { color: #9FB8A8; font-size: 12pt; max-width: 130mm; margin-top: 7mm; }
.cover .meta { display: flex; gap: 8mm; color: #D7E2DB; font-size: 9pt; border-top: 1px solid rgba(255,255,255,.12); padding-top: 6mm; }
h2 { font-size: 19pt; letter-spacing: -.03em; line-height: 1.15; margin: 0 0 4mm; }
h3 { font-size: 12pt; letter-spacing: -.01em; margin: 6mm 0 2mm; }
p + p { margin-top: 3mm; }
.muted { color: #4A6354; }
.num { display: inline-flex; width: 7mm; height: 7mm; border-radius: 50%; background: #04180C; color: #E4FF1A; font-size: 8pt; font-weight: 800; align-items: center; justify-content: center; margin-right: 3mm; flex-shrink: 0; }
.step { display: flex; align-items: flex-start; margin-top: 3.5mm; }
.box { border-radius: 5mm; background: #F4F7F2; padding: 6mm; margin-top: 6mm; }
.box.dark { background: #04180C; color: #fff; }
.box.warn { background: #FDF1DA; color: #5c3b00; }
table { width: 100%; border-collapse: collapse; margin-top: 4mm; font-size: 10pt; }
th, td { text-align: left; padding: 2.6mm 3mm; border-bottom: 1px solid #D8E1DA; }
th { font-size: 7.5pt; text-transform: uppercase; letter-spacing: .12em; color: #6B8174; font-weight: 800; }
td.r, th.r { text-align: right; font-variant-numeric: tabular-nums; }
.box.dark td { border-bottom: 1px dashed rgba(255,255,255,.14); color: #D7E2DB; }
.box.dark td.hl { color: #E4FF1A; font-weight: 800; }
.check { display: flex; gap: 3mm; align-items: flex-start; margin-top: 2.6mm; }
.check i { width: 4.2mm; height: 4.2mm; border: 1.4px solid #124E30; border-radius: 1.2mm; flex-shrink: 0; margin-top: .9mm; }
.footer { position: absolute; bottom: 9mm; left: 18mm; right: 18mm; display: flex; justify-content: space-between; font-size: 7.5pt; color: #6B8174; border-top: 1px solid #D8E1DA; padding-top: 3mm; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
.line { border-bottom: 1px solid #B9C8BD; height: 8.5mm; }
.week { display: grid; grid-template-columns: 9mm 1fr 1fr 5mm; gap: 2mm; align-items: center; font-size: 8.4pt; padding: 1.05mm 0; border-bottom: 1px solid #E9EFEA; font-variant-numeric: tabular-nums; }
.week .b { width: 4mm; height: 4mm; border: 1.2px solid #124E30; border-radius: 1mm; }
.week.h { font-weight: 800; color: #6B8174; font-size: 7pt; letter-spacing: .1em; text-transform: uppercase; }
`;

const logo = `<span class="mark"><svg width="22" height="22" viewBox="0 0 32 32"><circle cx="14.25" cy="17" r="6.25" fill="none" stroke="#04180C" stroke-width="3.1"/><path d="M21.9 10.6v12.8" stroke="#04180C" stroke-width="3.1" stroke-linecap="round"/><circle cx="14.25" cy="17" r="1.6" fill="#04180C"/></svg></span>`;
const brand = `<div class="brand">${logo}<div>Argent<span class="c"> Clair</span></div></div>`;
const footer = (title, n) => `<div class="footer"><span>Argent Clair — ${title}</span><span>Contenu éducatif, pas un conseil financier personnalisé · ${n}</span></div>`;

function cover({ eyebrow, title, lead, meta }) {
  return `<section class="page cover"><div class="grid"></div><div class="glow"></div>
  ${brand}
  <div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="lead">${lead}</p></div>
  <div class="meta">${meta.map((m) => `<span>${m}</span>`).join("")}</div></section>`;
}

/* ------------------------------------------------------------------ */

const guides = [
  {
    file: "guide-premier-salaire.pdf",
    name: "Le guide du premier salaire",
    pages: [
      cover({
        eyebrow: "Guide gratuit · Gestion du salaire",
        title: "Le guide du<br/><em>premier salaire.</em>",
        lead: "La méthode en 5 enveloppes pour donner un rôle à chaque franc dès le jour de paie, et bien démarrer sa vie financière.",
        meta: ["6 pages", "Montants en FCFA", "Édition 2026"],
      }),
      `<section class="page"><p class="eyebrow">01 — Le principe</p><h2>Chaque franc a un rôle, avant d’être dépensé.</h2>
      <p>Le salaire tombe, on règle le loyer, on rembourse un ami, on fait un gros marché… et dès le 10, le compte est déjà fatigué. Ce n’est pas une question de revenu : c’est l’absence de plan au moment précis où l’argent arrive.</p>
      <p>La méthode des enveloppes consiste à répartir son salaire, le jour même, entre cinq usages. On peut utiliser de vraies enveloppes, plusieurs comptes, des portefeuilles mobile money séparés ou un simple tableau.</p>
      <h3>Les 5 enveloppes</h3>
      ${[
        ["Épargne", "Prélevée en premier, dès réception du salaire. Visez 10 à 20 %."],
        ["Charges fixes", "Loyer, électricité, eau, internet, scolarité, remboursements."],
        ["Vie courante", "Marché, transport, crédit téléphonique : les dépenses du quotidien."],
        ["Solidarité", "La part pour la famille, les cérémonies, les cotisations. Fixée à l’avance."],
        ["Plaisir", "Sorties, habits, cadeaux. Une fois vide, on attend le mois suivant."],
      ].map(([t, d], i) => `<div class="step"><span class="num">${i + 1}</span><div><strong>${t}</strong><br/><span class="muted">${d}</span></div></div>`).join("")}
      <div class="box"><strong>La règle d’or :</strong> l’épargne n’est jamais « ce qui reste ». Elle se prélève en premier, comme une facture que vous vous payez à vous-même.</div>
      ${footer("Le guide du premier salaire", 2)}</section>`,
      `<section class="page"><p class="eyebrow">02 — Budget type</p><h2>Exemple pour un salaire net de 250 000 FCFA</h2>
      <p class="muted">Adaptez les montants à votre ville et à votre situation. L’important est que le total soit égal à votre salaire net.</p>
      <div class="box dark"><table><tbody>
      ${[
        ["Épargne (15 %)", 37500, true],
        ["Loyer", 70000],
        ["Électricité, eau, internet", 18000],
        ["Alimentation & marché", 50000],
        ["Transport", 20000],
        ["Crédit & data mobile", 7500],
        ["Solidarité familiale", 25000],
        ["Plaisir & imprévus mineurs", 22000],
      ].map(([l, v, h]) => `<tr><td>${l}</td><td class="r ${h ? "hl" : ""}">${fmt(v)}</td></tr>`).join("")}
      <tr><td><strong style="color:#fff">Total</strong></td><td class="r" style="color:#fff;font-weight:800">${fmt(250000)}</td></tr>
      </tbody></table></div>
      <h3>Diviser la vie courante par semaine</h3>
      <p>Avec 70 000 FCFA pour l’alimentation et le transport, ne gardez que 17 500 FCFA disponibles chaque semaine. Vous verrez immédiatement si vous dépensez trop vite, au lieu de le découvrir le 25.</p>
      <h3>Et les primes ?</h3>
      <p>Une prime, un 13e mois ou un cadeau ne sont pas des revenus réguliers. Utilisez-les pour accélérer un objectif : fonds d’urgence, remboursement d’une dette, projet.</p>
      ${footer("Le guide du premier salaire", 3)}</section>`,
      `<section class="page"><p class="eyebrow">03 — La routine</p><h2>Le jour de paie, en 20 minutes</h2>
      ${[
        "Vérifiez le montant net réellement reçu (et non le salaire brut du contrat).",
        "Transférez immédiatement l’enveloppe épargne vers un compte distinct.",
        "Payez ou provisionnez les charges fixes qui tombent dans le mois.",
        "Placez la vie courante sur le compte ou le portefeuille que vous utilisez au quotidien.",
        "Notez les montants solidarité et plaisir, et tenez-vous-y.",
      ].map((t, i) => `<div class="step"><span class="num">${i + 1}</span><div>${t}</div></div>`).join("")}
      <div class="box warn"><strong>Quand un imprévu arrive :</strong> financez-le en réduisant une autre enveloppe (le plaisir d’abord), jamais en vidant l’épargne sans réfléchir. Si un « imprévu » revient chaque mois, il doit rejoindre les charges fixes.</div>
      <h3>Le point du dernier dimanche du mois</h3>
      <p>Quinze minutes pour comparer ce qui était prévu et ce qui a été dépensé, enveloppe par enveloppe. Ajustez le mois suivant, sans culpabiliser : un budget s’apprend.</p>
      ${footer("Le guide du premier salaire", 4)}</section>`,
      `<section class="page"><p class="eyebrow">04 — Check-list</p><h2>Vos 6 premiers mois</h2>
      ${[
        "J’ai calculé mon salaire net réel et mes charges fixes.",
        "J’ai ouvert un compte ou un portefeuille séparé pour l’épargne.",
        "J’ai programmé un virement d’épargne le jour de la paie.",
        "J’ai fixé une enveloppe solidarité et je l’ai expliquée à mes proches.",
        "Je n’ai souscrit aucun crédit pendant les six premiers mois.",
        "J’ai noté toutes mes petites dépenses pendant un mois complet.",
        "Mon fonds d’urgence atteint au moins un mois de dépenses essentielles.",
        "Je me suis renseigné·e sur la couverture santé proposée par mon employeur.",
        "Je conserve toutes mes fiches de paie dans un dossier.",
        "J’ai testé mon budget dans le simulateur Argent Clair.",
      ].map((t) => `<div class="check"><i></i><span>${t}</span></div>`).join("")}
      <div class="box"><strong>Objectif à 6 mois :</strong> un fonds d’urgence d’un mois de dépenses essentielles, aucune dette nouvelle, et une épargne automatique d’au moins 10 % de votre salaire.</div>
      ${footer("Le guide du premier salaire", 5)}</section>`,
      `<section class="page"><p class="eyebrow">05 — Mon plan</p><h2>Mes enveloppes</h2>
      <p class="muted">Remplissez ce tableau à chaque changement de salaire.</p>
      <table><thead><tr><th>Enveloppe</th><th class="r">Montant</th><th class="r">% du salaire</th></tr></thead><tbody>
      ${["Épargne", "Charges fixes", "Vie courante", "Solidarité", "Plaisir", "Total"].map((t) => `<tr><td style="height:12mm"><strong>${t}</strong></td><td></td><td></td></tr>`).join("")}
      </tbody></table>
      <h3>Mon objectif d’épargne</h3>
      <div class="cols"><div><p class="muted">Projet</p><div class="line"></div></div><div><p class="muted">Montant visé</p><div class="line"></div></div></div>
      <div class="cols" style="margin-top:4mm"><div><p class="muted">Épargne par mois</p><div class="line"></div></div><div><p class="muted">Date visée</p><div class="line"></div></div></div>
      <div class="box dark" style="margin-top:10mm"><strong style="color:#E4FF1A">Allez plus loin</strong><br/><span style="color:#9FB8A8">Simulez votre budget et votre projet sur le site Argent Clair, rubrique Simulateur : les calculs se font instantanément et restent sur votre appareil.</span></div>
      ${footer("Le guide du premier salaire", 6)}</section>`,
    ],
  },
  {
    file: "defi-epargne-52-semaines.pdf",
    name: "Défi épargne 52 semaines",
    pages: (() => {
      const table = (unit) => {
        let total = 0;
        const rows = Array.from({ length: 52 }, (_, i) => {
          total += unit * (i + 1);
          return `<div class="week"><span>S${i + 1}</span><span>${fmt(unit * (i + 1))}</span><span class="muted">${fmt(total)}</span><span class="b"></span></div>`;
        });
        const head = `<div class="week h"><span>Sem.</span><span>À épargner</span><span>Cumul</span><span></span></div>`;
        return `<div class="cols"><div>${head}${rows.slice(0, 26).join("")}</div><div>${head}${rows.slice(26).join("")}</div></div>`;
      };
      return [
        cover({
          eyebrow: "Guide gratuit · Épargne",
          title: "Le défi épargne<br/><em>52 semaines.</em>",
          lead: "Épargnez un peu plus chaque semaine pendant un an. Deux versions, avec cases à cocher et cumuls, pour terminer l’année avec un vrai capital.",
          meta: ["3 pages", "Version douce : 689 000 FCFA", "Version classique : 1 378 000 FCFA"],
        }),
        `<section class="page"><p class="eyebrow">Version douce · 500 FCFA de plus chaque semaine</p><h2>Total en un an : ${fmt(689000)}</h2>
        <p class="muted" style="margin-bottom:3mm">Semaine 1 : 500 FCFA. Semaine 2 : 1 000 FCFA. Et ainsi de suite jusqu’à 26 000 FCFA en semaine 52. Astuce : vous pouvez aussi faire le défi à l’envers, en commençant par les montants les plus élevés.</p>
        ${table(500)}${footer("Défi épargne 52 semaines", 2)}</section>`,
        `<section class="page"><p class="eyebrow">Version classique · 1 000 FCFA de plus chaque semaine</p><h2>Total en un an : ${fmt(1378000)}</h2>
        <p class="muted" style="margin-bottom:3mm">Semaine 1 : 1 000 FCFA. Semaine 52 : 52 000 FCFA. Placez chaque versement sur un compte ou un portefeuille réservé à l’épargne, et cochez la case.</p>
        ${table(1000)}${footer("Défi épargne 52 semaines", 3)}</section>`,
      ];
    })(),
  },
  {
    file: "modele-budget-mensuel.pdf",
    name: "Modèle de budget mensuel",
    pages: [
      `<section class="page">${brand}<p class="eyebrow" style="margin-top:8mm">Modèle de budget mensuel</p><h2 style="margin-top:2mm">Mois de : ______________________</h2>
      <div class="cols">
        <div><h3>Revenus</h3><table><thead><tr><th>Source</th><th class="r">Montant</th></tr></thead><tbody>
        ${["Salaire net", "Activité complémentaire", "Autres", "Total revenus"].map((t) => `<tr><td style="height:9mm">${t}</td><td></td></tr>`).join("")}</tbody></table></div>
        <div><h3>Épargne (à prélever en premier)</h3><table><thead><tr><th>Objectif</th><th class="r">Montant</th></tr></thead><tbody>
        ${["Fonds d’urgence", "Projet", "Tontine", "Total épargne"].map((t) => `<tr><td style="height:9mm">${t}</td><td></td></tr>`).join("")}</tbody></table></div>
      </div>
      <div class="cols">
        <div><h3>Besoins (charges essentielles)</h3><table><thead><tr><th>Poste</th><th class="r">Prévu</th><th class="r">Réel</th></tr></thead><tbody>
        ${["Logement", "Électricité / eau", "Alimentation", "Transport", "Communication", "Santé", "Scolarité", "Famille & solidarité", "Remboursements", "Total besoins"].map((t) => `<tr><td style="height:8.4mm">${t}</td><td></td><td></td></tr>`).join("")}</tbody></table></div>
        <div><h3>Envies (confort, plaisir)</h3><table><thead><tr><th>Poste</th><th class="r">Prévu</th><th class="r">Réel</th></tr></thead><tbody>
        ${["Sorties", "Habillement", "Loisirs", "Cadeaux", "Autres", "", "", "", "", "Total envies"].map((t) => `<tr><td style="height:8.4mm">${t}</td><td></td><td></td></tr>`).join("")}</tbody></table></div>
      </div>
      ${footer("Modèle de budget mensuel", 1)}</section>`,
      `<section class="page"><p class="eyebrow">Bilan du mois</p><h2>Le calcul qui compte</h2>
      <div class="box dark"><table><tbody>
        <tr><td>Total revenus</td><td class="r" style="width:55mm">.............................</td></tr>
        <tr><td>− Total besoins</td><td class="r">.............................</td></tr>
        <tr><td>− Total envies</td><td class="r">.............................</td></tr>
        <tr><td class="hl">= Épargne restante</td><td class="r hl">.............................</td></tr>
        <tr><td>Taux d’épargne (épargne ÷ revenus × 100)</td><td class="r">............... %</td></tr>
      </tbody></table></div>
      <h3>Repère 50 / 30 / 20</h3>
      <p class="muted">50 % pour les besoins, 30 % pour les envies, 20 % pour l’épargne. Un repère à adapter, notamment si vous soutenez votre famille.</p>
      <table><thead><tr><th>Catégorie</th><th class="r">Mon %</th><th class="r">Repère</th></tr></thead><tbody>
        <tr><td style="height:9mm">Besoins</td><td></td><td class="r">50 %</td></tr>
        <tr><td style="height:9mm">Envies</td><td></td><td class="r">30 %</td></tr>
        <tr><td style="height:9mm">Épargne</td><td></td><td class="r">20 %</td></tr>
      </tbody></table>
      <h3>Ce que j’ai appris ce mois-ci</h3>
      ${Array.from({ length: 4 }).map(() => `<div class="line"></div>`).join("")}
      <h3>Ce que je change le mois prochain</h3>
      ${Array.from({ length: 4 }).map(() => `<div class="line"></div>`).join("")}
      ${footer("Modèle de budget mensuel", 2)}</section>`,
    ],
  },
  {
    file: "checklist-anti-arnaques.pdf",
    name: "Check-list anti-arnaques",
    pages: [
      `<section class="page">${brand}<p class="eyebrow" style="margin-top:8mm">Check-list anti-arnaques</p><h2 style="margin-top:2mm">12 questions à se poser avant de confier son argent</h2>
      <p class="muted">Si vous répondez « oui » à l’une des questions marquées d’un point d’alerte, arrêtez-vous et demandez conseil à une personne de confiance.</p>
      ${[
        "⚠ Le rendement promis est-il garanti et supérieur à ce que proposent les banques ?",
        "⚠ Les gains dépendent-ils surtout du recrutement de nouveaux membres ?",
        "⚠ Me presse-t-on de décider aujourd’hui même ?",
        "⚠ Me demande-t-on de garder le secret vis-à-vis de ma famille ?",
        "⚠ Me demande-t-on mon code secret ou un code reçu par SMS ?",
        "⚠ Dois-je payer des « frais » pour débloquer un gain ou un prêt ?",
        "La structure est-elle agréée (BCEAO, ministère des finances, autorité des marchés) ?",
        "Ai-je pu vérifier l’adresse, les dirigeants et les comptes de la structure ?",
        "Le contrat est-il écrit, clair et remis avant tout versement ?",
        "Puis-je récupérer mon argent, et sous quel délai ?",
        "Ai-je investi une somme dont la perte ne mettrait pas ma famille en difficulté ?",
        "Ai-je pris le temps d’en parler à une personne de confiance ?",
      ].map((t) => `<div class="check"><i></i><span>${t}</span></div>`).join("")}
      ${footer("Check-list anti-arnaques", 1)}</section>`,
      `<section class="page"><p class="eyebrow">Mobile money</p><h2>Les arnaques les plus courantes</h2>
      ${[
        ["Le faux transfert", "Un SMS imite une notification de dépôt, puis un appel : « Je me suis trompé, renvoyez-moi l’argent ». Vérifiez votre solde réel dans l’application avant toute action."],
        ["Le faux service client", "Un appel annonce un problème sur votre compte et demande votre code. Aucun opérateur ne demande jamais votre code secret."],
        ["Le faux gain", "Vous auriez gagné un concours auquel vous n’avez pas participé. Pour « recevoir » le lot, il faudrait payer des frais."],
        ["Le faux recrutement", "Une offre d’emploi très bien payée exige des frais de dossier ou de formation avant l’embauche."],
      ].map(([t, d], i) => `<div class="step"><span class="num">${i + 1}</span><div><strong>${t}</strong><br/><span class="muted">${d}</span></div></div>`).join("")}
      <div class="box warn"><strong>Si vous êtes victime</strong><br/>1. Cessez immédiatement tout versement.<br/>2. Contactez votre opérateur ou votre banque par les canaux officiels.<br/>3. Conservez toutes les preuves : messages, reçus, numéros.<br/>4. Déposez plainte et prévenez votre entourage.</div>
      <div class="box dark"><strong style="color:#E4FF1A">À retenir</strong><br/><span style="color:#D7E2DB">Un rendement élevé et garanti, l’urgence et le secret sont les trois signaux d’alerte qui reviennent dans presque toutes les arnaques.</span></div>
      ${footer("Check-list anti-arnaques", 2)}</section>`,
    ],
  },
];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
for (const guide of guides) {
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${guide.name} — Argent Clair</title>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>${css}</style></head><body>${guide.pages.join("")}</body></html>`;
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: path.join(outDir, guide.file), format: "A4", printBackground: true, preferCSSPageSize: true });
  console.log("✓", guide.file);
}
await browser.close();
