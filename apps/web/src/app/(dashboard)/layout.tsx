import type { ReactNode } from 'react';
import { signOut } from '@/lib/auth';
import { BrandProvider } from '@/components/brand-switcher/BrandProvider';
import { BrandSwitcher } from '@/components/brand-switcher/BrandSwitcher';

export default function DashboardLayout({ children }: { children: ReactNode }) {
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
