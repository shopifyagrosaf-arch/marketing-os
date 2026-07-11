'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';

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

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersPage | null>(null);
  const [search, setSearch] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    apiFetch<UsersPage>(`users${query}`).then(setData).catch((e) => setError(e.message));
  };

  useEffect(load, [search]);

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
      <h1>Users</h1>
      {error && <p role="alert">{error}</p>}

      <form onSubmit={createUser} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="email"
          placeholder="email@agrosaf.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">Pre-provision user</button>
      </form>

      <input
        type="search"
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: '1rem' }}
      />

      <table>
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
              <td>{user.status}</td>
              <td>
                <button onClick={() => toggleStatus(user)}>
                  {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data && <p>{data.total} total user(s)</p>}
    </div>
  );
}
