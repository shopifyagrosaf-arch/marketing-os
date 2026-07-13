'use client';

import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { useMockStore } from '@/mock/store';

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { currentUser, logout, theme, toggleTheme } = useMockStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between border-b border-line-hairline bg-surface/80 px-4 backdrop-blur dark:border-line-hairline-dark dark:bg-surface-dark/80">
      <button
        className="rounded-md p-1.5 text-ink-muted hover:bg-surface-page dark:hover:bg-white/5 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden text-sm text-ink-muted lg:block" />

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="rounded-md p-1.5 text-ink-muted hover:bg-surface-page dark:hover:bg-white/5"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-surface-page dark:hover:bg-white/5"
            >
              <Avatar name={currentUser.name} color={currentUser.color} />
              <span className="hidden text-sm font-medium text-ink-primary dark:text-ink-primary-dark sm:inline">
                {currentUser.name}
              </span>
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-xl border border-line-hairline bg-surface p-1 shadow-popover dark:border-line-hairline-dark dark:bg-surface-dark"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <div className="px-2 py-1.5 text-xs text-ink-muted">{currentUser.role}</div>
                <button
                  onClick={() => {
                    logout();
                    router.push('/login');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink-secondary hover:bg-surface-page dark:text-ink-secondary-dark dark:hover:bg-white/5"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
