import { useEffect, useState } from 'react';
import { useStore } from './store';
import { Login } from './screens/Login';
import { Dashboard } from './screens/Dashboard';
import { Debts } from './screens/Debts';
import { Customers } from './screens/Customers';
import { Reports } from './screens/Reports';
import { Settings } from './screens/Settings';
import { AddDebtModal } from './screens/AddDebt';
import { DebtDetails } from './screens/DebtDetails';
import { HomeIcon, WalletIcon, UsersIcon, ChartIcon, SettingsIcon, PlusIcon } from './components/Icons';
import { cn } from './utils/cn';

type Tab = 'home' | 'debts' | 'customers' | 'reports' | 'settings';

export default function App() {
  const { state } = useStore();
  const [tab, setTab] = useState<Tab>('home');
  const [showAdd, setShowAdd] = useState(false);
  const [openDebtId, setOpenDebtId] = useState<string | null>(null);

  // Apply dark mode
  useEffect(() => {
    if (state.settings.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [state.settings.darkMode]);

  // Phone-frame container for desktop
  const isLoggedIn = !!state.user;

  return (
    <div className="min-h-screen w-full bg-slate-200 dark:bg-slate-950 flex items-center justify-center sm:p-4">
      {/* Phone frame */}
      <div className="w-full sm:max-w-[420px] h-screen sm:h-[860px] sm:max-h-[90vh] bg-slate-50 dark:bg-slate-950 sm:rounded-[2.5rem] overflow-hidden relative shadow-2xl sm:ring-8 sm:ring-slate-900 sm:dark:ring-slate-800">
        {/* Status bar (mock) */}
        {isLoggedIn && (
          <div className="absolute top-0 left-0 right-0 h-9 z-30 flex items-center justify-between px-6 text-[11px] font-semibold text-slate-900 dark:text-white pointer-events-none">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <span>📶</span>
              <span>📡</span>
              <span>🔋</span>
            </div>
          </div>
        )}

        <div className="h-full overflow-y-auto">
          {!isLoggedIn ? (
            <Login />
          ) : (
            <>
              {tab === 'home' && (
                <Dashboard
                  onAddDebt={() => setShowAdd(true)}
                  onOpenDebt={(id) => setOpenDebtId(id)}
                  onViewAll={() => setTab('debts')}
                />
              )}
              {tab === 'debts' && (
                <Debts onOpenDebt={(id) => setOpenDebtId(id)} onAddDebt={() => setShowAdd(true)} />
              )}
              {tab === 'customers' && <Customers />}
              {tab === 'reports' && <Reports />}
              {tab === 'settings' && <Settings />}
            </>
          )}
        </div>

        {/* Bottom Nav */}
        {isLoggedIn && (
          <BottomNav tab={tab} setTab={setTab} onAdd={() => setShowAdd(true)} />
        )}

        {/* Add Debt Modal */}
        <AddDebtModal open={showAdd} onClose={() => setShowAdd(false)} />

        {/* Debt details */}
        {openDebtId && <DebtDetails debtId={openDebtId} onClose={() => setOpenDebtId(null)} />}
      </div>
    </div>
  );
}

function BottomNav({ tab, setTab, onAdd }: { tab: Tab; setTab: (t: Tab) => void; onAdd: () => void }) {
  const items: { key: Tab; icon: any; label: string }[] = [
    { key: 'home', icon: HomeIcon, label: 'الرئيسية' },
    { key: 'debts', icon: WalletIcon, label: 'الديون' },
    { key: 'customers', icon: UsersIcon, label: 'العملاء' },
    { key: 'reports', icon: ChartIcon, label: 'التقارير' },
    { key: 'settings', icon: SettingsIcon, label: 'الإعدادات' },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      {/* FAB */}
      <button
        onClick={onAdd}
        className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-600/40 flex items-center justify-center no-tap-highlight active:scale-90 transition ring-4 ring-slate-50 dark:ring-slate-950"
      >
        <PlusIcon size={24} />
      </button>
      <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-2 pb-3 pt-2 backdrop-blur">
        <div className="flex items-center justify-around">
          {items.slice(0, 2).map((item) => (
            <NavBtn key={item.key} item={item} active={tab === item.key} onClick={() => setTab(item.key)} />
          ))}
          <div className="w-14" /> {/* FAB space */}
          {items.slice(2).map((item) => (
            <NavBtn key={item.key} item={item} active={tab === item.key} onClick={() => setTab(item.key)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function NavBtn({ item, active, onClick }: { item: any; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl no-tap-highlight transition active:scale-95',
        active ? 'text-indigo-600' : 'text-slate-400'
      )}
    >
      <Icon size={20} />
      <span className={cn('text-[10px] font-medium', active && 'font-bold')}>{item.label}</span>
    </button>
  );
}
