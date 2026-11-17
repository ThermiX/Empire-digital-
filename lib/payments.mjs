// Module de paiement Animo : crée et vérifie les paiements via Moneroo.
// Sans dépendance. Fonctionne sous Node 18+ (Vercel, Netlify) et Cloudflare Workers/Pages.
//
// Variables d'environnement (à définir chez l'hébergeur, jamais dans la page) :
//   MONEROO_SECRET_KEY  clé secrète Moneroo (mode test ou production)
//   SITE_ORIGIN         adresse du site, sans barre finale. Exemple : https://animo.example
//   MONEROO_API_BASE    facultatif, https://api.moneroo.io par défaut (utilisé par les tests)

// Les montants sont fixés ici, côté serveur : le navigateur ne choisit que le nom de l'offre.
// Doit correspondre à SERVER_PRICES dans index.html. « Animo pour toi » (sur mesure) se règle sur WhatsApp.
export const PLANS = Object.freeze({ Essentiel: 10000, Boutique: 20000 });
// F CFA : le franc CFA d'Afrique de l'Ouest (XOF) et celui d'Afrique centrale (XAF) ont la même valeur.
export const ZONES = Object.freeze({ ouest: 'XOF', centre: 'XAF' });

const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}'’. -]{0,59}$/u;
const EMAIL_RE = /^[^\s@<>"'()\\,;:]{1,64}@[^\s@<>"'()\\,;:]{1,200}\.[^\s@<>"'()\\,;:]{2,24}$/;
const ID_RE = /^[A-Za-z0-9_-]{4,64}$/;
const MAX_BODY = 2000;
const TIMEOUT_MS = 10000;

export const JSON_HEADERS = Object.freeze({
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
});

const fail = (status, error, field) => ({ status, body: field ? { error, field } : { error } });

function apiBase(env) {
  return String(env.MONEROO_API_BASE || 'https://api.moneroo.io').replace(/\/+$/, '');
}

async function callMoneroo(env, fetchImpl, method, path, payload) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetchImpl(apiBase(env) + path, {
      method,
      headers: {
        Authorization: 'Bearer ' + env.MONEROO_SECRET_KEY,
        Accept: 'application/json',
        ...(payload ? { 'Content-Type': 'application/json' } : {}),
      },
      body: payload ? JSON.stringify(payload) : undefined,
      signal: ctl.signal,
    });
    let json = null;
    try { json = await res.json(); } catch (e) { json = null; }
    return { ok: res.ok, status: res.status, json };
  } finally {
    clearTimeout(timer);
  }
}

function isHttps(value) {
  try { return new URL(value).protocol === 'https:'; } catch (e) { return false; }
}

// Valide et normalise la demande de paiement envoyée par la page.
export function parseCheckoutInput(rawBody) {
  if (typeof rawBody !== 'string' || rawBody.length === 0 || rawBody.length > MAX_BODY) return { error: fail(rawBody && rawBody.length > MAX_BODY ? 413 : 400, 'invalid') };
  let input;
  try { input = JSON.parse(rawBody); } catch (e) { return { error: fail(400, 'invalid') }; }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: fail(400, 'invalid') };

  const plan = typeof input.plan === 'string' && Object.prototype.hasOwnProperty.call(PLANS, input.plan) ? input.plan : null;
  if (!plan) return { error: fail(400, 'invalid', 'plan') };
  const zone = typeof input.zone === 'string' && Object.prototype.hasOwnProperty.call(ZONES, input.zone) ? input.zone : null;
  if (!zone) return { error: fail(400, 'invalid', 'zone') };
  const first = typeof input.first_name === 'string' ? input.first_name.trim() : '';
  if (!NAME_RE.test(first)) return { error: fail(400, 'invalid', 'first_name') };
  const last = typeof input.last_name === 'string' ? input.last_name.trim() : '';
  if (!NAME_RE.test(last)) return { error: fail(400, 'invalid', 'last_name') };
  const email = typeof input.email === 'string' ? input.email.trim() : '';
  if (email.length > 120 || !EMAIL_RE.test(email)) return { error: fail(400, 'invalid', 'email') };

  return { value: { plan, zone, first_name: first, last_name: last, email } };
}

// req : { method, origin, contentType, rawBody, query: URLSearchParams }
// Retourne { status, body } : les adaptateurs (Vercel, Cloudflare, Netlify) ne font que le convertir en réponse HTTP.
// La page appelle GET ?ping=1 au chargement : les boutons « Payer » ne s'affichent que si la réponse est { ready: true }.
// Ne révèle rien d'autre que ce oui ou non.
export function isReady(env) {
  return Boolean(env && env.MONEROO_SECRET_KEY && /^https:\/\/[^/]+$/.test(String(env.SITE_ORIGIN || '').replace(/\/+$/, '')));
}

export async function handleRequest(req, env, fetchImpl = fetch) {
  if (req.method === 'GET' && req.query && req.query.get('ping') === '1') return { status: 200, body: { ready: isReady(env) } };
  if (!env || !env.MONEROO_SECRET_KEY || !env.SITE_ORIGIN) return fail(500, 'config');
  const siteOrigin = String(env.SITE_ORIGIN).replace(/\/+$/, '');

  // Seule la page du site peut appeler ce service depuis un navigateur.
  if (req.origin && req.origin !== siteOrigin) return fail(403, 'origin');

  try {
    if (req.method === 'POST') {
      if (req.origin !== siteOrigin) return fail(403, 'origin');
      if (!/^application\/json\b/i.test(req.contentType || '')) return fail(415, 'content-type');
      const parsed = parseCheckoutInput(req.rawBody);
      if (parsed.error) return parsed.error;
      const { plan, zone, first_name, last_name, email } = parsed.value;

      const ref = (globalThis.crypto && globalThis.crypto.randomUUID) ? globalThis.crypto.randomUUID() : String(Date.now());
      const r = await callMoneroo(env, fetchImpl, 'POST', '/v1/payments/initialize', {
        amount: PLANS[plan],
        currency: ZONES[zone],
        description: 'Animo, offre ' + plan + ', 1 mois',
        return_url: siteOrigin + '/',
        customer: { email, first_name, last_name },
        metadata: { plan, zone, ref },
      });
      const data = r.json && r.json.data;
      if (!r.ok || !data || typeof data.id !== 'string' || typeof data.checkout_url !== 'string' || !isHttps(data.checkout_url)) {
        console.error('moneroo initialize refused', r.status);
        return fail(502, 'upstream');
      }
      return { status: 200, body: { checkout_url: data.checkout_url, id: data.id } };
    }

    if (req.method === 'GET') {
      const id = req.query && req.query.get ? req.query.get('paymentId') : null;
      if (!id || !ID_RE.test(id)) return fail(400, 'invalid', 'paymentId');
      const r = await callMoneroo(env, fetchImpl, 'GET', '/v1/payments/' + encodeURIComponent(id) + '/verify');
      const d = r.json && r.json.data;
      if (!r.ok || !d || typeof d.status !== 'string') {
        console.error('moneroo verify refused', r.status);
        return fail(502, 'upstream');
      }
      const metaPlan = d.metadata && typeof d.metadata.plan === 'string' ? d.metadata.plan : null;
      const plan = metaPlan && Object.prototype.hasOwnProperty.call(PLANS, metaPlan) ? metaPlan : null;
      return {
        status: 200,
        body: {
          id,
          status: d.status,
          plan,
          // Le statut n'est donné que si montant et devise correspondent à l'offre : sinon on ne confirme rien.
          matches: Boolean(plan) && Number(d.amount) >= PLANS[plan] && (d.currency === 'XOF' || d.currency === 'XAF'),
          amount: Number(d.amount) || null,
          currency: typeof d.currency === 'string' ? d.currency : null,
        },
      };
    }

    return { status: 405, body: { error: 'method' } };
  } catch (e) {
    console.error('payments error', e && e.name);
    return fail(502, 'upstream');
  }
}
