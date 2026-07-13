import Link from 'next/link';
import { Button } from '@agrosaf/ui';
import { signOut } from '@/lib/auth';
import { BrandSwitcher } from '@/components/brand-switcher/BrandSwitcher';
import styles from './AppHeader.module.css';

export interface AppHeaderProps {
  isOrgAdmin: boolean;
}

/**
 * Top-level app bar shown on every authenticated page. Replaces the inline
 * `style={{...}}` header built in Sprint 1/2 — same structure (brand mark,
 * primary nav, brand switcher, sign out), now sourced from the design system.
 */
export function AppHeader({ isOrgAdmin }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <span className={styles.brand}>Agrosaf Marketing OS</span>
      <nav className={styles.nav}>
        <Link href="/">Dashboard</Link>
        <Link href="/content-requests">Content Requests</Link>
        {isOrgAdmin && <Link href="/admin">Admin</Link>}
      </nav>
      <div className={styles.actions}>
        <BrandSwitcher />
        <form
          action={async () => {
            'use server';
            await signOut();
          }}
        >
          <Button type="submit" variant="secondary" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
