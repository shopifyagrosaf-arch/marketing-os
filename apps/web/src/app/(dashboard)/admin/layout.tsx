import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { serverApiFetch } from '@/lib/server-api';
import { AdminSidebar } from '@/components/shell/AdminSidebar';

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

  return <AdminSidebar>{children}</AdminSidebar>;
}
