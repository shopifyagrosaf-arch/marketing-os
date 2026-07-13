export type Role =
  | 'Manager'
  | 'Management'
  | 'Marketing Executive'
  | 'Graphic Designer'
  | 'Video Editor'
  | 'Social Media Executive'
  | 'Performance Marketing Executive'
  | 'Content Writer';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  color: string;
  status: 'active' | 'archived';
  description: string;
  createdAt: string;
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  color: string; // avatar background
  status: 'active' | 'invited';
}

export type ContentRequestStatus = 'Draft' | 'Submitted' | 'In Review' | 'Approved' | 'Rejected' | 'Published';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type Channel =
  | 'Instagram'
  | 'Facebook'
  | 'LinkedIn'
  | 'Google Business'
  | 'Website'
  | 'Email'
  | 'YouTube';

export interface ContentRequest {
  id: string;
  title: string;
  description: string;
  contentType: string;
  channel: Channel;
  priority: Priority;
  status: ContentRequestStatus;
  brandId: string;
  requestedById: string;
  assigneeId: string | null;
  dueDate: string; // ISO date
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface Task {
  id: string;
  title: string;
  contentRequestId: string | null;
  assigneeId: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  createdAt: string;
}

export type AssetType = 'image' | 'video' | 'document' | 'other';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  url: string;
  thumbColor: string;
  contentRequestId: string | null;
  uploadedById: string;
  sizeKb: number;
  createdAt: string;
}

export interface ApprovalDecision {
  id: string;
  contentRequestId: string;
  decision: 'approved' | 'rejected';
  comment: string;
  decidedById: string;
  decidedAt: string;
}

export interface PerformanceEntry {
  id: string;
  contentRequestId: string;
  platform: Channel;
  date: string;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
}

export interface AppData {
  users: MockUser[];
  brands: Brand[];
  contentRequests: ContentRequest[];
  tasks: Task[];
  assets: Asset[];
  approvalDecisions: ApprovalDecision[];
  performanceEntries: PerformanceEntry[];
}
