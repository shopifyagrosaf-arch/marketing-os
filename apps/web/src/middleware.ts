import { NextResponse, type NextRequest } from 'next/server';

/**
 * UI-preview build: gates page navigation on the mock-session cookie
 * (`mock_user_id`, set by the mock login page — see src/mock/store.tsx)
 * instead of a real Auth.js session. This is a placeholder, not a security
 * boundary — there is no backend behind this build yet (see docs/SPRINT_UI_PREVIEW.md).
 */
export function middleware(request: NextRequest) {
  const isLoggedIn = !!request.cookies.get('mock_user_id')?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  if (!isLoggedIn && !isLoginPage) {
    const loginUrl = new URL('/login', request.nextUrl);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
