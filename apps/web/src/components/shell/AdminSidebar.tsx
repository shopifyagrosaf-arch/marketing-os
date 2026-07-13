import type { ReactNode } from 'react';
import Link from 'next/link';
import styles from './AdminSidebar.module.css';

const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/roles', label: 'Roles' },
  { href: '/admin/permissions', label: 'Permissions' },
  { href: '/admin/brands', label: 'Brands' },
  { href: '/admin/organization', label: 'Organization' },
] as const;

/** Section nav for `/admin/*`, replacing Sprint 2's inline-styled nav column. */
export function AdminSidebar({ children }: { children: ReactNode }) {
  return (
    <div className={styles.layout}>
      <nav className={styles.sidebar} aria-label="Admin sections">
        {ADMIN_NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
