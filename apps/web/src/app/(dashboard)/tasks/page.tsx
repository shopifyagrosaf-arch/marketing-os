'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { Drawer } from '@/components/ui/Drawer';
import { Field, Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { SkeletonCards } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/toast';
import { PageHeaderBar } from '@/components/shell/PageHeaderBar';
import { useSimulatedLoading } from '@/lib/useSimulatedLoading';
import { PRIORITY_TONE, TASK_STATUS_LABEL } from '@/lib/status';
import type { Priority, Task, TaskStatus } from '@/mock/types';
import { useMockStore } from '@/mock/store';

const COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];

export default function TasksPage() {
  const { data, currentUser, addTask, updateTask, deleteTask } = useMockStore();
  const loading = useSimulatedLoading();
  const toast = useToast();
  const confirm = useConfirm();

  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState(data.users[0]?.id ?? '');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [contentRequestId, setContentRequestId] = useState('');

  const userById = (id: string) => data.users.find((u) => u.id === id);
  const requestTitle = (id: string | null) => data.contentRequests.find((cr) => cr.id === id)?.title;

  const filteredTasks = useMemo(
    () =>
      data.tasks.filter(
        (t) =>
          (assigneeFilter === 'All' || t.assigneeId === assigneeFilter) &&
          (priorityFilter === 'All' || t.priority === priorityFilter),
      ),
    [data.tasks, assigneeFilter, priorityFilter],
  );

  const activeTask = data.tasks.find((t) => t.id === activeTaskId) ?? null;

  const onDrop = (status: TaskStatus) => {
    if (dragTaskId) {
      updateTask(dragTaskId, { status });
      toast.success(`Moved to ${TASK_STATUS_LABEL[status]}`);
    }
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
    toast.success('Task added', title);
    setTitle('');
    setPriority('Medium');
    setDueDate('');
    setContentRequestId('');
    setModalOpen(false);
  };

  const removeTask = async (task: Task) => {
    const ok = await confirm({
      title: 'Remove this task?',
      description: `"${task.title}" will be removed from the board.`,
      confirmLabel: 'Remove',
    });
    if (!ok) return;
    deleteTask(task.id);
    setActiveTaskId(null);
    toast.success('Task removed');
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

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="sm:w-48">
          <option value="All">All assignees</option>
          {data.users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>
        <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as Priority | 'All')} className="sm:w-40">
          <option value="All">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <SkeletonCards count={8} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((status) => {
            const tasks = filteredTasks.filter((t) => t.status === status);
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
                <div className="min-h-[3rem] space-y-2">
                  {tasks.length === 0 && (
                    <p className="rounded-lg border border-dashed border-line-hairline p-3 text-center text-xs text-ink-muted dark:border-line-hairline-dark">
                      No tasks
                    </p>
                  )}
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      assignee={userById(task.assigneeId)}
                      requestTitle={requestTitle(task.contentRequestId)}
                      onDragStart={() => setDragTaskId(task.id)}
                      onOpen={() => setActiveTaskId(task.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
                {PRIORITIES.map((p) => (
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

      <Drawer
        open={!!activeTask}
        onClose={() => setActiveTaskId(null)}
        title={activeTask?.title ?? ''}
        description={requestTitle(activeTask?.contentRequestId ?? null)}
        footer={
          activeTask && (
            <Button variant="danger" className="w-full" onClick={() => removeTask(activeTask)}>
              <Trash2 className="h-4 w-4" /> Remove task
            </Button>
          )
        }
      >
        {activeTask && (
          <div className="space-y-4">
            <Field label="Status">
              <Select
                value={activeTask.status}
                onChange={(e) => updateTask(activeTask.id, { status: e.target.value as TaskStatus })}
              >
                {COLUMNS.map((c) => (
                  <option key={c} value={c}>
                    {TASK_STATUS_LABEL[c]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Assignee">
              <Select
                value={activeTask.assigneeId}
                onChange={(e) => updateTask(activeTask.id, { assigneeId: e.target.value })}
              >
                {data.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Priority">
              <Select
                value={activeTask.priority}
                onChange={(e) => updateTask(activeTask.id, { priority: e.target.value as Priority })}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Due date">
              <Input
                type="date"
                value={activeTask.dueDate}
                onChange={(e) => updateTask(activeTask.id, { dueDate: e.target.value })}
              />
            </Field>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function TaskCard({
  task,
  assignee,
  requestTitle,
  onDragStart,
  onOpen,
}: {
  task: Task;
  assignee?: { name: string; color: string };
  requestTitle?: string;
  onDragStart: () => void;
  onOpen: () => void;
}) {
  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onClick={onOpen}
      className="cursor-grab p-3 transition-shadow hover:shadow-popover active:cursor-grabbing"
    >
      <p className="text-sm font-medium text-ink-primary dark:text-ink-primary-dark">{task.title}</p>
      {requestTitle && <p className="mt-0.5 truncate text-xs text-ink-muted">{requestTitle}</p>}
      <div className="mt-2 flex items-center justify-between">
        <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
        {assignee && <Avatar name={assignee.name} color={assignee.color} size={22} />}
      </div>
      <p className="tabular-nums mt-2 text-xs text-ink-muted">Due {task.dueDate}</p>
    </Card>
  );
}
