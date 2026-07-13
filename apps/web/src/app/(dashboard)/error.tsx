'use client';

import { useEffect } from 'react';
import { Alert, Button } from '@agrosaf/ui';

/**
 * Next.js error boundary for everything under (dashboard) — catches
 * render/data errors (e.g. a failed apiFetch that a page didn't handle
 * itself) instead of showing Next's default unstyled crash screen.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <Alert tone="error" style={{ flexDirection: 'column', gap: '0.75rem' }}>
      <div>
        <strong>Something went wrong.</strong>
        <p style={{ margin: '0.25rem 0 0' }}>{error.message}</p>
      </div>
      <Button variant="secondary" size="sm" onClick={reset} style={{ alignSelf: 'flex-start' }}>
        Try again
      </Button>
    </Alert>
  );
}
