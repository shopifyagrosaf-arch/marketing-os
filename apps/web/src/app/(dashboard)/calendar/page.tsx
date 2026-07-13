'use client';

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeaderBar } from '@/components/shell/PageHeaderBar';
import { CONTENT_STATUS_COLOR } from '@/lib/status';
import { useMockStore } from '@/mock/store';

export default function CalendarPage() {
  const { data } = useMockStore();
  const [anchor, setAnchor] = useState(() => new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(anchor));
    const end = endOfWeek(endOfMonth(anchor));
    return eachDayOfInterval({ start, end });
  }, [anchor]);

  const itemsByDay = (day: Date) => data.contentRequests.filter((cr) => isSameDay(parseISO(cr.dueDate), day));

  return (
    <div>
      <PageHeaderBar
        title="Content Calendar"
        description="Requests plotted by due date."
        actions={
          <div className="flex items-center gap-1">
            <Button variant="secondary" size="sm" onClick={() => setAnchor((d) => subMonths(d, 1))} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="w-32 text-center text-sm font-medium text-ink-primary dark:text-ink-primary-dark">
              {format(anchor, 'MMMM yyyy')}
            </span>
            <Button variant="secondary" size="sm" onClick={() => setAnchor((d) => addMonths(d, 1))} aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const items = itemsByDay(day);
          const inMonth = isSameMonth(day, anchor);
          const isToday = isSameDay(day, new Date());
          return (
            <Card
              key={day.toISOString()}
              className={`min-h-[6.5rem] p-1.5 ${inMonth ? '' : 'opacity-40'}`}
            >
              <p
                className={`tabular-nums mb-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                  isToday ? 'bg-brand-500 font-semibold text-white' : 'text-ink-muted'
                }`}
              >
                {format(day, 'd')}
              </p>
              <div className="space-y-1">
                {items.slice(0, 3).map((cr) => (
                  <Link
                    key={cr.id}
                    href={`/content-requests/${cr.id}`}
                    className="block truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium text-white"
                    style={{ background: CONTENT_STATUS_COLOR[cr.status] }}
                    title={cr.title}
                  >
                    {cr.title}
                  </Link>
                ))}
                {items.length > 3 && <p className="text-[11px] text-ink-muted">+{items.length - 3} more</p>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
