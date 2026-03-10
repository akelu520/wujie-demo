import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table.tsx';
import { cn } from '@/lib/utils.ts';

// ── Types ──────────────────────────────────────────────────────────────────────

type Period = 'today' | 'week' | 'month' | 'quarter';

interface PeriodData {
  newUsers: number;
  orders: number;
  revenue: number;
  convRate: number;
}

interface ChannelRow {
  channel: string;
  visits: number;
  orders: number;
  convRate: number;
  revenue: number;
  share: number;
}

interface DayPoint {
  label: string;
  users: number;
  orders: number;
  revenue: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const PERIOD_DATA: Record<Period, { current: PeriodData; prev: PeriodData }> = {
  today: {
    current: { newUsers: 348,   orders: 127,  revenue: 8.6,  convRate: 3.8 },
    prev:    { newUsers: 302,   orders: 108,  revenue: 7.1,  convRate: 3.4 },
  },
  week: {
    current: { newUsers: 2184,  orders: 836,  revenue: 54.2, convRate: 4.1 },
    prev:    { newUsers: 1950,  orders: 724,  revenue: 48.5, convRate: 3.9 },
  },
  month: {
    current: { newUsers: 9420,  orders: 3580, revenue: 228.4, convRate: 4.3 },
    prev:    { newUsers: 8760,  orders: 3190, revenue: 201.7, convRate: 4.0 },
  },
  quarter: {
    current: { newUsers: 28600, orders: 10420, revenue: 682.1, convRate: 4.5 },
    prev:    { newUsers: 24100, orders: 8850,  revenue: 561.3, convRate: 4.1 },
  },
};

const CHANNELS: Record<Period, ChannelRow[]> = {
  today: [
    { channel: 'direct',   visits: 1240, orders: 58,  convRate: 4.7, revenue: 3.8, share: 32 },
    { channel: 'organic',  visits: 980,  orders: 31,  convRate: 3.2, revenue: 2.0, share: 25 },
    { channel: 'paid',     visits: 760,  orders: 24,  convRate: 3.2, revenue: 1.6, share: 20 },
    { channel: 'referral', visits: 420,  orders: 9,   convRate: 2.1, revenue: 0.7, share: 13 },
    { channel: 'social',   visits: 390,  orders: 5,   convRate: 1.3, revenue: 0.5, share: 10 },
  ],
  week: [
    { channel: 'direct',   visits: 8400, orders: 382, convRate: 4.5, revenue: 24.6, share: 35 },
    { channel: 'organic',  visits: 6200, orders: 218, convRate: 3.5, revenue: 13.5, share: 26 },
    { channel: 'paid',     visits: 4800, orders: 148, convRate: 3.1, revenue: 9.8,  share: 20 },
    { channel: 'referral', visits: 2600, orders: 60,  convRate: 2.3, revenue: 4.0,  share: 11 },
    { channel: 'social',   visits: 1900, orders: 28,  convRate: 1.5, revenue: 2.3,  share: 8  },
  ],
  month: [
    { channel: 'direct',   visits: 36000, orders: 1580, convRate: 4.4, revenue: 102.1, share: 34 },
    { channel: 'organic',  visits: 26500, orders: 920,  convRate: 3.5, revenue: 58.4,  share: 26 },
    { channel: 'paid',     visits: 20000, orders: 624,  convRate: 3.1, revenue: 40.2,  share: 20 },
    { channel: 'referral', visits: 11000, orders: 260,  convRate: 2.4, revenue: 17.0,  share: 12 },
    { channel: 'social',   visits: 8000,  orders: 196,  convRate: 2.5, revenue: 10.7,  share: 8  },
  ],
  quarter: [
    { channel: 'direct',   visits: 108000, orders: 4720, convRate: 4.4, revenue: 306.2, share: 34 },
    { channel: 'organic',  visits: 80000,  orders: 2810, convRate: 3.5, revenue: 175.4, share: 26 },
    { channel: 'paid',     visits: 60000,  orders: 1870, convRate: 3.1, revenue: 120.5, share: 20 },
    { channel: 'referral', visits: 32000,  orders: 800,  convRate: 2.5, revenue: 51.0,  share: 12 },
    { channel: 'social',   visits: 24000,  orders: 220,  convRate: 0.9, revenue: 29.0,  share: 8  },
  ],
};

// 趋势数据（最近 7 个数据点）
const TREND_POINTS: Record<Period, DayPoint[]> = {
  today: [
    { label: '00:00', users: 12,  orders: 3,  revenue: 0.2 },
    { label: '04:00', users: 8,   orders: 2,  revenue: 0.1 },
    { label: '08:00', users: 45,  orders: 18, revenue: 1.2 },
    { label: '12:00', users: 82,  orders: 35, revenue: 2.4 },
    { label: '16:00', users: 96,  orders: 42, revenue: 2.8 },
    { label: '20:00', users: 78,  orders: 22, revenue: 1.5 },
    { label: '23:00', users: 27,  orders: 5,  revenue: 0.4 },
  ],
  week: [
    { label: 'Mon', users: 310, orders: 118, revenue: 7.6  },
    { label: 'Tue', users: 280, orders: 102, revenue: 6.5  },
    { label: 'Wed', users: 350, orders: 135, revenue: 8.8  },
    { label: 'Thu', users: 420, orders: 158, revenue: 10.2 },
    { label: 'Fri', users: 390, orders: 142, revenue: 9.1  },
    { label: 'Sat', users: 248, orders: 98,  revenue: 6.2  },
    { label: 'Sun', users: 186, orders: 83,  revenue: 5.8  },
  ],
  month: [
    { label: 'W1', users: 2100, orders: 820,  revenue: 52.4 },
    { label: 'W2', users: 2380, orders: 910,  revenue: 58.8 },
    { label: 'W3', users: 2520, orders: 980,  revenue: 63.1 },
    { label: 'W4', users: 2420, orders: 870,  revenue: 54.1 },
  ],
  quarter: [
    { label: 'Jan', users: 8800,  orders: 3300, revenue: 210.2 },
    { label: 'Feb', users: 9200,  orders: 3520, revenue: 224.0 },
    { label: 'Mar', users: 10600, orders: 3600, revenue: 248.0 },
  ],
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function pctChange(curr: number, prev: number) {
  if (prev === 0) return 0;
  return ((curr - prev) / prev) * 100;
}

function fmt(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return n.toLocaleString();
}

// ── MetricCard ─────────────────────────────────────────────────────────────────

function MetricCard({ label, value, prev, unit = '' }: {
  label: string; value: number; prev: number; unit?: string;
}) {
  const delta = pctChange(value, prev);
  const up    = delta > 0;
  const flat  = Math.abs(delta) < 0.1;
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
        <p className="text-2xl font-bold tabular-nums">{typeof value === 'number' && unit === '%' ? value.toFixed(1) + '%' : unit === '万' ? value.toFixed(1) + '万' : fmt(value)}</p>
        <div className={cn('flex items-center gap-1 mt-1.5 text-xs font-medium',
          flat ? 'text-muted-foreground' : up ? 'text-emerald-600' : 'text-red-500')}>
          {flat ? <Minus size={11} /> : up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          <span>{flat ? '持平' : `${up ? '+' : ''}${delta.toFixed(1)}%`}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ── TrendChart (CSS bar chart) ──────────────────────────────────────────────────

function TrendChart({ points, metric }: { points: DayPoint[]; metric: 'users' | 'orders' | 'revenue' }) {
  const values = points.map(p => p[metric]);
  const max    = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1.5 h-24">
      {points.map((p, i) => {
        const pct = (p[metric] / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="w-full relative flex items-end" style={{ height: '80px' }}>
              <div
                className="w-full rounded-t bg-primary/60 group-hover:bg-primary transition-all"
                style={{ height: `${Math.max(4, pct)}%` }}
                title={`${p.label}: ${p[metric]}`}
              />
            </div>
            <span className="text-[9px] text-muted-foreground whitespace-nowrap">{p.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── ShareBar ───────────────────────────────────────────────────────────────────

function ShareBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary/60 rounded-full" style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs tabular-nums">{value}%</span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

type TrendMetric = 'users' | 'orders' | 'revenue';

export default function ReportsPage() {
  const { t } = useTranslation();

  const [period, setPeriod]           = useState<Period>('week');
  const [trendMetric, setTrendMetric] = useState<TrendMetric>('revenue');

  const { current, prev } = PERIOD_DATA[period];
  const channels           = CHANNELS[period];
  const trendPoints        = TREND_POINTS[period];

  const PERIODS: { key: Period; label: string }[] = [
    { key: 'today',   label: t('reports.today')   },
    { key: 'week',    label: t('reports.week')     },
    { key: 'month',   label: t('reports.month')    },
    { key: 'quarter', label: t('reports.quarter')  },
  ];

  const METRICS: { key: TrendMetric; label: string }[] = [
    { key: 'users',   label: t('reports.newUsers') },
    { key: 'orders',  label: t('reports.orders')   },
    { key: 'revenue', label: t('reports.revenue')  },
  ];

  return (
    <div className="p-8 space-y-5">

      {/* 页头 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('reports.title')}</h1>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {PERIODS.map(p => (
              <Button
                key={p.key}
                size="sm"
                variant={period === p.key ? 'default' : 'outline'}
                onClick={() => setPeriod(p.key)}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download size={13} />{t('reports.export')}
          </Button>
        </div>
      </div>

      {/* 指标卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label={t('reports.newUsers')} value={current.newUsers} prev={prev.newUsers}          />
        <MetricCard label={t('reports.orders')}   value={current.orders}   prev={prev.orders}            />
        <MetricCard label={t('reports.revenue')}  value={current.revenue}  prev={prev.revenue}  unit="万" />
        <MetricCard label={t('reports.convRate')} value={current.convRate} prev={prev.convRate} unit="%"  />
      </div>

      {/* 趋势图 + 渠道表 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* 趋势走势 */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{t('reports.trendTitle')}</CardTitle>
              <div className="flex gap-1">
                {METRICS.map(m => (
                  <Button
                    key={m.key}
                    size="xs"
                    variant={trendMetric === m.key ? 'default' : 'ghost'}
                    onClick={() => setTrendMetric(m.key)}
                  >
                    {m.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <TrendChart points={trendPoints} metric={trendMetric} />
          </CardContent>
        </Card>

        {/* 渠道分布小卡片 */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('reports.channelBreakdown')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {channels.map(ch => (
              <div key={ch.channel} className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground whitespace-nowrap w-20 shrink-0">{t(`reports.${ch.channel}`)}</span>
                <div className="flex-1">
                  <ShareBar value={ch.share} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 渠道明细表 */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-0 px-5 pt-4">
          <CardTitle className="text-sm">{t('reports.channelBreakdown')}</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('reports.channel')}</TableHead>
              <TableHead className="text-right">{t('reports.visits')}</TableHead>
              <TableHead className="text-right">{t('reports.ordersCount')}</TableHead>
              <TableHead className="text-right">{t('reports.channelConvRate')}</TableHead>
              <TableHead className="text-right">{t('reports.channelRevenue')}</TableHead>
              <TableHead>{t('reports.share')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {channels.map(ch => (
              <TableRow key={ch.channel}>
                <TableCell className="font-medium">{t(`reports.${ch.channel}`)}</TableCell>
                <TableCell className="text-right tabular-nums text-sm">{ch.visits.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums text-sm">{ch.orders.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums text-sm">{ch.convRate.toFixed(1)}%</TableCell>
                <TableCell className="text-right tabular-nums text-sm font-medium">{ch.revenue.toFixed(1)}万</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full" style={{ width: `${ch.share}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">{ch.share}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
