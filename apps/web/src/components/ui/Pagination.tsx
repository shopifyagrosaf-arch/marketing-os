'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="mt-3 flex flex-col items-center justify-between gap-2 border-t border-line-hairline pt-3 text-sm sm:flex-row dark:border-line-hairline-dark">
      <p className="tabular-nums text-xs text-ink-muted">
        Showing <span className="font-medium text-ink-secondary dark:text-ink-secondary-dark">{from}–{to}</span> of{' '}
        <span className="font-medium text-ink-secondary dark:text-ink-secondary-dark">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </Button>
        <span className="tabular-nums px-2 text-xs text-ink-muted">
          Page {page} / {pageCount}
        </span>
        <Button variant="secondary" size="sm" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
          Next <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
