import type { ReactNode } from 'react';
import { Container } from '@agrosaf/ui';
import { serverApiFetch } from '@/lib/server-api';
import { BrandProvider } from '@/components/brand-switcher/BrandProvider';
import { AppHeader } from '@/components/shell/AppHeader';

const ADMIN_ROLES = ['SUPER_ADMIN', 'MARKETING_HEAD'];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const me = await serverApiFetch<{ orgRole: string | null }>('auth/me');
  const isOrgAdmin = !!me && ADMIN_ROLES.includes(me.orgRole ?? '');

  return (
    <BrandProvider>
      <AppHeader isOrgAdmin={isOrgAdmin} />
      <Container>{children}</Container>
    </BrandProvider>
  );
}
