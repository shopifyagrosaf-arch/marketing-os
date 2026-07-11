import { auth } from '@/lib/auth';

/**
 * Redirects unauthenticated visitors to /login for every route except the
 * login page and Next.js internals/API routes (matcher below). The proxy
 * route (api/proxy/**) additionally re-checks auth server-side per request
 * (lib/api-token.ts) — this middleware alone is not the security boundary
 * for API calls, only for page navigation.
 */
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname.startsWith('/login');

  if (!isLoggedIn && !isLoginPage) {
    const loginUrl = new URL('/login', req.nextUrl);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
