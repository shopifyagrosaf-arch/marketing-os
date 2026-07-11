'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';

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
      <h1>Brand Access</h1>
      {error && <p role="alert">{error}</p>}

      <table style={{ marginBottom: '1rem' }}>
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
                <button onClick={() => revoke(g.id)}>Revoke</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={grant} style={{ display: 'flex', gap: '0.5rem' }}>
        <select value={brandId} onChange={(e) => setBrandId(e.target.value)} required>
          <option value="">Select brand</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select value={roleId} onChange={(e) => setRoleId(e.target.value)} required>
          <option value="">Select role</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <button type="submit">Grant access</button>
      </form>
    </div>
  );
}
