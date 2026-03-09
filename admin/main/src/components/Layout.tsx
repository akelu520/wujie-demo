import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Users, Shield, TrendingUp, FileText, UserCircle,
  Headphones, BarChart3, ChevronRight, LogOut,
  LineChart, BookOpen, Image, UserSearch, TicketIcon, Megaphone, Globe,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/store/auth.tsx';
import { globalActions } from '@/App.tsx';
import { cn } from '@/lib/utils.ts';

interface NavChild {
  key: string;
  labelKey: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface NavGroup {
  key: string;
  labelKey: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: NavChild[];
}

interface LayoutProps {
  children: React.ReactNode;
}

const menuConfig: NavGroup[] = [
  {
    key: 'basic',
    labelKey: 'layout.basic',
    icon: LayoutDashboard,
    children: [
      { key: '/basic/dashboard', labelKey: 'layout.dashboard', icon: LayoutDashboard },
      { key: '/basic/users',     labelKey: 'layout.users',     icon: Users },
      { key: '/basic/roles',     labelKey: 'layout.roles',     icon: Shield },
    ],
  },
  {
    key: 'securities',
    labelKey: 'layout.securities',
    icon: TrendingUp,
    children: [
      { key: '/securities/accounts', labelKey: 'layout.accounts', icon: UserCircle },
      { key: '/securities/trades',   labelKey: 'layout.trades',   icon: LineChart },
      { key: '/securities/market',   labelKey: 'layout.market',   icon: BarChart3 },
      { key: '/securities/risk',     labelKey: 'layout.risk',     icon: Shield },
    ],
  },
  {
    key: 'cms',
    labelKey: 'layout.cms',
    icon: FileText,
    children: [
      { key: '/cms/articles',    labelKey: 'layout.articles',    icon: BookOpen },
      { key: '/cms/categories',  labelKey: 'layout.categories',  icon: FileText },
      { key: '/cms/media',       labelKey: 'layout.media',       icon: Image },
    ],
  },
  {
    key: 'crm',
    labelKey: 'layout.crm',
    icon: UserSearch,
    children: [
      { key: '/crm/customers', labelKey: 'layout.customers', icon: Users },
      { key: '/crm/profiles',  labelKey: 'layout.profiles',  icon: UserCircle },
    ],
  },
  {
    key: 'service',
    labelKey: 'layout.service',
    icon: Headphones,
    children: [
      { key: '/service/tickets', labelKey: 'layout.tickets', icon: TicketIcon },
      { key: '/service/agents',  labelKey: 'layout.agents',  icon: Headphones },
    ],
  },
  {
    key: 'operations',
    labelKey: 'layout.operations',
    icon: Megaphone,
    children: [
      { key: '/operations/campaigns', labelKey: 'layout.campaigns', icon: Megaphone },
      { key: '/operations/reports',   labelKey: 'layout.reports',   icon: BarChart3 },
    ],
  },
];

const LANGUAGES = [
  { code: 'zh-CN', labelKey: 'lang.zhCN', short: '中' },
  { code: 'en',    labelKey: 'lang.en',   short: 'EN' },
  { code: 'zh-TW', labelKey: 'lang.zhTW', short: '繁' },
] as const;

/** 侧边栏菜单分组（默认展开，点击可折叠） */
function SidebarGroup({ group }: { group: NavGroup }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const GroupIcon = group.icon;

  const hasActive = group.children.some(
    c => location.pathname === c.key || location.pathname.startsWith(c.key + '/'),
  );
  const [open, setOpen] = useState(() =>
    location.pathname.startsWith(`/${group.key}`),
  );

  return (
    <div>
      {/* 分组标题行 */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-colors select-none',
          hasActive
            ? 'text-sidebar-foreground/90'
            : 'text-sidebar-foreground/40 hover:text-sidebar-foreground/70',
        )}
      >
        <span className="flex items-center gap-2">
          <GroupIcon size={13} />
          {t(group.labelKey)}
        </span>
        <ChevronDown
          size={12}
          className={cn('transition-transform duration-200', open ? 'rotate-0' : '-rotate-90')}
        />
      </button>

      {/* 子项 */}
      {open && (
        <div className="mt-0.5 mb-1 space-y-px">
          {group.children.map(child => {
            const ChildIcon = child.icon;
            const active =
              location.pathname === child.key ||
              location.pathname.startsWith(child.key + '/');
            return (
              <button
                key={child.key}
                onClick={() => navigate(child.key)}
                className={cn(
                  'w-full flex items-center gap-2.5 pl-7 pr-3 py-1.5 rounded-lg text-sm transition-colors',
                  active
                    ? 'bg-white/10 text-sidebar-foreground font-medium'
                    : 'text-sidebar-foreground/50 hover:text-sidebar-foreground/90 hover:bg-white/5',
                )}
              >
                <ChildIcon size={14} className={active ? 'opacity-100' : 'opacity-60'} />
                {t(child.labelKey)}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-foreground/70 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** 用户头像（取用户名首字母） */
function Avatar({ name }: { name: string }) {
  const initials = name.slice(0, 1).toUpperCase();
  return (
    <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-xs font-semibold text-sidebar-foreground shrink-0 select-none">
      {initials}
    </span>
  );
}

/** 语言切换下拉（简单弹出层） */
function LangSwitcher() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  function handleChange(code: string) {
    i18n.changeLanguage(code);
    localStorage.setItem('admin-language', code);
    globalActions.setGlobalState({ language: code });
    setOpen(false);
  }

  const current = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Globe size={14} />
        <span>{current.short}</span>
        <ChevronDown size={11} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <>
          {/* 背景遮罩，点击关闭 */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-36 bg-popover border border-border rounded-lg shadow-md py-1 text-sm">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleChange(lang.code)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted transition-colors',
                  i18n.language === lang.code
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground',
                )}
              >
                <span className="w-5 text-center text-xs font-semibold">{lang.short}</span>
                {t(lang.labelKey)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  // 面包屑
  const currentGroup = menuConfig.find(m => location.pathname.startsWith(`/${m.key}`));
  const currentChild = currentGroup?.children.find(
    c => location.pathname === c.key || location.pathname.startsWith(c.key + '/'),
  );

  return (
    <div className="flex h-screen bg-background">

      {/* ── 侧边栏 ─────────────────────────────────── */}
      <aside className="w-56 bg-sidebar flex flex-col shrink-0">

        {/* Logo */}
        <div className="h-12 flex items-center gap-2.5 px-4 shrink-0">
          <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center shrink-0">
            <LayoutDashboard size={13} className="text-sidebar-foreground" />
          </div>
          <span className="text-sm font-semibold text-sidebar-foreground tracking-tight truncate">
            {t('layout.title')}
          </span>
        </div>

        {/* 导航 */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {menuConfig.map(group => (
            <SidebarGroup key={group.key} group={group} />
          ))}
        </nav>

        {/* 用户区 */}
        <div className="px-2 py-2 border-t border-sidebar-border shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 group cursor-default transition-colors">
            <Avatar name={user?.username ?? '?'} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate leading-snug">
                {user?.username}
              </p>
              <p className="text-[11px] text-sidebar-foreground/45 truncate leading-snug">
                {user?.roleLabel}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title={t('layout.logout')}
              className="p-1 rounded-md text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── 右侧主区域 ─────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* 顶部栏 */}
        <header className="h-12 border-b border-border bg-card flex items-center justify-between px-5 shrink-0">

          {/* 面包屑 */}
          <nav className="flex items-center gap-1 text-sm min-w-0">
            <button
              onClick={() => navigate('/basic/dashboard')}
              className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {t('layout.title')}
            </button>

            {currentGroup && (
              <>
                <ChevronRight size={13} className="text-border shrink-0" />
                <button
                  onClick={() => navigate(currentGroup.children[0].key)}
                  className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                >
                  {t(currentGroup.labelKey)}
                </button>
              </>
            )}

            {currentChild && (
              <>
                <ChevronRight size={13} className="text-border shrink-0" />
                <span className="text-foreground font-medium truncate">
                  {t(currentChild.labelKey)}
                </span>
              </>
            )}
          </nav>

          {/* 右侧操作区 */}
          <div className="flex items-center gap-1 shrink-0">
            <LangSwitcher />
          </div>
        </header>

        {/* 子应用挂载区 */}
        <main className="flex-1 overflow-auto">
          {children}
          <div id="subapp-container" className="min-h-full" />
        </main>
      </div>
    </div>
  );
}
