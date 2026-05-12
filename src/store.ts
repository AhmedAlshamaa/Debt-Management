import { useEffect, useState, useCallback } from 'react';
import type { Debt, Customer, AppSettings, User, Payment } from './types';

const STORAGE_KEY = 'debt_app_v1';

interface AppState {
  user: User | null;
  debts: Debt[];
  customers: Customer[];
  settings: AppSettings;
}

const defaultState: AppState = {
  user: null,
  debts: [],
  customers: [],
  settings: {
    darkMode: false,
    defaultCurrency: 'SAR',
    notificationsEnabled: true,
    biometricLock: false,
    cloudBackup: false,
    language: 'ar',
  },
};

// Demo seed data
function seedData(): AppState {
  const now = Date.now();
  const day = 86400000;

  const customers: Customer[] = [
    { id: 'c1', name: 'أحمد محمد', phone: '0551234567', email: 'ahmad@example.com', createdAt: now - 30 * day, avatar: '👨' },
    { id: 'c2', name: 'سارة العتيبي', phone: '0509876543', createdAt: now - 25 * day, avatar: '👩' },
    { id: 'c3', name: 'شركة النور التجارية', phone: '0112345678', email: 'info@alnoor.com', createdAt: now - 60 * day, avatar: '🏢' },
    { id: 'c4', name: 'خالد الحربي', phone: '0533344455', createdAt: now - 10 * day, avatar: '🧑' },
    { id: 'c5', name: 'فاطمة الزهراني', phone: '0566778899', createdAt: now - 5 * day, avatar: '👩‍💼' },
  ];

  const debts: Debt[] = [
    {
      id: 'd1', customerId: 'c1', type: 'owed_to_me', amount: 5000, paidAmount: 2000,
      currency: 'SAR', description: 'قرض شخصي', dueDate: now + 7 * day, createdAt: now - 20 * day,
      payments: [{ id: 'p1', debtId: 'd1', amount: 2000, date: now - 5 * day, note: 'دفعة أولى' }],
      reminderEnabled: true,
    },
    {
      id: 'd2', customerId: 'c2', type: 'owed_to_me', amount: 1500, paidAmount: 0,
      currency: 'SAR', description: 'بضاعة مباعة', dueDate: now - 3 * day, createdAt: now - 15 * day,
      payments: [], reminderEnabled: true,
    },
    {
      id: 'd3', customerId: 'c3', type: 'i_owe', amount: 12000, paidAmount: 12000,
      currency: 'SAR', description: 'فاتورة مستلزمات مكتبية', dueDate: now - 30 * day, createdAt: now - 60 * day,
      payments: [{ id: 'p2', debtId: 'd3', amount: 12000, date: now - 28 * day, note: 'سداد كامل' }],
      reminderEnabled: false,
    },
    {
      id: 'd4', customerId: 'c4', type: 'owed_to_me', amount: 800, paidAmount: 0,
      currency: 'SAR', description: 'إصلاح سيارة', dueDate: now + 15 * day, createdAt: now - 5 * day,
      payments: [], reminderEnabled: true,
    },
    {
      id: 'd5', customerId: 'c5', type: 'i_owe', amount: 3500, paidAmount: 1000,
      currency: 'SAR', description: 'استشارة قانونية', dueDate: now + 20 * day, createdAt: now - 4 * day,
      payments: [{ id: 'p3', debtId: 'd5', amount: 1000, date: now - 1 * day }],
      reminderEnabled: true,
    },
    {
      id: 'd6', customerId: 'c1', type: 'owed_to_me', amount: 2500, paidAmount: 2500,
      currency: 'SAR', description: 'ايجار شهري', dueDate: now - 60 * day, createdAt: now - 90 * day,
      payments: [{ id: 'p4', debtId: 'd6', amount: 2500, date: now - 55 * day }],
      reminderEnabled: false,
    },
  ];

  return { ...defaultState, customers, debts };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return seedData();
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

// Simple pub/sub store
let state: AppState = loadState();
const listeners = new Set<() => void>();

function setState(updater: (s: AppState) => AppState) {
  state = updater(state);
  saveState(state);
  listeners.forEach((l) => l());
}

export function useStore() {
  const [, force] = useState(0);
  useEffect(() => {
    const cb = () => force((x) => x + 1);
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  }, []);

  const login = useCallback((email: string, name?: string) => {
    setState((s) => ({ ...s, user: { name: name || email.split('@')[0], email, avatar: '👤' } }));
  }, []);

  const logout = useCallback(() => {
    setState((s) => ({ ...s, user: null }));
  }, []);

  const addDebt = useCallback((debt: Omit<Debt, 'id' | 'createdAt' | 'payments' | 'paidAmount'>) => {
    setState((s) => ({
      ...s,
      debts: [
        { ...debt, id: 'd' + Date.now(), createdAt: Date.now(), payments: [], paidAmount: 0 },
        ...s.debts,
      ],
    }));
  }, []);

  const updateDebt = useCallback((id: string, patch: Partial<Debt>) => {
    setState((s) => ({
      ...s,
      debts: s.debts.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    }));
  }, []);

  const deleteDebt = useCallback((id: string) => {
    setState((s) => ({ ...s, debts: s.debts.filter((d) => d.id !== id) }));
  }, []);

  const addPayment = useCallback((debtId: string, amount: number, note?: string) => {
    setState((s) => ({
      ...s,
      debts: s.debts.map((d) => {
        if (d.id !== debtId) return d;
        const payment: Payment = { id: 'p' + Date.now(), debtId, amount, date: Date.now(), note };
        return {
          ...d,
          payments: [...d.payments, payment],
          paidAmount: Math.min(d.amount, d.paidAmount + amount),
        };
      }),
    }));
  }, []);

  const addCustomer = useCallback((customer: Omit<Customer, 'id' | 'createdAt'>) => {
    setState((s) => ({
      ...s,
      customers: [
        { ...customer, id: 'c' + Date.now(), createdAt: Date.now() },
        ...s.customers,
      ],
    }));
  }, []);

  const updateCustomer = useCallback((id: string, patch: Partial<Customer>) => {
    setState((s) => ({
      ...s,
      customers: s.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      customers: s.customers.filter((c) => c.id !== id),
      debts: s.debts.filter((d) => d.customerId !== id),
    }));
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const resetDemo = useCallback(() => {
    setState(() => ({ ...seedData(), user: state.user, settings: state.settings }));
  }, []);

  return {
    state,
    login, logout,
    addDebt, updateDebt, deleteDebt, addPayment,
    addCustomer, updateCustomer, deleteCustomer,
    updateSettings, resetDemo,
  };
}
