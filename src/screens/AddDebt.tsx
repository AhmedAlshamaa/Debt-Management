import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Modal } from '../components/Modal';
import { Input, Textarea, Select, Button, Switch } from '../components/UI';
import { CURRENCY_LABELS } from '../utils/format';
import type { Currency, DebtType } from '../types';

export function AddDebtModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, addDebt } = useStore();
  const [type, setType] = useState<DebtType>('owed_to_me');
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>(state.settings.defaultCurrency);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reminder, setReminder] = useState(true);

  useEffect(() => {
    if (open) {
      setType('owed_to_me');
      setCustomerId(state.customers[0]?.id || '');
      setAmount('');
      setCurrency(state.settings.defaultCurrency);
      setDescription('');
      const d = new Date(); d.setDate(d.getDate() + 30);
      setDueDate(d.toISOString().split('T')[0]);
      setReminder(true);
    }
  }, [open, state.customers, state.settings.defaultCurrency]);

  const submit = () => {
    if (!customerId || !amount) return;
    addDebt({
      customerId,
      type,
      amount: parseFloat(amount),
      currency,
      description: description || 'دين',
      dueDate: new Date(dueDate).getTime(),
      reminderEnabled: reminder,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="إضافة دين جديد">
      <div className="space-y-4">
        {/* Type selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">نوع الدين</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setType('owed_to_me')}
              className={`p-3 rounded-xl border-2 transition no-tap-highlight active:scale-95 ${
                type === 'owed_to_me'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600'
              }`}
            >
              <div className="text-2xl mb-1">📥</div>
              <p className="text-xs font-bold">مستحق لي</p>
              <p className="text-[10px] opacity-70">شخص يدين لي</p>
            </button>
            <button
              onClick={() => setType('i_owe')}
              className={`p-3 rounded-xl border-2 transition no-tap-highlight active:scale-95 ${
                type === 'i_owe'
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600'
              }`}
            >
              <div className="text-2xl mb-1">📤</div>
              <p className="text-xs font-bold">مستحق عليّ</p>
              <p className="text-[10px] opacity-70">أنا مدين لشخص</p>
            </button>
          </div>
        </div>

        <Select label="العميل *" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
          <option value="">اختر عميل...</option>
          {state.customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>

        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <Input label="المبلغ *" type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <Select label="العملة" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
            {Object.entries(CURRENCY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.symbol}</option>
            ))}
          </Select>
        </div>

        <Textarea label="الوصف" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="مثل: قرض شخصي، فاتورة..." />

        <Input label="تاريخ الاستحقاق *" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">تذكير ذكي 🔔</p>
            <p className="text-xs text-slate-500">إشعار قبل موعد السداد</p>
          </div>
          <Switch checked={reminder} onChange={setReminder} />
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose}>إلغاء</Button>
          <Button fullWidth disabled={!customerId || !amount || !dueDate} onClick={submit}>إضافة</Button>
        </div>
      </div>
    </Modal>
  );
}
