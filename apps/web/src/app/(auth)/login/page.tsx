'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { useMockStore } from '@/mock/store';

/**
 * Mock sign-in for the UI-preview build: pick a seeded user, no password/SSO
 * (see docs/SPRINT_UI_PREVIEW.md — real auth is deferred to the backend-
 * integration phase). Sets the `mock_user_id` cookie middleware.ts checks.
 */
export default function LoginPage() {
  const { data, currentUser, login } = useMockStore();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) router.replace('/');
  }, [currentUser, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-page p-4 dark:bg-surface-dark-page">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-5 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
            A
          </span>
          <div>
            <p className="text-sm font-semibold text-ink-primary dark:text-ink-primary-dark">Agrosaf Marketing OS</p>
            <p className="text-xs text-ink-muted">Sign in to continue</p>
          </div>
        </div>

        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">Sign in as</p>
        <div className="space-y-1.5">
          {data.users.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                login(user.id);
                router.push('/');
              }}
              className="flex w-full items-center gap-3 rounded-lg border border-line-hairline p-2.5 text-left transition-colors hover:border-brand-500 hover:bg-brand-500/5 dark:border-line-hairline-dark"
            >
              <Avatar name={user.name} color={user.color} size={32} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink-primary dark:text-ink-primary-dark">
                  {user.name}
                </span>
                <span className="block truncate text-xs text-ink-muted">{user.role}</span>
              </span>
            </button>
          ))}
        </div>
      </Card>
    </main>
  );
}
