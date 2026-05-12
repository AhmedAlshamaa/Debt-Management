import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { Card, Badge, ProgressBar, EmptyState, Button } from '../components/UI';
import { SearchIcon, WalletIcon, PlusIcon } from '../components/Icons';
import { formatMoney, formatDateShort, daysUntil, getDebtStatus, STATUS_LABELS } from '../utils/format';
import type { Debt, DebtStatus, DebtType } from '../types';

interface Props {
  onOpenDebt: (id: string) => void;
  onAddDebt: () => void;
}

const FILTERS: { key: 'all' | DebtType; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'owed_to_me', label: 'لي' },
  { key: 'i_owe', label: 'عليّ' },
];

const STATUS_FILTERS: { key: 'all' | DebtStatus; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'pending', label: 'معلق' },
  { key: 'partial', label: 'جزئي' },
  { key: 'paid', label: 'مسدد' },
  { key: 'overdue', label: 'متأخر' },
];

export function Debts({ onOpenDebt, onAddDebt }: Props) {
  const { state } = useStore();
  const { debts, customers } = state;
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | DebtType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | DebtStatus>('all');

  const filtered = useMemo(() => {
    return debts.filter((d) => {
      if (typeFilter !== 'all' && d.type !== typeFilter) return false;
      if (statusFilter !== 'all' && getDebtStatus(d) !== statusFilter) return false;
      if (search) {
        const c = customers.find((x) => x.id === d.customerId);
        const q = search.toLowerCase();
        return (c?.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
      }
      return true;
    }).sort((a, b) => b.createdAt - a.createdAt);
  }, [debts, customers, typeFilter, statusFilter, search]);

  const getCustomer = (id: string) => customers.find((c) => c.id === id);

  const totals = useMemo(() => {
    const owed = filtered.filter(d => d.type === 'owed_to_me').reduce((s,d)=>s+(d.amount-d.paidAmount),0);
    const owe = filtered.filter(d => d.type === 'i_owe').reduce((s,d)=>s+(d.amount-d.paidAmount),0);
    return { owed, owe };
  }, [filtered]);

  return (
    <div className="pb-28 min-h-full">
      <div className="bg-white dark:bg-slate-900 px-5 pt-12 pb-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">الديون</h1>
          <button onClick={onAddDebt} className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 no-tap-highlight active:scale-95">
            <PlusIcon size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="بحث عن عميل أو وصف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-0 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Type filter */}
        <div className="flex gap-2 mb-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setTypeFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition no-tap-highlight ${
                typeFilter === f.key
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {/* Status filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap border transition no-tap-highlight ${
                statusFilter === f.key
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="px-5 mt-4 grid grid-cols-2 gap-3">
        <Card className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30">
          <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium mb-0.5">إجمالي لي</p>
          <p className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">{formatMoney(totals.owed)}</p>
        </Card>
        <Card className="p-3 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30">
          <p className="text-[10px] text-rose-700 dark:text-rose-300 font-medium mb-0.5">إجمالي عليّ</p>
          <p className="text-base font-extrabold text-rose-700 dark:text-rose-300">{formatMoney(totals.owe)}</p>
        </Card>
      </div>

      {/* List */}
      <div className="px-5 mt-4 space-y-2">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<WalletIcon size={56} />}
            title="لا توجد ديون"
            description="ابدأ بإضافة دين جديد لمتابعته"
            action={<Button icon={<PlusIcon size={16} />} onClick={onAddDebt}>إضافة دين</Button>}
          />
        ) : (
          filtered.map((d) => (
            <DebtCard key={d.id} debt={d} customer={getCustomer(d.customerId)} onClick={() => onOpenDebt(d.id)} />
          ))
        )}
      </div>
    </div>
  );
}

function DebtCard({ debt, customer, onClick }: { debt: Debt; customer: any; onClick: () => void }) {
  const status = getDebtStatus(debt);
  const isCredit = debt.type === 'owed_to_me';
  const days = daysUntil(debt.dueDate);

  return (
    <Card className="p-4" onClick={onClick}>
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
          isCredit ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-rose-50 dark:bg-rose-500/10'
        }`}>
          {customer?.avatar || '👤'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{customer?.name || 'غير معروف'}</p>
              <p className="text-xs text-slate-500 truncate">{debt.description}</p>
            </div>
            <div className="text-left shrink-0">
              <p className={`text-base font-extrabold ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatMoney(debt.amount, debt.currency)}
              </p>
              <p className="text-[10px] text-slate-400">{formatDateShort(debt.dueDate)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <ProgressBar
              value={debt.paidAmount}
              max={debt.amount}
              color={status === 'paid' ? 'emerald' : status === 'overdue' ? 'rose' : status === 'partial' ? 'indigo' : 'amber'}
            />
            <span className="text-[10px] font-medium text-slate-500 shrink-0">
              {Math.round((debt.paidAmount / debt.amount) * 100)}%
            </span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <Badge color={status === 'paid' ? 'green' : status === 'overdue' ? 'red' : status === 'partial' ? 'blue' : 'amber'}>
              {STATUS_LABELS[status]}
            </Badge>
            {status !== 'paid' && (
              <span className={`text-[10px] font-medium ${days < 0 ? 'text-rose-600' : days <= 3 ? 'text-amber-600' : 'text-slate-500'}`}>
                {days < 0 ? `متأخر ${Math.abs(days)} يوم` : days === 0 ? 'مستحق اليوم' : `متبقي ${days} يوم`}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
