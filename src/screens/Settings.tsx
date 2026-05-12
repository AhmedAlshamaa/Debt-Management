import { useStore } from '../store';
import { Card, Switch, Button } from '../components/UI';
import { MoonIcon, SunIcon, BellIcon, LockIcon, CloudIcon, DollarIcon, FingerprintIcon, LogoutIcon, InfoIcon, DownloadIcon, FileIcon } from '../components/Icons';
import { CURRENCY_LABELS } from '../utils/format';
import type { Currency } from '../types';

export function Settings() {
  const { state, updateSettings, logout, resetDemo } = useStore();
  const { settings, user, debts, customers } = state;

  const sections: {
    title: string;
    items: {
      icon: any;
      label: string;
      desc?: string;
      iconBg: string;
      iconColor: string;
      action?: React.ReactNode;
      onClick?: () => void;
    }[];
  }[] = [
    {
      title: 'المظهر',
      items: [
        {
          icon: settings.darkMode ? MoonIcon : SunIcon,
          label: 'الوضع الليلي',
          desc: settings.darkMode ? 'مفعّل' : 'معطّل',
          iconBg: 'bg-indigo-100 dark:bg-indigo-500/20',
          iconColor: 'text-indigo-600',
          action: <Switch checked={settings.darkMode} onChange={(v) => updateSettings({ darkMode: v })} />,
        },
        {
          icon: DollarIcon,
          label: 'العملة الافتراضية',
          desc: CURRENCY_LABELS[settings.defaultCurrency].name,
          iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
          iconColor: 'text-emerald-600',
          action: (
            <select
              value={settings.defaultCurrency}
              onChange={(e) => updateSettings({ defaultCurrency: e.target.value as Currency })}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white border-0 focus:outline-none"
            >
              {Object.entries(CURRENCY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.symbol} {k}</option>
              ))}
            </select>
          ),
        },
      ],
    },
    {
      title: 'الإشعارات والأمان',
      items: [
        {
          icon: BellIcon,
          label: 'التذكيرات الذكية',
          desc: 'تنبيه قبل موعد الاستحقاق',
          iconBg: 'bg-amber-100 dark:bg-amber-500/20',
          iconColor: 'text-amber-600',
          action: <Switch checked={settings.notificationsEnabled} onChange={(v) => updateSettings({ notificationsEnabled: v })} />,
        },
        {
          icon: FingerprintIcon,
          label: 'القفل بالبصمة / Face ID',
          desc: 'حماية إضافية للتطبيق',
          iconBg: 'bg-rose-100 dark:bg-rose-500/20',
          iconColor: 'text-rose-600',
          action: <Switch checked={settings.biometricLock} onChange={(v) => updateSettings({ biometricLock: v })} />,
        },
        {
          icon: LockIcon,
          label: 'تغيير كلمة المرور',
          desc: 'تحديث كلمة المرور الحالية',
          iconBg: 'bg-slate-100 dark:bg-slate-800',
          iconColor: 'text-slate-600',
          onClick: () => alert('سيتم فتح شاشة تغيير كلمة المرور'),
        },
      ],
    },
    {
      title: 'البيانات',
      items: [
        {
          icon: CloudIcon,
          label: 'النسخ الاحتياطي السحابي',
          desc: 'مزامنة تلقائية للبيانات',
          iconBg: 'bg-blue-100 dark:bg-blue-500/20',
          iconColor: 'text-blue-600',
          action: <Switch checked={settings.cloudBackup} onChange={(v) => updateSettings({ cloudBackup: v })} />,
        },
        {
          icon: DownloadIcon,
          label: 'تصدير Excel',
          desc: `${debts.length} دين، ${customers.length} عميل`,
          iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
          iconColor: 'text-emerald-600',
          onClick: () => alert('جاري تصدير Excel...'),
        },
        {
          icon: FileIcon,
          label: 'تصدير PDF',
          desc: 'تقرير شامل بصيغة PDF',
          iconBg: 'bg-rose-100 dark:bg-rose-500/20',
          iconColor: 'text-rose-600',
          onClick: () => alert('جاري تصدير PDF...'),
        },
      ],
    },
    {
      title: 'حول',
      items: [
        {
          icon: InfoIcon,
          label: 'عن التطبيق',
          desc: 'الإصدار 1.0.0',
          iconBg: 'bg-slate-100 dark:bg-slate-800',
          iconColor: 'text-slate-600',
          onClick: () => alert('ديوني v1.0.0\nتطبيق إدارة الديون الذكية'),
        },
      ],
    },
  ];

  return (
    <div className="pb-28 min-h-full">
      <div className="bg-white dark:bg-slate-900 px-5 pt-12 pb-5 border-b border-slate-100 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-4">الإعدادات</h1>

        {/* Profile */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl ring-2 ring-white/30">
            {user?.avatar || '👤'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{user?.name || 'المستخدم'}</p>
            <p className="text-xs text-white/80 truncate">{user?.email}</p>
          </div>
          <button className="text-xs bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg font-semibold no-tap-highlight active:scale-95">
            تعديل
          </button>
        </div>
      </div>

      <div className="px-5 mt-4 space-y-5">
        {sections.map((section, si) => (
          <div key={si}>
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 px-1">{section.title}</h3>
            <Card className="overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {section.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    onClick={item.onClick}
                    className={`flex items-center gap-3 p-3.5 ${item.onClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800 no-tap-highlight' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center ${item.iconColor}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                      {item.desc && <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>}
                    </div>
                    {item.action}
                  </div>
                );
              })}
            </Card>
          </div>
        ))}

        <Button variant="secondary" fullWidth onClick={resetDemo}>إعادة تعيين البيانات التجريبية</Button>
        <Button variant="danger" fullWidth icon={<LogoutIcon size={18} />} onClick={logout}>تسجيل الخروج</Button>

        <p className="text-center text-xs text-slate-400 pt-2">صُنع بـ ❤️ لمساعدتك على إدارة ديونك</p>
      </div>
    </div>
  );
}
