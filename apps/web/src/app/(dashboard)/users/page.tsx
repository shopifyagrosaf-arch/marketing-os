'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field, Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { Table, Td, Th, Thead, Tr } from '@/components/ui/Table';
import { useToast } from '@/components/ui/toast';
import { PageHeaderBar } from '@/components/shell/PageHeaderBar';
import { useSimulatedLoading } from '@/lib/useSimulatedLoading';
import type { MockUser, Role } from '@/mock/types';
import { useMockStore } from '@/mock/store';

const ROLES: Role[] = ['Admin', 'Marketing Head', 'Brand Manager', 'Content Writer', 'Viewer'];
const PALETTE = ['#2a78d6', '#1baf7a', '#eda100', '#4a3aa7', '#e34948', '#e87ba4', '#eb6834'];
const PAGE_SIZE = 8;

export default function UsersPage() {
  const { data, addUser, updateUser, deleteUser } = useMockStore();
  const loading = useSimulatedLoading();
  const toast = useToast();
  const confirm = useConfirm();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'All'>('All');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('Content Writer');

  const filtered = useMemo(
    () =>
      data.users.filter((u) => {
        const matchesSearch =
          u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'All' || u.role === roleFilter;
        return matchesSearch && matchesRole;
      }),
    [data.users, search, roleFilter],
  );

  useEffect(() => setPage(1), [search, roleFilter]);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeUser = data.users.find((u) => u.id === activeUserId) ?? null;
  const requestCount = (id: string) => data.contentRequests.filter((cr) => cr.requestedById === id).length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({ name, email, role, color: PALETTE[Math.floor(Math.random() * PALETTE.length)], status: 'invited' });
    toast.success('Invite sent', email);
    setName('');
    setEmail('');
    setRole('Content Writer');
    setModalOpen(false);
  };

  const removeUser = async (user: MockUser) => {
    const ok = await confirm({
      title: 'Remove this user?',
      description: `${user.name} will lose access to this workspace.`,
      confirmLabel: 'Remove',
    });
    if (!ok) return;
    deleteUser(user.id);
    setActiveUserId(null);
    toast.success('User removed');
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

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as Role | 'All')} className="sm:w-48">
          <option value="All">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <SkeletonTable rows={6} cols={4} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No users match your filters." />
      ) : (
        <>
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
              {pageItems.map((user) => (
                <Tr key={user.id} className="cursor-pointer" onClick={() => setActiveUserId(user.id)}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Avatar name={user.name} color={user.color} size={26} />
                      <span className="font-medium text-ink-primary dark:text-ink-primary-dark">{user.name}</span>
                    </div>
                  </Td>
                  <Td>{user.email}</Td>
                  <Td onClick={(e) => e.stopPropagation()}>
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
                  <Td onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => removeUser(user)}
                      className="text-ink-muted hover:text-status-critical"
                      aria-label={`Remove ${user.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
        </>
      )}

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

      <Drawer
        open={!!activeUser}
        onClose={() => setActiveUserId(null)}
        title={activeUser?.name ?? ''}
        description={activeUser?.email}
        footer={
          activeUser && (
            <Button variant="danger" className="w-full" onClick={() => removeUser(activeUser)}>
              <Trash2 className="h-4 w-4" /> Remove user
            </Button>
          )
        }
      >
        {activeUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={activeUser.name} color={activeUser.color} size={44} />
              <div>
                <p className="text-sm font-medium text-ink-primary dark:text-ink-primary-dark">{activeUser.name}</p>
                <Badge tone={activeUser.status === 'active' ? 'good' : 'neutral'}>{activeUser.status}</Badge>
              </div>
            </div>
            <Field label="Role">
              <Select value={activeUser.role} onChange={(e) => updateUser(activeUser.id, { role: e.target.value as Role })}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </Field>
            <div>
              <p className="text-xs text-ink-muted">Content requests filed</p>
              <p className="text-lg font-semibold text-ink-primary dark:text-ink-primary-dark">{requestCount(activeUser.id)}</p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
