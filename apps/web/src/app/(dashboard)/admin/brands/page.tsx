'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';

interface Brand {
  id: string;
  name: string;
  slug: string;
  localeDefault: string;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    apiFetch<Brand[]>('brands').then(setBrands);
  };

  useEffect(load, []);

  const createBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch('brands', { method: 'POST', body: { name, slug } });
      setName('');
      setSlug('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create brand.');
    }
  };

  const startEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setEditingName(brand.name);
  };

  const saveEdit = async (id: string) => {
    setError(null);
    try {
      await apiFetch(`brands/${id}`, { method: 'PATCH', body: { name: editingName } });
      setEditingId(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update brand.');
    }
  };

  return (
    <div>
      <h1>Brands</h1>
      {error && <p role="alert">{error}</p>}

      <table style={{ marginBottom: '1rem' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Locale</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr key={brand.id}>
              <td>
                {editingId === brand.id ? (
                  <input value={editingName} onChange={(e) => setEditingName(e.target.value)} />
                ) : (
                  brand.name
                )}
              </td>
              <td>{brand.slug}</td>
              <td>{brand.localeDefault}</td>
              <td>
                {editingId === brand.id ? (
                  <button onClick={() => saveEdit(brand.id)}>Save</button>
                ) : (
                  <button onClick={() => startEdit(brand)}>Edit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={createBrand} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Brand name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="brand-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />
        <button type="submit">Create brand</button>
      </form>
    </div>
  );
}
