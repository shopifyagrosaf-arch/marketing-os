'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Alert, Badge, Button, Card, FormField, Spinner, Textarea, TextInput } from '@agrosaf/ui';
import { apiFetch } from '@/lib/api-client';
import { useBrand } from '@/components/brand-switcher/BrandProvider';
import { PageHeader } from '@/components/shell/PageHeader';

type ContentRequestStatus = 'DRAFT' | 'SUBMITTED' | 'CANCELLED';

interface ContentRequest {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  channel: string | null;
  status: ContentRequestStatus;
  dueDate: string | null;
}

const STATUS_TONE: Record<ContentRequestStatus, 'neutral' | 'info' | 'danger'> = {
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  CANCELLED: 'danger',
};

/** Which status a DRAFT/SUBMITTED request can transition to next — mirrors CONTENT_REQUEST_TRANSITIONS on the API. */
const NEXT_ACTIONS: Record<ContentRequestStatus, { label: string; status: ContentRequestStatus }[]> = {
  DRAFT: [
    { label: 'Submit', status: 'SUBMITTED' },
    { label: 'Cancel', status: 'CANCELLED' },
  ],
  SUBMITTED: [{ label: 'Withdraw', status: 'CANCELLED' }],
  CANCELLED: [],
};

export default function ContentRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const { selectedBrandId } = useBrand();
  const [request, setRequest] = useState<ContentRequest | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!selectedBrandId) return;
    apiFetch<ContentRequest>(`content-requests/${params.id}`, { brandId: selectedBrandId })
      .then((cr) => {
        setRequest(cr);
        setTitle(cr.title);
        setDescription(cr.description ?? '');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load content request.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  useEffect(load, [selectedBrandId, params.id]);

  const saveEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedBrandId) return;
    try {
      await apiFetch(`content-requests/${params.id}`, {
        method: 'PATCH',
        body: { title, description: description || undefined },
        brandId: selectedBrandId,
      });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save changes.');
    }
  };

  const transition = async (status: ContentRequestStatus) => {
    setError(null);
    if (!selectedBrandId) return;
    try {
      await apiFetch(`content-requests/${params.id}/status`, {
        method: 'PATCH',
        body: { status },
        brandId: selectedBrandId,
      });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update status.');
    }
  };

  if (!selectedBrandId) {
    return (
      <div>
        <PageHeader title="Content Request" />
        <p>Select a brand to continue.</p>
      </div>
    );
  }

  if (!request) return <Spinner label="Loading content request…" />;

  return (
    <div>
      <PageHeader
        title={request.title}
        actions={<Badge tone={STATUS_TONE[request.status]}>{request.status}</Badge>}
      />
      {error && (
        <Alert tone="error" style={{ marginBottom: '1rem' }}>
          {error}
        </Alert>
      )}

      <Card style={{ maxWidth: 560, marginBottom: '1.5rem' }}>
        <p>
          <strong>Type:</strong> {request.contentType}
        </p>
        <p>
          <strong>Channel:</strong> {request.channel ?? '—'}
        </p>
        <p>
          <strong>Due date:</strong> {request.dueDate ? new Date(request.dueDate).toLocaleDateString() : '—'}
        </p>
      </Card>

      {request.status === 'DRAFT' && (
        <form
          onSubmit={saveEdits}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 480, marginBottom: '1.5rem' }}
        >
          <FormField label="Title" htmlFor="cr-edit-title">
            <TextInput
              id="cr-edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </FormField>
          <FormField label="Description" htmlFor="cr-edit-description">
            <Textarea
              id="cr-edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </FormField>
          <Button type="submit" variant="secondary" style={{ alignSelf: 'flex-start' }}>
            Save changes
          </Button>
        </form>
      )}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {NEXT_ACTIONS[request.status].map((action) => (
          <Button
            key={action.status}
            variant={action.status === 'CANCELLED' ? 'danger' : 'primary'}
            onClick={() => transition(action.status)}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
