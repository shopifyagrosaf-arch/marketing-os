'use client';

import { Alert, Select, Spinner } from '@agrosaf/ui';
import { useBrand } from './BrandProvider';

export function BrandSwitcher() {
  const { brands, selectedBrandId, selectBrand, loading, error } = useBrand();

  if (loading) return <Spinner label="Loading brands…" />;
  if (error) return <Alert tone="error">{error}</Alert>;
  if (brands.length === 0) return <span>No brands assigned to your account.</span>;

  return (
    <label>
      <span aria-hidden="true">Brand: </span>
      <Select
        value={selectedBrandId ?? ''}
        onChange={(e) => selectBrand(e.target.value)}
        aria-label="Switch brand"
      >
        {brands.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </Select>
    </label>
  );
}
