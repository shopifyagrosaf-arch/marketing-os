'use client';

import { useEffect } from 'react';

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
    <div role="alert" style={{ padding: '2rem' }}>
      <h2>Something went wrong.</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
