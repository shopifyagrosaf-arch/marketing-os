import { Search } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';
import { cn } from './cn';

export function SearchInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
      <input
        className="h-9 w-full rounded-lg border border-line-hairline bg-white pl-8 pr-3 text-sm text-ink-primary placeholder:text-ink-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 dark:border-line-hairline-dark dark:bg-surface-dark dark:text-ink-primary-dark"
        {...props}
      />
    </div>
  );
}
