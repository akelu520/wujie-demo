import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table.tsx';

// ── Mock Data ─────────────────────────────────────────────────────────────────

const STOCKS = [
  { code: '600519', name: '贵州茅台', price: 1768.50, change: +18.30, changePct: +1.05, volume: 12856,  amount: 22.8e8, cap: 2220e8 },
  { code: '000858', name: '五粮液',   price: 153.20,  change: -2.10,  changePct: -1.35, volume: 45230,  amount: 6.9e8,  cap: 593e8  },
  { code: '300750', name: '宁德时代', price: 198.80,  change: +5.60,  changePct: +2.90, volume: 82150,  amount: 16.3e8, cap: 463e8  },
  { code: '601318', name: '中国平安', price: 44.56,   change: +0.32,  changePct: +0.72, volume: 215600, amount: 9.6e8,  cap: 812e8  },
  { code: '000002', name: '万科A',    price: 9.52,    change: -0.38,  changePct: -3.84, volume: 356200, amount: 3.4e8,  cap: 110e8  },
  { code: '002594', name: '比亚迪',   price: 256.30,  change: +8.90,  changePct: +3.60, volume: 92400,  amount: 23.7e8, cap: 742e8  },
  { code: '600036', name: '招商银行', price: 33.12,   change: -0.15,  changePct: -0.45, volume: 185000, amount: 6.1e8,  cap: 835e8  },
  { code: '601888', name: '中国中免', price: 148.90,  change: +2.40,  changePct: +1.64, volume: 38900,  amount: 5.8e8,  cap: 123e8  },
  { code: '600900', name: '长江电力', price: 28.56,   change: +0.22,  changePct: +0.78, volume: 125000, amount: 3.6e8,  cap: 547e8  },
  { code: '000333', name: '美的集团', price: 62.40,   change: +1.80,  changePct: +2.97, volume: 78500,  amount: 4.9e8,  cap: 441e8  },
  { code: '601398', name: '工商银行', price: 5.82,    change: 0,      changePct: 0,     volume: 892000, amount: 5.2e8,  cap: 2072e8 },
  { code: '000651', name: '格力电器', price: 35.68,   change: -0.72,  changePct: -1.98, volume: 96000,  amount: 3.4e8,  cap: 214e8  },
];

function fmtAmt(n: number) {
  if (n >= 1e8) return (n / 1e8).toFixed(2) + '亿';
  if (n >= 1e4) return (n / 1e4).toFixed(2) + '万';
  return n.toLocaleString();
}

function StatCard({
  label, value, valueClass = '', icon,
}: { label: string; value: string; valueClass?: string; icon?: React.ReactNode }) {
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MarketPage() {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() =>
    STOCKS.filter(s =>
      s.code.includes(keyword) || s.name.includes(keyword)
    ), [keyword]);

  const rising  = STOCKS.filter(s => s.changePct > 0).length;
  const falling = STOCKS.filter(s => s.changePct < 0).length;
  const flat    = STOCKS.filter(s => s.changePct === 0).length;

  return (
    <div className="p-8 space-y-4">

      {/* 页头 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('market.title')}</h1>
        <p className="text-xs text-muted-foreground">
          {t('market.total')}：{STOCKS.length} 只
        </p>
      </div>

      {/* 涨跌统计 */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label={t('market.rising')}
          value={String(rising)}
          valueClass="text-red-500"
          icon={<TrendingUp size={14} className="text-red-500" />}
        />
        <StatCard
          label={t('market.falling')}
          value={String(falling)}
          valueClass="text-emerald-600"
          icon={<TrendingDown size={14} className="text-emerald-600" />}
        />
        <StatCard
          label={t('market.flat')}
          value={String(flat)}
          valueClass="text-muted-foreground"
          icon={<Minus size={14} className="text-muted-foreground" />}
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
              placeholder={t('market.search')}
              value={keyword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 行情表格 */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('market.code')}</TableHead>
              <TableHead>{t('market.name')}</TableHead>
              <TableHead className="text-right">{t('market.price')}</TableHead>
              <TableHead className="text-right">{t('market.change')}</TableHead>
              <TableHead className="text-right">{t('market.changePct')}</TableHead>
              <TableHead className="text-right">{t('market.volume')}</TableHead>
              <TableHead className="text-right">{t('market.amount')}</TableHead>
              <TableHead className="text-right">{t('market.marketCap')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(s => {
              const isUp   = s.changePct > 0;
              const isDown = s.changePct < 0;
              const cls = isUp ? 'text-red-500' : isDown ? 'text-emerald-600' : 'text-muted-foreground';
              return (
                <TableRow key={s.code}>
                  <TableCell className="font-mono font-medium">{s.code}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className={`text-right tabular-nums font-semibold ${cls}`}>
                    {s.price.toFixed(2)}
                  </TableCell>
                  <TableCell className={`text-right tabular-nums ${cls}`}>
                    {s.change > 0 ? '+' : ''}{s.change.toFixed(2)}
                  </TableCell>
                  <TableCell className={`text-right tabular-nums font-medium ${cls}`}>
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs ${
                      isUp ? 'bg-red-500/10' : isDown ? 'bg-emerald-500/10' : 'bg-muted'
                    }`}>
                      {isUp ? '+' : ''}{s.changePct.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {(s.volume / 100).toFixed(0)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {fmtAmt(s.amount)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {fmtAmt(s.cap)}
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
