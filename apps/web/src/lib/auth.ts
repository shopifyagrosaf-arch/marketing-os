import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

/**
 * Auth.js handles browser sessions (Google Workspace / Microsoft 365 SSO
 * per SRS v2 assumption A7). It intentionally does NOT talk to the NestJS
 * API directly — Auth.js's default session token is an encrypted JWE, not
 * a plain HS256-signed JWT, so the API can't verify it with a shared
 * secret. Instead, `getApiAccessToken` (lib/api-token.ts) mints a small,
 * short-lived HS256 JWT from this session for server-to-server API calls.
 *
 * The Microsoft provider is configured explicitly (clientId/clientSecret/
 * issuer) rather than relying on Auth.js's automatic env var inference —
 * that convention expects `AUTH_MICROSOFT_ENTRA_ID_ID` /
 * `AUTH_MICROSOFT_ENTRA_ID_SECRET` / `AUTH_MICROSOFT_ENTRA_ID_ISSUER` (the
 * provider's `id` is itself "microsoft-entra-id", hence the doubled "ID"),
 * which is easy to get wrong silently. Explicit config keeps the env var
 * names in .env.example the actual source of truth.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google,
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_SECRET,
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_TENANT_ID}/v2.0`,
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
  },
});
