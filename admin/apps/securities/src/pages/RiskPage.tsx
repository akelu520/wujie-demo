import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table.tsx';

// ── Mock Data ─────────────────────────────────────────────────────────────────

type RiskLevel  = 'high' | 'medium' | 'low';
type AlertStatus = 'pending' | 'processing' | 'resolved';
type AlertType  = 'concentration' | 'drawdown' | 'leverage' | 'liquid';

interface Alert {
  id: string;
  account: string;
  holder: string;
  level: RiskLevel;
  type: AlertType;
  triggered: string;
  threshold: string;
  time: string;
  status: AlertStatus;
}

const ALERTS: Alert[] = [
  { id: 'R001', account: 'A001234', holder: '张明远', level: 'high',   type: 'concentration', triggered: '85.2%', threshold: '80%', time: '09:45:23', status: 'pending'    },
  { id: 'R002', account: 'A001238', holder: '刘建国', level: 'medium', type: 'drawdown',       triggered: '12.5%', threshold: '10%', time: '10:12:05', status: 'processing' },
  { id: 'R003', account: 'A001235', holder: '李晓雪', level: 'low',    type: 'leverage',       triggered: '3.8x',  threshold: '4x',  time: '11:03:18', status: 'resolved'   },
  { id: 'R004', account: 'A001236', holder: '王国强', level: 'high',   type: 'liquid',         triggered: '4.2%',  threshold: '5%',  time: '13:22:41', status: 'pending'    },
  { id: 'R005', account: 'A001240', holder: '孙丽华', level: 'medium', type: 'concentration',  triggered: '72.3%', threshold: '70%', time: '14:05:32', status: 'pending'    },
  { id: 'R006', account: 'A001241', holder: '周天宇', level: 'low',    type: 'drawdown',       triggered: '7.8%',  threshold: '8%',  time: '14:38:19', status: 'resolved'   },
  { id: 'R007', account: 'A001242', holder: '吴志远', level: 'high',   type: 'leverage',       triggered: '5.2x',  threshold: '4x',  time: '15:01:44', status: 'processing' },
];

function StatCard({
  label, value, valueClass = '', icon,
}: { label: string; value: string | number; valueClass?: string; icon?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-1.5">
          {icon}
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        <p className={`text-2xl font-bold tabular-nums ${valueClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

const LEVEL_CFG: Record<RiskLevel, { label: string; bg: string; text: string; dot: string }> = {
  high:   { label: '',  bg: 'bg-red-500/10',    text: 'text-red-600',         dot: 'bg-red-500'    },
  medium: { label: '',  bg: 'bg-orange-500/10', text: 'text-orange-600',      dot: 'bg-orange-400' },
  low:    { label: '',  bg: 'bg-blue-500/10',   text: 'text-blue-600',        dot: 'bg-blue-400'   },
};

const STATUS_CFG: Record<AlertStatus, { label: string; bg: string; text: string }> = {
  pending:    { label: '', bg: 'bg-red-500/10',     text: 'text-red-600'    },
  processing: { label: '', bg: 'bg-orange-500/10',  text: 'text-orange-600' },
  resolved:   { label: '', bg: 'bg-emerald-500/10', text: 'text-emerald-600'},
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RiskPage() {
  const { t } = useTranslation();
  const [keyword, setKeyword]   = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | RiskLevel>('all');
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  // Patch labels at render time so they use current locale
  const levelCfg = (level: RiskLevel) => ({
    ...LEVEL_CFG[level],
    label: t(`risk.${level}`),
  });
  const statusCfg = (status: AlertStatus, id: string) => {
    const effective = resolvedIds.has(id) ? 'resolved' : status;
    return {
      ...STATUS_CFG[effective],
      label: t(`risk.${effective === 'pending' ? 'pendingStatus' : effective}`),
      effective,
    };
  };
  const typeLabel = (type: AlertType) => t(`risk.${type}`);

  const filtered = useMemo(() =>
    ALERTS.filter(a => {
      const matchKw = a.account.includes(keyword) || a.holder.includes(keyword);
      const matchLevel = levelFilter === 'all' || a.level === levelFilter;
      return matchKw && matchLevel;
    }), [keyword, levelFilter]);

  const pendingCount = ALERTS.filter(a => !resolvedIds.has(a.id) && (a.status === 'pending' || a.status === 'processing')).length;
  const highCount    = ALERTS.filter(a => a.level === 'high').length;
  const resolvedCount = resolvedIds.size + ALERTS.filter(a => a.status === 'resolved').length;
  const todayCount   = ALERTS.length;

  function handleResolve(id: string) {
    setResolvedIds(prev => new Set([...prev, id]));
  }

  return (
    <div className="p-8 space-y-4">

      {/* 页头 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('risk.title')}</h1>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('risk.pendingAlerts')}
          value={pendingCount}
          valueClass={pendingCount > 0 ? 'text-red-500' : ''}
          icon={<ShieldAlert size={14} className={pendingCount > 0 ? 'text-red-500' : 'text-muted-foreground'} />}
        />
        <StatCard
          label={t('risk.highRiskAlerts')}
          value={highCount}
          valueClass="text-red-500"
        />
        <StatCard
          label={t('risk.todayNew')}
          value={todayCount}
        />
        <StatCard
          label={t('risk.todayResolved')}
          value={resolvedCount}
          valueClass="text-emerald-600"
          icon={<CheckCircle2 size={14} className="text-emerald-600" />}
        />
      </div>

      {/* 过滤栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative max-w-xs flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                className="pl-9"
                placeholder={`${t('risk.account')} / ${t('risk.holder')}`}
                value={keyword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
              />
            </div>
            <div className="flex gap-1.5">
              {(['all', 'high', 'medium', 'low'] as const).map(lv => (
                <Button
                  key={lv}
                  variant={levelFilter === lv ? 'default' : 'outline'}
                  size="sm"
                  className={
                    lv === 'high' && levelFilter === lv ? 'bg-red-600 hover:bg-red-700 border-red-600 text-white' :
                    lv === 'medium' && levelFilter === lv ? 'bg-orange-500 hover:bg-orange-600 border-orange-500 text-white' :
                    lv === 'low' && levelFilter === lv ? 'bg-blue-500 hover:bg-blue-600 border-blue-500 text-white' : ''
                  }
                  onClick={() => setLevelFilter(lv)}
                >
                  {lv === 'all' ? t('risk.all') : t(`risk.${lv}`)}
                </Button>
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
              <TableHead>{t('risk.alertId')}</TableHead>
              <TableHead>{t('risk.account')}</TableHead>
              <TableHead>{t('risk.holder')}</TableHead>
              <TableHead>{t('risk.level')}</TableHead>
              <TableHead>{t('risk.type')}</TableHead>
              <TableHead className="text-right">{t('risk.triggered')}</TableHead>
              <TableHead className="text-right">{t('risk.threshold')}</TableHead>
              <TableHead>{t('risk.time')}</TableHead>
              <TableHead>{t('risk.status')}</TableHead>
              <TableHead className="text-right">{t('risk.resolve')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(a => {
              const lc = levelCfg(a.level);
              const sc = statusCfg(a.status, a.id);
              const isResolved = sc.effective === 'resolved';
              return (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-sm text-muted-foreground">{a.id}</TableCell>
                  <TableCell className="font-mono font-medium">{a.account}</TableCell>
                  <TableCell>{a.holder}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${lc.bg} ${lc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${lc.dot}`} />
                      {lc.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{typeLabel(a.type)}</TableCell>
                  <TableCell className={`text-right tabular-nums font-semibold ${lc.text}`}>{a.triggered}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{a.threshold}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={11} />
                      {a.time}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                      {sc.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {!isResolved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolve(a.id)}
                      >
                        {t('risk.resolve')}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="py-12 text-center text-muted-foreground">
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

    </div>
  );
}
