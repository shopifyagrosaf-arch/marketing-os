import type { TableHTMLAttributes } from 'react';
import styles from './Table.module.css';

/**
 * Thin wrapper around the native `<table>` — provides consistent styling
 * and a horizontally scrollable container for narrow viewports, without
 * hiding the native table semantics screen readers rely on. Compose it with
 * plain `<thead>`/`<tbody>`/`<tr>`/`<th>`/`<td>` (styled globally by this
 * component's CSS Module, keyed off the `.table` wrapper class).
 */
export function Table({ className, ...rest }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className={styles.wrapper}>
      <table className={[styles.table, className].filter(Boolean).join(' ')} {...rest} />
    </div>
  );
}
