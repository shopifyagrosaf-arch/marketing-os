'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiFetch } from '@/lib/api-client';

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface BrandContextValue {
  brands: Brand[];
  selectedBrandId: string | null;
  selectBrand: (brandId: string) => void;
  loading: boolean;
  error: string | null;
}

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

const STORAGE_KEY = 'agrosaf.selectedBrandId';

/**
 * Loads the brands the signed-in user can access and holds the current
 * selection in memory + localStorage. This is what makes "switch brands
 * without logging out" work: switching just changes which brandId gets
 * sent as the x-brand-id header on the next API call, no re-auth involved.
 */
export function BrandProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiFetch<Brand[]>('brands/mine')
      .then((fetchedBrands) => {
        if (cancelled) return;
        setBrands(fetchedBrands);

        const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        const initial = fetchedBrands.find((b) => b.id === stored)?.id ?? fetchedBrands[0]?.id ?? null;
        setSelectedBrandId(initial);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load brands.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectBrand = (brandId: string) => {
    setSelectedBrandId(brandId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, brandId);
    }
  };

  const value = useMemo(
    () => ({ brands, selectedBrandId, selectBrand, loading, error }),
    [brands, selectedBrandId, loading, error],
  );

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand(): BrandContextValue {
  const ctx = useContext(BrandContext);
  if (!ctx) {
    throw new Error('useBrand must be used within a BrandProvider.');
  }
  return ctx;
}
