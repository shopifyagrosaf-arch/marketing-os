'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, FormField, Table, TextInput } from '@agrosaf/ui';
import { apiFetch } from '@/lib/api-client';
import { PageHeader } from '@/components/shell/PageHeader';

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
      await apiFetch('permissions', {
        method: 'POST',
        body: { action, description: description || undefined },
      });
      setAction('');
      setDescription('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create permission.');
    }
  };

  return (
    <div>
      <PageHeader title="Permissions" />
      {error && (
        <Alert tone="error" style={{ marginBottom: '1rem' }}>
          {error}
        </Alert>
      )}

      <Table aria-label="Permissions" style={{ marginBottom: '1.5rem' }}>
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
      </Table>

      <form onSubmit={createPermission} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
        <FormField label="Action" htmlFor="permission-action">
          <TextInput
            id="permission-action"
            type="text"
            placeholder="content:approve"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Description" htmlFor="permission-description">
          <TextInput
            id="permission-description"
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormField>
        <Button type="submit">Create permission</Button>
      </form>
    </div>
  );
}
