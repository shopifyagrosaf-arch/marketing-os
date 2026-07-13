import { Button } from '../Button/Button';
import styles from './Pagination.module.css';

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

/** Page-number pager for the `{ items, total, page, limit }` shape every admin list endpoint returns. */
export function Pagination({ page, limit, total, onPageChange }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / limit));

  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Previous
      </Button>
      <span>
        Page {page} of {pageCount}
      </span>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
      >
        Next
      </Button>
    </nav>
  );
}
