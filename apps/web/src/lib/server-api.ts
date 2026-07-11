import 'server-only';
import { getApiAccessToken } from './api-token';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/**
 * Server Component / layout equivalent of api-client.ts's `apiFetch` —
 * calls the NestJS API directly (not through the browser-facing
 * /api/proxy route, which would be a needless self-hop for server-side
 * code that already has direct access to `getApiAccessToken`).
 *
 * Returns `null` on any failure (unauthenticated, forbidden, not found)
 * rather than throwing — callers that need to distinguish those cases
 * should use `apiFetch` client-side instead; this is meant for simple
 * "am I allowed here at all" layout checks.
 */
export async function serverApiFetch<T>(path: string): Promise<T | null> {
  const token = await getApiAccessToken();
  if (!token) {
    return null;
  }

  const response = await fetch(`${API_URL}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<T>;
}
