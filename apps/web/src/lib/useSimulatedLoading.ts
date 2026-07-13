'use client';

import { useEffect, useState } from 'react';

/**
 * The mock store resolves synchronously, so pages never show a loading
 * state — this fakes a brief network-like delay on mount so loading/empty
 * states are real, reviewable UI rather than invisible.
 */
export function useSimulatedLoading(delayMs = 500) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delayMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return loading;
}
