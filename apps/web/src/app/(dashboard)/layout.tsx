import type { ReactNode } from 'react';
import Link from 'next/link';
import { signOut } from '@/lib/auth';
import { serverApiFetch } from '@/lib/server-api';
import { BrandProvider } from '@/components/brand-switcher/BrandProvider';
import { BrandSwitcher } from '@/components/brand-switcher/BrandSwitcher';

const ADMIN_ROLES = ['SUPER_ADMIN', 'MARKETING_HEAD'];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const me = await serverApiFetch<{ orgRole: string | null }>('auth/me');
  const isOrgAdmin = !!me && ADMIN_ROLES.includes(me.orgRole ?? '');

  return (
    <BrandProvider>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid #ddd',
        }}
      >
        <strong>Agrosaf Marketing OS</strong>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/">Dashboard</Link>
          {isOrgAdmin && <Link href="/admin">Admin</Link>}
        </nav>
        <BrandSwitcher />
        <form
          action={async () => {
            'use server';
            await signOut();
          }}
        >
          <button type="submit">Sign out</button>
        </form>
      </header>
      <main style={{ padding: '1.5rem' }}>{children}</main>
    </BrandProvider>
  );
}
