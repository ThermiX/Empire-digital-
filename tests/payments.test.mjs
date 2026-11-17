// Lancer : npm test   (ou : node --test tests/)
// Un faux serveur Moneroo reproduit les réponses de la documentation officielle.
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { handleRequest, PLANS } from '../lib/payments.mjs';

const ORIGIN = 'https://animo.example';
let server, base, seen, mode;

test.before(async () => {
  server = http.createServer((req, res) => {
    let body = '';
    req.on('data', c => (body += c));
    req.on('end', () => {
      seen = { method: req.method, url: req.url, auth: req.headers.authorization, body: body ? JSON.parse(body) : null };
      res.setHeader('Content-Type', 'application/json');
      if (mode === 'down') { res.statusCode = 500; return res.end('{"message":"secret internal detail"}'); }
      if (req.method === 'POST' && req.url === '/v1/payments/initialize') {
        const url = mode === 'http-url' ? 'http://evil.example/x' : 'https://checkout.moneroo.io/pay_123';
        return res.end(JSON.stringify({ message: 'Transaction initialized successfully', data: { id: 'pay_123', checkout_url: url } }));
      }
      if (req.method === 'GET' && req.url === '/v1/payments/pay_123/verify') {
        return res.end(JSON.stringify({ message: 'ok', data: { id: 'pay_123', status: 'success', amount: 20000, currency: 'XOF', metadata: { plan: 'Boutique' } } }));
      }
      res.statusCode = 404; res.end('{}');
    });
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port;
});
test.after(() => server.close());
test.beforeEach(() => { mode = 'ok'; seen = null; });

const env = () => ({ MONEROO_SECRET_KEY: 'sk_test_123', SITE_ORIGIN: ORIGIN, MONEROO_API_BASE: base });
const post = (payload, over = {}) => handleRequest({
  method: 'POST', origin: ORIGIN, contentType: 'application/json',
  rawBody: typeof payload === 'string' ? payload : JSON.stringify(payload), query: new URLSearchParams(), ...over,
}, env());
const good = { plan: 'Boutique', zone: 'ouest', first_name: 'Awa', last_name: 'Diallo', email: 'awa@example.org' };

test('crée un paiement : montant et devise viennent du serveur', async () => {
  const r = await post({ ...good, amount: 1, currency: 'USD' });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { checkout_url: 'https://checkout.moneroo.io/pay_123', id: 'pay_123' });
  assert.equal(seen.method, 'POST');
  assert.equal(seen.url, '/v1/payments/initialize');
  assert.equal(seen.auth, 'Bearer sk_test_123');
  assert.equal(seen.body.amount, PLANS.Boutique);
  assert.equal(seen.body.currency, 'XOF');
  assert.equal(seen.body.return_url, ORIGIN + '/');
  assert.deepEqual(seen.body.customer, { email: 'awa@example.org', first_name: 'Awa', last_name: 'Diallo' });
  for (const v of Object.values(seen.body.metadata)) assert.equal(typeof v, 'string'); // Moneroo : valeurs texte uniquement
});

test('les offres payables en ligne ont les bons prix, et la zone centre paie en XAF', async () => {
  for (const [plan, price] of [['Essentiel', 10000], ['Boutique', 20000]]) {
    await post({ ...good, plan });
    assert.equal(seen.body.amount, price);
  }
  await post({ ...good, zone: 'centre' });
  assert.equal(seen.body.currency, 'XAF');
});

test('refuse les données invalides', async () => {
  const cases = [
    [{ ...good, plan: 'Gratuit' }, 'plan'],
    [{ ...good, plan: 'Animo pour toi' }, 'plan'],
    [{ ...good, plan: 'Pro' }, 'plan'],
    [{ ...good, plan: '__proto__' }, 'plan'],
    [{ ...good, zone: 'mars' }, 'zone'],
    [{ ...good, first_name: '<script>' }, 'first_name'],
    [{ ...good, last_name: '' }, 'last_name'],
    [{ ...good, email: 'pas-un-email' }, 'email'],
    [{ ...good, email: 'a@b.co\r\nBcc: x@y.z' }, 'email'],
  ];
  for (const [payload, field] of cases) {
    const r = await post(payload);
    assert.equal(r.status, 400, field);
    assert.equal(r.body.field, field);
    assert.equal(seen, null, 'rien ne doit partir vers Moneroo');
  }
  assert.equal((await post('pas du json')).status, 400);
  assert.equal((await post('[1,2]')).status, 400);
  assert.equal((await post('x'.repeat(2500))).status, 413);
});

test('refuse une autre origine, une origine absente et un mauvais type de contenu', async () => {
  assert.equal((await post(good, { origin: 'https://evil.example' })).status, 403);
  assert.equal((await post(good, { origin: '' })).status, 403);
  assert.equal((await post(good, { contentType: 'text/plain' })).status, 415);
  assert.equal(seen, null);
});

test('erreur de Moneroo : réponse générique, sans détail interne', async () => {
  mode = 'down';
  const r = await post(good);
  assert.equal(r.status, 502);
  assert.deepEqual(r.body, { error: 'upstream' });
  assert.ok(!JSON.stringify(r.body).includes('secret'));
});

test('refuse une adresse de paiement qui n’est pas en https', async () => {
  mode = 'http-url';
  assert.equal((await post(good)).status, 502);
});

test('sans clé secrète ou sans adresse du site : erreur de configuration', async () => {
  const r = await handleRequest({ method: 'POST', origin: ORIGIN, contentType: 'application/json', rawBody: JSON.stringify(good), query: new URLSearchParams() }, { SITE_ORIGIN: ORIGIN });
  assert.equal(r.status, 500);
});

test('vérifie un paiement', async () => {
  const r = await handleRequest({ method: 'GET', origin: '', query: new URLSearchParams('paymentId=pay_123') }, env());
  assert.equal(r.status, 200);
  assert.equal(seen.url, '/v1/payments/pay_123/verify');
  assert.equal(r.body.status, 'success');
  assert.equal(r.body.plan, 'Boutique');
  assert.equal(r.body.matches, true);
});

test('refuse un identifiant de paiement douteux', async () => {
  for (const id of ['', 'a', '../../secret', 'x y', 'pay_123/../../x']) {
    const r = await handleRequest({ method: 'GET', origin: '', query: new URLSearchParams({ paymentId: id }) }, env());
    assert.equal(r.status, 400, id);
  }
  assert.equal(seen, null);
});

test('refuse les autres méthodes', async () => {
  const r = await handleRequest({ method: 'DELETE', origin: ORIGIN, query: new URLSearchParams() }, env());
  assert.equal(r.status, 405);
});

test('ping : prêt seulement avec une clé et une adresse https', async () => {
  const ping = e => handleRequest({ method: 'GET', origin: '', query: new URLSearchParams('ping=1') }, e);
  assert.deepEqual(await ping(env()), { status: 200, body: { ready: true } });
  assert.deepEqual((await ping({ SITE_ORIGIN: ORIGIN })).body, { ready: false });
  assert.deepEqual((await ping({ MONEROO_SECRET_KEY: 'sk_test_123' })).body, { ready: false });
  assert.deepEqual((await ping({ MONEROO_SECRET_KEY: 'sk_test_123', SITE_ORIGIN: 'http://animo.example' })).body, { ready: false });
  assert.deepEqual((await ping({})).body, { ready: false });
  assert.equal(seen, null, 'le ping n’appelle jamais Moneroo');
});
