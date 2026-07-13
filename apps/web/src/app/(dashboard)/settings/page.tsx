'use client';

import { Moon, Sun, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { Field, Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/toast';
import { PageHeaderBar } from '@/components/shell/PageHeaderBar';
import { useMockStore } from '@/mock/store';

export default function SettingsPage() {
  const { currentUser, updateUser, deleteUser, logout, theme, toggleTheme } = useMockStore();
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [orgName, setOrgName] = useState('Agrosaf Group');

  if (!currentUser) return null;

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(currentUser.id, { name, email });
    toast.success('Profile saved');
  };

  const saveWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Workspace settings saved', orgName);
  };

  const removeAccount = async () => {
    const ok = await confirm({
      title: 'Delete your account?',
      description: 'This removes your user from this mock workspace and signs you out. This cannot be undone.',
      confirmLabel: 'Delete account',
    });
    if (!ok) return;
    deleteUser(currentUser.id);
    logout();
    toast.success('Account deleted');
    router.push('/login');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeaderBar title="Settings" description="Your profile and workspace preferences." />

      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-primary-dark">Profile</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={currentUser.name} color={currentUser.color} size={44} />
              <div>
                <p className="text-sm font-medium text-ink-primary dark:text-ink-primary-dark">{currentUser.name}</p>
                <p className="text-xs text-ink-muted">{currentUser.role}</p>
              </div>
            </div>
            <Field label="Full name">
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Button type="submit">Save profile</Button>
          </form>
        </CardBody>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-primary-dark">Workspace</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={saveWorkspace} className="space-y-4">
            <Field label="Organization name" hint="Display name shown across the app">
              <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </Field>
            <Button type="submit" variant="secondary">
              Save workspace
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-primary-dark">Appearance</h2>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-primary dark:text-ink-primary-dark">Theme</p>
              <p className="text-xs text-ink-muted">Switch between light and dark mode.</p>
            </div>
            <Button variant="secondary" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card className="border-status-critical/30">
        <CardHeader>
          <h2 className="text-sm font-semibold text-status-critical">Danger zone</h2>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-primary dark:text-ink-primary-dark">Delete account</p>
              <p className="text-xs text-ink-muted">Permanently remove your user from this workspace.</p>
            </div>
            <Button variant="danger" onClick={removeAccount}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
