'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Field, Input, Select, Textarea } from '@/components/ui/Input';
import { PageHeaderBar } from '@/components/shell/PageHeaderBar';
import { CONTENT_STATUS_TONE, PRIORITY_TONE } from '@/lib/status';
import type { ContentRequestStatus } from '@/mock/types';
import { useMockStore } from '@/mock/store';

const NEXT_ACTIONS: Record<ContentRequestStatus, { label: string; status: ContentRequestStatus; variant?: 'primary' | 'danger' }[]> = {
  Draft: [{ label: 'Submit for review', status: 'Submitted' }],
  Submitted: [{ label: 'Move to In Review', status: 'In Review' }],
  'In Review': [],
  Approved: [{ label: 'Mark as Published', status: 'Published' }],
  Rejected: [{ label: 'Move back to Draft', status: 'Draft' }],
  Published: [],
};

export default function ContentRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, updateContentRequest, deleteContentRequest } = useMockStore();
  const request = data.contentRequests.find((cr) => cr.id === params.id);

  const [title, setTitle] = useState(request?.title ?? '');
  const [description, setDescription] = useState(request?.description ?? '');
  const [assigneeId, setAssigneeId] = useState(request?.assigneeId ?? '');

  if (!request) {
    return (
      <div>
        <PageHeaderBar title="Content request not found" />
        <Link href="/content-requests" className="text-sm text-brand-600 hover:underline dark:text-brand-400">
          Back to Content Requests
        </Link>
      </div>
    );
  }

  const requester = data.users.find((u) => u.id === request.requestedById);

  const saveEdits = (e: React.FormEvent) => {
    e.preventDefault();
    updateContentRequest(request.id, { title, description, assigneeId: assigneeId || null });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/content-requests"
        className="mb-3 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink-primary dark:hover:text-ink-primary-dark"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Content Requests
      </Link>
      <PageHeaderBar
        title={request.title}
        actions={<Badge tone={CONTENT_STATUS_TONE[request.status]}>{request.status}</Badge>}
      />

      <Card className="mb-4">
        <CardBody className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-ink-muted">Type</p>
            <p className="font-medium text-ink-primary dark:text-ink-primary-dark">{request.contentType}</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Channel</p>
            <p className="font-medium text-ink-primary dark:text-ink-primary-dark">{request.channel}</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Priority</p>
            <Badge tone={PRIORITY_TONE[request.priority]}>{request.priority}</Badge>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Due date</p>
            <p className="tabular-nums font-medium text-ink-primary dark:text-ink-primary-dark">{request.dueDate}</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Requested by</p>
            <p className="font-medium text-ink-primary dark:text-ink-primary-dark">{requester?.name ?? '—'}</p>
          </div>
        </CardBody>
      </Card>

      <Card className="mb-4">
        <CardBody>
          <form onSubmit={saveEdits} className="space-y-4">
            <Field label="Title">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </Field>
            <Field label="Description">
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </Field>
            <Field label="Assignee">
              <Select value={assigneeId ?? ''} onChange={(e) => setAssigneeId(e.target.value)}>
                <option value="">Unassigned</option>
                {data.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Button type="submit" variant="secondary">
              Save changes
            </Button>
          </form>
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-2">
        {NEXT_ACTIONS[request.status].map((action) => (
          <Button key={action.status} variant={action.variant ?? 'primary'} onClick={() => updateContentRequest(request.id, { status: action.status })}>
            {action.label}
          </Button>
        ))}
        <Button
          variant="danger"
          onClick={() => {
            deleteContentRequest(request.id);
            router.push('/content-requests');
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
