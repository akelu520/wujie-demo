import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Users, Shield, TrendingUp, FileText, UserCircle,
  Headphones, BarChart3, ChevronRight,
  LineChart, BookOpen, Image, UserSearch, TicketIcon, Megaphone, Globe,
  ChevronDown, Bell, Settings, HelpCircle, Search, PanelLeftOpen, PanelLeftClose,
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

/** 主导航项（最左侧 icon + 超短标签） */
function PrimaryNavItem({
  group,
  isActive,
  onClick,
}: {
  group: NavGroup;
  isActive: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const Icon = group.icon;
  return (
    <button
      onClick={onClick}
      title={t(group.labelKey)}
      className={cn(
        'w-full flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl transition-all duration-150 group select-none',
        isActive
          ? 'bg-white/15 text-sidebar-foreground'
          : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-white/10',
      )}
    >
      <div className={cn(
        'w-8 h-8 flex items-center justify-center rounded-lg transition-colors',
        isActive ? 'bg-white/15' : 'group-hover:bg-white/8',
      )}>
        <Icon size={17} />
      </div>
      <span className="text-[10px] leading-tight text-center w-full truncate px-0.5 font-medium">
        {t(group.labelKey)}
      </span>
    </button>
  );
}

/** 主导航底部工具按钮 */
function PrimaryUtilItem({
  icon: Icon,
  label,
  onClick,
  className,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'w-full flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-white/10 transition-all duration-150 select-none',
        className,
      )}
    >
      <Icon size={16} />
      <span className="text-[10px] leading-tight font-medium">{label}</span>
    </button>
  );
}

/** 二级导航项 */
function SecondaryNavItem({ child }: { child: NavChild }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const Icon = child.icon;
  const active = location.pathname === child.key || location.pathname.startsWith(child.key + '/');
  return (
    <button
      onClick={() => navigate(child.key)}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
        active
          ? 'bg-primary/8 text-primary font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
      )}
    >
      <Icon size={15} className={cn('shrink-0', active ? 'opacity-100' : 'opacity-60')} />
      <span className="truncate">{t(child.labelKey)}</span>
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
    </button>
  );
}

/** 语言切换下拉 */
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
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Globe size={14} />
        <span className="font-medium">{current.short}</span>
        <ChevronDown size={11} className={cn('transition-transform duration-150', open && 'rotate-180')} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 z-20 w-36 bg-popover border border-border rounded-xl shadow-lg py-1 text-sm overflow-hidden">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleChange(lang.code)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted transition-colors',
                  i18n.language === lang.code ? 'text-foreground font-medium' : 'text-muted-foreground',
                )}
              >
                <span className="w-5 text-center text-xs font-bold">{lang.short}</span>
                <span>{t(lang.labelKey)}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** 搜索栏（header 中的快捷搜索按钮） */
function SearchBar() {
  const { t } = useTranslation();
  return (
    <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/40 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-48">
      <Search size={13} />
      <span className="flex-1 text-left">{t('layout.search')}...</span>
      <kbd className="text-[10px] bg-background border border-border rounded px-1 font-mono">⌘K</kbd>
    </button>
  );
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [showSecondary, setShowSecondary] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const secondaryRef = useRef<HTMLElement>(null);
  const SECONDARY_WIDTH = 192; // w-48 = 12rem

  function handleHandleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    const el = secondaryRef.current;
    if (!el) return;

    const startX = e.clientX;
    const startWidth = showSecondary ? SECONDARY_WIDTH : 0;
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    function onMouseMove(ev: MouseEvent) {
      const w = Math.max(0, Math.min(SECONDARY_WIDTH, startWidth + (ev.clientX - startX)));
      el.style.width = w + 'px';
    }

    function onMouseUp(ev: MouseEvent) {
      const finalW = Math.max(0, Math.min(SECONDARY_WIDTH, startWidth + (ev.clientX - startX)));
      const snapOpen = finalW > SECONDARY_WIDTH / 2;

      // snap 动画：用 inline style 过渡，不走 React 渲染
      el.style.transition = 'width 150ms ease-out';
      el.style.width = (snapOpen ? SECONDARY_WIDTH : 0) + 'px';

      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      // 动画结束后清掉 inline style，交还 React 控制
      setTimeout(() => {
        el.style.width = '';
        el.style.transition = '';
        setShowSecondary(snapOpen);
        setIsDragging(false);
      }, 155);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  // 当前激活子系统（fallback 到第一个）
  const activeGroup = menuConfig.find(m => location.pathname.startsWith(`/${m.key}`)) ?? menuConfig[0];

  // 面包屑当前子页面
  const currentChild = activeGroup.children.find(
    c => location.pathname === c.key || location.pathname.startsWith(c.key + '/'),
  );

  return (
    <div className="flex h-screen bg-background">

      {/* ── 一级导航（最左侧，icon-only + 短标签） ── */}
      <aside className="w-[72px] bg-sidebar flex flex-col items-center shrink-0 py-1.5">

        {/* Logo + 二级栏开关 */}
        <div className="w-full flex flex-col items-center gap-1 px-1.5 mb-1 shrink-0">
          <div className="w-full flex items-center justify-center h-11">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shadow-sm">
              <LayoutDashboard size={16} className="text-sidebar-foreground" />
            </div>
          </div>
          {/* 展开/收起二级导航的切换按钮 */}
          <button
            onClick={() => setShowSecondary(s => !s)}
            title={showSecondary ? '收起导航' : '展开导航'}
            className="w-full flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-white/10 transition-all duration-150"
          >
            {showSecondary
              ? <PanelLeftClose size={16} />
              : <PanelLeftOpen  size={16} />
            }
          </button>
        </div>

        {/* 应用模块 */}
        <nav className="flex-1 w-full px-1.5 space-y-0.5 overflow-y-auto">
          {menuConfig.map(group => (
            <PrimaryNavItem
              key={group.key}
              group={group}
              isActive={activeGroup.key === group.key}
              onClick={() => navigate(group.children[0].key)}
            />
          ))}
        </nav>

        {/* 底部工具区 */}
        <div className="w-full px-1.5 space-y-0.5 mt-1 shrink-0 border-t border-sidebar-border pt-2">
          <PrimaryUtilItem icon={Bell}        label={t('layout.notifications')} />
          <PrimaryUtilItem icon={Settings}    label={t('layout.settings')} />
          <PrimaryUtilItem icon={HelpCircle}  label={t('layout.help')} />

          {/* 用户头像 */}
          <button
            onClick={handleLogout}
            title={`${user?.username} · ${t('layout.logout')}`}
            className="w-full flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl hover:bg-white/8 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-sidebar-foreground ring-2 ring-transparent group-hover:ring-white/20 transition-all">
              {user?.username?.slice(0, 1).toUpperCase() ?? '?'}
            </div>
            <span className="text-[10px] text-sidebar-foreground/50 leading-tight truncate w-full text-center px-0.5">
              {user?.username}
            </span>
          </button>
        </div>
      </aside>

      {/* ── 二级导航（子系统内页面列表，可折叠） ── */}
      <aside
        ref={secondaryRef as React.RefObject<HTMLDivElement>}
        className={cn(
          'bg-card flex flex-col shrink-0 overflow-hidden min-w-0',
          !isDragging && 'transition-all duration-200 ease-in-out',
          showSecondary ? 'w-48' : 'w-0',
        )}
      >

        {/* 子系统标题 */}
        <div className="h-11 flex items-center gap-2.5 px-4 border-b border-border shrink-0">
          {(() => { const Icon = activeGroup.icon; return <Icon size={15} className="text-muted-foreground shrink-0" />; })()}
          <span className="text-sm font-semibold text-foreground truncate">
            {t(activeGroup.labelKey)}
          </span>
        </div>

        {/* 页面列表 */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-px">
          {activeGroup.children.map(child => (
            <SecondaryNavItem key={child.key} child={child} />
          ))}
        </nav>

        {/* 子系统底部：展示用户角色 */}
        <div className="px-4 py-3 border-t border-border shrink-0">
          <p className="text-xs text-muted-foreground/70 truncate leading-snug">
            {user?.roleLabel}
          </p>
        </div>
      </aside>

      {/* ── 拖拽手柄（分隔线 + 可拖拉区域） ── */}
      <div
        onMouseDown={handleHandleMouseDown}
        className="w-[5px] shrink-0 relative cursor-col-resize group select-none z-10"
      >
        <div className={cn(
          'absolute inset-y-0 left-[2px] w-px transition-colors duration-150',
          isDragging ? 'bg-primary' : 'bg-border group-hover:bg-primary/50',
        )} />
      </div>

      {/* ── 右侧主区域 ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* 顶部栏 */}
        <header className="h-11 border-b border-border bg-card flex items-center justify-between px-5 shrink-0 gap-4">

          {/* 面包屑 */}
          <nav className="flex items-center gap-1 text-sm min-w-0 shrink-0">
            <button
              onClick={() => navigate('/basic/dashboard')}
              className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {t('layout.title')}
            </button>
            <ChevronRight size={13} className="text-border/80 shrink-0" />
            <button
              onClick={() => navigate(activeGroup.children[0].key)}
              className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {t(activeGroup.labelKey)}
            </button>
            {currentChild && (
              <>
                <ChevronRight size={13} className="text-border/80 shrink-0" />
                <span className="text-foreground font-medium truncate">
                  {t(currentChild.labelKey)}
                </span>
              </>
            )}
          </nav>

          {/* 中间搜索 */}
          <div className="flex-1 flex justify-center">
            <SearchBar />
          </div>

          {/* 右侧操作 */}
          <div className="flex items-center gap-1 shrink-0">
            {/* 通知铃铛 */}
            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative">
              <Bell size={15} />
            </button>
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
