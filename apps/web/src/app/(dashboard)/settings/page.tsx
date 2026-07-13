'use client';

import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Input';
import { PageHeaderBar } from '@/components/shell/PageHeaderBar';
import { useMockStore } from '@/mock/store';

export default function SettingsPage() {
  const { currentUser, updateUser, theme, toggleTheme } = useMockStore();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [orgName, setOrgName] = useState('Agrosaf Group');
  const [saved, setSaved] = useState(false);

  if (!currentUser) return null;

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(currentUser.id, { name, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
            <div className="flex items-center gap-3">
              <Button type="submit">Save profile</Button>
              {saved && <span className="text-xs text-status-good">Saved</span>}
            </div>
          </form>
        </CardBody>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-primary-dark">Workspace</h2>
        </CardHeader>
        <CardBody>
          <Field label="Organization name" hint="Display name shown across the app">
            <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
          </Field>
        </CardBody>
      </Card>

      <Card>
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
    </div>
  );
}
