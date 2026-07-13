'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Card, FormField, Spinner, TextInput } from '@agrosaf/ui';
import { apiFetch } from '@/lib/api-client';
import { PageHeader } from '@/components/shell/PageHeader';

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

  if (!org) return <Spinner label="Loading organization…" />;

  return (
    <div>
      <PageHeader title="Organization Settings" />
      {error && (
        <Alert tone="error" style={{ marginBottom: '1rem' }}>
          {error}
        </Alert>
      )}
      {saved && (
        <Alert tone="success" style={{ marginBottom: '1rem' }}>
          Saved.
        </Alert>
      )}

      <Card style={{ maxWidth: 480 }}>
        <p>
          <strong>Plan tier:</strong> {org.planTier}
        </p>
        <form onSubmit={save} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <FormField label="Organization name" htmlFor="org-name">
            <TextInput id="org-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </FormField>
          <Button type="submit">Save</Button>
        </form>
      </Card>
    </div>
  );
}
