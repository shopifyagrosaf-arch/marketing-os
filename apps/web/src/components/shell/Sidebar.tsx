'use client';

import {
  BarChart3,
  Building2,
  CalendarDays,
  CheckSquare,
  Columns3,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  Settings,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/components/ui/cn';
import { ROLE_ROUTES } from '@/lib/permissions';
import { useMockStore } from '@/mock/store';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/content-requests', label: 'Content Requests', icon: FileText },
  { href: '/tasks', label: 'Task Board', icon: Columns3 },
  { href: '/calendar', label: 'Content Calendar', icon: CalendarDays },
  { href: '/assets', label: 'Asset Library', icon: ImageIcon },
  { href: '/approvals', label: 'Approvals', icon: CheckSquare },
  { href: '/performance', label: 'Performance', icon: BarChart3 },
];

const ADMIN_NAV = [
  { href: '/users', label: 'User Management', icon: Users },
  { href: '/brands', label: 'Brands', icon: Building2 },
];

const SETTINGS_NAV = { href: '/settings', label: 'Settings', icon: Settings };

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { currentUser } = useMockStore();
  const allowed = currentUser ? new Set(ROLE_ROUTES[currentUser.role]) : null;

  const visibleNav = NAV.filter((item) => !allowed || allowed.has(item.href));
  const visibleAdminNav = ADMIN_NAV.filter((item) => !allowed || allowed.has(item.href));

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const linkClass = (href: string) =>
    cn(
      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive(href)
        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
        : 'text-ink-secondary hover:bg-surface-page dark:text-ink-secondary-dark dark:hover:bg-white/5',
    );

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-line-hairline bg-surface transition-transform dark:border-line-hairline-dark dark:bg-surface-dark lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
              A
            </span>
            <span className="text-sm font-semibold text-ink-primary dark:text-ink-primary-dark">
              Agrosaf Marketing
            </span>
          </div>
          <button className="rounded-md p-1 text-ink-muted lg:hidden" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {visibleNav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={linkClass(href)} onClick={onClose}>
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}

          {visibleAdminNav.length > 0 && (
            <>
              <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Admin</p>
              {visibleAdminNav.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className={linkClass(href)} onClick={onClose}>
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </>
          )}

          <Link href={SETTINGS_NAV.href} className={linkClass(SETTINGS_NAV.href)} onClick={onClose}>
            <SETTINGS_NAV.icon className="h-4 w-4" />
            {SETTINGS_NAV.label}
          </Link>
        </nav>

        <div className="border-t border-line-hairline p-3 text-xs text-ink-muted dark:border-line-hairline-dark">
          Mock data preview &middot; v0.3.0-ui-preview
        </div>
      </aside>
    </>
  );
}
