export type Currency = 'SAR' | 'USD' | 'EUR' | 'AED' | 'EGP' | 'KWD';

export type DebtType = 'owed_to_me' | 'i_owe';
export type DebtStatus = 'pending' | 'partial' | 'paid' | 'overdue';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: number;
  avatar?: string; // emoji or color
}

export interface Payment {
  id: string;
  debtId: string;
  amount: number;
  date: number;
  note?: string;
}

export interface Debt {
  id: string;
  customerId: string;
  type: DebtType;
  amount: number;
  paidAmount: number;
  currency: Currency;
  description: string;
  dueDate: number;
  createdAt: number;
  payments: Payment[];
  reminderEnabled: boolean;
}

export interface AppSettings {
  darkMode: boolean;
  defaultCurrency: Currency;
  notificationsEnabled: boolean;
  biometricLock: boolean;
  cloudBackup: boolean;
  language: 'ar' | 'en';
}

export interface User {
  name: string;
  email: string;
  avatar: string;
}
