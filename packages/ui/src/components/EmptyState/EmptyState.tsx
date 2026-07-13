import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Consistent "no results" placeholder for lists (users, roles, content requests, ...). */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <span className={styles.title}>{title}</span>
      {description && <span>{description}</span>}
      {action}
    </div>
  );
}
