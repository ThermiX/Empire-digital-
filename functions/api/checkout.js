// Adaptateur Cloudflare Pages Functions : /api/checkout
import { handleRequest, JSON_HEADERS } from '../../lib/payments.mjs';

export async function onRequest({ request, env }) {
  const rawBody = request.method === 'POST' ? await request.text() : '';
  const out = await handleRequest(
    {
      method: request.method,
      origin: request.headers.get('origin') || '',
      contentType: request.headers.get('content-type') || '',
      rawBody,
      query: new URL(request.url).searchParams,
    },
    env,
  );
  return new Response(JSON.stringify(out.body), { status: out.status, headers: JSON_HEADERS });
}
