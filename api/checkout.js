// Adaptateur Vercel : /api/checkout
import { handleRequest, JSON_HEADERS } from '../lib/payments.mjs';

export default async function handler(req, res) {
  let rawBody = '';
  if (req.method === 'POST') {
    rawBody = typeof req.body === 'string' ? req.body : (req.body ? JSON.stringify(req.body) : '');
  }
  const query = new URL(req.url, 'http://localhost').searchParams;
  const out = await handleRequest(
    { method: req.method, origin: req.headers.origin || '', contentType: req.headers['content-type'] || '', rawBody, query },
    process.env,
  );
  Object.entries(JSON_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  res.status(out.status).send(JSON.stringify(out.body));
}
