import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { serverApiFetch } from '@/lib/server-api';

const ADMIN_ROLES = ['SUPER_ADMIN', 'MARKETING_HEAD'];

/**
 * Server-side gate for the entire /admin section, on top of (not instead
 * of) the API's own OrgRoleGuard on every endpoint underneath it — this
 * only controls whether the admin UI renders at all; the API remains the
 * real authorization boundary regardless of what this layout does.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const me = await serverApiFetch<{ orgRole: string | null }>('auth/me');

  if (!me || !ADMIN_ROLES.includes(me.orgRole ?? '')) {
    redirect('/');
  }

  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <nav style={{ minWidth: 160, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Link href="/admin">Overview</Link>
        <Link href="/admin/users">Users</Link>
        <Link href="/admin/roles">Roles</Link>
        <Link href="/admin/permissions">Permissions</Link>
        <Link href="/admin/brands">Brands</Link>
        <Link href="/admin/organization">Organization</Link>
      </nav>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
