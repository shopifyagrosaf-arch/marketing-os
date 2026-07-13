import type { HTMLAttributes } from 'react';
import { cn } from './cn';

export type BadgeTone = 'neutral' | 'good' | 'warning' | 'serious' | 'critical' | 'brand';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-ink-muted/10 text-ink-secondary dark:text-ink-secondary-dark',
  good: 'bg-status-good/10 text-status-good',
  warning: 'bg-status-warning/15 text-[#7a5400] dark:text-status-warning',
  serious: 'bg-status-serious/15 text-[#8a3d1f] dark:text-status-serious',
  critical: 'bg-status-critical/10 text-status-critical',
  brand: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
