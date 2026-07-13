'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field, Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { SearchInput } from '@/components/ui/SearchInput';
import { Table, Td, Th, Thead, Tr } from '@/components/ui/Table';
import { PageHeaderBar } from '@/components/shell/PageHeaderBar';
import { CONTENT_STATUS_TONE, PRIORITY_TONE } from '@/lib/status';
import type { Channel, ContentRequestStatus, Priority } from '@/mock/types';
import { useMockStore } from '@/mock/store';

const STATUSES: Array<ContentRequestStatus | 'All'> = [
  'All',
  'Draft',
  'Submitted',
  'In Review',
  'Approved',
  'Rejected',
  'Published',
];
const CHANNELS: Channel[] = ['Instagram', 'Facebook', 'LinkedIn', 'Google Business', 'Website', 'Email', 'YouTube'];
const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];

export default function ContentRequestsPage() {
  const { data, currentUser, addContentRequest } = useMockStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContentRequestStatus | 'All'>('All');
  const [modalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState('Social post');
  const [channel, setChannel] = useState<Channel>('Instagram');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [dueDate, setDueDate] = useState('');

  const filtered = useMemo(
    () =>
      data.contentRequests.filter((cr) => {
        const matchesSearch = cr.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || cr.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [data.contentRequests, search, statusFilter],
  );

  const userName = (id: string | null) => data.users.find((u) => u.id === id)?.name ?? '—';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    addContentRequest({
      title,
      description,
      contentType,
      channel,
      priority,
      requestedById: currentUser.id,
      assigneeId: null,
      dueDate: dueDate || new Date().toISOString().slice(0, 10),
    });
    setTitle('');
    setDescription('');
    setContentType('Social post');
    setChannel('Instagram');
    setPriority('Medium');
    setDueDate('');
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeaderBar
        title="Content Requests"
        description="Submit and track content requests across every channel."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> New request
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          placeholder="Search requests…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ContentRequestStatus | 'All')}
          className="sm:w-48"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === 'All' ? 'All statuses' : s}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No content requests match your filters." />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Title</Th>
              <Th>Channel</Th>
              <Th>Priority</Th>
              <Th>Assignee</Th>
              <Th>Due</Th>
              <Th>Status</Th>
            </tr>
          </Thead>
          <tbody>
            {filtered.map((cr) => (
              <Tr key={cr.id}>
                <Td>
                  <Link href={`/content-requests/${cr.id}`} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
                    {cr.title}
                  </Link>
                </Td>
                <Td>{cr.channel}</Td>
                <Td>
                  <Badge tone={PRIORITY_TONE[cr.priority]}>{cr.priority}</Badge>
                </Td>
                <Td>{userName(cr.assigneeId)}</Td>
                <Td className="tabular-nums">{cr.dueDate}</Td>
                <Td>
                  <Badge tone={CONTENT_STATUS_TONE[cr.status]}>{cr.status}</Badge>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New content request">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </Field>
          <Field label="Description" hint="Optional">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Content type">
              <Input value={contentType} onChange={(e) => setContentType(e.target.value)} required />
            </Field>
            <Field label="Channel">
              <Select value={channel} onChange={(e) => setChannel(e.target.value as Channel)}>
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Due date">
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create request</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
