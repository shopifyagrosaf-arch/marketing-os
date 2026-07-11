'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';

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
      <h1>Roles</h1>
      {error && <p role="alert">{error}</p>}

      <table style={{ marginBottom: '1rem' }}>
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
              <td>{role.isOrgWide ? 'Yes' : 'No'}</td>
              <td>{role.isCustom ? 'Yes' : 'Built-in'}</td>
              <td>{role.isCustom && <button onClick={() => removeRole(role.id)}>Delete</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={createRole}>
        <h2>Create custom role</h2>
        <input
          type="text"
          placeholder="REGIONAL_BRAND_LEAD"
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase())}
          required
        />
        <label>
          <input
            type="checkbox"
            checked={isOrgWide}
            onChange={(e) => setIsOrgWide(e.target.checked)}
          />
          Org-wide (not brand-scoped)
        </label>

        <fieldset>
          <legend>Permissions</legend>
          {permissions.map((p) => (
            <label key={p.id} style={{ display: 'block' }}>
              <input
                type="checkbox"
                checked={selectedActions.includes(p.action)}
                onChange={() => toggleAction(p.action)}
              />
              {p.action}
            </label>
          ))}
        </fieldset>

        <button type="submit">Create role</button>
      </form>
    </div>
  );
}
