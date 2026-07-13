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
  Textarea,
  TextInput,
} from '@agrosaf/ui';
import { apiFetch } from '@/lib/api-client';
import { useBrand } from '@/components/brand-switcher/BrandProvider';
import { PageHeader } from '@/components/shell/PageHeader';

type ContentRequestStatus = 'DRAFT' | 'SUBMITTED' | 'CANCELLED';

interface ContentRequest {
  id: string;
  title: string;
  contentType: string;
  channel: string | null;
  status: ContentRequestStatus;
  dueDate: string | null;
}

interface ContentRequestsPage {
  items: ContentRequest[];
  total: number;
  page: number;
  limit: number;
}

const STATUS_TONE: Record<ContentRequestStatus, 'neutral' | 'info' | 'danger'> = {
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  CANCELLED: 'danger',
};

export default function ContentRequestsPage() {
  const { selectedBrandId } = useBrand();
  const [data, setData] = useState<ContentRequestsPage | null>(null);
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState('');
  const [channel, setChannel] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!selectedBrandId) return;
    apiFetch<ContentRequestsPage>(`content-requests?page=${page}`, { brandId: selectedBrandId })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load content requests.'));
  };

  useEffect(load, [selectedBrandId, page]);

  const createRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedBrandId) return;
    try {
      await apiFetch(
        'content-requests',
        {
          method: 'POST',
          body: { title, contentType, channel: channel || undefined, description: description || undefined },
          brandId: selectedBrandId,
        },
      );
      setTitle('');
      setContentType('');
      setChannel('');
      setDescription('');
      setPage(1);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create content request.');
    }
  };

  if (!selectedBrandId) {
    return (
      <div>
        <PageHeader title="Content Requests" />
        <p>Select a brand to continue.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Content Requests"
        description="Submit a request to kick off the content approval workflow."
      />
      {error && (
        <Alert tone="error" style={{ marginBottom: '1rem' }}>
          {error}
        </Alert>
      )}

      <form
        onSubmit={createRequest}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxWidth: 480 }}
      >
        <FormField label="Title" htmlFor="cr-title">
          <TextInput
            id="cr-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Content type" htmlFor="cr-content-type" hint="e.g. social_post, blog_article">
          <TextInput
            id="cr-content-type"
            type="text"
            placeholder="social_post"
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Channel" htmlFor="cr-channel" hint="Optional, e.g. instagram">
          <TextInput
            id="cr-channel"
            type="text"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          />
        </FormField>
        <FormField label="Description" htmlFor="cr-description" hint="Optional">
          <Textarea
            id="cr-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </FormField>
        <Button type="submit" style={{ alignSelf: 'flex-start' }}>
          Create request
        </Button>
      </form>

      {data && data.items.length === 0 ? (
        <EmptyState title="No content requests yet for this brand." />
      ) : (
        <Table aria-label="Content requests">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Channel</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((cr) => (
              <tr key={cr.id}>
                <td>
                  <Link href={`/content-requests/${cr.id}`}>{cr.title}</Link>
                </td>
                <td>{cr.contentType}</td>
                <td>{cr.channel ?? '—'}</td>
                <td>
                  <Badge tone={STATUS_TONE[cr.status]}>{cr.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {data && (
        <div style={{ marginTop: '1rem' }}>
          <Pagination page={data.page} limit={data.limit} total={data.total} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
