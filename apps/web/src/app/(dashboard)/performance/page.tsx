'use client';

import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Field, Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StatTile } from '@/components/ui/StatTile';
import { Table, Td, Th, Thead, Tr } from '@/components/ui/Table';
import { PageHeaderBar } from '@/components/shell/PageHeaderBar';
import type { Channel } from '@/mock/types';
import { useMockStore } from '@/mock/store';

const CHANNELS: Channel[] = ['Instagram', 'Facebook', 'LinkedIn', 'Google Business', 'Website', 'Email', 'YouTube'];

export default function PerformancePage() {
  const { data, addPerformanceEntry, theme } = useMockStore();
  const gridColor = theme === 'dark' ? '#2c2c2a' : '#e1e0d9';
  const surface = theme === 'dark' ? '#1a1a19' : '#fcfcfb';
  const ink = theme === 'dark' ? '#ffffff' : '#0b0b0b';

  const [modalOpen, setModalOpen] = useState(false);
  const [contentRequestId, setContentRequestId] = useState(data.contentRequests[0]?.id ?? '');
  const [platform, setPlatform] = useState<Channel>('Instagram');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [reach, setReach] = useState(0);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState(0);
  const [shares, setShares] = useState(0);
  const [clicks, setClicks] = useState(0);

  const totals = useMemo(
    () =>
      data.performanceEntries.reduce(
        (acc, p) => ({
          reach: acc.reach + p.reach,
          likes: acc.likes + p.likes,
          comments: acc.comments + p.comments,
          clicks: acc.clicks + p.clicks,
        }),
        { reach: 0, likes: 0, comments: 0, clicks: 0 },
      ),
    [data.performanceEntries],
  );

  const byPlatform = useMemo(
    () =>
      CHANNELS.map((platform) => ({
        platform,
        engagement: data.performanceEntries
          .filter((p) => p.platform === platform)
          .reduce((sum, p) => sum + p.likes + p.comments + p.shares, 0),
      })).filter((row) => row.engagement > 0),
    [data.performanceEntries],
  );

  const rows = [...data.performanceEntries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentRequestId) return;
    addPerformanceEntry({ contentRequestId, platform, date, reach, likes, comments, shares, clicks });
    setReach(0);
    setLikes(0);
    setComments(0);
    setShares(0);
    setClicks(0);
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeaderBar
        title="Performance"
        description="Manually logged reach and engagement across published content."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Log performance
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Total reach" value={totals.reach.toLocaleString()} />
        <StatTile label="Total likes" value={totals.likes.toLocaleString()} />
        <StatTile label="Total comments" value={totals.comments.toLocaleString()} />
        <StatTile label="Total clicks" value={totals.clicks.toLocaleString()} />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-primary-dark">Engagement by platform</h2>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byPlatform} margin={{ left: -20 }}>
              <CartesianGrid vertical={false} stroke={gridColor} />
              <XAxis dataKey="platform" tick={{ fontSize: 11, fill: '#898781' }} axisLine={{ stroke: gridColor }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#898781' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: surface, border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 12, color: ink }}
              />
              <Bar dataKey="engagement" fill="#2a78d6" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-primary-dark">Entries</h2>
        </CardHeader>
        <CardBody className="pt-0">
          <Table>
            <Thead>
              <tr>
                <Th>Date</Th>
                <Th>Content</Th>
                <Th>Platform</Th>
                <Th>Reach</Th>
                <Th>Likes</Th>
                <Th>Comments</Th>
                <Th>Clicks</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.map((p) => (
                <Tr key={p.id}>
                  <Td className="tabular-nums">{p.date}</Td>
                  <Td className="max-w-[220px] truncate">{data.contentRequests.find((cr) => cr.id === p.contentRequestId)?.title ?? '—'}</Td>
                  <Td>{p.platform}</Td>
                  <Td className="tabular-nums">{p.reach.toLocaleString()}</Td>
                  <Td className="tabular-nums">{p.likes}</Td>
                  <Td className="tabular-nums">{p.comments}</Td>
                  <Td className="tabular-nums">{p.clicks}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log performance entry">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Content request">
            <Select value={contentRequestId} onChange={(e) => setContentRequestId(e.target.value)} required>
              {data.contentRequests.map((cr) => (
                <option key={cr.id} value={cr.id}>
                  {cr.title}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Platform">
              <Select value={platform} onChange={(e) => setPlatform(e.target.value as Channel)}>
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Date">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </Field>
            <Field label="Reach">
              <Input type="number" min={0} value={reach} onChange={(e) => setReach(Number(e.target.value))} />
            </Field>
            <Field label="Likes">
              <Input type="number" min={0} value={likes} onChange={(e) => setLikes(Number(e.target.value))} />
            </Field>
            <Field label="Comments">
              <Input type="number" min={0} value={comments} onChange={(e) => setComments(Number(e.target.value))} />
            </Field>
            <Field label="Shares">
              <Input type="number" min={0} value={shares} onChange={(e) => setShares(Number(e.target.value))} />
            </Field>
            <Field label="Clicks">
              <Input type="number" min={0} value={clicks} onChange={(e) => setClicks(Number(e.target.value))} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save entry</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
