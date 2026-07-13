import styles from './Spinner.module.css';

export interface SpinnerProps {
  label?: string;
}

/** Replaces bare "Loading…" text used since Sprint 1 with a consistent, accessible indicator. */
export function Spinner({ label = 'Loading…' }: SpinnerProps) {
  return (
    <span className={styles.row} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      {label}
    </span>
  );
}
