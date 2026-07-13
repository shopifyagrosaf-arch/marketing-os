import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Card } from './Card';

export function StatTile({
  label,
  value,
  delta,
  deltaTone = 'good',
  icon,
  href,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaTone?: 'good' | 'critical';
  icon?: ReactNode;
  href?: string;
}) {
  const content = (
    <Card className={`group p-4 ${href ? 'cursor-pointer hover:border-brand-500/50 hover:shadow-popover' : ''}`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
        {icon && <div className="text-ink-muted">{icon}</div>}
      </div>
      <p className="tabular-nums mt-2 text-2xl font-semibold text-ink-primary dark:text-ink-primary-dark">{value}</p>
      <div className="mt-1 flex items-center justify-between">
        {delta ? (
          <p className={`text-xs font-medium ${deltaTone === 'good' ? 'text-status-good' : 'text-status-critical'}`}>
            {delta}
          </p>
        ) : (
          <span />
        )}
        {href && (
          <ArrowRight className="h-3.5 w-3.5 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
