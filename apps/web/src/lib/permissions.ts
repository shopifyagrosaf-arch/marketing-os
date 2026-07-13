import type { Role } from '@/mock/types';

/**
 * Every route a role may reach, keyed by the same hrefs used in Sidebar's
 * nav config. '/' and '/settings' are available to everyone. Enforced both
 * for what the Sidebar renders and (in AppShell) for direct navigation, not
 * just hidden-but-reachable links.
 */
export const ROLE_ROUTES: Record<Role, string[]> = {
  Manager: ['/', '/content-requests', '/tasks', '/calendar', '/assets', '/approvals', '/performance', '/users', '/brands', '/settings'],
  Management: ['/', '/content-requests', '/tasks', '/calendar', '/assets', '/approvals', '/performance', '/users', '/brands', '/settings'],
  'Marketing Executive': ['/', '/content-requests', '/tasks', '/calendar', '/performance', '/settings'],
  'Graphic Designer': ['/', '/tasks', '/assets', '/settings'],
  'Video Editor': ['/', '/tasks', '/assets', '/settings'],
  'Social Media Executive': ['/', '/content-requests', '/tasks', '/calendar', '/assets', '/settings'],
  'Performance Marketing Executive': ['/', '/content-requests', '/performance', '/settings'],
  'Content Writer': ['/', '/content-requests', '/tasks', '/settings'],
};

/** Where each role lands right after login. */
export const ROLE_HOME: Record<Role, string> = {
  Manager: '/',
  Management: '/',
  'Marketing Executive': '/content-requests',
  'Graphic Designer': '/assets',
  'Video Editor': '/assets',
  'Social Media Executive': '/calendar',
  'Performance Marketing Executive': '/performance',
  'Content Writer': '/content-requests',
};

export function canAccessRoute(role: Role, pathname: string): boolean {
  const allowed = ROLE_ROUTES[role];
  return allowed.some((route) => (route === '/' ? pathname === '/' : pathname.startsWith(route)));
}
