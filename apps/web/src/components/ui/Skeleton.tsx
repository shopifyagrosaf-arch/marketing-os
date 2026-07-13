import { cn } from './cn';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-ink-muted/15', className)} />;
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line-hairline dark:border-line-hairline-dark">
      <div className="border-b border-line-hairline bg-surface-page p-3 dark:border-line-hairline-dark dark:bg-white/[0.03]">
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="divide-y divide-line-hairline dark:divide-line-hairline-dark">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 p-3">
            {Array.from({ length: cols }).map((__, c) => (
              <Skeleton key={c} className={c === 0 ? 'h-3.5 flex-1' : 'h-3.5 w-16'} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-line-hairline p-3 dark:border-line-hairline-dark">
          <Skeleton className="mb-2 h-24 w-full" />
          <Skeleton className="mb-1 h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonStatRow({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-line-hairline p-4 dark:border-line-hairline-dark">
          <Skeleton className="mb-3 h-3 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}
