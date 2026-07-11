'use client';

/**
 * Client-side fetch wrapper. Always calls the same-origin /api/proxy route
 * (never the NestJS API directly) so the API bearer token stays server-side
 * — see app/api/proxy/[...path]/route.ts.
 */
export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; brandId?: string } = {},
): Promise<T> {
  const { method = 'GET', body, brandId } = options;

  const headers: Record<string, string> = {};
  if (brandId) {
    headers['x-brand-id'] = brandId;
  }

  const response = await fetch(`/api/proxy/${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorBody.message ?? `Request to ${path} failed (${response.status}).`);
  }

  return response.json() as Promise<T>;
}
