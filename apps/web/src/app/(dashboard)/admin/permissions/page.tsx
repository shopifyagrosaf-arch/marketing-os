'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';

interface Permission {
  id: string;
  action: string;
  description: string | null;
}

export default function AdminPermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [action, setAction] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    apiFetch<Permission[]>('permissions').then(setPermissions);
  };

  useEffect(load, []);

  const createPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch('permissions', { method: 'POST', body: { action, description: description || undefined } });
      setAction('');
      setDescription('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create permission.');
    }
  };

  return (
    <div>
      <h1>Permissions</h1>
      {error && <p role="alert">{error}</p>}

      <table style={{ marginBottom: '1rem' }}>
        <thead>
          <tr>
            <th>Action</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((p) => (
            <tr key={p.id}>
              <td>{p.action}</td>
              <td>{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={createPermission} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="content:approve"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Create permission</button>
      </form>
    </div>
  );
}
