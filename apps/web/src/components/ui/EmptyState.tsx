import type { ReactNode } from 'react';

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-hairline px-6 py-14 text-center dark:border-line-hairline-dark">
      {icon && <div className="mb-1 text-ink-muted">{icon}</div>}
      <p className="text-sm font-medium text-ink-primary dark:text-ink-primary-dark">{title}</p>
      {description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
