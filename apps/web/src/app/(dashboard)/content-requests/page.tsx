'use client';

import { Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field, Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { Table, Td, Th, Thead, Tr } from '@/components/ui/Table';
import { useToast } from '@/components/ui/toast';
import { PageHeaderBar } from '@/components/shell/PageHeaderBar';
import { useSimulatedLoading } from '@/lib/useSimulatedLoading';
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
const PAGE_SIZE = 6;

export default function ContentRequestsPage() {
  const { data, currentUser, addContentRequest, deleteContentRequest } = useMockStore();
  const loading = useSimulatedLoading();
  const toast = useToast();
  const confirm = useConfirm();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContentRequestStatus | 'All'>('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState('Social post');
  const [channel, setChannel] = useState<Channel>('Instagram');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [brandId, setBrandId] = useState(data.brands[0]?.id ?? '');
  const [dueDate, setDueDate] = useState('');

  const filtered = useMemo(
    () =>
      data.contentRequests.filter((cr) => {
        const matchesSearch = cr.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || cr.status === statusFilter;
        const matchesBrand = brandFilter === 'All' || cr.brandId === brandFilter;
        return matchesSearch && matchesStatus && matchesBrand;
      }),
    [data.contentRequests, search, statusFilter, brandFilter],
  );

  useEffect(() => setPage(1), [search, statusFilter, brandFilter]);

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const userName = (id: string | null) => data.users.find((u) => u.id === id)?.name ?? '—';
  const brand = (id: string) => data.brands.find((b) => b.id === id);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !brandId) return;
    addContentRequest({
      title,
      description,
      contentType,
      channel,
      priority,
      brandId,
      requestedById: currentUser.id,
      assigneeId: null,
      dueDate: dueDate || new Date().toISOString().slice(0, 10),
    });
    toast.success('Content request created', title);
    setTitle('');
    setDescription('');
    setContentType('Social post');
    setChannel('Instagram');
    setPriority('Medium');
    setDueDate('');
    setModalOpen(false);
  };

  const remove = async (id: string, requestTitle: string) => {
    const ok = await confirm({
      title: 'Delete this content request?',
      description: `"${requestTitle}" will be permanently removed from this workspace.`,
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    deleteContentRequest(id);
    toast.success('Content request deleted');
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
          className="sm:w-44"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === 'All' ? 'All statuses' : s}
            </option>
          ))}
        </Select>
        <Select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="sm:w-52">
          <option value="All">All brands</option>
          {data.brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <SkeletonTable rows={6} cols={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No content requests match your filters."
          description="Try clearing filters or create a new request."
          action={
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" /> New request
            </Button>
          }
        />
      ) : (
        <>
          <Table>
            <Thead>
              <tr>
                <Th>Title</Th>
                <Th>Brand</Th>
                <Th>Channel</Th>
                <Th>Priority</Th>
                <Th>Assignee</Th>
                <Th>Due</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </Thead>
            <tbody>
              {pageItems.map((cr) => (
                <Tr key={cr.id}>
                  <Td>
                    <Link
                      href={`/content-requests/${cr.id}`}
                      className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                    >
                      {cr.title}
                    </Link>
                  </Td>
                  <Td>
                    {brand(cr.brandId) && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: brand(cr.brandId)!.color }} />
                        {brand(cr.brandId)!.name}
                      </span>
                    )}
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
                  <Td>
                    <button
                      onClick={() => remove(cr.id, cr.title)}
                      className="text-ink-muted hover:text-status-critical"
                      aria-label={`Delete ${cr.title}`}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New content request">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </Field>
          <Field label="Description" hint="Optional">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Brand">
              <Select value={brandId} onChange={(e) => setBrandId(e.target.value)} required>
                {data.brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </Field>
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
