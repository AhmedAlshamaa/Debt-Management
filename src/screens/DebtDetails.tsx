import { useState } from 'react';
import { useStore } from '../store';
import { Modal } from '../components/Modal';
import { Button, Input, Textarea, Badge, ProgressBar } from '../components/UI';
import { ArrowRightIcon, TrashIcon, BellIcon, PhoneIcon, MailIcon, CalendarIcon, CheckIcon, PlusIcon } from '../components/Icons';
import { formatMoney, formatDate, daysUntil, getDebtStatus, STATUS_LABELS } from '../utils/format';

export function DebtDetails({ debtId, onClose }: { debtId: string; onClose: () => void }) {
  const { state, deleteDebt, addPayment, updateDebt } = useStore();
  const debt = state.debts.find((d) => d.id === debtId);
  const customer = debt ? state.customers.find((c) => c.id === debt.customerId) : null;

  const [showPay, setShowPay] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');

  if (!debt || !customer) return null;

  const status = getDebtStatus(debt);
  const remaining = debt.amount - debt.paidAmount;
  const isCredit = debt.type === 'owed_to_me';
  const days = daysUntil(debt.dueDate);

  const handlePay = () => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return;
    addPayment(debt.id, Math.min(amt, remaining), payNote || undefined);
    setShowPay(false);
    setPayAmount('');
    setPayNote('');
  };

  const handleDelete = () => {
    if (confirm('هل تريد حذف هذا الدين؟')) {
      deleteDebt(debt.id);
      onClose();
    }
  };

  const handleSendReminder = () => {
    alert(`تم إرسال تذكير إلى ${customer.name} بقيمة ${formatMoney(remaining, debt.currency)}`);
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-50 dark:bg-slate-950 overflow-y-auto animate-slide-up">
      {/* Header */}
      <div className={`px-5 pt-12 pb-8 text-white relative overflow-hidden ${
        isCredit ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' : 'bg-gradient-to-br from-rose-500 to-rose-700'
      }`}>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="relative flex items-center justify-between mb-4">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center no-tap-highlight">
            <ArrowRightIcon size={20} />
          </button>
          <button onClick={handleDelete} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center no-tap-highlight">
            <TrashIcon size={18} />
          </button>
        </div>
        <p className="text-white/80 text-sm mb-1">{isCredit ? 'مستحق لي من' : 'مستحق عليّ لـ'}</p>
        <h2 className="text-2xl font-extrabold mb-3">{customer.name}</h2>
        <div className="flex items-baseline gap-2">
          <p className="text-4xl font-extrabold">{formatMoney(debt.amount, debt.currency)}</p>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Badge color={status === 'paid' ? 'green' : status === 'overdue' ? 'red' : 'amber'}>
            {STATUS_LABELS[status]}
          </Badge>
          {status !== 'paid' && (
            <span className="text-xs bg-white/20 backdrop-blur px-2 py-0.5 rounded-full">
              {days < 0 ? `متأخر ${Math.abs(days)} يوم` : days === 0 ? 'اليوم' : `بعد ${days} يوم`}
            </span>
          )}
        </div>
      </div>

      {/* Progress card */}
      <div className="px-5 -mt-5 relative z-10">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500">المسدد</p>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {formatMoney(debt.paidAmount, debt.currency)} / {formatMoney(debt.amount, debt.currency)}
            </p>
          </div>
          <ProgressBar value={debt.paidAmount} max={debt.amount} color={status === 'paid' ? 'emerald' : 'indigo'} />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs text-slate-500">المتبقي</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">{formatMoney(remaining, debt.currency)}</p>
            </div>
            {status !== 'paid' && (
              <Button icon={<PlusIcon size={16} />} onClick={() => setShowPay(true)}>إضافة دفعة</Button>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="px-5 mt-5 space-y-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">التفاصيل</h3>
          <DetailRow icon={<span className="text-lg">📝</span>} label="الوصف" value={debt.description} />
          <DetailRow icon={<CalendarIcon size={18} />} label="تاريخ الاستحقاق" value={formatDate(debt.dueDate)} />
          <DetailRow icon={<CalendarIcon size={18} />} label="تاريخ الإنشاء" value={formatDate(debt.createdAt)} />
          <DetailRow
            icon={<BellIcon size={18} />}
            label="التذكيرات"
            value={debt.reminderEnabled ? 'مفعّلة' : 'معطّلة'}
            action={
              <button
                onClick={() => updateDebt(debt.id, { reminderEnabled: !debt.reminderEnabled })}
                className="text-xs text-indigo-600 font-semibold"
              >
                {debt.reminderEnabled ? 'إيقاف' : 'تفعيل'}
              </button>
            }
          />
        </div>

        {/* Customer card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">معلومات العميل</h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-2xl shadow">
              {customer.avatar || '👤'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{customer.name}</p>
              <p className="text-xs text-slate-500">{customer.phone}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a href={`tel:${customer.phone}`} className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-xs font-semibold no-tap-highlight active:scale-95">
              <PhoneIcon size={14} /> اتصال
            </a>
            <a href={`https://wa.me/${customer.phone.replace(/\D/g,'')}`} target="_blank" className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-xs font-semibold no-tap-highlight active:scale-95">
              💬 واتساب
            </a>
            {customer.email && (
              <a href={`mailto:${customer.email}`} className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 text-xs font-semibold no-tap-highlight active:scale-95">
                <MailIcon size={14} /> بريد إلكتروني
              </a>
            )}
          </div>
        </div>

        {/* Payments history */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">سجل الدفعات</h3>
            <Badge color="blue">{debt.payments.length}</Badge>
          </div>
          {debt.payments.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">لا توجد دفعات بعد</p>
          ) : (
            <div className="space-y-2">
              {debt.payments.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                    <CheckIcon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{formatMoney(p.amount, debt.currency)}</p>
                    <p className="text-[10px] text-slate-500">{formatDate(p.date)}{p.note ? ` • ${p.note}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {status !== 'paid' && (
          <Button variant="secondary" fullWidth icon={<BellIcon size={16} />} onClick={handleSendReminder}>
            إرسال تذكير
          </Button>
        )}

        <div className="h-8" />
      </div>

      {/* Payment modal */}
      <Modal open={showPay} onClose={() => setShowPay(false)} title="إضافة دفعة">
        <div className="space-y-4">
          <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <p className="text-xs text-slate-500 mb-1">المبلغ المتبقي</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{formatMoney(remaining, debt.currency)}</p>
          </div>
          <Input label="مبلغ الدفعة *" type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="0.00" />
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPayAmount(remaining.toString())}>المبلغ كاملاً</Button>
            <Button variant="secondary" size="sm" onClick={() => setPayAmount((remaining/2).toString())}>النصف</Button>
          </div>
          <Textarea label="ملاحظة (اختياري)" value={payNote} onChange={(e) => setPayNote(e.target.value)} />
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" fullWidth onClick={() => setShowPay(false)}>إلغاء</Button>
            <Button variant="success" fullWidth onClick={handlePay}>تأكيد الدفع</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function DetailRow({ icon, label, value, action }: { icon: React.ReactNode; label: string; value: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-900 dark:text-white">{value}</p>
      </div>
      {action}
    </div>
  );
}
