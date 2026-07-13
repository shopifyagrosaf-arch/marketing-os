import type { HTMLAttributes } from 'react';
import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

/** Status pill — e.g. a user's ACTIVE/SUSPENDED status or a content request's workflow status. */
export function Badge({ tone = 'neutral', className, ...rest }: BadgeProps) {
  const classes = [styles.badge, styles[tone], className].filter(Boolean).join(' ');
  return <span className={classes} {...rest} />;
}
