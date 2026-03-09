import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Shield, Activity, TrendingUp } from 'lucide-react';
import { statsApi } from '@/api/index.ts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table.tsx';
import type { Stats, LoginLog } from '@/types/index.ts';

interface StatCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
}

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon size={20} className="text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

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
    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">{t('dashboard.loading')}</div>
  );

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-xl font-semibold">{t('dashboard.title')}</h1>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Users}      label={t('dashboard.totalUsers')}  value={stats?.totalUsers ?? 0} />
        <StatCard icon={Activity}   label={t('dashboard.activeUsers')} value={stats?.activeUsers ?? 0} />
        <StatCard icon={TrendingUp} label={t('dashboard.todayLogins')} value={stats?.todayLogins ?? 0} />
        <StatCard icon={Shield}     label={t('dashboard.totalRoles')}  value={stats?.totalRoles ?? 0} />
      </div>

      <Card>
        <CardHeader>
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
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.username}</TableCell>
                  <TableCell className="text-muted-foreground">{log.ip}</TableCell>
                  <TableCell>
                    <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                      {log.status === 'success' ? t('dashboard.success') : t('dashboard.failed')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.created_at}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">{t('dashboard.noRecords')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
