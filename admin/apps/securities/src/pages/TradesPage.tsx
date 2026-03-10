import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table.tsx';

// ── Mock Data ─────────────────────────────────────────────────────────────────

type Direction = 'buy' | 'sell';
type TradeStatus = 'done' | 'partial' | 'cancelled' | 'pending';

const TRADES = [
  { id: 'T20240310001', time: '09:31:02', code: '600519', name: '贵州茅台', direction: 'buy'  as Direction, qty: 100,  price: 1768.50, amount: 176850, fee: 265.28, status: 'done'      as TradeStatus },
  { id: 'T20240310002', time: '09:45:18', code: '000858', name: '五粮液',   direction: 'sell' as Direction, qty: 200,  price: 153.20,  amount: 30640,  fee: 45.96,  status: 'done'      as TradeStatus },
  { id: 'T20240310003', time: '10:02:35', code: '300750', name: '宁德时代', direction: 'buy'  as Direction, qty: 50,   price: 198.80,  amount: 9940,   fee: 14.91,  status: 'partial'   as TradeStatus },
  { id: 'T20240310004', time: '10:15:42', code: '601318', name: '中国平安', direction: 'buy'  as Direction, qty: 500,  price: 44.56,   amount: 22280,  fee: 33.42,  status: 'done'      as TradeStatus },
  { id: 'T20240310005', time: '10:28:11', code: '000002', name: '万科A',    direction: 'sell' as Direction, qty: 1000, price: 9.52,    amount: 9520,   fee: 14.28,  status: 'cancelled' as TradeStatus },
  { id: 'T20240310006', time: '11:03:27', code: '002594', name: '比亚迪',   direction: 'buy'  as Direction, qty: 30,   price: 256.30,  amount: 7689,   fee: 11.53,  status: 'pending'   as TradeStatus },
  { id: 'T20240310007', time: '13:21:44', code: '600036', name: '招商银行', direction: 'sell' as Direction, qty: 800,  price: 33.12,   amount: 26496,  fee: 39.74,  status: 'done'      as TradeStatus },
  { id: 'T20240310008', time: '14:08:56', code: '601888', name: '中国中免', direction: 'buy'  as Direction, qty: 60,   price: 148.90,  amount: 8934,   fee: 13.40,  status: 'done'      as TradeStatus },
  { id: 'T20240310009', time: '14:32:15', code: '000333', name: '美的集团', direction: 'sell' as Direction, qty: 200,  price: 62.40,   amount: 12480,  fee: 18.72,  status: 'done'      as TradeStatus },
  { id: 'T20240310010', time: '14:55:38', code: '600900', name: '长江电力', direction: 'buy'  as Direction, qty: 300,  price: 28.56,   amount: 8568,   fee: 12.85,  status: 'pending'   as TradeStatus },
];

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

export default function TradesPage() {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [dirFilter, setDirFilter] = useState<'all' | Direction>('all');

  const filtered = useMemo(() =>
    TRADES.filter(tr => {
      const kw = keyword.toLowerCase();
      const matchKw = tr.code.includes(kw) || tr.name.includes(keyword);
      const matchDir = dirFilter === 'all' || tr.direction === dirFilter;
      return matchKw && matchDir;
    }), [keyword, dirFilter]);

  const buyCount  = TRADES.filter(tr => tr.direction === 'buy').length;
  const sellCount = TRADES.filter(tr => tr.direction === 'sell').length;
  const totalAmt  = TRADES
    .filter(tr => tr.status === 'done' || tr.status === 'partial')
    .reduce((s, tr) => s + tr.amount, 0);

  const statusConfig: Record<TradeStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    done:      { label: t('trades.done'),      variant: 'default'     },
    partial:   { label: t('trades.partial'),   variant: 'secondary'   },
    cancelled: { label: t('trades.cancelled'), variant: 'destructive' },
    pending:   { label: t('trades.pending'),   variant: 'outline'     },
  };

  return (
    <div className="p-8 space-y-4">

      {/* 页头 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('trades.title')}</h1>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('trades.todayTrades')} value={String(TRADES.length)} />
        <StatCard
          label={t('trades.buyCount')}
          value={String(buyCount)}
          valueClass="text-emerald-600"
        />
        <StatCard
          label={t('trades.sellCount')}
          value={String(sellCount)}
          valueClass="text-red-500"
        />
        <StatCard
          label={t('trades.totalAmount')}
          value={`¥${(totalAmt / 10000).toFixed(2)}万`}
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
                placeholder={t('trades.search')}
                value={keyword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
              />
            </div>
            <div className="flex gap-1.5">
              {(['all', 'buy', 'sell'] as const).map(d => (
                <Button
                  key={d}
                  variant={dirFilter === d ? 'default' : 'outline'}
                  size="sm"
                  className={
                    d === 'buy' && dirFilter === d ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white' :
                    d === 'sell' && dirFilter === d ? 'bg-red-500 hover:bg-red-600 border-red-500 text-white' : ''
                  }
                  onClick={() => setDirFilter(d)}
                >
                  {d === 'all' ? t('trades.all') : d === 'buy' ? t('trades.buy') : t('trades.sell')}
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
              <TableHead>{t('trades.time')}</TableHead>
              <TableHead>{t('trades.code')}</TableHead>
              <TableHead>{t('trades.name')}</TableHead>
              <TableHead>{t('trades.direction')}</TableHead>
              <TableHead className="text-right">{t('trades.quantity')}</TableHead>
              <TableHead className="text-right">{t('trades.price')}</TableHead>
              <TableHead className="text-right">{t('trades.amount')}</TableHead>
              <TableHead className="text-right">{t('trades.fee')}</TableHead>
              <TableHead>{t('trades.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(tr => {
              const cfg = statusConfig[tr.status];
              const isBuy = tr.direction === 'buy';
              return (
                <TableRow key={tr.id}>
                  <TableCell className="text-muted-foreground tabular-nums text-xs">{tr.time}</TableCell>
                  <TableCell className="font-mono font-medium">{tr.code}</TableCell>
                  <TableCell>{tr.name}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isBuy
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {isBuy ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {isBuy ? t('trades.buy') : t('trades.sell')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{tr.qty.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{tr.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    ¥{tr.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    ¥{tr.fee.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
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
