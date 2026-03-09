import { useEffect, useState } from 'react';
import { Users, Shield, Activity, TrendingUp } from 'lucide-react';
import { statsApi } from '@/api/index.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table.jsx';

function StatCard({ icon: Icon, label, value }) {
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
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([statsApi.summary(), statsApi.loginLogs(10)])
      .then(([s, l]) => {
        setStats(s.data);
        setLogs(l.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">加载中...</div>
  );

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-xl font-semibold">仪表盘</h1>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Users} label="用户总数" value={stats?.totalUsers ?? 0} />
        <StatCard icon={Activity} label="活跃用户" value={stats?.activeUsers ?? 0} />
        <StatCard icon={TrendingUp} label="今日登录" value={stats?.todayLogins ?? 0} />
        <StatCard icon={Shield} label="角色数量" value={stats?.totalRoles ?? 0} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">最近登录记录</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户名</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.username}</TableCell>
                  <TableCell className="text-muted-foreground">{log.ip}</TableCell>
                  <TableCell>
                    <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                      {log.status === 'success' ? '成功' : '失败'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.created_at}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">暂无记录</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
