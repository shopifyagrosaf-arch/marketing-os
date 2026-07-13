'use client';

import { File, FileText, Image as ImageIcon, Trash2, Upload, Video } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { SkeletonCards } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/toast';
import { PageHeaderBar } from '@/components/shell/PageHeaderBar';
import { useSimulatedLoading } from '@/lib/useSimulatedLoading';
import type { Asset, AssetType } from '@/mock/types';
import { useMockStore } from '@/mock/store';

const TYPE_ICON: Record<AssetType, typeof ImageIcon> = {
  image: ImageIcon,
  video: Video,
  document: FileText,
  other: File,
};

function inferType(fileName: string): AssetType {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image';
  if (['mp4', 'mov', 'webm'].includes(ext)) return 'video';
  if (['pdf', 'doc', 'docx', 'ppt', 'pptx'].includes(ext)) return 'document';
  return 'other';
}

const PALETTE = ['#2a78d6', '#1baf7a', '#eda100', '#4a3aa7', '#e34948', '#e87ba4', '#eb6834'];
const PAGE_SIZE = 10;

export default function AssetsPage() {
  const { data, currentUser, addAsset, deleteAsset } = useMockStore();
  const loading = useSimulatedLoading();
  const toast = useToast();
  const confirm = useConfirm();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssetType | 'All'>('All');
  const [page, setPage] = useState(1);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [linkedRequestId, setLinkedRequestId] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      data.assets.filter((a) => {
        const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'All' || a.type === typeFilter;
        return matchesSearch && matchesType;
      }),
    [data.assets, search, typeFilter],
  );

  useEffect(() => setPage(1), [search, typeFilter]);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeAsset = data.assets.find((a) => a.id === activeAssetId) ?? null;
  const uploader = (id: string) => data.users.find((u) => u.id === id)?.name ?? '—';

  const confirmUpload = () => {
    if (!currentUser || pendingFiles.length === 0) return;
    pendingFiles.forEach((file) => {
      addAsset({
        name: file.name,
        type: inferType(file.name),
        url: '',
        thumbColor: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        contentRequestId: linkedRequestId || null,
        uploadedById: currentUser.id,
        sizeKb: Math.round(file.size / 1024) || 128,
      });
    });
    toast.success(`${pendingFiles.length} asset${pendingFiles.length > 1 ? 's' : ''} uploaded`);
    setPendingFiles([]);
    setLinkedRequestId('');
    setUploadOpen(false);
  };

  const removeAsset = async (asset: Asset) => {
    const ok = await confirm({
      title: 'Delete this asset?',
      description: `"${asset.name}" will be permanently removed from the library.`,
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    deleteAsset(asset.id);
    setActiveAssetId(null);
    toast.success('Asset deleted');
  };

  return (
    <div>
      <PageHeaderBar
        title="Asset Library"
        description="Brand creative assets — images, video, and documents."
        actions={
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4" /> Upload
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput placeholder="Search assets…" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as AssetType | 'All')} className="sm:w-40">
          <option value="All">All types</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="document">Document</option>
          <option value="other">Other</option>
        </Select>
      </div>

      {loading ? (
        <SkeletonCards count={10} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No assets found."
          description="Upload a file to get started."
          action={
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4" /> Upload
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {pageItems.map((asset) => {
              const Icon = TYPE_ICON[asset.type];
              return (
                <Card
                  key={asset.id}
                  onClick={() => setActiveAssetId(asset.id)}
                  className="group relative cursor-pointer overflow-hidden p-0 transition-shadow hover:shadow-popover"
                >
                  <div className="flex h-24 items-center justify-center" style={{ background: `${asset.thumbColor}22` }}>
                    <Icon className="h-8 w-8" style={{ color: asset.thumbColor }} />
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-sm font-medium text-ink-primary dark:text-ink-primary-dark" title={asset.name}>
                      {asset.name}
                    </p>
                    <p className="text-xs text-ink-muted">{(asset.sizeKb / 1024).toFixed(1)} MB</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAsset(asset);
                    }}
                    className="absolute right-1.5 top-1.5 rounded-md bg-black/40 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label={`Delete ${asset.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </Card>
              );
            })}
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
        </>
      )}

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload asset">
        <div className="space-y-4">
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => setPendingFiles(Array.from(e.target.files ?? []))}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line-hairline p-8 text-center hover:border-brand-500 hover:bg-brand-500/5 dark:border-line-hairline-dark"
          >
            <Upload className="h-6 w-6 text-ink-muted" />
            <span className="text-sm font-medium text-ink-primary dark:text-ink-primary-dark">
              {pendingFiles.length > 0 ? `${pendingFiles.length} file(s) selected` : 'Click to choose files'}
            </span>
            {pendingFiles.length > 0 && (
              <span className="max-w-full truncate text-xs text-ink-muted">
                {pendingFiles.map((f) => f.name).join(', ')}
              </span>
            )}
          </button>
          <Field label="Link to content request" hint="Optional">
            <Select value={linkedRequestId} onChange={(e) => setLinkedRequestId(e.target.value)}>
              <option value="">None</option>
              {data.contentRequests.map((cr) => (
                <option key={cr.id} value={cr.id}>
                  {cr.title}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUpload} disabled={pendingFiles.length === 0}>
              Upload
            </Button>
          </div>
        </div>
      </Modal>

      <Drawer
        open={!!activeAsset}
        onClose={() => setActiveAssetId(null)}
        title={activeAsset?.name ?? ''}
        footer={
          activeAsset && (
            <Button variant="danger" className="w-full" onClick={() => removeAsset(activeAsset)}>
              <Trash2 className="h-4 w-4" /> Delete asset
            </Button>
          )
        }
      >
        {activeAsset && (
          <div className="space-y-4 text-sm">
            <div
              className="flex h-32 items-center justify-center rounded-xl"
              style={{ background: `${activeAsset.thumbColor}22` }}
            >
              {(() => {
                const Icon = TYPE_ICON[activeAsset.type];
                return <Icon className="h-10 w-10" style={{ color: activeAsset.thumbColor }} />;
              })()}
            </div>
            <div>
              <p className="text-xs text-ink-muted">Type</p>
              <p className="font-medium capitalize text-ink-primary dark:text-ink-primary-dark">{activeAsset.type}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Size</p>
              <p className="font-medium text-ink-primary dark:text-ink-primary-dark">
                {(activeAsset.sizeKb / 1024).toFixed(1)} MB
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Uploaded by</p>
              <p className="font-medium text-ink-primary dark:text-ink-primary-dark">{uploader(activeAsset.uploadedById)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Uploaded on</p>
              <p className="font-medium text-ink-primary dark:text-ink-primary-dark">{activeAsset.createdAt}</p>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => toast.info('Mock download', 'No real file is stored in this preview build.')}
            >
              Download
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
