import type { Currency, Debt, DebtStatus } from '../types';

export const CURRENCY_LABELS: Record<Currency, { symbol: string; name: string }> = {
  SAR: { symbol: 'ر.س', name: 'ريال سعودي' },
  USD: { symbol: '$', name: 'دولار أمريكي' },
  EUR: { symbol: '€', name: 'يورو' },
  AED: { symbol: 'د.إ', name: 'درهم إماراتي' },
  EGP: { symbol: 'ج.م', name: 'جنيه مصري' },
  KWD: { symbol: 'د.ك', name: 'دينار كويتي' },
};

export function formatMoney(amount: number, currency: Currency = 'SAR'): string {
  const sym = CURRENCY_LABELS[currency]?.symbol || '';
  return `${amount.toLocaleString('ar-SA', { maximumFractionDigits: 2 })} ${sym}`;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateShort(ts: number): string {
  return new Date(ts).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
}

export function daysUntil(ts: number): number {
  const diff = ts - Date.now();
  return Math.ceil(diff / 86400000);
}

export function getDebtStatus(debt: Debt): DebtStatus {
  if (debt.paidAmount >= debt.amount) return 'paid';
  if (debt.dueDate < Date.now()) return 'overdue';
  if (debt.paidAmount > 0) return 'partial';
  return 'pending';
}

export const STATUS_LABELS: Record<DebtStatus, string> = {
  pending: 'معلق',
  partial: 'مدفوع جزئياً',
  paid: 'مسدد',
  overdue: 'متأخر',
};

export const STATUS_COLORS: Record<DebtStatus, { bg: string; text: string; ring: string }> = {
  pending: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-300', ring: 'ring-amber-500' },
  partial: { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-300', ring: 'ring-blue-500' },
  paid: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-500' },
  overdue: { bg: 'bg-rose-100 dark:bg-rose-500/20', text: 'text-rose-700 dark:text-rose-300', ring: 'ring-rose-500' },
};
