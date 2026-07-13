'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, FormField, Table, TextInput } from '@agrosaf/ui';
import { apiFetch } from '@/lib/api-client';
import { PageHeader } from '@/components/shell/PageHeader';

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
      <PageHeader title="Brands" />
      {error && (
        <Alert tone="error" style={{ marginBottom: '1rem' }}>
          {error}
        </Alert>
      )}

      <Table aria-label="Brands" style={{ marginBottom: '1.5rem' }}>
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
                  <TextInput
                    aria-label={`Edit name for ${brand.name}`}
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                  />
                ) : (
                  brand.name
                )}
              </td>
              <td>{brand.slug}</td>
              <td>{brand.localeDefault}</td>
              <td>
                {editingId === brand.id ? (
                  <Button size="sm" onClick={() => saveEdit(brand.id)}>
                    Save
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => startEdit(brand)}>
                    Edit
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <form onSubmit={createBrand} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
        <FormField label="Brand name" htmlFor="brand-name">
          <TextInput
            id="brand-name"
            type="text"
            placeholder="Brand name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Slug" htmlFor="brand-slug">
          <TextInput
            id="brand-slug"
            type="text"
            placeholder="brand-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </FormField>
        <Button type="submit">Create brand</Button>
      </form>
    </div>
  );
}
