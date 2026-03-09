import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/store/auth.jsx';
import { Button } from '@/components/ui/button.jsx';
import { cn } from '@/lib/utils.js';

const nav = [
  { to: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { to: '/users', label: '用户管理', icon: Users },
  { to: '/roles', label: '角色权限', icon: Shield },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-background">
      {/* 侧边栏 */}
      <aside className="w-56 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <div className="h-14 flex items-center px-5 border-b border-sidebar-border">
          <span className="text-sm font-semibold tracking-wide">后台管理系统</span>
        </div>
        <nav className="flex-1 py-3 space-y-0.5 px-2">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-1">
          <p className="px-3 text-xs text-sidebar-foreground/50">{user?.username} · {user?.roleLabel}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <LogOut size={15} />
            退出登录
          </Button>
        </div>
      </aside>

      {/* 主内容 */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
