import type { BadgeTone } from '@/components/ui/Badge';
import type { ContentRequestStatus, Priority, TaskStatus } from '@/mock/types';

// Fixed identity mapping reused across badges, kanban columns, and charts —
// colors follow the status entity, never a rank, per the dataviz skill's
// "color follows the entity" rule.
export const CONTENT_STATUS_TONE: Record<ContentRequestStatus, BadgeTone> = {
  Draft: 'neutral',
  Submitted: 'brand',
  'In Review': 'warning',
  Approved: 'good',
  Rejected: 'critical',
  Published: 'good',
};

export const CONTENT_STATUS_COLOR: Record<ContentRequestStatus, string> = {
  Draft: '#898781',
  Submitted: '#2a78d6',
  'In Review': '#eda100',
  Approved: '#0ca30c',
  Rejected: '#d03b3b',
  Published: '#1baf7a',
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

export const TASK_STATUS_TONE: Record<TaskStatus, BadgeTone> = {
  todo: 'neutral',
  in_progress: 'brand',
  review: 'warning',
  done: 'good',
};

export const PRIORITY_TONE: Record<Priority, BadgeTone> = {
  Low: 'neutral',
  Medium: 'brand',
  High: 'warning',
  Urgent: 'critical',
};
