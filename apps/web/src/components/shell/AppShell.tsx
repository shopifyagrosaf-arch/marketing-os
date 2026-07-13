'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { canAccessRoute, ROLE_HOME } from '@/lib/permissions';
import { useMockStore } from '@/mock/store';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell({ children }: { children: ReactNode }) {
  const { currentUser } = useMockStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setChecked(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (checked && !currentUser) {
      router.replace('/login');
    }
  }, [checked, currentUser, router]);

  useEffect(() => {
    if (currentUser && !canAccessRoute(currentUser.role, pathname)) {
      router.replace(ROLE_HOME[currentUser.role]);
    }
  }, [currentUser, pathname, router]);

  if (!currentUser || !canAccessRoute(currentUser.role, pathname)) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-ink-muted">Loading…</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
