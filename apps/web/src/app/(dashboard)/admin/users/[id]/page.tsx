'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Alert, Button, EmptyState, Select, Table } from '@agrosaf/ui';
import { apiFetch } from '@/lib/api-client';
import { PageHeader } from '@/components/shell/PageHeader';

interface BrandAccessGrant {
  id: string;
  brand: { id: string; name: string };
  role: { id: string; name: string };
}
interface Brand {
  id: string;
  name: string;
}
interface Role {
  id: string;
  name: string;
}

export default function UserBrandAccessPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;

  const [grants, setGrants] = useState<BrandAccessGrant[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [brandId, setBrandId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    apiFetch<BrandAccessGrant[]>(`users/${userId}/brand-access`).then(setGrants);
  };

  useEffect(() => {
    load();
    apiFetch<Brand[]>('brands').then(setBrands);
    apiFetch<Role[]>('roles').then(setRoles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const grant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch(`users/${userId}/brand-access`, { method: 'POST', body: { brandId, roleId } });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to grant access.');
    }
  };

  const revoke = async (brandAccessId: string) => {
    await apiFetch(`users/${userId}/brand-access/${brandAccessId}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <PageHeader title="Brand Access" />
      {error && (
        <Alert tone="error" style={{ marginBottom: '1rem' }}>
          {error}
        </Alert>
      )}

      {grants.length === 0 ? (
        <EmptyState title="No brand access granted yet." />
      ) : (
        <Table aria-label="Brand access grants" style={{ marginBottom: '1.5rem' }}>
          <thead>
            <tr>
              <th>Brand</th>
              <th>Role</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {grants.map((g) => (
              <tr key={g.id}>
                <td>{g.brand.name}</td>
                <td>{g.role.name}</td>
                <td>
                  <Button variant="danger" size="sm" onClick={() => revoke(g.id)}>
                    Revoke
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <form onSubmit={grant} style={{ display: 'flex', gap: '0.5rem' }}>
        <Select
          aria-label="Select brand"
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          required
        >
          <option value="">Select brand</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
        <Select aria-label="Select role" value={roleId} onChange={(e) => setRoleId(e.target.value)} required>
          <option value="">Select role</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
        <Button type="submit">Grant access</Button>
      </form>
    </div>
  );
}
