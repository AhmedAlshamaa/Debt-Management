import { useMemo } from 'react';
import { useStore } from '../store';
import { Card, Badge, ProgressBar } from '../components/UI';
import { TrendUpIcon, TrendDownIcon, BellIcon, WalletIcon, ClockIcon, ArrowLeftIcon } from '../components/Icons';
import { formatMoney, formatDateShort, daysUntil, getDebtStatus, STATUS_LABELS } from '../utils/format';
import type { Debt } from '../types';

interface Props {
  onAddDebt: () => void;
  onOpenDebt: (id: string) => void;
  onViewAll: () => void;
}

export function Dashboard({ onAddDebt, onOpenDebt, onViewAll }: Props) {
  const { state } = useStore();
  const { user, debts, customers } = state;

  const stats = useMemo(() => {
    const owedToMe = debts.filter((d) => d.type === 'owed_to_me');
    const iOwe = debts.filter((d) => d.type === 'i_owe');

    const totalOwedToMe = owedToMe.reduce((s, d) => s + (d.amount - d.paidAmount), 0);
    const totalIOwe = iOwe.reduce((s, d) => s + (d.amount - d.paidAmount), 0);
    const collected = debts.reduce((s, d) => s + d.paidAmount, 0);
    const overdue = debts.filter((d) => getDebtStatus(d) === 'overdue').length;

    return { totalOwedToMe, totalIOwe, collected, overdue, net: totalOwedToMe - totalIOwe };
  }, [debts]);

  const upcomingReminders = useMemo(() => {
    return debts
      .filter((d) => getDebtStatus(d) !== 'paid')
      .filter((d) => {
        const days = daysUntil(d.dueDate);
        return days <= 7;
      })
      .sort((a, b) => a.dueDate - b.dueDate)
      .slice(0, 3);
  }, [debts]);

  const recentDebts = [...debts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);

  const getCustomer = (id: string) => customers.find((c) => c.id === id);

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 text-white px-5 pt-12 pb-20 rounded-b-[2rem] relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
        <div className="relative flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl ring-2 ring-white/30">
              {user?.avatar || '👤'}
            </div>
            <div>
              <p className="text-xs text-white/70">مرحباً بعودتك،</p>
              <p className="font-bold text-base">{user?.name}</p>
            </div>
          </div>
          <button className="relative w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center no-tap-highlight">
            <BellIcon size={20} />
            {stats.overdue > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {stats.overdue}
              </span>
            )}
          </button>
        </div>

        {/* Net balance card */}
        <div className="relative">
          <p className="text-white/70 text-xs mb-1">صافي الرصيد</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-extrabold tracking-tight">
              {formatMoney(Math.abs(stats.net))}
            </h2>
            {stats.net >= 0 ? (
              <Badge color="green">
                <TrendUpIcon size={12} className="ml-1" /> دائن
              </Badge>
            ) : (
              <Badge color="red">
                <TrendDownIcon size={12} className="ml-1" /> مدين
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stats cards floating */}
      <div className="px-5 -mt-12 relative z-10 grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendUpIcon size={18} />
            </div>
            <Badge color="green">لي</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">المستحق لي</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{formatMoney(stats.totalOwedToMe)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <TrendDownIcon size={18} />
            </div>
            <Badge color="red">عليّ</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">المستحق عليّ</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{formatMoney(stats.totalIOwe)}</p>
        </Card>
      </div>

      {/* Quick stats row */}
      <div className="px-5 mt-3 grid grid-cols-2 gap-3">
        <Card className="p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <WalletIcon size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-500">المحصّل</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{formatMoney(stats.collected)}</p>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <ClockIcon size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-500">متأخرة</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{stats.overdue} ديون</p>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="px-5 mt-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">إجراءات سريعة</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: '➕', label: 'دين جديد', onClick: onAddDebt, bg: 'bg-indigo-500' },
            { icon: '💰', label: 'تحصيل', onClick: onViewAll, bg: 'bg-emerald-500' },
            { icon: '📊', label: 'التقارير', onClick: () => {}, bg: 'bg-blue-500' },
            { icon: '📤', label: 'مشاركة', onClick: () => {}, bg: 'bg-amber-500' },
          ].map((a, i) => (
            <button
              key={i}
              onClick={a.onClick}
              className="flex flex-col items-center gap-1.5 no-tap-highlight active:scale-95 transition"
            >
              <div className={`w-12 h-12 rounded-2xl ${a.bg} flex items-center justify-center text-xl shadow-lg shadow-black/5`}>
                {a.icon}
              </div>
              <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming reminders */}
      {upcomingReminders.length > 0 && (
        <div className="px-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BellIcon size={16} className="text-amber-500" />
              تذكيرات قادمة
            </h3>
          </div>
          <div className="space-y-2">
            {upcomingReminders.map((d) => {
              const c = getCustomer(d.customerId);
              const days = daysUntil(d.dueDate);
              return (
                <Card key={d.id} className="p-3 flex items-center gap-3" onClick={() => onOpenDebt(d.id)}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    days < 0 ? 'bg-rose-100 dark:bg-rose-500/20' : 'bg-amber-100 dark:bg-amber-500/20'
                  }`}>
                    {c?.avatar || '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{c?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{d.description}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{formatMoney(d.amount - d.paidAmount, d.currency)}</p>
                    <p className={`text-[10px] font-medium ${days < 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                      {days < 0 ? `متأخر ${Math.abs(days)} أيام` : days === 0 ? 'اليوم' : `بعد ${days} أيام`}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent debts */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">آخر الديون</h3>
          <button onClick={onViewAll} className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
            عرض الكل <ArrowLeftIcon size={14} />
          </button>
        </div>
        <div className="space-y-2">
          {recentDebts.map((d) => (
            <DebtListItem key={d.id} debt={d} customer={getCustomer(d.customerId)} onClick={() => onOpenDebt(d.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DebtListItem({ debt, customer, onClick }: { debt: Debt; customer: any; onClick: () => void }) {
  const status = getDebtStatus(debt);
  const isCredit = debt.type === 'owed_to_me';

  return (
    <Card className="p-4" onClick={onClick}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">
          {customer?.avatar || '👤'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{customer?.name || 'غير معروف'}</p>
            <p className={`text-sm font-extrabold ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isCredit ? '+' : '-'}{formatMoney(debt.amount, debt.currency)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 truncate">{debt.description}</p>
            <span className="text-[10px] text-slate-400 shrink-0 mr-2">{formatDateShort(debt.dueDate)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ProgressBar
          value={debt.paidAmount}
          max={debt.amount}
          color={status === 'paid' ? 'emerald' : status === 'overdue' ? 'rose' : status === 'partial' ? 'indigo' : 'amber'}
        />
        <span className="text-[10px] font-medium text-slate-500 shrink-0">{STATUS_LABELS[status]}</span>
      </div>
    </Card>
  );
}
