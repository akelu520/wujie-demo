import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search, X, UserCircle, LineChart, BarChart3,
  Navigation, AlertTriangle, Users,
  TrendingUp, TrendingDown, ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils.ts';

// ── useDebounce ───────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Mock 数据 ────────────────────────────────────────────────────────────────

const MOCK_ACCOUNTS = [
  { id: 'ACC001234', name: '张三',           type: '个人', balance: '¥1,234,567',   change: '+2.34%', up: true  },
  { id: 'ACC001235', name: '招商证券资管01', type: '机构', balance: '¥56,789,012',  change: '-0.87%', up: false },
  { id: 'ACC001236', name: '李四',           type: '个人', balance: '¥89,234',       change: '+0.12%', up: true  },
  { id: 'ACC001237', name: '华夏基金专户',   type: '机构', balance: '¥234,567,890', change: '+1.56%', up: true  },
  { id: 'ACC001238', name: '王五',           type: '个人', balance: '¥456,789',      change: '-2.11%', up: false },
];

const MOCK_TRADES = [
  { id: 'TRD240315001', symbol: '600036', name: '招商银行',   action: '买入', qty: '10,000股', price: '¥38.52',    time: '10:23:45' },
  { id: 'TRD240315002', symbol: '000001', name: '平安银行',   action: '卖出', qty: '5,000股',  price: '¥10.89',    time: '10:31:12' },
  { id: 'TRD240315003', symbol: 'AAPL',   name: 'Apple Inc.', action: '买入', qty: '100股',    price: '$178.50',   time: '11:05:00' },
  { id: 'TRD240315004', symbol: '600519', name: '贵州茅台',   action: '买入', qty: '20股',     price: '¥1,680.00', time: '11:42:33' },
  { id: 'TRD240315005', symbol: 'TSLA',   name: 'Tesla Inc.', action: '卖出', qty: '50股',     price: '$247.89',   time: '13:17:58' },
];

const MOCK_MARKET = [
  { symbol: '600036', name: '招商银行',   price: '¥38.52',    change: '+1.25%', up: true,  high: '¥39.10',  low: '¥38.01', vol: '1.23亿'  },
  { symbol: '000001', name: '平安银行',   price: '¥10.89',    change: '-0.36%', up: false, high: '¥11.02',  low: '¥10.80', vol: '8,765万' },
  { symbol: '600519', name: '贵州茅台',   price: '¥1,680.00', change: '+2.18%', up: true,  high: '¥1,698',  low: '¥1,650', vol: '234万'   },
  { symbol: '601318', name: '中国平安',   price: '¥45.67',    change: '-0.89%', up: false, high: '¥46.20',  low: '¥45.30', vol: '4,512万' },
  { symbol: 'AAPL',   name: 'Apple Inc.', price: '$178.50',   change: '+0.82%', up: true,  high: '$179.80', low: '$177.20', vol: '52.3M'  },
  { symbol: 'TSLA',   name: 'Tesla Inc.', price: '$247.89',   change: '+3.21%', up: true,  high: '$251.00', low: '$240.50', vol: '98.7M'  },
  { symbol: '600028', name: '中国石化',   price: '¥5.89',     change: '-1.23%', up: false, high: '¥6.05',   low: '¥5.82',  vol: '2.89亿' },
];

const MOCK_RISK = [
  { id: 'RISK001', type: '持仓集中度超限', account: 'ACC001234', level: '高',   desc: '单一标的持仓占比超过 30%，当前 38.5%', time: '09:15' },
  { id: 'RISK002', type: '止损线触发',     account: 'ACC001235', level: '紧急', desc: '账户净值跌破止损线，需立即处理',         time: '10:02' },
  { id: 'RISK003', type: '单日亏损预警',   account: 'ACC001237', level: '中',   desc: '今日亏损 1.8%，接近预警阈值 2%',         time: '11:30' },
];

const MOCK_USERS = [
  { id: 'USR001', username: 'superadmin', name: '超级管理员', email: 'superadmin@example.com', role: '超级管理员', status: '正常', lastLogin: '2024-03-15 09:12' },
  { id: 'USR002', username: 'admin',      name: '系统管理员', email: 'admin@example.com',      role: '管理员',     status: '正常', lastLogin: '2024-03-15 08:45' },
  { id: 'USR003', username: 'viewer',     name: '查看用户',   email: 'viewer@example.com',      role: '查看者',     status: '正常', lastLogin: '2024-03-14 17:30' },
  { id: 'USR004', username: 'trader_li',  name: '李明',       email: 'li.ming@example.com',     role: '交易员',     status: '正常', lastLogin: '2024-03-15 07:58' },
  { id: 'USR005', username: 'risk_zhang', name: '张伟',       email: 'zhang.wei@example.com',   role: '风控专员',   status: '正常', lastLogin: '2024-03-15 09:05' },
  { id: 'USR006', username: 'ops_wang',   name: '王芳',       email: 'wang.fang@example.com',   role: '运营专员',   status: '禁用', lastLogin: '2024-02-28 16:00' },
];

// ── 类型 ─────────────────────────────────────────────────────────────────────

type Category = 'nav' | 'account' | 'trade' | 'market' | 'risk' | 'user';

const ASYNC_CATS: Category[] = ['account', 'trade', 'market', 'risk'];

interface SearchResult {
  id: string;
  category: Category;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeUp?: boolean;
  badgeDanger?: boolean;
  href: string;
  raw: Record<string, unknown>;
}

// ── 分类色彩系统 ──────────────────────────────────────────────────────────────

const CAT_COLOR: Record<Category, {
  iconBg: string;
  iconText: string;
  accent: string;    // left border on active
  badgeBg: string;
  badgeText: string;
}> = {
  nav:     { iconBg: 'bg-blue-500/12',    iconText: 'text-blue-500',   accent: 'border-blue-500',    badgeBg: 'bg-blue-500/10',    badgeText: 'text-blue-600 dark:text-blue-400'   },
  user:    { iconBg: 'bg-violet-500/12',  iconText: 'text-violet-500', accent: 'border-violet-500',  badgeBg: 'bg-violet-500/10',  badgeText: 'text-violet-600 dark:text-violet-400' },
  account: { iconBg: 'bg-emerald-500/12', iconText: 'text-emerald-500',accent: 'border-emerald-500', badgeBg: 'bg-emerald-500/10', badgeText: 'text-emerald-600 dark:text-emerald-400' },
  trade:   { iconBg: 'bg-amber-500/12',   iconText: 'text-amber-500',  accent: 'border-amber-500',   badgeBg: 'bg-amber-500/10',   badgeText: 'text-amber-600 dark:text-amber-400'  },
  market:  { iconBg: 'bg-sky-500/12',     iconText: 'text-sky-500',    accent: 'border-sky-500',     badgeBg: 'bg-sky-500/10',     badgeText: 'text-sky-600 dark:text-sky-400'      },
  risk:    { iconBg: 'bg-rose-500/12',    iconText: 'text-rose-500',   accent: 'border-rose-500',    badgeBg: 'bg-rose-500/10',    badgeText: 'text-rose-600 dark:text-rose-400'    },
};

// ── 搜索逻辑 ─────────────────────────────────────────────────────────────────

function buildSyncResults(query: string, navLabels: Record<string, string>): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const results: SearchResult[] = [];

  (([
    { key: '/basic/dashboard',      labelKey: 'dashboard' },
    { key: '/basic/users',          labelKey: 'users' },
    { key: '/basic/roles',          labelKey: 'roles' },
    { key: '/securities/accounts',  labelKey: 'accounts' },
    { key: '/securities/trades',    labelKey: 'trades' },
    { key: '/securities/market',    labelKey: 'market' },
    { key: '/securities/risk',      labelKey: 'risk' },
    { key: '/cms/articles',         labelKey: 'articles' },
    { key: '/cms/categories',       labelKey: 'categories' },
    { key: '/cms/media',            labelKey: 'media' },
    { key: '/crm/customers',        labelKey: 'customers' },
    { key: '/crm/profiles',         labelKey: 'profiles' },
    { key: '/service/tickets',      labelKey: 'tickets' },
    { key: '/service/agents',       labelKey: 'agents' },
    { key: '/operations/campaigns', labelKey: 'campaigns' },
    { key: '/operations/reports',   labelKey: 'reports' },
  ] as const)).forEach(item => {
    const label = navLabels[item.labelKey] ?? item.labelKey;
    if (label.toLowerCase().includes(q) || item.key.includes(q)) {
      results.push({ id: `nav:${item.key}`, category: 'nav', title: label, href: item.key, raw: { key: item.key, label } });
    }
  });

  MOCK_USERS
    .filter(u =>
      u.id.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) ||
      u.name.includes(q) || u.email.toLowerCase().includes(q) || u.role.includes(q),
    )
    .forEach(u => results.push({
      id: `usr:${u.id}`, category: 'user', title: u.name,
      subtitle: `${u.username} · ${u.role}`,
      badge: u.status, badgeDanger: u.status === '禁用',
      href: '/basic/users', raw: u as unknown as Record<string, unknown>,
    }));

  return results;
}

function mockSearchAsync(query: string, signal: AbortSignal): Promise<SearchResult[]> {
  return new Promise((resolve, reject) => {
    const delay = 200 + Math.random() * 150;
    const timer = setTimeout(() => {
      if (signal.aborted) { reject(new DOMException('Aborted', 'AbortError')); return; }
      const q = query.toLowerCase().trim();
      const results: SearchResult[] = [];

      MOCK_ACCOUNTS
        .filter(a => a.id.toLowerCase().includes(q) || a.name.includes(q) || a.type.includes(q))
        .forEach(a => results.push({
          id: `acc:${a.id}`, category: 'account', title: a.name, subtitle: `${a.id} · ${a.type}`,
          badge: a.change, badgeUp: a.up, href: '/securities/accounts',
          raw: a as unknown as Record<string, unknown>,
        }));

      MOCK_TRADES
        .filter(tr => tr.id.toLowerCase().includes(q) || tr.symbol.toLowerCase().includes(q) || tr.name.toLowerCase().includes(q))
        .forEach(tr => results.push({
          id: `trd:${tr.id}`, category: 'trade', title: `${tr.name}（${tr.symbol}）`, subtitle: tr.id,
          badge: tr.action, badgeUp: tr.action === '买入', href: '/securities/trades',
          raw: tr as unknown as Record<string, unknown>,
        }));

      MOCK_MARKET
        .filter(m => m.symbol.toLowerCase().includes(q) || m.name.toLowerCase().includes(q))
        .forEach(m => results.push({
          id: `mkt:${m.symbol}`, category: 'market', title: m.name, subtitle: m.symbol,
          badge: m.change, badgeUp: m.up, href: '/securities/market',
          raw: m as unknown as Record<string, unknown>,
        }));

      MOCK_RISK
        .filter(r => r.id.toLowerCase().includes(q) || r.type.includes(q) || r.account.toLowerCase().includes(q))
        .forEach(r => results.push({
          id: `risk:${r.id}`, category: 'risk', title: r.type, subtitle: `${r.id} · ${r.account}`,
          badge: r.level, badgeDanger: r.level === '紧急' || r.level === '高', href: '/securities/risk',
          raw: r as unknown as Record<string, unknown>,
        }));

      resolve(results);
    }, delay);

    signal.addEventListener('abort', () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); });
  });
}

// ── 图标映射 ──────────────────────────────────────────────────────────────────

const CATEGORY_ICON: Record<Category, React.ComponentType<{ size?: number; className?: string }>> = {
  nav: Navigation, user: Users, account: UserCircle,
  trade: LineChart, market: BarChart3, risk: AlertTriangle,
};

// ── 骨架行（shimmer 动画）────────────────────────────────────────────────────

function SkeletonRow({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-7 h-7 rounded-lg bg-muted/50 shrink-0 overflow-hidden relative">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      </div>
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 rounded-md bg-muted/50 relative overflow-hidden" style={{ width: `${52 + delay % 3 * 14}%` }}>
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/8 to-transparent" style={{ animationDelay: `${delay + 100}ms` }} />
        </div>
        <div className="h-2 rounded-md bg-muted/30 relative overflow-hidden w-2/5">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/8 to-transparent" style={{ animationDelay: `${delay + 200}ms` }} />
        </div>
      </div>
    </div>
  );
}

// ── 预览面板 ──────────────────────────────────────────────────────────────────

function PreviewPanel({ result }: { result: SearchResult | null }) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2.5 px-4">
        <div className="w-10 h-10 rounded-2xl bg-muted/40 flex items-center justify-center">
          <Search size={16} className="text-muted-foreground/30" />
        </div>
        <p className="text-[11px] text-muted-foreground/40 text-center leading-relaxed">
          悬停或使用方向键<br />选择条目查看详情
        </p>
      </div>
    );
  }

  const Icon = CATEGORY_ICON[result.category];
  const colors = CAT_COLOR[result.category];

  return (
    <div className="flex flex-col h-full overflow-y-auto animate-in fade-in duration-150">
      {/* 彩色头部 */}
      <div className="px-4 pt-4 pb-3.5 border-b border-border relative overflow-hidden">
        <div className={cn('absolute inset-0 opacity-[0.06]', colors.iconBg.replace('/12', ''))} />
        <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center mb-3 shrink-0', colors.iconBg)}>
          <Icon size={14} className={colors.iconText} />
        </div>
        <p className="text-[13px] font-semibold text-foreground leading-snug">{result.title}</p>
        {result.subtitle && (
          <p className="text-[11px] text-muted-foreground mt-1 font-mono">{result.subtitle}</p>
        )}
      </div>

      {/* 详情 */}
      <div className="px-4 py-3.5 space-y-2 flex-1">
        {result.category === 'market' && (() => {
          const m = result.raw as typeof MOCK_MARKET[0];
          return (
            <>
              <div className="flex items-end justify-between mb-3">
                <span className="text-2xl font-bold text-foreground tabular-nums tracking-tight">{m.price}</span>
                <span className={cn('text-sm font-semibold flex items-center gap-1 tabular-nums', m.up ? 'text-emerald-500' : 'text-rose-500')}>
                  {m.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {m.change}
                </span>
              </div>
              <DataRow label="最高" value={m.high} up />
              <DataRow label="最低" value={m.low} down />
              <DataRow label="成交量" value={m.vol} />
              <DataRow label="代码" value={m.symbol} mono />
            </>
          );
        })()}

        {result.category === 'account' && (() => {
          const a = result.raw as typeof MOCK_ACCOUNTS[0];
          return (
            <>
              <div className="flex items-end justify-between mb-3">
                <span className="text-xl font-bold text-foreground tabular-nums tracking-tight">{a.balance}</span>
                <span className={cn('text-xs font-semibold flex items-center gap-0.5 tabular-nums', a.up ? 'text-emerald-500' : 'text-rose-500')}>
                  {a.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {a.change}
                </span>
              </div>
              <DataRow label="账户编号" value={a.id} mono />
              <DataRow label="账户类型" value={a.type} />
            </>
          );
        })()}

        {result.category === 'trade' && (() => {
          const tr = result.raw as typeof MOCK_TRADES[0];
          return (
            <>
              <div className="mb-3">
                <span className={cn(
                  'inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg',
                  tr.action === '买入'
                    ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/12 text-rose-600 dark:text-rose-400',
                )}>
                  {tr.action === '买入' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {tr.action}
                </span>
              </div>
              <DataRow label="成交价" value={tr.price} mono />
              <DataRow label="数量" value={tr.qty} mono />
              <DataRow label="代码" value={tr.symbol} />
              <DataRow label="时间" value={tr.time} />
              <DataRow label="单号" value={tr.id} mono small />
            </>
          );
        })()}

        {result.category === 'risk' && (() => {
          const r = result.raw as typeof MOCK_RISK[0];
          const isDanger = r.level === '紧急' || r.level === '高';
          return (
            <>
              <div className={cn(
                'inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg mb-1',
                isDanger ? 'bg-rose-500/12 text-rose-600 dark:text-rose-400' : 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
              )}>
                <AlertTriangle size={11} />
                {r.level}风险
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 pb-2 border-b border-border/50">{r.desc}</p>
              <DataRow label="关联账户" value={r.account} mono />
              <DataRow label="触发时间" value={r.time} />
              <DataRow label="预警编号" value={r.id} mono small />
            </>
          );
        })()}

        {result.category === 'user' && (() => {
          const u = result.raw as typeof MOCK_USERS[0];
          return (
            <>
              <div className="flex items-center gap-3 pb-3 mb-1 border-b border-border/50">
                <div className="w-9 h-9 rounded-xl bg-violet-500/12 flex items-center justify-center text-sm font-bold text-violet-600 dark:text-violet-400 shrink-0">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{u.name}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">@{u.username}</p>
                </div>
              </div>
              <DataRow label="角色" value={u.role} />
              <DataRow label="邮箱" value={u.email} mono small />
              <DataRow label="状态" value={u.status} danger={u.status === '禁用'} />
              <DataRow label="最近登录" value={u.lastLogin} />
            </>
          );
        })()}

        {result.category === 'nav' && (() => {
          const n = result.raw as { key: string; label: string };
          return (
            <>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <ArrowRight size={11} />
                点击跳转到该页面
              </div>
              <DataRow label="路径" value={n.key} mono small />
            </>
          );
        })()}
      </div>
    </div>
  );
}

function DataRow({
  label, value, mono = false, small = false,
  up = false, down = false, danger = false,
}: {
  label: string; value: string; mono?: boolean; small?: boolean;
  up?: boolean; down?: boolean; danger?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-2 py-0.5">
      <span className="text-[11px] text-muted-foreground/50 shrink-0 pt-px">{label}</span>
      <span className={cn(
        'text-right tabular-nums break-all',
        small ? 'text-[10px]' : 'text-[11px]',
        mono && 'font-mono',
        up && 'text-emerald-600 dark:text-emerald-400',
        down && 'text-rose-600 dark:text-rose-400',
        danger && 'text-rose-600 dark:text-rose-400 font-semibold',
        !up && !down && !danger && 'text-foreground',
      )}>
        {value}
      </span>
    </div>
  );
}

// ── 主组件 ────────────────────────────────────────────────────────────────────

const CACHE_TTL = 60_000;

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [syncResults, setSyncResults] = useState<SearchResult[]>([]);
  const [asyncResults, setAsyncResults] = useState<SearchResult[]>([]);
  const [loadingCats, setLoadingCats] = useState<Set<Category>>(new Set());

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef<Map<string, { results: SearchResult[]; ts: number }>>(new Map());

  const debouncedQuery = useDebounce(query.trim(), 300);

  const navLabels: Record<string, string> = {
    dashboard: t('layout.dashboard'), users: t('layout.users'), roles: t('layout.roles'),
    accounts: t('layout.accounts'), trades: t('layout.trades'), market: t('layout.market'),
    risk: t('layout.risk'), articles: t('layout.articles'), categories: t('layout.categories'),
    media: t('layout.media'), customers: t('layout.customers'), profiles: t('layout.profiles'),
    tickets: t('layout.tickets'), agents: t('layout.agents'),
    campaigns: t('layout.campaigns'), reports: t('layout.reports'),
  };

  // effect 1：query 变化 → 立即更新 sync，清空 async
  useEffect(() => {
    const q = query.trim();
    if (!q) { setSyncResults([]); setAsyncResults([]); setLoadingCats(new Set()); return; }
    setSyncResults(buildSyncResults(q, navLabels));
    setAsyncResults([]);
    setLoadingCats(new Set(ASYNC_CATS));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // effect 2：debounce 后发异步请求
  useEffect(() => {
    if (!debouncedQuery) return;
    const cached = cacheRef.current.get(debouncedQuery);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setAsyncResults(cached.results); setLoadingCats(new Set()); return;
    }
    const controller = new AbortController();
    mockSearchAsync(debouncedQuery, controller.signal)
      .then(results => {
        cacheRef.current.set(debouncedQuery, { results, ts: Date.now() });
        setAsyncResults(results); setLoadingCats(new Set());
      })
      .catch(() => {});
    return () => controller.abort();
  }, [debouncedQuery]);

  // 打开时聚焦并重置
  useEffect(() => {
    if (open) {
      setQuery(''); setActiveIdx(0); setActiveCategory('all');
      setSyncResults([]); setAsyncResults([]); setLoadingCats(new Set());
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => { setActiveIdx(0); }, [query]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  const allResults = [...syncResults, ...asyncResults];
  const isPending = debouncedQuery !== query.trim() || loadingCats.size > 0;

  const counts: Partial<Record<Category, number>> = {};
  allResults.forEach(r => { counts[r.category] = (counts[r.category] ?? 0) + 1; });

  const filteredResults =
    activeCategory === 'all' || (counts[activeCategory] ?? 0) === 0
      ? allResults
      : allResults.filter(r => r.category === activeCategory);

  const previewResult = filteredResults[activeIdx] ?? null;

  const grouped: Array<{ category: Category; items: SearchResult[] }> = [];
  filteredResults.forEach(r => {
    const last = grouped[grouped.length - 1];
    if (last?.category === r.category) last.items.push(r);
    else grouped.push({ category: r.category, items: [r] });
  });

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filteredResults.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && filteredResults[activeIdx]) select(filteredResults[activeIdx]);
  }

  function select(result: SearchResult) { navigate(result.href); onClose(); }

  if (!open) return null;

  const hasQuery = query.trim().length > 0;
  const showThreeCol = hasQuery && (allResults.length > 0 || isPending);
  let flatIdx = -1;

  return (
    <>
      {/* 遮罩 */}
      <div className="fixed inset-0 z-[60] bg-black/60 animate-in fade-in duration-150" onClick={onClose} />

      {/* 弹框 */}
      <div className="fixed left-1/2 top-[10%] z-[61] -translate-x-1/2 w-full max-w-3xl px-4 animate-in fade-in slide-in-from-top-4 duration-200">
        <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] ring-1 ring-white/5">

          {/* 搜索输入 */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-gradient-to-r from-muted/20 to-transparent">
            <Search
              size={16}
              className={cn(
                'shrink-0 transition-colors duration-200',
                hasQuery ? 'text-foreground' : 'text-muted-foreground',
              )}
            />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('search.placeholder')}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
            />
            {/* loading 指示 */}
            {isPending && hasQuery && (
              <span className="flex gap-0.5 items-center shrink-0">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full bg-muted-foreground/40 animate-bounce"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </span>
            )}
            {query && !isPending && (
              <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0">
                <X size={14} />
              </button>
            )}
            <kbd className="text-[10px] bg-muted/60 border border-border/80 rounded-md px-1.5 py-0.5 font-mono text-muted-foreground/70 shrink-0">
              Esc
            </kbd>
          </div>

          {/* 主体 */}
          {showThreeCol ? (
            <div className="flex h-[380px]">

              {/* 左：分类筛选 */}
              <div className="w-[140px] border-r border-border py-2.5 flex flex-col gap-0.5 overflow-y-auto shrink-0 bg-muted/10">
                <div className="px-3 pb-1.5">
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                    分类
                  </span>
                </div>

                {/* 全部 */}
                <button
                  onClick={() => { setActiveCategory('all'); setActiveIdx(0); }}
                  className={cn(
                    'flex items-center justify-between mx-2 px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer',
                    activeCategory === 'all'
                      ? 'bg-foreground/8 text-foreground'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )}
                >
                  <span className="text-xs font-medium">{t('search.catAll')}</span>
                  <span className={cn(
                    'text-[10px] font-mono tabular-nums',
                    activeCategory === 'all' ? 'text-foreground/60' : 'text-muted-foreground/50',
                  )}>
                    {isPending ? '···' : allResults.length}
                  </span>
                </button>

                {/* 已有结果的分类 */}
                {(Object.entries(counts) as [Category, number][]).map(([cat, count]) => {
                  const CatIcon = CATEGORY_ICON[cat];
                  const isActive = activeCategory === cat;
                  const colors = CAT_COLOR[cat];
                  const isLoading = loadingCats.has(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setActiveIdx(0); }}
                      className={cn(
                        'flex items-center justify-between mx-2 px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer',
                        isActive
                          ? cn('bg-foreground/8 text-foreground')
                          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                      )}
                    >
                      <span className="flex items-center gap-2 text-xs font-medium">
                        <CatIcon size={11} className={isActive ? colors.iconText : ''} />
                        {t(`search.cat${cat.charAt(0).toUpperCase() + cat.slice(1)}`)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        {isLoading && <span className={cn('w-1 h-1 rounded-full animate-pulse', colors.iconText)} />}
                        <span className={cn(
                          'text-[10px] font-mono tabular-nums',
                          isActive ? 'text-foreground/60' : 'text-muted-foreground/50',
                        )}>
                          {count}
                        </span>
                      </span>
                    </button>
                  );
                })}

                {/* 加载中、尚无结果的分类 */}
                {ASYNC_CATS.filter(cat => loadingCats.has(cat) && !counts[cat]).map(cat => {
                  const CatIcon = CATEGORY_ICON[cat];
                  const colors = CAT_COLOR[cat];
                  return (
                    <div key={cat} className="flex items-center justify-between mx-2 px-2.5 py-1.5 rounded-lg text-muted-foreground/30">
                      <span className="flex items-center gap-2 text-xs">
                        <CatIcon size={11} />
                        {t(`search.cat${cat.charAt(0).toUpperCase() + cat.slice(1)}`)}
                      </span>
                      <span className={cn('w-1 h-1 rounded-full animate-pulse', colors.iconText)} />
                    </div>
                  );
                })}
              </div>

              {/* 中：结果列表 */}
              <div ref={listRef} className="flex-1 overflow-y-auto">
                {grouped.map(group => {
                  const CatIcon = CATEGORY_ICON[group.category];
                  const colors = CAT_COLOR[group.category];
                  return (
                    <div key={group.category} className="py-1">
                      {activeCategory === 'all' && (
                        <div className="flex items-center gap-2 px-3 pt-2.5 pb-1">
                          <CatIcon size={10} className={cn(colors.iconText, 'opacity-60')} />
                          <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                            {t(`search.cat${group.category.charAt(0).toUpperCase() + group.category.slice(1)}`)}
                          </span>
                        </div>
                      )}
                      {group.items.map(result => {
                        flatIdx++;
                        const idx = flatIdx;
                        const isActive = idx === activeIdx;
                        const rColors = CAT_COLOR[result.category];
                        return (
                          <button
                            key={result.id}
                            data-idx={idx}
                            onClick={() => select(result)}
                            onMouseEnter={() => setActiveIdx(idx)}
                            style={{ animationDelay: `${idx * 20}ms` }}
                            className={cn(
                              'w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all duration-100 cursor-pointer',
                              'animate-in fade-in slide-in-from-left-1',
                              isActive
                                ? cn('bg-muted border-l-2', rColors.accent)
                                : 'border-l-2 border-transparent hover:bg-muted/40',
                            )}
                          >
                            <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', rColors.iconBg)}>
                              <CatIcon size={12} className={rColors.iconText} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate leading-snug">{result.title}</p>
                              {result.subtitle && (
                                <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-mono">{result.subtitle}</p>
                              )}
                            </div>
                            {result.badge && (
                              <span className={cn(
                                'text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 tabular-nums',
                                result.badgeDanger
                                  ? 'bg-rose-500/12 text-rose-600 dark:text-rose-400'
                                  : result.badgeUp !== undefined
                                    ? result.badgeUp
                                      ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                                      : 'bg-rose-500/12 text-rose-600 dark:text-rose-400'
                                    : cn(rColors.badgeBg, rColors.badgeText),
                              )}>
                                {result.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}

                {/* 骨架 */}
                {isPending && (activeCategory === 'all' || ASYNC_CATS.includes(activeCategory as Category)) && (
                  <div className="py-1">
                    {activeCategory === 'all' && (
                      <div className="flex items-center gap-2 px-3 pt-2.5 pb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20 animate-pulse" />
                        <span className="text-[9px] font-bold text-muted-foreground/25 uppercase tracking-widest">加载中</span>
                      </div>
                    )}
                    <SkeletonRow delay={0} />
                    <SkeletonRow delay={80} />
                    <SkeletonRow delay={160} />
                  </div>
                )}

                {/* 无结果 */}
                {!isPending && filteredResults.length === 0 && hasQuery && (
                  <div className="flex flex-col items-center justify-center py-16 gap-2">
                    <Search size={20} className="text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground/50">{t('search.noResults', { query })}</p>
                  </div>
                )}
              </div>

              {/* 右：预览面板 */}
              <div className="w-[200px] border-l border-border shrink-0 bg-muted/10">
                <PreviewPanel result={previewResult} />
              </div>
            </div>
          ) : (
            /* 空态 */
            <div className="py-14 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center">
                <Search size={18} className="text-muted-foreground/30" />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{t('search.hint')}</p>
                <p className="text-xs text-muted-foreground/40 mt-1">{t('search.hintSub')}</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/30 mt-1">
                <kbd className="bg-muted/60 border border-border/60 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
                <span>唤起</span>
                <span className="mx-1">·</span>
                <kbd className="bg-muted/60 border border-border/60 rounded px-1.5 py-0.5 font-mono">Esc</kbd>
                <span>关闭</span>
              </div>
            </div>
          )}

          {/* 底部快捷键 */}
          {showThreeCol && (
            <div className="flex items-center gap-5 px-4 py-2 border-t border-border bg-muted/10">
              {[
                { key: '↑↓', label: t('search.keyNav') },
                { key: '↵',  label: t('search.keyConfirm') },
                { key: 'Esc', label: t('search.keyClose') },
              ].map(({ key, label }) => (
                <span key={key} className="text-[10px] text-muted-foreground/40 flex items-center gap-1.5">
                  <kbd className="bg-muted/60 border border-border/60 rounded px-1.5 py-0.5 font-mono text-muted-foreground/60">{key}</kbd>
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </>
  );
}
