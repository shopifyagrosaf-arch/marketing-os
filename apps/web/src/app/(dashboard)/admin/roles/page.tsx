'use client';

import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Checkbox, FormField, Table, TextInput } from '@agrosaf/ui';
import { apiFetch } from '@/lib/api-client';
import { PageHeader } from '@/components/shell/PageHeader';

interface Role {
  id: string;
  name: string;
  isCustom: boolean;
  isOrgWide: boolean;
}
interface Permission {
  id: string;
  action: string;
}

/**
 * Built-in roles (isCustom: false) render without edit/delete controls —
 * the API rejects mutating them anyway (RolesService#mustBeCustom), but
 * hiding the controls avoids a round-trip just to show an error for an
 * action that can never succeed.
 */
export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [name, setName] = useState('');
  const [isOrgWide, setIsOrgWide] = useState(false);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    apiFetch<Role[]>('roles').then(setRoles);
  };

  useEffect(() => {
    load();
    apiFetch<Permission[]>('permissions').then(setPermissions);
  }, []);

  const toggleAction = (action: string) => {
    setSelectedActions((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action],
    );
  };

  const createRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch('roles', {
        method: 'POST',
        body: { name, isOrgWide, permissionActions: selectedActions },
      });
      setName('');
      setIsOrgWide(false);
      setSelectedActions([]);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create role.');
    }
  };

  const removeRole = async (id: string) => {
    setError(null);
    try {
      await apiFetch(`roles/${id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete role.');
    }
  };

  return (
    <div>
      <PageHeader title="Roles" />
      {error && (
        <Alert tone="error" style={{ marginBottom: '1rem' }}>
          {error}
        </Alert>
      )}

      <Table aria-label="Roles" style={{ marginBottom: '1.5rem' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Org-wide</th>
            <th>Custom</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td>{role.name}</td>
              <td>
                <Badge tone={role.isOrgWide ? 'info' : 'neutral'}>
                  {role.isOrgWide ? 'Yes' : 'No'}
                </Badge>
              </td>
              <td>
                <Badge tone={role.isCustom ? 'success' : 'neutral'}>
                  {role.isCustom ? 'Yes' : 'Built-in'}
                </Badge>
              </td>
              <td>
                {role.isCustom && (
                  <Button variant="danger" size="sm" onClick={() => removeRole(role.id)}>
                    Delete
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <form onSubmit={createRole} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2>Create custom role</h2>
        <FormField label="Role name" htmlFor="role-name" hint="e.g. REGIONAL_BRAND_LEAD">
          <TextInput
            id="role-name"
            type="text"
            placeholder="REGIONAL_BRAND_LEAD"
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            required
          />
        </FormField>
        <Checkbox
          label="Org-wide (not brand-scoped)"
          checked={isOrgWide}
          onChange={(e) => setIsOrgWide(e.target.checked)}
        />

        <fieldset style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
          <legend>Permissions</legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {permissions.map((p) => (
              <Checkbox
                key={p.id}
                label={p.action}
                checked={selectedActions.includes(p.action)}
                onChange={() => toggleAction(p.action)}
              />
            ))}
          </div>
        </fieldset>

        <Button type="submit" style={{ alignSelf: 'flex-start' }}>
          Create role
        </Button>
      </form>
    </div>
  );
}
