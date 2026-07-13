'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { useBrand } from '@/components/brand-switcher/BrandProvider';
import { PageHeader } from '@/components/shell/PageHeader';

interface Me {
  id: string;
  email: string;
  name: string;
}

/**
 * Sprint 1 placeholder dashboard — proves the brand-switching plumbing
 * end-to-end (auth/me is org-scoped only; brands/:id is brand-scoped and
 * requires the x-brand-id header the switcher sets). Real dashboard widgets
 * (pending tasks, approvals, KPIs) land in later sprints per the roadmap.
 */
export default function DashboardPage() {
  const { selectedBrandId, brands } = useBrand();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    apiFetch<Me>('auth/me').then(setMe).catch(() => setMe(null));
  }, []);

  const currentBrand = brands.find((b) => b.id === selectedBrandId);

  return (
    <div>
      <PageHeader title="Dashboard" />
      {me && (
        <p>
          Signed in as {me.name} ({me.email})
        </p>
      )}
      {currentBrand ? <p>Current brand: {currentBrand.name}</p> : <p>Select a brand to continue.</p>}
    </div>
  );
}
