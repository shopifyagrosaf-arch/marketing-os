'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';

interface Organization {
  id: string;
  name: string;
  planTier: string;
}

export default function AdminOrganizationPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch<Organization>('organizations/me').then((o) => {
      setOrg(o);
      setName(o.name);
    });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      const updated = await apiFetch<Organization>('organizations/me', {
        method: 'PATCH',
        body: { name },
      });
      setOrg(updated);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update organization.');
    }
  };

  if (!org) return <p>Loading…</p>;

  return (
    <div>
      <h1>Organization Settings</h1>
      {error && <p role="alert">{error}</p>}
      {saved && <p>Saved.</p>}
      <p>Plan tier: {org.planTier}</p>
      <form onSubmit={save} style={{ display: 'flex', gap: '0.5rem' }}>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
