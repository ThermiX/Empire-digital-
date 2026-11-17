// Adaptateur Netlify Functions : /api/checkout
import { handleRequest, JSON_HEADERS } from '../../lib/payments.mjs';

export default async (request) => {
  const rawBody = request.method === 'POST' ? await request.text() : '';
  const out = await handleRequest(
    {
      method: request.method,
      origin: request.headers.get('origin') || '',
      contentType: request.headers.get('content-type') || '',
      rawBody,
      query: new URL(request.url).searchParams,
    },
    process.env,
  );
  return new Response(JSON.stringify(out.body), { status: out.status, headers: JSON_HEADERS });
};

export const config = { path: '/api/checkout' };
