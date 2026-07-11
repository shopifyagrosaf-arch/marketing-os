import { NextRequest, NextResponse } from 'next/server';
import { getApiAccessToken } from '@/lib/api-token';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/**
 * Same-origin proxy from the browser to the NestJS API. Exists so the
 * short-lived API JWT (see lib/api-token.ts) is minted server-side and
 * never sent to the client — the browser only ever holds the Auth.js
 * session cookie, not an API-bearer token.
 *
 * The `x-brand-id` header set by the client's brand switcher (see
 * components/brand-switcher) is forwarded through unchanged; the NestJS
 * BrandAccessGuard is the actual authority on whether the user may use it.
 */
async function proxy(request: NextRequest, path: string[]) {
  const token = await getApiAccessToken();
  if (!token) {
    return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 });
  }

  const targetUrl = `${API_URL}/${path.join('/')}${request.nextUrl.search}`;
  const brandId = request.headers.get('x-brand-id');

  const forwardHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  if (brandId) {
    forwardHeaders['x-brand-id'] = brandId;
  }

  const hasBody = !['GET', 'HEAD'].includes(request.method);
  const upstreamResponse = await fetch(targetUrl, {
    method: request.method,
    headers: forwardHeaders,
    body: hasBody ? await request.text() : undefined,
    cache: 'no-store',
  });

  const responseBody = await upstreamResponse.text();
  return new NextResponse(responseBody, {
    status: upstreamResponse.status,
    headers: { 'Content-Type': upstreamResponse.headers.get('Content-Type') ?? 'application/json' },
  });
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, params.path);
}
export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, params.path);
}
export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, params.path);
}
export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, params.path);
}
