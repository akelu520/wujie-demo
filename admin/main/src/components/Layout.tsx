import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Shield, TrendingUp, FileText, UserCircle,
  Headphones, BarChart3, ChevronDown, ChevronRight, LogOut,
  LineChart, BookOpen, Image, UserSearch, TicketIcon, Megaphone,
} from 'lucide-react';
import { useAuth } from '@/store/auth.tsx';
import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils.ts';

interface NavChild {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

interface NavGroup {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  children: NavChild[];
}

interface MenuItemProps {
  item: NavGroup;
  defaultOpen?: boolean;
}

interface LayoutProps {
  children: React.ReactNode;
}

const menuConfig: NavGroup[] = [
  {
    key: 'basic',
    label: '基础后台',
    icon: LayoutDashboard,
    children: [
      { key: '/basic/dashboard', label: '仪表盘', icon: LayoutDashboard },
      { key: '/basic/users', label: '用户管理', icon: Users },
      { key: '/basic/roles', label: '角色权限', icon: Shield },
    ],
  },
  {
    key: 'securities',
    label: '证券后台',
    icon: TrendingUp,
    children: [
      { key: '/securities/accounts', label: '账户管理', icon: UserCircle },
      { key: '/securities/trades', label: '交易记录', icon: LineChart },
      { key: '/securities/market', label: '行情数据', icon: BarChart3 },
      { key: '/securities/risk', label: '风控管理', icon: Shield },
    ],
  },
  {
    key: 'cms',
    label: '内容管理',
    icon: FileText,
    children: [
      { key: '/cms/articles', label: '文章管理', icon: BookOpen },
      { key: '/cms/categories', label: '分类管理', icon: FileText },
      { key: '/cms/media', label: '媒体库', icon: Image },
    ],
  },
  {
    key: 'crm',
    label: '客户管理',
    icon: UserSearch,
    children: [
      { key: '/crm/customers', label: '客户列表', icon: Users },
      { key: '/crm/profiles', label: '客户画像', icon: UserCircle },
    ],
  },
  {
    key: 'service',
    label: '客服系统',
    icon: Headphones,
    children: [
      { key: '/service/tickets', label: '工单管理', icon: TicketIcon },
      { key: '/service/agents', label: '坐席管理', icon: Headphones },
    ],
  },
  {
    key: 'operations',
    label: '运营系统',
    icon: Megaphone,
    children: [
      { key: '/operations/campaigns', label: '活动管理', icon: Megaphone },
      { key: '/operations/reports', label: '数据报表', icon: BarChart3 },
    ],
  },
];

function MenuItem({ item, defaultOpen = false }: MenuItemProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(defaultOpen || location.pathname.startsWith(`/${item.key}`));
  const Icon = item.icon;

  const isChildActive = item.children?.some(c => location.pathname.startsWith(c.key));

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors',
          isChildActive
            ? 'text-sidebar-foreground font-medium'
            : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30'
        )}
      >
        <span className="flex items-center gap-2.5">
          <Icon size={16} />
          {item.label}
        </span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
          {item.children.map(child => {
            const ChildIcon = child.icon;
            const active = location.pathname === child.key || location.pathname.startsWith(child.key + '/');
            return (
              <button
                key={child.key}
                onClick={() => navigate(child.key)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30'
                )}
              >
                <ChildIcon size={14} />
                {child.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  // 当前激活的一级菜单 key
  const activeGroup = menuConfig.find(m => location.pathname.startsWith(`/${m.key}`))?.key;

  return (
    <div className="flex h-screen bg-background">
      {/* 侧边栏 */}
      <aside className="w-60 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border shrink-0">
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-sidebar-border">
          <span className="text-sm font-semibold tracking-wide">后台管理平台</span>
        </div>

        {/* 菜单 */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {menuConfig.map(item => (
            <MenuItem
              key={item.key}
              item={item}
              defaultOpen={item.key === activeGroup}
            />
          ))}
        </nav>

        {/* 用户信息 */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="px-3 py-1 mb-1">
            <p className="text-xs font-medium text-sidebar-foreground">{user?.username}</p>
            <p className="text-xs text-sidebar-foreground/50">{user?.roleLabel}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
          >
            <LogOut size={14} />
            退出登录
          </Button>
        </div>
      </aside>

      {/* 子应用容器 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <header className="h-14 border-b border-border bg-card flex items-center px-6 shrink-0">
          <span className="text-sm text-muted-foreground">
            {menuConfig.flatMap(m => m.children).find(c => location.pathname.startsWith(c.key))?.label ?? '后台管理平台'}
          </span>
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
