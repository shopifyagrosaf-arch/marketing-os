import type { ReactNode } from 'react';
import { Card } from './Card';

export function StatTile({
  label,
  value,
  delta,
  deltaTone = 'good',
  icon,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaTone?: 'good' | 'critical';
  icon?: ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
        {icon && <div className="text-ink-muted">{icon}</div>}
      </div>
      <p className="tabular-nums mt-2 text-2xl font-semibold text-ink-primary dark:text-ink-primary-dark">{value}</p>
      {delta && (
        <p className={`mt-1 text-xs font-medium ${deltaTone === 'good' ? 'text-status-good' : 'text-status-critical'}`}>
          {delta}
        </p>
      )}
    </Card>
  );
}
