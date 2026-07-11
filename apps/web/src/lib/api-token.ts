import 'server-only';
import { SignJWT } from 'jose';
import { auth } from './auth';

/**
 * Mints a short-lived HS256 JWT from the current Auth.js session, for the
 * NestJS API's passport-jwt strategy to verify (shared AUTH_SECRET). Never
 * exposed to the browser — only called from Route Handlers/Server Components
 * (enforced by the `server-only` import).
 */
export async function getApiAccessToken(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }

  const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
  return new SignJWT({
    email: session.user.email,
    name: session.user.name ?? session.user.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(session.user.email)
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(secret);
}
