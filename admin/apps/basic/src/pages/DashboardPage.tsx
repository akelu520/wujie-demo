import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Shield, Activity, TrendingUp } from 'lucide-react';
import { statsApi } from '@/api/index.ts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table.tsx';
import type { Stats, LoginLog } from '@/types/index.ts';

// ── count-up hook ─────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!target) { setValue(0); return; }
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

// ── StatCard ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  iconBg: string;
  iconText: string;
  accentBar: string;
  delay?: number;
}

function StatCard({ icon: Icon, label, value, iconBg, iconText, accentBar, delay = 0 }: StatCardProps) {
  const displayed = useCountUp(value, 700);

  return (
    <Card
      className="overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="pt-5 pb-5 px-5">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon size={18} className={iconText} />
          </div>
        </div>
        <p className="text-3xl font-bold tabular-nums tracking-tight">{displayed.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-1.5">{label}</p>
      </CardContent>
      {/* 底部色条 */}
      <div className={`h-0.5 ${accentBar} opacity-60`} />
    </Card>
  );
}

// ── 配置 ──────────────────────────────────────────────────────────────────────

const STAT_CONFIGS = [
  {
    statKey: 'totalUsers'  as const,
    icon: Users,
    iconBg:    'bg-sky-500/10',
    iconText:  'text-sky-500',
    accentBar: 'bg-sky-500',
  },
  {
    statKey: 'activeUsers' as const,
    icon: Activity,
    iconBg:    'bg-emerald-500/10',
    iconText:  'text-emerald-500',
    accentBar: 'bg-emerald-500',
  },
  {
    statKey: 'todayLogins' as const,
    icon: TrendingUp,
    iconBg:    'bg-violet-500/10',
    iconText:  'text-violet-500',
    accentBar: 'bg-violet-500',
  },
  {
    statKey: 'totalRoles'  as const,
    icon: Shield,
    iconBg:    'bg-amber-500/10',
    iconText:  'text-amber-500',
    accentBar: 'bg-amber-500',
  },
] as const;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([statsApi.summary(), statsApi.loginLogs(10)])
      .then(([s, l]) => { setStats(s.data); setLogs(l.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
      {t('dashboard.loading')}
    </div>
  );

  return (
    <div className="p-8 space-y-6">
      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
        <h1 className="text-xl font-semibold">{t('dashboard.title')}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        {STAT_CONFIGS.map((cfg, i) => (
          <StatCard
            key={cfg.statKey}
            icon={cfg.icon}
            label={t(`dashboard.${cfg.statKey}`)}
            value={stats?.[cfg.statKey] ?? 0}
            iconBg={cfg.iconBg}
            iconText={cfg.iconText}
            accentBar={cfg.accentBar}
            delay={i * 80}
          />
        ))}
      </div>

      {/* 最近登录 */}
      <Card className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '360ms', animationFillMode: 'both' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('dashboard.recentLogins')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('dashboard.username')}</TableHead>
                <TableHead>{t('dashboard.ip')}</TableHead>
                <TableHead>{t('dashboard.status')}</TableHead>
                <TableHead>{t('dashboard.time')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-medium">{log.username}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{log.ip}</TableCell>
                  <TableCell>
                    <Badge
                      variant={log.status === 'success' ? 'default' : 'destructive'}
                      className="text-[10px] px-1.5 py-0.5"
                    >
                      {log.status === 'success' ? t('dashboard.success') : t('dashboard.failed')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs tabular-nums">{log.created_at}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground text-sm">
                    {t('dashboard.noRecords')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
