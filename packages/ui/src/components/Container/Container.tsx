import type { HTMLAttributes } from 'react';
import styles from './Container.module.css';

/** Consistent page padding + max content width — replaces the inline `style={{ padding: ... }}` used on `<main>` since Sprint 1. */
export function Container({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={[styles.container, className].filter(Boolean).join(' ')} {...rest} />;
}
