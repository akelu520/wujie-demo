import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/store/auth.tsx';
import { Lock, User, BarChart3, ShieldCheck, Activity, Users as UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState<{ username: string; password: string }>({ username: '', password: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const result = await login(form.username, form.password);
    if (result.ok) {
      navigate('/dashboard');
    } else {
      setError(result.message || t('login.loginFailed'));
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── 左侧品牌面板 ── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-sidebar p-10 relative overflow-hidden">

        {/* 几何背景 */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="lp-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.07" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lp-grid)" />
          <line x1="0%" y1="100%" x2="100%" y2="0%" stroke="white" strokeWidth="0.8" strokeOpacity="0.04" />
          <line x1="-10%" y1="90%" x2="90%" y2="-10%" stroke="white" strokeWidth="0.5" strokeOpacity="0.03" />
          <circle cx="420" cy="0" r="240" fill="none" stroke="white" strokeWidth="0.6" strokeOpacity="0.05" />
          <circle cx="420" cy="0" r="380" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.03" />
          <circle cx="0" cy="600" r="200" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.04" />
        </svg>

        {/* 顶部 logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <BarChart3 size={16} className="text-sidebar-foreground" />
          </div>
          <span className="text-sidebar-foreground/80 text-sm font-semibold tracking-widest uppercase">
            Admin
          </span>
        </div>

        {/* 中部标题 */}
        <div className="relative z-10">
          <p className="text-sidebar-foreground/35 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            Enterprise Platform
          </p>
          <h1 className="text-[2.6rem] font-bold text-sidebar-foreground leading-[1.1] mb-5">
            {t('login.title')}
          </h1>
          <p className="text-sidebar-foreground/45 text-sm leading-relaxed max-w-[260px]">
            统一管理证券交易、用户权限、<br />内容运营及客户关系的企业级平台
          </p>
        </div>

        {/* 底部特性 */}
        <div className="space-y-3 relative z-10">
          {[
            { icon: ShieldCheck, label: '基于角色的精细权限控制' },
            { icon: Activity,    label: '实时系统监控与审计日志' },
            { icon: UsersIcon,   label: '多子系统统一管理入口' },
          ].map(({ icon: FIcon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-white/8 flex items-center justify-center shrink-0">
                <FIcon size={12} className="text-sidebar-foreground/50" />
              </div>
              <span className="text-sidebar-foreground/45 text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 右侧表单区 ── */}
      <div className="flex-1 flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* 移动端 logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-foreground/8 flex items-center justify-center">
              <BarChart3 size={16} className="text-foreground" />
            </div>
            <span className="font-semibold text-sm">{t('login.title')}</span>
          </div>

          {/* 标题 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">{t('login.subtitle')}</h2>
            <p className="text-sm text-muted-foreground mt-1.5">使用您的管理员账号登录</p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="username"
                className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
              >
                {t('login.username')}
              </Label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  id="username"
                  data-testid="username"
                  placeholder={t('login.usernamePlaceholder')}
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
              >
                {t('login.password')}
              </Label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  id="password"
                  data-testid="password"
                  type="password"
                  placeholder={t('login.passwordPlaceholder')}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="pl-9 h-11"
                />
              </div>
            </div>

            {error && (
              <p className="text-destructive text-sm" data-testid="login-error">{error}</p>
            )}

            <Button
              data-testid="login-btn"
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-1 font-semibold"
            >
              {loading ? t('login.loggingIn') : t('login.loginBtn')}
            </Button>
          </form>

          {/* 测试账号 */}
          <div className="mt-8 pt-6 border-t border-border/60">
            <p className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest mb-3">
              {t('login.testAccounts')}
            </p>
            <div className="space-y-1.5">
              {[
                { user: 'superadmin', pwd: 'Admin@123456' },
                { user: 'admin',      pwd: 'Admin@123456' },
              ].map(({ user, pwd }) => (
                <button
                  key={user}
                  type="button"
                  onClick={() => setForm({ username: user, password: pwd })}
                  className="w-full flex items-center justify-between text-xs bg-muted/40 hover:bg-muted/70 rounded-lg px-3 py-2 transition-colors cursor-pointer"
                >
                  <span className="font-mono text-foreground/70">{user}</span>
                  <span className="font-mono text-muted-foreground">{pwd}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
