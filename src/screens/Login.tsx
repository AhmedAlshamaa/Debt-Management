import { useState } from 'react';
import { useStore } from '../store';
import { Button, Input } from '../components/UI';
import { WalletIcon, MailIcon, EyeIcon, EyeOffIcon, FingerprintIcon } from '../components/Icons';

export function Login() {
  const { login } = useStore();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@dayni.app');
  const [password, setPassword] = useState('demo1234');
  const [showPwd, setShowPwd] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email, name || undefined);
  };

  return (
    <div className="min-h-full flex flex-col bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-900 text-white">
      <div className="flex-1 flex flex-col justify-center px-6 py-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-4 ring-1 ring-white/20 shadow-2xl">
            <WalletIcon size={40} />
          </div>
          <h1 className="text-3xl font-extrabold mb-1">ديوني</h1>
          <p className="text-white/70 text-sm">إدارة الديون الذكية</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-6 shadow-2xl animate-slide-up">
          {/* Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 mb-5">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all no-tap-highlight ${
                  mode === m ? 'bg-white dark:bg-slate-900 shadow text-indigo-600' : 'text-slate-500'
                }`}
              >
                {m === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <Input label="الاسم الكامل" placeholder="أدخل اسمك" value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <div className="relative">
              <Input label="البريد الإلكتروني" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <MailIcon className="absolute left-3 top-9 text-slate-400" size={18} />
            </div>
            <div className="relative">
              <Input
                label="كلمة المرور"
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute left-3 top-9 text-slate-400">
                {showPwd ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                  تذكرني
                </label>
                <button type="button" className="text-indigo-600 font-medium">نسيت كلمة المرور؟</button>
              </div>
            )}

            <Button type="submit" fullWidth size="lg">
              {mode === 'login' ? 'دخول' : 'إنشاء حساب'}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
              <div className="relative flex justify-center text-xs"><span className="px-3 bg-white dark:bg-slate-900 text-slate-500">أو</span></div>
            </div>

            <button
              type="button"
              onClick={() => login('biometric@dayni.app', 'مستخدم')}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 font-semibold no-tap-highlight active:scale-[0.98] transition"
            >
              <FingerprintIcon size={22} />
              الدخول بالبصمة
            </button>
          </form>
        </div>

        <p className="text-center text-white/60 text-xs mt-6">© 2026 تطبيق ديوني — جميع الحقوق محفوظة</p>
      </div>
    </div>
  );
}
