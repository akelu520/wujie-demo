import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Eye, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table.tsx';

// ── Mock Data ─────────────────────────────────────────────────────────────────

const ACCOUNTS = [
  { id: 'A001234', holder: '张明远', type: 'vip',         available: 2850000,  assets: 5200000,  pnl: +38600,  status: 'active'  },
  { id: 'A001235', holder: '李晓雪', type: 'normal',      available: 45200,    assets: 88300,    pnl: -1240,   status: 'active'  },
  { id: 'A001236', holder: '王国强', type: 'institution', available: 18500000, assets: 42000000, pnl: +126000, status: 'active'  },
  { id: 'A001237', holder: '陈静怡', type: 'normal',      available: 12000,    assets: 35000,    pnl: -880,    status: 'frozen'  },
  { id: 'A001238', holder: '刘建国', type: 'vip',         available: 680000,   assets: 1200000,  pnl: +9800,   status: 'active'  },
  { id: 'A001239', holder: '赵文博', type: 'normal',      available: 8000,     assets: 25000,    pnl: 0,       status: 'pending' },
  { id: 'A001240', holder: '孙丽华', type: 'vip',         available: 320000,   assets: 780000,   pnl: +5200,   status: 'active'  },
  { id: 'A001241', holder: '周天宇', type: 'normal',      available: 55000,    assets: 120000,   pnl: -2100,   status: 'active'  },
  { id: 'A001242', holder: '吴志远', type: 'institution', available: 9200000,  assets: 21000000, pnl: +58000,  status: 'active'  },
  { id: 'A001243', holder: '郑美玲', type: 'vip',         available: 156000,   assets: 420000,   pnl: +3300,   status: 'active'  },
];

function fmt(n: number) {
  if (Math.abs(n) >= 1e8) return (n / 1e8).toFixed(2) + '亿';
  if (Math.abs(n) >= 1e4) return (n / 1e4).toFixed(2) + '万';
  return n.toLocaleString('zh-CN');
}

function StatCard({
  label, value, sub, valueClass = '',
}: { label: string; value: string; sub?: string; valueClass?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
        <p className={`text-2xl font-bold tabular-nums ${valueClass}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AccountsPage() {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [frozen, setFrozen] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() =>
    ACCOUNTS.filter(a =>
      a.id.toLowerCase().includes(keyword.toLowerCase()) ||
      a.holder.includes(keyword)
    ), [keyword]);

  const totalAssets = ACCOUNTS.reduce((s, a) => s + a.assets, 0);
  const totalPnl    = ACCOUNTS.reduce((s, a) => s + a.pnl, 0);
  const activeCount = ACCOUNTS.filter(a => a.status === 'active').length;

  function toggleFreeze(id: string) {
    setFrozen(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function getStatus(a: typeof ACCOUNTS[0]) {
    if (frozen[a.id]) return 'frozen';
    return a.status;
  }

  const typeLabel: Record<string, string> = {
    normal:      t('accounts.normal'),
    vip:         t('accounts.vip'),
    institution: t('accounts.institution'),
  };

  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    active:  { label: t('accounts.active'),  variant: 'default' },
    frozen:  { label: t('accounts.frozen'),  variant: 'destructive' },
    pending: { label: t('accounts.pending'), variant: 'outline' },
  };

  return (
    <div className="p-8 space-y-4">

      {/* 页头 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('accounts.title')}</h1>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('accounts.totalAccounts')}
          value={String(ACCOUNTS.length)}
          sub={`${t('accounts.activeAccounts')} ${activeCount}`}
        />
        <StatCard
          label={t('accounts.activeAccounts')}
          value={String(activeCount)}
          sub={`${((activeCount / ACCOUNTS.length) * 100).toFixed(0)}% 活跃率`}
        />
        <StatCard
          label={t('accounts.totalAssets')}
          value={fmt(totalAssets)}
        />
        <StatCard
          label={t('accounts.todayPnl')}
          value={(totalPnl >= 0 ? '+' : '') + fmt(totalPnl)}
          valueClass={totalPnl >= 0 ? 'text-emerald-600' : 'text-red-500'}
        />
      </div>

      {/* 搜索 */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              className="pl-9"
              placeholder={t('accounts.search')}
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 表格 */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('accounts.accountNo')}</TableHead>
              <TableHead>{t('accounts.holder')}</TableHead>
              <TableHead>{t('accounts.type')}</TableHead>
              <TableHead className="text-right">{t('accounts.available')}</TableHead>
              <TableHead className="text-right">{t('accounts.assets')}</TableHead>
              <TableHead className="text-right">{t('accounts.todayPnl')}</TableHead>
              <TableHead>{t('accounts.status')}</TableHead>
              <TableHead className="text-right">{t('accounts.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(a => {
              const status = getStatus(a);
              const cfg = statusConfig[status] ?? statusConfig.active;
              const pnl = a.pnl;
              return (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-sm">{a.id}</TableCell>
                  <TableCell className="font-medium">{a.holder}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      a.type === 'vip' ? 'bg-amber-500/10 text-amber-600' :
                      a.type === 'institution' ? 'bg-blue-500/10 text-blue-600' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {typeLabel[a.type]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(a.available)}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{fmt(a.assets)}</TableCell>
                  <TableCell className={`text-right tabular-nums font-medium ${pnl > 0 ? 'text-emerald-600' : pnl < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {pnl > 0 ? '+' : ''}{fmt(pnl)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" title={t('accounts.detail')}>
                        <Eye size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title={status === 'frozen' ? t('accounts.unfreeze') : t('accounts.freeze')}
                        className={status === 'frozen' ? 'text-emerald-600 hover:text-emerald-600' : 'text-muted-foreground'}
                        onClick={() => toggleFreeze(a.id)}
                      >
                        {status === 'frozen' ? <Unlock size={14} /> : <Lock size={14} />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
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
