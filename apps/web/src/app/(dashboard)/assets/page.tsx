'use client';

import { File, FileText, Image as ImageIcon, Trash2, Upload, Video } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Input';
import { SearchInput } from '@/components/ui/SearchInput';
import { PageHeaderBar } from '@/components/shell/PageHeaderBar';
import type { AssetType } from '@/mock/types';
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

export default function AssetsPage() {
  const { data, currentUser, addAsset, deleteAsset } = useMockStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssetType | 'All'>('All');
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

  const onUpload = (files: FileList | null) => {
    if (!files || !currentUser) return;
    Array.from(files).forEach((file) => {
      addAsset({
        name: file.name,
        type: inferType(file.name),
        url: '',
        thumbColor: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        contentRequestId: null,
        uploadedById: currentUser.id,
        sizeKb: Math.round(file.size / 1024),
      });
    });
  };

  return (
    <div>
      <PageHeaderBar
        title="Asset Library"
        description="Brand creative assets — images, video, and documents."
        actions={
          <>
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                onUpload(e.target.files);
                e.target.value = '';
              }}
            />
            <Button onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload
            </Button>
          </>
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

      {filtered.length === 0 ? (
        <EmptyState title="No assets found." description="Upload a file to get started." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((asset) => {
            const Icon = TYPE_ICON[asset.type];
            return (
              <Card key={asset.id} className="group relative overflow-hidden p-0">
                <div
                  className="flex h-24 items-center justify-center"
                  style={{ background: `${asset.thumbColor}22` }}
                >
                  <Icon className="h-8 w-8" style={{ color: asset.thumbColor }} />
                </div>
                <div className="p-2.5">
                  <p className="truncate text-sm font-medium text-ink-primary dark:text-ink-primary-dark" title={asset.name}>
                    {asset.name}
                  </p>
                  <p className="text-xs text-ink-muted">{(asset.sizeKb / 1024).toFixed(1)} MB</p>
                </div>
                <button
                  onClick={() => deleteAsset(asset.id)}
                  className="absolute right-1.5 top-1.5 rounded-md bg-black/40 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Delete ${asset.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
