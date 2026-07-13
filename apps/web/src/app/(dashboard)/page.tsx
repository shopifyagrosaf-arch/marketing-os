'use client';

import { CheckSquare, Clock, FileText, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { PageHeaderBar } from '@/components/shell/PageHeaderBar';
import { CONTENT_STATUS_COLOR, CONTENT_STATUS_TONE } from '@/lib/status';
import type { ContentRequestStatus } from '@/mock/types';
import { useMockStore } from '@/mock/store';

const STATUS_ORDER: ContentRequestStatus[] = ['Draft', 'Submitted', 'In Review', 'Approved', 'Published', 'Rejected'];

export default function DashboardPage() {
  const { data, theme } = useMockStore();
  const axisColor = '#898781';
  const gridColor = theme === 'dark' ? '#2c2c2a' : '#e1e0d9';
  const surface = theme === 'dark' ? '#1a1a19' : '#fcfcfb';
  const ink = theme === 'dark' ? '#ffffff' : '#0b0b0b';

  const byStatus = useMemo(
    () =>
      STATUS_ORDER.map((status) => ({
        status,
        count: data.contentRequests.filter((cr) => cr.status === status).length,
      })),
    [data.contentRequests],
  );

  const reachTrend = useMemo(
    () =>
      [...data.performanceEntries]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((p) => ({ date: p.date.slice(5), reach: p.reach })),
    [data.performanceEntries],
  );

  const pendingApprovals = data.contentRequests.filter(
    (cr) => cr.status === 'Submitted' || cr.status === 'In Review',
  ).length;
  const openRequests = data.contentRequests.filter((cr) => !['Published', 'Rejected'].includes(cr.status)).length;
  const tasksInFlight = data.tasks.filter((t) => t.status !== 'done').length;
  const totalReach = data.performanceEntries.reduce((sum, p) => sum + p.reach, 0);

  const recent = [...data.contentRequests].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);

  return (
    <div>
      <PageHeaderBar title="Dashboard" description="Overview of content operations across all brands." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Open requests" value={openRequests} icon={<FileText className="h-4 w-4" />} />
        <StatTile label="Pending approvals" value={pendingApprovals} icon={<CheckSquare className="h-4 w-4" />} />
        <StatTile label="Tasks in flight" value={tasksInFlight} icon={<Clock className="h-4 w-4" />} />
        <StatTile
          label="Total reach (14d)"
          value={totalReach.toLocaleString()}
          delta="+12.4% vs prior period"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-primary-dark">Requests by status</h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byStatus} margin={{ left: -20 }}>
                <CartesianGrid vertical={false} stroke={gridColor} />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 11, fill: axisColor }}
                  axisLine={{ stroke: gridColor }}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(11,11,11,0.03)' }}
                  contentStyle={{
                    background: surface,
                    border: `1px solid ${gridColor}`,
                    borderRadius: 8,
                    fontSize: 12,
                    color: ink,
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
                  {byStatus.map((entry) => (
                    <Cell key={entry.status} fill={CONTENT_STATUS_COLOR[entry.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-primary-dark">Reach — last 14 days</h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={reachTrend} margin={{ left: -20 }}>
                <CartesianGrid vertical={false} stroke={gridColor} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: axisColor }} axisLine={{ stroke: gridColor }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: surface,
                    border: `1px solid ${gridColor}`,
                    borderRadius: 8,
                    fontSize: 12,
                    color: ink,
                  }}
                />
                <Line type="monotone" dataKey="reach" stroke="#2a78d6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-primary-dark">Recent activity</h2>
        </CardHeader>
        <CardBody className="space-y-2">
          {recent.map((cr) => (
            <div
              key={cr.id}
              className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-surface-page dark:hover:bg-white/5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-primary dark:text-ink-primary-dark">{cr.title}</p>
                <p className="text-xs text-ink-muted">Updated {cr.updatedAt}</p>
              </div>
              <Badge tone={CONTENT_STATUS_TONE[cr.status]}>{cr.status}</Badge>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
