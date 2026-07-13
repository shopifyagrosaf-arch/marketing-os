'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  FormField,
  Pagination,
  Table,
  TextInput,
} from '@agrosaf/ui';
import { apiFetch } from '@/lib/api-client';
import { PageHeader } from '@/components/shell/PageHeader';

interface User {
  id: string;
  email: string;
  name: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
}

interface UsersPage {
  items: User[];
  total: number;
  page: number;
  limit: number;
}

const STATUS_TONE: Record<User['status'], 'success' | 'warning' | 'neutral'> = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  EXPIRED: 'neutral',
};

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersPage | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set('search', search);
    apiFetch<UsersPage>(`users?${params.toString()}`)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load users.'));
  };

  useEffect(load, [search, page]);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch('users', { method: 'POST', body: { email, name } });
      setEmail('');
      setName('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create user.');
    }
  };

  const toggleStatus = async (user: User) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await apiFetch(`users/${user.id}/status`, { method: 'PATCH', body: { status: nextStatus } });
    load();
  };

  return (
    <div>
      <PageHeader title="Users" description="Pre-provision users ahead of first SSO login." />
      {error && (
        <Alert tone="error" style={{ marginBottom: '1rem' }}>
          {error}
        </Alert>
      )}

      <form
        onSubmit={createUser}
        style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}
      >
        <FormField label="Email" htmlFor="new-user-email">
          <TextInput
            id="new-user-email"
            type="email"
            placeholder="email@agrosaf.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Full name" htmlFor="new-user-name">
          <TextInput
            id="new-user-name"
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </FormField>
        <Button type="submit">Pre-provision user</Button>
      </form>

      <FormField label="Search" htmlFor="user-search" hint="By name or email">
        <TextInput
          id="user-search"
          type="search"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </FormField>

      {data && data.items.length === 0 ? (
        <EmptyState title="No users match your search." />
      ) : (
        <Table aria-label="Users" style={{ marginTop: '1rem' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data?.items.map((user) => (
              <tr key={user.id}>
                <td>
                  <Link href={`/admin/users/${user.id}`}>{user.name}</Link>
                </td>
                <td>{user.email}</td>
                <td>
                  <Badge tone={STATUS_TONE[user.status]}>{user.status}</Badge>
                </td>
                <td>
                  <Button variant="secondary" size="sm" onClick={() => toggleStatus(user)}>
                    {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {data && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
          }}
        >
          <span>{data.total} total user(s)</span>
          <Pagination page={data.page} limit={data.limit} total={data.total} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
