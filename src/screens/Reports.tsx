import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { Card, Badge } from '../components/UI';
import { TrendUpIcon, TrendDownIcon, DownloadIcon, FileIcon, ChartIcon } from '../components/Icons';
import { formatMoney, getDebtStatus, STATUS_LABELS, STATUS_COLORS } from '../utils/format';

type Period = 'week' | 'month' | 'year';

export function Reports() {
  const { state } = useStore();
  const { debts, customers } = state;
  const [period, setPeriod] = useState<Period>('month');

  const now = Date.now();
  const day = 86400000;
  const periodMs = { week: 7 * day, month: 30 * day, year: 365 * day }[period];

  const stats = useMemo(() => {
    const inPeriod = debts.filter((d) => d.createdAt >= now - periodMs);
    const totalOwed = debts.filter(d => d.type === 'owed_to_me').reduce((s,d) => s + (d.amount - d.paidAmount), 0);
    const totalIOwe = debts.filter(d => d.type === 'i_owe').reduce((s,d) => s + (d.amount - d.paidAmount), 0);
    const collected = debts.flatMap(d => d.payments).filter(p => p.date >= now - periodMs).reduce((s,p) => s+p.amount, 0);
    const newCount = inPeriod.length;
    const paidCount = debts.filter(d => getDebtStatus(d) === 'paid').length;
    const overdueCount = debts.filter(d => getDebtStatus(d) === 'overdue').length;

    // Status breakdown
    const byStatus: Record<string, number> = { pending: 0, partial: 0, paid: 0, overdue: 0 };
    debts.forEach(d => { byStatus[getDebtStatus(d)]++; });
    const total = debts.length || 1;

    // Top customers
    const customerTotals = new Map<string, number>();
    debts.forEach(d => {
      const cur = customerTotals.get(d.customerId) || 0;
      customerTotals.set(d.customerId, cur + (d.amount - d.paidAmount) * (d.type === 'owed_to_me' ? 1 : -1));
    });
    const topCustomers = Array.from(customerTotals.entries())
      .map(([id, amount]) => ({ customer: customers.find(c => c.id === id)!, amount }))
      .filter(x => x.customer && Math.abs(x.amount) > 0)
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 5);

    // Monthly trend (last 6 months)
    const monthly: { month: string; owed: number; collected: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
      const owed = debts.filter(x => x.createdAt >= start && x.createdAt < end).reduce((s,x) => s+x.amount, 0);
      const collected = debts.flatMap(x => x.payments).filter(p => p.date >= start && p.date < end).reduce((s,p) => s+p.amount, 0);
      monthly.push({
        month: d.toLocaleDateString('ar-SA', { month: 'short' }),
        owed, collected,
      });
    }

    return { totalOwed, totalIOwe, collected, newCount, paidCount, overdueCount, byStatus, total, topCustomers, monthly };
  }, [debts, customers, periodMs, now]);

  const maxMonth = Math.max(...stats.monthly.map(m => Math.max(m.owed, m.collected)), 1);

  const exportData = (type: 'pdf' | 'excel') => {
    alert(`جاري تصدير التقرير إلى ${type === 'pdf' ? 'PDF' : 'Excel'}... (محاكاة)`);
  };

  return (
    <div className="pb-28 min-h-full">
      <div className="bg-white dark:bg-slate-900 px-5 pt-12 pb-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">التقارير</h1>
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {(['week', 'month', 'year'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition no-tap-highlight ${
                period === p ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow' : 'text-slate-500'
              }`}
            >
              {p === 'week' ? 'أسبوع' : p === 'month' ? 'شهر' : 'سنة'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="px-5 mt-4 grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600">
              <TrendUpIcon size={16} />
            </div>
            <span className="text-xs text-slate-500">المحصّل</span>
          </div>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white">{formatMoney(stats.collected)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600">
              <ChartIcon size={16} />
            </div>
            <span className="text-xs text-slate-500">جديدة</span>
          </div>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white">{stats.newCount} دين</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600">✅</div>
            <span className="text-xs text-slate-500">مسددة</span>
          </div>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white">{stats.paidCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-600">
              <TrendDownIcon size={16} />
            </div>
            <span className="text-xs text-slate-500">متأخرة</span>
          </div>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white">{stats.overdueCount}</p>
        </Card>
      </div>

      {/* Monthly bar chart */}
      <div className="px-5 mt-5">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">آخر 6 أشهر</h3>
            <div className="flex gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-indigo-500 rounded-full" /> ديون</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full" /> محصّل</span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 h-40">
            {stats.monthly.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center gap-0.5 h-32">
                  <div
                    className="flex-1 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md min-h-[4px] transition-all"
                    style={{ height: `${(m.owed / maxMonth) * 100}%` }}
                    title={formatMoney(m.owed)}
                  />
                  <div
                    className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md min-h-[4px] transition-all"
                    style={{ height: `${(m.collected / maxMonth) * 100}%` }}
                    title={formatMoney(m.collected)}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-medium">{m.month}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Status pie/breakdown */}
      <div className="px-5 mt-4">
        <Card className="p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">توزيع الحالات</h3>
          <div className="flex items-center gap-4">
            <DonutChart data={stats.byStatus} total={stats.total} />
            <div className="flex-1 space-y-2">
              {(['pending', 'partial', 'paid', 'overdue'] as const).map((k) => {
                const pct = Math.round((stats.byStatus[k] / stats.total) * 100);
                const colors = STATUS_COLORS[k];
                return (
                  <div key={k} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${colors.bg.split(' ')[0].replace('bg-','bg-')} ring-2 ${colors.ring}`} />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{STATUS_LABELS[k]}</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{stats.byStatus[k]}</span>
                      <span className="text-slate-400 mr-1">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Top customers */}
      <div className="px-5 mt-4">
        <Card className="p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">أعلى العملاء</h3>
          {stats.topCustomers.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">لا توجد بيانات</p>
          ) : (
            <div className="space-y-2.5">
              {stats.topCustomers.map(({ customer, amount }, i) => (
                <div key={customer.id} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                    {i + 1}
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">
                    {customer.avatar || '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{customer.name}</p>
                    <Badge color={amount >= 0 ? 'green' : 'red'}>{amount >= 0 ? 'يستحق له' : 'مستحق عليه'}</Badge>
                  </div>
                  <p className={`text-sm font-bold ${amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatMoney(Math.abs(amount))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Export */}
      <div className="px-5 mt-4">
        <Card className="p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">تصدير التقرير</h3>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => exportData('pdf')} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 font-semibold text-sm no-tap-highlight active:scale-95 transition">
              <FileIcon size={18} /> PDF
            </button>
            <button onClick={() => exportData('excel')} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 font-semibold text-sm no-tap-highlight active:scale-95 transition">
              <DownloadIcon size={18} /> Excel
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function DonutChart({ data, total }: { data: Record<string, number>; total: number }) {
  const colors: Record<string, string> = {
    pending: '#f59e0b',
    partial: '#3b82f6',
    paid: '#10b981',
    overdue: '#ef4444',
  };
  const order = ['paid', 'partial', 'pending', 'overdue'];
  const r = 32;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#e5e7eb" className="dark:stroke-slate-800" strokeWidth="12" />
        {order.map((k) => {
          const val = data[k] || 0;
          if (!val) return null;
          const len = (val / total) * c;
          const el = (
            <circle
              key={k}
              cx="40" cy="40" r={r} fill="none"
              stroke={colors[k]} strokeWidth="12"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-extrabold text-slate-900 dark:text-white">{total}</span>
        <span className="text-[9px] text-slate-500">إجمالي</span>
      </div>
    </div>
  );
}
