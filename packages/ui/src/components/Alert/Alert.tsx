import type { HTMLAttributes } from 'react';
import styles from './Alert.module.css';

export type AlertTone = 'error' | 'success' | 'info';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone;
}

/** Replaces the ad-hoc `<p role="alert">` used for error messages since Sprint 1/2. */
export function Alert({ tone = 'info', className, role, ...rest }: AlertProps) {
  const classes = [styles.alert, styles[tone], className].filter(Boolean).join(' ');
  return <div role={role ?? (tone === 'error' ? 'alert' : 'status')} className={classes} {...rest} />;
}
