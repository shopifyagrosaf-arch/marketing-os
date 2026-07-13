'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  SEED_ASSETS,
  SEED_BRANDS,
  SEED_CONTENT_REQUESTS,
  SEED_PERFORMANCE,
  SEED_TASKS,
  SEED_USERS,
} from './seed';
import type {
  Asset,
  ApprovalDecision,
  AppData,
  Brand,
  ContentRequest,
  MockUser,
  PerformanceEntry,
  Task,
} from './types';

const STORAGE_KEY = 'agrosaf-mvp-data-v2';
const SESSION_COOKIE = 'mock_user_id';

function seedData(): AppData {
  return {
    users: SEED_USERS,
    brands: SEED_BRANDS,
    contentRequests: SEED_CONTENT_REQUESTS,
    tasks: SEED_TASKS,
    assets: SEED_ASSETS,
    approvalDecisions: [],
    performanceEntries: SEED_PERFORMANCE,
  };
}

function loadInitial(): AppData {
  if (typeof window === 'undefined') return seedData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppData;
  } catch {
    // fall through to seed data
  }
  return seedData();
}

function setCookie(name: string, value: string, days = 30) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
}
function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}
function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}${idCounter}`;
}

interface MockStoreValue {
  data: AppData;
  currentUser: MockUser | null;
  login: (userId: string) => void;
  logout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  addContentRequest: (input: Omit<ContentRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => ContentRequest;
  updateContentRequest: (id: string, patch: Partial<ContentRequest>) => void;
  deleteContentRequest: (id: string) => void;

  addTask: (input: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  addAsset: (input: Omit<Asset, 'id' | 'createdAt'>) => Asset;
  deleteAsset: (id: string) => void;

  decideApproval: (contentRequestId: string, decision: 'approved' | 'rejected', comment: string) => void;

  addPerformanceEntry: (input: Omit<PerformanceEntry, 'id'>) => void;

  addUser: (input: Omit<MockUser, 'id'>) => MockUser;
  updateUser: (id: string, patch: Partial<MockUser>) => void;
  deleteUser: (id: string) => void;

  addBrand: (input: Omit<Brand, 'id' | 'createdAt'>) => Brand;
  updateBrand: (id: string, patch: Partial<Brand>) => void;
  deleteBrand: (id: string) => void;
}

const MockStoreContext = createContext<MockStoreValue | null>(null);

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadInitial);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCurrentUserId(readCookie(SESSION_COOKIE));
    const storedTheme = window.localStorage.getItem('agrosaf-theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    setTheme(storedTheme === 'dark' || (!storedTheme && prefersDark) ? 'dark' : 'light');
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('agrosaf-theme', theme);
  }, [theme, hydrated]);

  const login = useCallback((userId: string) => {
    setCookie(SESSION_COOKIE, userId);
    setCurrentUserId(userId);
  }, []);

  const logout = useCallback(() => {
    clearCookie(SESSION_COOKIE);
    setCurrentUserId(null);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const addContentRequest = useCallback<MockStoreValue['addContentRequest']>((input) => {
    const now = new Date().toISOString();
    const record: ContentRequest = { ...input, id: nextId('cr'), status: 'Draft', createdAt: now, updatedAt: now };
    setData((d) => ({ ...d, contentRequests: [record, ...d.contentRequests] }));
    return record;
  }, []);

  const updateContentRequest = useCallback<MockStoreValue['updateContentRequest']>((id, patch) => {
    setData((d) => ({
      ...d,
      contentRequests: d.contentRequests.map((cr) =>
        cr.id === id ? { ...cr, ...patch, updatedAt: new Date().toISOString() } : cr,
      ),
    }));
  }, []);

  const deleteContentRequest = useCallback<MockStoreValue['deleteContentRequest']>((id) => {
    setData((d) => ({ ...d, contentRequests: d.contentRequests.filter((cr) => cr.id !== id) }));
  }, []);

  const addTask = useCallback<MockStoreValue['addTask']>((input) => {
    const record: Task = { ...input, id: nextId('t'), createdAt: new Date().toISOString() };
    setData((d) => ({ ...d, tasks: [record, ...d.tasks] }));
    return record;
  }, []);

  const updateTask = useCallback<MockStoreValue['updateTask']>((id, patch) => {
    setData((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  }, []);

  const deleteTask = useCallback<MockStoreValue['deleteTask']>((id) => {
    setData((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) }));
  }, []);

  const addAsset = useCallback<MockStoreValue['addAsset']>((input) => {
    const record: Asset = { ...input, id: nextId('a'), createdAt: new Date().toISOString() };
    setData((d) => ({ ...d, assets: [record, ...d.assets] }));
    return record;
  }, []);

  const deleteAsset = useCallback<MockStoreValue['deleteAsset']>((id) => {
    setData((d) => ({ ...d, assets: d.assets.filter((a) => a.id !== id) }));
  }, []);

  const decideApproval = useCallback<MockStoreValue['decideApproval']>((contentRequestId, decision, comment) => {
    const entry: ApprovalDecision = {
      id: nextId('ap'),
      contentRequestId,
      decision,
      comment,
      decidedById: currentUserId ?? 'u1',
      decidedAt: new Date().toISOString(),
    };
    setData((d) => ({
      ...d,
      approvalDecisions: [entry, ...d.approvalDecisions],
      contentRequests: d.contentRequests.map((cr) =>
        cr.id === contentRequestId
          ? { ...cr, status: decision === 'approved' ? 'Approved' : 'Rejected', updatedAt: entry.decidedAt }
          : cr,
      ),
    }));
  }, [currentUserId]);

  const addPerformanceEntry = useCallback<MockStoreValue['addPerformanceEntry']>((input) => {
    const record: PerformanceEntry = { ...input, id: nextId('p') };
    setData((d) => ({ ...d, performanceEntries: [record, ...d.performanceEntries] }));
  }, []);

  const addUser = useCallback<MockStoreValue['addUser']>((input) => {
    const record: MockUser = { ...input, id: nextId('u') };
    setData((d) => ({ ...d, users: [...d.users, record] }));
    return record;
  }, []);

  const updateUser = useCallback<MockStoreValue['updateUser']>((id, patch) => {
    setData((d) => ({ ...d, users: d.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }));
  }, []);

  const deleteUser = useCallback<MockStoreValue['deleteUser']>((id) => {
    setData((d) => ({ ...d, users: d.users.filter((u) => u.id !== id) }));
  }, []);

  const addBrand = useCallback<MockStoreValue['addBrand']>((input) => {
    const record: Brand = { ...input, id: nextId('b'), createdAt: new Date().toISOString() };
    setData((d) => ({ ...d, brands: [...d.brands, record] }));
    return record;
  }, []);

  const updateBrand = useCallback<MockStoreValue['updateBrand']>((id, patch) => {
    setData((d) => ({ ...d, brands: d.brands.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
  }, []);

  const deleteBrand = useCallback<MockStoreValue['deleteBrand']>((id) => {
    setData((d) => ({ ...d, brands: d.brands.filter((b) => b.id !== id) }));
  }, []);

  const currentUser = useMemo(
    () => data.users.find((u) => u.id === currentUserId) ?? null,
    [data.users, currentUserId],
  );

  const value = useMemo<MockStoreValue>(
    () => ({
      data,
      currentUser,
      login,
      logout,
      theme,
      toggleTheme,
      addContentRequest,
      updateContentRequest,
      deleteContentRequest,
      addTask,
      updateTask,
      deleteTask,
      addAsset,
      deleteAsset,
      decideApproval,
      addPerformanceEntry,
      addUser,
      updateUser,
      deleteUser,
      addBrand,
      updateBrand,
      deleteBrand,
    }),
    [
      data,
      currentUser,
      login,
      logout,
      theme,
      toggleTheme,
      addContentRequest,
      updateContentRequest,
      deleteContentRequest,
      addTask,
      updateTask,
      deleteTask,
      addAsset,
      deleteAsset,
      decideApproval,
      addPerformanceEntry,
      addUser,
      updateUser,
      deleteUser,
      addBrand,
      updateBrand,
      deleteBrand,
    ],
  );

  return <MockStoreContext.Provider value={value}>{children}</MockStoreContext.Provider>;
}

export function useMockStore() {
  const ctx = useContext(MockStoreContext);
  if (!ctx) throw new Error('useMockStore must be used within MockDataProvider');
  return ctx;
}
