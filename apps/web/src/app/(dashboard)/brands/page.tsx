'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field, Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { SkeletonCards } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/toast';
import { PageHeaderBar } from '@/components/shell/PageHeaderBar';
import { useSimulatedLoading } from '@/lib/useSimulatedLoading';
import type { Brand } from '@/mock/types';
import { useMockStore } from '@/mock/store';

const PALETTE = ['#2a78d6', '#1baf7a', '#eda100', '#4a3aa7', '#e34948', '#e87ba4', '#eb6834'];
const PAGE_SIZE = 9;

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function BrandsPage() {
  const { data, addBrand, updateBrand, deleteBrand } = useMockStore();
  const loading = useSimulatedLoading();
  const toast = useToast();
  const confirm = useConfirm();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Brand['status']>('All');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PALETTE[0]);

  const filtered = useMemo(
    () =>
      data.brands.filter((b) => {
        const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [data.brands, search, statusFilter],
  );

  useEffect(() => setPage(1), [search, statusFilter]);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeBrand = data.brands.find((b) => b.id === activeBrandId) ?? null;
  const requestCount = (id: string) => data.contentRequests.filter((cr) => cr.brandId === id).length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addBrand({ name, slug: slugify(name), color, status: 'active', description });
    toast.success('Brand added', name);
    setName('');
    setDescription('');
    setColor(PALETTE[0]);
    setModalOpen(false);
  };

  const removeBrand = async (brand: Brand) => {
    const count = requestCount(brand.id);
    const ok = await confirm({
      title: 'Delete this brand?',
      description:
        count > 0
          ? `${brand.name} has ${count} linked content request${count > 1 ? 's' : ''}. Deleting it won't remove those requests, but they'll lose their brand reference.`
          : `${brand.name} will be permanently removed.`,
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    deleteBrand(brand.id);
    setActiveBrandId(null);
    toast.success('Brand deleted');
  };

  return (
    <div>
      <PageHeaderBar
        title="Brands"
        description="The brand portfolio content requests and campaigns are organized under."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> New brand
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput placeholder="Search brands…" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'All' | Brand['status'])} className="sm:w-40">
          <option value="All">All statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </Select>
      </div>

      {loading ? (
        <SkeletonCards count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No brands match your filters." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((brand) => (
              <Card
                key={brand.id}
                onClick={() => setActiveBrandId(brand.id)}
                className="cursor-pointer p-4 transition-shadow hover:shadow-popover"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ background: brand.color }}
                  >
                    {brand.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-primary dark:text-ink-primary-dark">{brand.name}</p>
                    <p className="truncate text-xs text-ink-muted">{brand.slug}</p>
                  </div>
                </div>
                <p className="mb-3 line-clamp-2 text-sm text-ink-secondary dark:text-ink-secondary-dark">{brand.description}</p>
                <div className="flex items-center justify-between">
                  <Badge tone={brand.status === 'active' ? 'good' : 'neutral'}>{brand.status}</Badge>
                  <span className="text-xs text-ink-muted">{requestCount(brand.id)} requests</span>
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New brand">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Brand name">
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Description" hint="Optional">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </Field>
          <Field label="Color">
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-surface dark:ring-offset-surface-dark ${
                    color === c ? 'ring-ink-primary dark:ring-white' : 'ring-transparent'
                  }`}
                  style={{ background: c }}
                  aria-label={`Choose ${c}`}
                />
              ))}
            </div>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create brand</Button>
          </div>
        </form>
      </Modal>

      <Drawer
        open={!!activeBrand}
        onClose={() => setActiveBrandId(null)}
        title={activeBrand?.name ?? ''}
        footer={
          activeBrand && (
            <Button variant="danger" className="w-full" onClick={() => removeBrand(activeBrand)}>
              <Trash2 className="h-4 w-4" /> Delete brand
            </Button>
          )
        }
      >
        {activeBrand && (
          <div className="space-y-4">
            <Field label="Name">
              <Input value={activeBrand.name} onChange={(e) => updateBrand(activeBrand.id, { name: e.target.value })} />
            </Field>
            <Field label="Description">
              <Textarea
                value={activeBrand.description}
                onChange={(e) => updateBrand(activeBrand.id, { description: e.target.value })}
                rows={3}
              />
            </Field>
            <Field label="Status">
              <Select
                value={activeBrand.status}
                onChange={(e) => updateBrand(activeBrand.id, { status: e.target.value as Brand['status'] })}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </Select>
            </Field>
            <CardBody className="rounded-lg border border-line-hairline p-3 dark:border-line-hairline-dark">
              <p className="text-xs text-ink-muted">Linked content requests</p>
              <p className="text-lg font-semibold text-ink-primary dark:text-ink-primary-dark">
                {requestCount(activeBrand.id)}
              </p>
            </CardBody>
          </div>
        )}
      </Drawer>
    </div>
  );
}
