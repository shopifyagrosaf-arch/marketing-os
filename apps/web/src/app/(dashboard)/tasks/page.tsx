'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageHeaderBar } from '@/components/shell/PageHeaderBar';
import { PRIORITY_TONE, TASK_STATUS_LABEL } from '@/lib/status';
import type { Priority, Task, TaskStatus } from '@/mock/types';
import { useMockStore } from '@/mock/store';

const COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];

export default function TasksPage() {
  const { data, currentUser, addTask, updateTask, deleteTask } = useMockStore();
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState(data.users[0]?.id ?? '');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [contentRequestId, setContentRequestId] = useState('');

  const userName = (id: string) => data.users.find((u) => u.id === id);
  const requestTitle = (id: string | null) => data.contentRequests.find((cr) => cr.id === id)?.title;

  const onDrop = (status: TaskStatus) => {
    if (dragTaskId) updateTask(dragTaskId, { status });
    setDragTaskId(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    addTask({
      title,
      assigneeId: assigneeId || currentUser.id,
      status: 'todo',
      priority,
      dueDate: dueDate || new Date().toISOString().slice(0, 10),
      contentRequestId: contentRequestId || null,
    });
    setTitle('');
    setPriority('Medium');
    setDueDate('');
    setContentRequestId('');
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeaderBar
        title="Task Board"
        description="Drag tasks across the board as work progresses."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> New task
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((status) => {
          const tasks = data.tasks.filter((t) => t.status === status);
          return (
            <div
              key={status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(status)}
              className="rounded-xl bg-surface-page/60 p-2 dark:bg-white/[0.02]"
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  {TASK_STATUS_LABEL[status]}
                </p>
                <span className="tabular-nums rounded-full bg-ink-muted/10 px-1.5 text-xs text-ink-muted">
                  {tasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    assignee={userName(task.assigneeId)}
                    requestTitle={requestTitle(task.contentRequestId)}
                    onDragStart={() => setDragTaskId(task.id)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New task">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Assignee">
              <Select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                {data.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                {(['Low', 'Medium', 'High', 'Urgent'] as Priority[]).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Due date">
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </Field>
            <Field label="Linked request" hint="Optional">
              <Select value={contentRequestId} onChange={(e) => setContentRequestId(e.target.value)}>
                <option value="">None</option>
                {data.contentRequests.map((cr) => (
                  <option key={cr.id} value={cr.id}>
                    {cr.title}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function TaskCard({
  task,
  assignee,
  requestTitle,
  onDragStart,
  onDelete,
}: {
  task: Task;
  assignee?: { name: string; color: string };
  requestTitle?: string;
  onDragStart: () => void;
  onDelete: () => void;
}) {
  return (
    <Card draggable onDragStart={onDragStart} className="cursor-grab p-3 active:cursor-grabbing">
      <p className="text-sm font-medium text-ink-primary dark:text-ink-primary-dark">{task.title}</p>
      {requestTitle && <p className="mt-0.5 truncate text-xs text-ink-muted">{requestTitle}</p>}
      <div className="mt-2 flex items-center justify-between">
        <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
        {assignee && <Avatar name={assignee.name} color={assignee.color} size={22} />}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="tabular-nums text-xs text-ink-muted">Due {task.dueDate}</span>
        <button onClick={onDelete} className="text-xs text-ink-muted hover:text-status-critical">
          Remove
        </button>
      </div>
    </Card>
  );
}
