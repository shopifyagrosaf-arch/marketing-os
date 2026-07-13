'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table, Td, Th, Thead, Tr } from '@/components/ui/Table';
import { PageHeaderBar } from '@/components/shell/PageHeaderBar';
import type { Role } from '@/mock/types';
import { useMockStore } from '@/mock/store';

const ROLES: Role[] = ['Admin', 'Marketing Head', 'Brand Manager', 'Content Writer', 'Viewer'];
const PALETTE = ['#2a78d6', '#1baf7a', '#eda100', '#4a3aa7', '#e34948', '#e87ba4', '#eb6834'];

export default function UsersPage() {
  const { data, addUser, updateUser, deleteUser } = useMockStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('Content Writer');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      name,
      email,
      role,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      status: 'invited',
    });
    setName('');
    setEmail('');
    setRole('Content Writer');
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeaderBar
        title="User Management"
        description="Manage internal marketing team access."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Invite user
          </Button>
        }
      />

      <Table>
        <Thead>
          <tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th />
          </tr>
        </Thead>
        <tbody>
          {data.users.map((user) => (
            <Tr key={user.id}>
              <Td>
                <div className="flex items-center gap-2">
                  <Avatar name={user.name} color={user.color} size={26} />
                  <span className="font-medium text-ink-primary dark:text-ink-primary-dark">{user.name}</span>
                </div>
              </Td>
              <Td>{user.email}</Td>
              <Td>
                <Select
                  value={user.role}
                  onChange={(e) => updateUser(user.id, { role: e.target.value as Role })}
                  className="h-8 w-40 py-0 text-xs"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              </Td>
              <Td>
                <Badge tone={user.status === 'active' ? 'good' : 'neutral'}>{user.status}</Badge>
              </Td>
              <Td>
                <button onClick={() => deleteUser(user.id)} className="text-ink-muted hover:text-status-critical" aria-label={`Remove ${user.name}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Invite user">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Full name">
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Role">
            <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Send invite</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
