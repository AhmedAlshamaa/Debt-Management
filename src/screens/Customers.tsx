import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { Card, EmptyState, Button } from '../components/UI';
import { SearchIcon, PlusIcon, UsersIcon, PhoneIcon, MailIcon, TrashIcon, EditIcon } from '../components/Icons';
import { formatMoney, getDebtStatus } from '../utils/format';
import { Modal } from '../components/Modal';
import { Input, Textarea } from '../components/UI';
import type { Customer } from '../types';

export function Customers() {
  const { state, addCustomer, updateCustomer, deleteCustomer } = useStore();
  const { customers, debts } = state;
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [viewing, setViewing] = useState<Customer | null>(null);

  const customerStats = useMemo(() => {
    const map = new Map<string, { total: number; active: number; balance: number }>();
    customers.forEach((c) => {
      const cd = debts.filter((d) => d.customerId === c.id);
      const active = cd.filter((d) => getDebtStatus(d) !== 'paid').length;
      const balance = cd.reduce((s, d) => s + (d.type === 'owed_to_me' ? (d.amount - d.paidAmount) : -(d.amount - d.paidAmount)), 0);
      map.set(c.id, { total: cd.length, active, balance });
    });
    return map;
  }, [customers, debts]);

  const filtered = customers.filter((c) =>
    !search || c.name.includes(search) || c.phone.includes(search) || (c.email || '').includes(search)
  );

  return (
    <div className="pb-28 min-h-full">
      <div className="bg-white dark:bg-slate-900 px-5 pt-12 pb-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">العملاء</h1>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 no-tap-highlight active:scale-95"
          >
            <PlusIcon size={18} />
          </button>
        </div>
        <div className="relative">
          <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-0 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="px-5 mt-4">
        <p className="text-xs text-slate-500 mb-3">{filtered.length} عميل</p>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<UsersIcon size={56} />}
            title="لا يوجد عملاء"
            description="ابدأ بإضافة عميل جديد"
            action={<Button icon={<PlusIcon size={16} />} onClick={() => { setEditing(null); setShowForm(true); }}>إضافة عميل</Button>}
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => {
              const stats = customerStats.get(c.id) || { total: 0, active: 0, balance: 0 };
              return (
                <Card key={c.id} className="p-4" onClick={() => setViewing(c)}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-2xl shadow-md">
                      {c.avatar || '👤'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{c.name}</p>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <PhoneIcon size={11} /> {c.phone}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-extrabold ${stats.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {stats.balance >= 0 ? '+' : '-'}{formatMoney(Math.abs(stats.balance))}
                      </p>
                      <p className="text-[10px] text-slate-400">{stats.active} نشط من {stats.total}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Customer details modal */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="تفاصيل العميل">
        {viewing && (() => {
          const stats = customerStats.get(viewing.id) || { total: 0, active: 0, balance: 0 };
          const cDebts = debts.filter((d) => d.customerId === viewing.id);
          return (
            <div className="space-y-4">
              <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-4xl shadow-lg mb-3">
                  {viewing.avatar || '👤'}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{viewing.name}</h3>
                <p className={`text-2xl font-extrabold mt-2 ${stats.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stats.balance >= 0 ? '+' : '-'}{formatMoney(Math.abs(stats.balance))}
                </p>
                <p className="text-xs text-slate-500">{stats.balance >= 0 ? 'يستحق له' : 'مستحق عليه'}</p>
              </div>

              <div className="space-y-2">
                <a href={`tel:${viewing.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center"><PhoneIcon size={16} /></div>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-500">هاتف</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{viewing.phone}</p>
                  </div>
                </a>
                {viewing.email && (
                  <a href={`mailto:${viewing.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center"><MailIcon size={16} /></div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-500">البريد</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{viewing.email}</p>
                    </div>
                  </a>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.total}</p>
                  <p className="text-[10px] text-slate-500">إجمالي</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10">
                  <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{stats.active}</p>
                  <p className="text-[10px] text-amber-600">نشط</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{stats.total - stats.active}</p>
                  <p className="text-[10px] text-emerald-600">مسدد</p>
                </div>
              </div>

              {cDebts.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">الديون ({cDebts.length})</p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {cDebts.map((d) => (
                      <div key={d.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{d.description}</p>
                          <p className="text-[10px] text-slate-500">{d.type === 'owed_to_me' ? 'لي' : 'عليّ'}</p>
                        </div>
                        <p className={`text-xs font-bold shrink-0 ${d.type === 'owed_to_me' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatMoney(d.amount - d.paidAmount, d.currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="secondary" fullWidth icon={<EditIcon size={16} />} onClick={() => { setEditing(viewing); setViewing(null); setShowForm(true); }}>تعديل</Button>
                <Button variant="danger" fullWidth icon={<TrashIcon size={16} />} onClick={() => { if (confirm('حذف العميل وجميع ديونه؟')) { deleteCustomer(viewing.id); setViewing(null); } }}>حذف</Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Form modal */}
      <CustomerForm
        open={showForm}
        editing={editing}
        onClose={() => setShowForm(false)}
        onSave={(c) => {
          if (editing) updateCustomer(editing.id, c);
          else addCustomer(c);
          setShowForm(false);
        }}
      />
    </div>
  );
}

function CustomerForm({ open, editing, onClose, onSave }: {
  open: boolean;
  editing: Customer | null;
  onClose: () => void;
  onSave: (c: Omit<Customer, 'id' | 'createdAt'>) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [avatar, setAvatar] = useState('👤');

  const AVATARS = ['👤', '👨', '👩', '🧑', '👨‍💼', '👩‍💼', '🧔', '👵', '🏢', '🏪'];

  // reset on open
  useState(() => {
    if (editing) {
      setName(editing.name); setPhone(editing.phone); setEmail(editing.email || ''); setNotes(editing.notes || ''); setAvatar(editing.avatar || '👤');
    }
  });

  // re-init when editing changes
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useMemo(() => {
    if (open) {
      setName(editing?.name || '');
      setPhone(editing?.phone || '');
      setEmail(editing?.email || '');
      setNotes(editing?.notes || '');
      setAvatar(editing?.avatar || '👤');
    }
  }, [open, editing]);

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'تعديل عميل' : 'عميل جديد'}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الصورة الرمزية</label>
          <div className="flex gap-2 flex-wrap">
            {AVATARS.map((a) => (
              <button key={a} onClick={() => setAvatar(a)}
                className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition ${
                  avatar === a ? 'bg-indigo-600 text-white scale-110' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >{a}</button>
            ))}
          </div>
        </div>
        <Input label="الاسم *" value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم العميل" />
        <Input label="الهاتف *" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xxxxxxxx" />
        <Input label="البريد الإلكتروني" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
        <Textarea label="ملاحظات" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي ملاحظات..." />
        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={onClose}>إلغاء</Button>
          <Button fullWidth disabled={!name || !phone} onClick={() => onSave({ name, phone, email: email || undefined, notes: notes || undefined, avatar })}>
            {editing ? 'حفظ' : 'إضافة'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
