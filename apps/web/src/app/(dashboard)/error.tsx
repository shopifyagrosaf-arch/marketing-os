'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-status-critical/30 bg-status-critical/5 p-4">
      <div>
        <p className="text-sm font-semibold text-status-critical">Something went wrong.</p>
        <p className="mt-1 text-sm text-ink-secondary dark:text-ink-secondary-dark">{error.message}</p>
      </div>
      <Button variant="secondary" size="sm" onClick={reset} className="self-start">
        Try again
      </Button>
    </div>
  );
}
