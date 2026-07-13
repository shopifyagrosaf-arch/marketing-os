import { addDays, formatISO, subDays } from 'date-fns';
import type {
  Asset,
  ContentRequest,
  MockUser,
  PerformanceEntry,
  Task,
} from './types';

const iso = (d: Date) => formatISO(d, { representation: 'date' });
const today = new Date();

export const SEED_USERS: MockUser[] = [
  { id: 'u1', name: 'Aisha Khan', email: 'aisha@agrosaf.com', role: 'Admin', color: '#2a78d6', status: 'active' },
  { id: 'u2', name: 'Rohan Mehta', email: 'rohan@agrosaf.com', role: 'Marketing Head', color: '#1baf7a', status: 'active' },
  { id: 'u3', name: 'Priya Nair', email: 'priya@agrosaf.com', role: 'Brand Manager', color: '#eda100', status: 'active' },
  { id: 'u4', name: 'Farhan Ali', email: 'farhan@agrosaf.com', role: 'Content Writer', color: '#4a3aa7', status: 'active' },
  { id: 'u5', name: 'Sara Iqbal', email: 'sara@agrosaf.com', role: 'Content Writer', color: '#e34948', status: 'active' },
  { id: 'u6', name: 'Imran Sheikh', email: 'imran@agrosaf.com', role: 'Viewer', color: '#eb6834', status: 'invited' },
];

export const SEED_CONTENT_REQUESTS: ContentRequest[] = [
  {
    id: 'cr1',
    title: 'World Diabetes Day carousel',
    description: 'Educational carousel on early screening, for Instagram + LinkedIn.',
    contentType: 'Social carousel',
    channel: 'Instagram',
    priority: 'High',
    status: 'In Review',
    requestedById: 'u3',
    assigneeId: 'u4',
    dueDate: iso(addDays(today, 3)),
    createdAt: iso(subDays(today, 5)),
    updatedAt: iso(subDays(today, 1)),
  },
  {
    id: 'cr2',
    title: 'Monsoon wellness blog post',
    description: 'SEO blog on immunity products for the monsoon season.',
    contentType: 'Blog post',
    channel: 'Website',
    priority: 'Medium',
    status: 'Draft',
    requestedById: 'u2',
    assigneeId: 'u5',
    dueDate: iso(addDays(today, 7)),
    createdAt: iso(subDays(today, 2)),
    updatedAt: iso(subDays(today, 2)),
  },
  {
    id: 'cr3',
    title: 'New hospital wing launch post',
    description: 'Announcement post + GMB update for the new cardiac wing.',
    contentType: 'Announcement',
    channel: 'Google Business',
    priority: 'Urgent',
    status: 'Submitted',
    requestedById: 'u2',
    assigneeId: 'u4',
    dueDate: iso(addDays(today, 1)),
    createdAt: iso(subDays(today, 1)),
    updatedAt: iso(subDays(today, 1)),
  },
  {
    id: 'cr4',
    title: 'Product education reel — Alosafe syrup',
    description: '30s reel explaining dosage and usage for caregivers.',
    contentType: 'Video script',
    channel: 'Instagram',
    priority: 'Medium',
    status: 'Approved',
    requestedById: 'u3',
    assigneeId: 'u5',
    dueDate: iso(addDays(today, 10)),
    createdAt: iso(subDays(today, 8)),
    updatedAt: iso(subDays(today, 3)),
  },
  {
    id: 'cr5',
    title: 'Weekly newsletter — July issue',
    description: 'Email newsletter covering all four brands.',
    contentType: 'Email',
    channel: 'Email',
    priority: 'Low',
    status: 'Published',
    requestedById: 'u2',
    assigneeId: 'u4',
    dueDate: iso(subDays(today, 2)),
    createdAt: iso(subDays(today, 12)),
    updatedAt: iso(subDays(today, 2)),
  },
  {
    id: 'cr6',
    title: 'Doctor testimonial video',
    description: 'Short testimonial for YouTube from a partner cardiologist.',
    contentType: 'Video script',
    channel: 'YouTube',
    priority: 'High',
    status: 'Rejected',
    requestedById: 'u3',
    assigneeId: 'u5',
    dueDate: iso(addDays(today, 5)),
    createdAt: iso(subDays(today, 6)),
    updatedAt: iso(subDays(today, 1)),
  },
  {
    id: 'cr7',
    title: 'Festival greetings post — Independence Day',
    description: 'Brand-neutral festive post across Instagram + Facebook.',
    contentType: 'Social post',
    channel: 'Facebook',
    priority: 'Low',
    status: 'Draft',
    requestedById: 'u4',
    assigneeId: null,
    dueDate: iso(addDays(today, 14)),
    createdAt: iso(today),
    updatedAt: iso(today),
  },
];

export const SEED_TASKS: Task[] = [
  { id: 't1', title: 'Write caption + hashtags for diabetes carousel', contentRequestId: 'cr1', assigneeId: 'u4', status: 'review', priority: 'High', dueDate: iso(addDays(today, 2)), createdAt: iso(subDays(today, 4)) },
  { id: 't2', title: 'Design 5 carousel slides', contentRequestId: 'cr1', assigneeId: 'u5', status: 'in_progress', priority: 'High', dueDate: iso(addDays(today, 3)), createdAt: iso(subDays(today, 3)) },
  { id: 't3', title: 'Draft monsoon blog outline', contentRequestId: 'cr2', assigneeId: 'u5', status: 'todo', priority: 'Medium', dueDate: iso(addDays(today, 4)), createdAt: iso(subDays(today, 1)) },
  { id: 't4', title: 'Get GMB copy approved', contentRequestId: 'cr3', assigneeId: 'u2', status: 'in_progress', priority: 'Urgent', dueDate: iso(addDays(today, 1)), createdAt: iso(today) },
  { id: 't5', title: 'Storyboard product reel', contentRequestId: 'cr4', assigneeId: 'u5', status: 'done', priority: 'Medium', dueDate: iso(subDays(today, 1)), createdAt: iso(subDays(today, 7)) },
  { id: 't6', title: 'Schedule newsletter send', contentRequestId: 'cr5', assigneeId: 'u4', status: 'done', priority: 'Low', dueDate: iso(subDays(today, 2)), createdAt: iso(subDays(today, 10)) },
  { id: 't7', title: 'Revise testimonial script per legal notes', contentRequestId: 'cr6', assigneeId: 'u5', status: 'todo', priority: 'High', dueDate: iso(addDays(today, 4)), createdAt: iso(subDays(today, 1)) },
  { id: 't8', title: 'Source festival greeting template', contentRequestId: 'cr7', assigneeId: 'u4', status: 'todo', priority: 'Low', dueDate: iso(addDays(today, 12)), createdAt: iso(today) },
];

export const SEED_ASSETS: Asset[] = [
  { id: 'a1', name: 'diabetes-slide-1.png', type: 'image', url: '', thumbColor: '#2a78d6', contentRequestId: 'cr1', uploadedById: 'u5', sizeKb: 842, createdAt: iso(subDays(today, 2)) },
  { id: 'a2', name: 'diabetes-slide-2.png', type: 'image', url: '', thumbColor: '#1baf7a', contentRequestId: 'cr1', uploadedById: 'u5', sizeKb: 913, createdAt: iso(subDays(today, 2)) },
  { id: 'a3', name: 'hospital-wing-hero.jpg', type: 'image', url: '', thumbColor: '#eda100', contentRequestId: 'cr3', uploadedById: 'u4', sizeKb: 1204, createdAt: iso(subDays(today, 1)) },
  { id: 'a4', name: 'product-reel-draft.mp4', type: 'video', url: '', thumbColor: '#4a3aa7', contentRequestId: 'cr4', uploadedById: 'u5', sizeKb: 15230, createdAt: iso(subDays(today, 4)) },
  { id: 'a5', name: 'newsletter-july.pdf', type: 'document', url: '', thumbColor: '#e34948', contentRequestId: 'cr5', uploadedById: 'u4', sizeKb: 320, createdAt: iso(subDays(today, 6)) },
  { id: 'a6', name: 'brand-logo-pack.zip', type: 'other', url: '', thumbColor: '#eb6834', contentRequestId: null, uploadedById: 'u1', sizeKb: 4096, createdAt: iso(subDays(today, 20)) },
];

const platforms: Array<ContentRequest['channel']> = ['Instagram', 'Facebook', 'LinkedIn', 'Google Business', 'YouTube'];
export const SEED_PERFORMANCE: PerformanceEntry[] = Array.from({ length: 14 }).map((_, i) => {
  const d = subDays(today, 13 - i);
  const base = 400 + i * 35;
  return {
    id: `p${i + 1}`,
    contentRequestId: SEED_CONTENT_REQUESTS[i % SEED_CONTENT_REQUESTS.length].id,
    platform: platforms[i % platforms.length],
    date: iso(d),
    reach: base + Math.round(Math.sin(i) * 60) + 500,
    likes: Math.round((base + 200) / 8),
    comments: Math.round((base + 200) / 40),
    shares: Math.round((base + 200) / 60),
    clicks: Math.round((base + 200) / 15),
  };
});
