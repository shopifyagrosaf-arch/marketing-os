'use client';

import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Textarea } from '@/components/ui/Input';
import { PageHeaderBar } from '@/components/shell/PageHeaderBar';
import { CONTENT_STATUS_TONE, PRIORITY_TONE } from '@/lib/status';
import { useMockStore } from '@/mock/store';

export default function ApprovalsPage() {
  const { data, decideApproval } = useMockStore();
  const pending = data.contentRequests.filter((cr) => cr.status === 'Submitted' || cr.status === 'In Review');
  const [comments, setComments] = useState<Record<string, string>>({});

  const decisionHistory = [...data.approvalDecisions].sort((a, b) => b.decidedAt.localeCompare(a.decidedAt)).slice(0, 6);

  return (
    <div>
      <PageHeaderBar title="Approvals" description="Review submitted content before it moves forward." />

      {pending.length === 0 ? (
        <EmptyState title="Nothing waiting for approval." description="Submitted requests will appear here." />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {pending.map((cr) => {
            const requester = data.users.find((u) => u.id === cr.requestedById);
            return (
              <Card key={cr.id}>
                <CardBody>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-ink-primary dark:text-ink-primary-dark">{cr.title}</p>
                      <p className="text-xs text-ink-muted">
                        {cr.contentType} &middot; {cr.channel} &middot; requested by {requester?.name ?? '—'}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Badge tone={CONTENT_STATUS_TONE[cr.status]}>{cr.status}</Badge>
                      <Badge tone={PRIORITY_TONE[cr.priority]}>{cr.priority}</Badge>
                    </div>
                  </div>
                  <p className="mb-3 text-sm text-ink-secondary dark:text-ink-secondary-dark">{cr.description}</p>
                  <Textarea
                    placeholder="Optional comment…"
                    rows={2}
                    value={comments[cr.id] ?? ''}
                    onChange={(e) => setComments((c) => ({ ...c, [cr.id]: e.target.value }))}
                    className="mb-3"
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => decideApproval(cr.id, 'approved', comments[cr.id] ?? '')}>
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                    <Button variant="danger" onClick={() => decideApproval(cr.id, 'rejected', comments[cr.id] ?? '')}>
                      <X className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {decisionHistory.length > 0 && (
        <Card className="mt-5">
          <CardBody className="space-y-2">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">Recent decisions</p>
            {decisionHistory.map((d) => {
              const cr = data.contentRequests.find((c) => c.id === d.contentRequestId);
              const by = data.users.find((u) => u.id === d.decidedById);
              return (
                <div key={d.id} className="flex items-center justify-between text-sm">
                  <span className="truncate text-ink-secondary dark:text-ink-secondary-dark">
                    {cr?.title ?? 'Deleted request'} &middot; by {by?.name ?? '—'}
                  </span>
                  <Badge tone={d.decision === 'approved' ? 'good' : 'critical'}>{d.decision}</Badge>
                </div>
              );
            })}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
