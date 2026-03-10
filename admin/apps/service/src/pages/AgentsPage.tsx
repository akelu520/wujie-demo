import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Headphones, Wifi, WifiOff, Coffee, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table.tsx';
import { cn } from '@/lib/utils.ts';

// ── Types ──────────────────────────────────────────────────────────────────────

type AgentStatus = 'online' | 'busy' | 'offline' | 'break';

interface Agent {
  id: string;
  name: string;
  group: string;
  status: AgentStatus;
  currentTickets: number;
  handledToday: number;
  score: number;
  skills: string[];
  joinDate: string;
  avgHandle: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK: Agent[] = [
  { id: 'A001', name: '王晓梅', group: '技术支持', status: 'online',  currentTickets: 3, handledToday: 12, score: 4.8, skills: ['技术问题', 'API集成', '数据库'],    joinDate: '2023-04-01', avgHandle: 18 },
  { id: 'A002', name: '李志远', group: '账单客服', status: 'busy',    currentTickets: 5, handledToday: 9,  score: 4.6, skills: ['账单处理', '退款审核', '合同管理'],  joinDate: '2022-11-15', avgHandle: 22 },
  { id: 'A003', name: '张文静', group: '技术支持', status: 'online',  currentTickets: 2, handledToday: 15, score: 4.9, skills: ['技术问题', '前端调试', '移动端'],    joinDate: '2024-02-20', avgHandle: 15 },
  { id: 'A004', name: '刘海波', group: '投诉处理', status: 'break',   currentTickets: 0, handledToday: 7,  score: 4.4, skills: ['投诉处理', '情绪管理', '升级处理'],  joinDate: '2023-08-10', avgHandle: 30 },
  { id: 'A005', name: '陈晓宇', group: '账单客服', status: 'online',  currentTickets: 4, handledToday: 11, score: 4.7, skills: ['账单处理', '咨询解答', '产品介绍'],  joinDate: '2023-01-05', avgHandle: 20 },
  { id: 'A006', name: '周明慧', group: '技术支持', status: 'offline', currentTickets: 0, handledToday: 0,  score: 4.5, skills: ['技术问题', 'Linux运维', '网络故障'], joinDate: '2024-06-01', avgHandle: 25 },
  { id: 'A007', name: '孙建国', group: '投诉处理', status: 'online',  currentTickets: 1, handledToday: 8,  score: 4.3, skills: ['投诉处理', '客户关系', '回访管理'],  joinDate: '2022-05-20', avgHandle: 35 },
  { id: 'A008', name: '吴思雨', group: '通用客服', status: 'busy',    currentTickets: 6, handledToday: 14, score: 4.7, skills: ['通用咨询', '产品介绍', '快速响应'],  joinDate: '2024-03-15', avgHandle: 12 },
  { id: 'A009', name: '郑天宇', group: '通用客服', status: 'online',  currentTickets: 2, handledToday: 10, score: 4.6, skills: ['通用咨询', '多语言', '邮件跟进'],    joinDate: '2023-09-01', avgHandle: 16 },
  { id: 'A010', name: '黄雪萍', group: '账单客服', status: 'offline', currentTickets: 0, handledToday: 0,  score: 4.8, skills: ['账单处理', '发票管理', '税务咨询'],  joinDate: '2021-12-10', avgHandle: 24 },
];

// ── Config ─────────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<AgentStatus, {
  bg: string; text: string; dot: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = {
  online:  { bg: 'bg-emerald-500/10', text: 'text-emerald-600',     dot: 'bg-emerald-500',          icon: Wifi        },
  busy:    { bg: 'bg-orange-500/10',  text: 'text-orange-600',      dot: 'bg-orange-400',           icon: AlertCircle },
  offline: { bg: 'bg-muted',          text: 'text-muted-foreground', dot: 'bg-muted-foreground/40', icon: WifiOff     },
  break:   { bg: 'bg-blue-500/10',    text: 'text-blue-600',        dot: 'bg-blue-400',             icon: Coffee      },
};

const GROUPS = ['全部', '技术支持', '账单客服', '投诉处理', '通用客服'];

// ── ScoreBar ───────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const pct   = ((score - 1) / 4) * 100;
  const color = score >= 4.7 ? 'bg-emerald-500' : score >= 4.4 ? 'bg-blue-500' : 'bg-orange-400';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums">{score.toFixed(1)}</span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const { t } = useTranslation();

  const [agents, setAgents]               = useState<Agent[]>(MOCK);
  const [keyword, setKeyword]             = useState('');
  const [statusFilter, setStatusFilter]   = useState<'all' | AgentStatus>('all');
  const [groupFilter, setGroupFilter]     = useState('全部');

  const filtered = useMemo(() =>
    agents.filter(a => {
      const kw = keyword.toLowerCase();
      const matchKw = !kw || a.name.includes(kw) || a.id.toLowerCase().includes(kw);
      const matchS  = statusFilter === 'all' || a.status === statusFilter;
      const matchG  = groupFilter === '全部'  || a.group  === groupFilter;
      return matchKw && matchS && matchG;
    }),
  [agents, keyword, statusFilter, groupFilter]);

  const stats = useMemo(() => {
    const scores = agents.map(a => a.score);
    return {
      total:           agents.length,
      onlineCount:     agents.filter(a => a.status === 'online').length,
      avgHandle:       Math.round(agents.reduce((s, a) => s + a.avgHandle, 0) / agents.length),
      avgSatisfaction: (scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(1),
      totalCurrent:    agents.filter(a => a.status === 'online' || a.status === 'busy')
                             .reduce((s, a) => s + a.currentTickets, 0),
    };
  }, [agents]);

  function toggleStatus(id: string) {
    setAgents(prev => prev.map(a => {
      if (a.id !== id) return a;
      const next: AgentStatus = (a.status === 'offline') ? 'online' : 'offline';
      return { ...a, status: next };
    }));
  }

  return (
    <div className="p-8 space-y-4">

      {/* 页头 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('agents.title')}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {stats.totalCurrent} 个工单处理中
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1.5">
              <Headphones size={14} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{t('agents.total')}</p>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1.5">
              <Wifi size={14} className="text-emerald-500" />
              <p className="text-xs text-muted-foreground">{t('agents.onlineCount')}</p>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{stats.onlineCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1.5">{t('agents.avgHandle')}</p>
            <p className="text-2xl font-bold tabular-nums">{stats.avgHandle}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1.5">{t('agents.avgSatisfaction')}</p>
            <p className="text-2xl font-bold tabular-nums text-primary">{stats.avgSatisfaction}</p>
          </CardContent>
        </Card>
      </div>

      {/* 过滤栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder={t('agents.search')} value={keyword}
                onChange={e => setKeyword(e.target.value)} />
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}>{t('agents.all')}</Button>
              {(['online', 'busy', 'break', 'offline'] as AgentStatus[]).map(s => {
                const cfg = STATUS_CFG[s];
                return (
                  <Button
                    key={s} size="sm"
                    variant={statusFilter === s ? 'default' : 'outline'}
                    className={statusFilter === s
                      ? s === 'online' ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white'
                      : s === 'busy'   ? 'bg-orange-500 hover:bg-orange-600 border-orange-500 text-white'
                      : s === 'break'  ? 'bg-blue-500 hover:bg-blue-600 border-blue-500 text-white'
                      : '' : ''}
                    onClick={() => setStatusFilter(s)}
                  >
                    <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', cfg.dot)} />
                    {t(`agents.${s}`)}
                  </Button>
                );
              })}
            </div>
            <div className="flex gap-1">
              {GROUPS.map(g => (
                <Button key={g} size="sm" variant={groupFilter === g ? 'default' : 'outline'}
                  onClick={() => setGroupFilter(g)}>{g}</Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 表格 */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">{t('agents.id')}</TableHead>
              <TableHead>{t('agents.name')}</TableHead>
              <TableHead>{t('agents.group')}</TableHead>
              <TableHead>{t('agents.status')}</TableHead>
              <TableHead className="text-center">{t('agents.currentTickets')}</TableHead>
              <TableHead className="text-center">{t('agents.handledToday')}</TableHead>
              <TableHead>{t('agents.score')}</TableHead>
              <TableHead>{t('agents.skills')}</TableHead>
              <TableHead>{t('agents.joinDate')}</TableHead>
              <TableHead className="text-right">{t('agents.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(agent => {
              const sc     = STATUS_CFG[agent.status];
              const Icon   = sc.icon;
              const isActive = agent.status === 'online' || agent.status === 'busy';
              return (
                <TableRow key={agent.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{agent.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {agent.name.slice(0, 1)}
                        </div>
                        <span className={cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card', sc.dot)} />
                      </div>
                      <span className="font-medium text-sm">{agent.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{agent.group}</TableCell>
                  <TableCell>
                    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full', sc.bg, sc.text)}>
                      <Icon size={10} />
                      {t(`agents.${agent.status}`)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn('text-sm font-medium tabular-nums', agent.currentTickets >= 5 && 'text-red-500')}>
                      {agent.currentTickets}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-sm tabular-nums">{agent.handledToday}</TableCell>
                  <TableCell><ScoreBar score={agent.score} /></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {agent.skills.slice(0, 2).map(s => (
                        <span key={s} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                      {agent.skills.length > 2 && (
                        <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">+{agent.skills.length - 2}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{agent.joinDate}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => toggleStatus(agent.id)}>
                      {isActive ? t('agents.setOffline') : t('agents.setOnline')}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="py-12 text-center text-muted-foreground">{t('agents.noData')}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
