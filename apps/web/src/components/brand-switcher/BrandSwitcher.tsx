'use client';

import { useBrand } from './BrandProvider';

export function BrandSwitcher() {
  const { brands, selectedBrandId, selectBrand, loading, error } = useBrand();

  if (loading) return <span>Loading brands…</span>;
  if (error) return <span role="alert">{error}</span>;
  if (brands.length === 0) return <span>No brands assigned to your account.</span>;

  return (
    <label>
      Brand:{' '}
      <select
        value={selectedBrandId ?? ''}
        onChange={(e) => selectBrand(e.target.value)}
        aria-label="Switch brand"
      >
        {brands.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>
    </label>
  );
}
