import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search, Plus, Star, Phone, Mail, Building2, MoreHorizontal,
  Edit2, Bell, UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table.tsx';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog.tsx';
import { Label } from '@/components/ui/label.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { cn } from '@/lib/utils.ts';

// ── Types ──────────────────────────────────────────────────────────────────────

type Tier    = 'gold' | 'silver' | 'bronze';
type CType   = 'enterprise' | 'individual';
type CStatus = 'active' | 'inactive' | 'churn';
type Source  = 'direct' | 'referral' | 'online' | 'event';

interface Customer {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  tier: Tier;
  type: CType;
  status: CStatus;
  source: Source;
  lastContact: string;
  notes: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK: Customer[] = [
  { id: 'C001', name: '张伟',  company: '星辰科技有限公司',    phone: '138-0010-1234', email: 'zhang.wei@xingchen.com',    tier: 'gold',   type: 'enterprise', status: 'active',   source: 'direct',   lastContact: '2026-03-08', notes: '年度合同即将到期，需重点跟进续约' },
  { id: 'C002', name: '李婷',  company: '未来数字传媒',        phone: '139-2200-5678', email: 'li.ting@future.com',         tier: 'silver', type: 'enterprise', status: 'active',   source: 'referral', lastContact: '2026-03-05', notes: '对新产品线感兴趣，等待报价' },
  { id: 'C003', name: '王浩',  company: '—',                   phone: '135-6600-9012', email: 'wang.hao@gmail.com',         tier: 'bronze', type: 'individual', status: 'inactive', source: 'online',   lastContact: '2026-01-20', notes: '已三个月未响应，考虑激活活动' },
  { id: 'C004', name: '刘洋',  company: '鸿远集团股份有限公司', phone: '136-8800-3456', email: 'liu.yang@hongyuan.com',      tier: 'gold',   type: 'enterprise', status: 'active',   source: 'event',    lastContact: '2026-03-09', notes: 'VIP客户，季度复盘已安排' },
  { id: 'C005', name: '陈佳',  company: '智汇咨询',            phone: '137-4400-7890', email: 'chen.jia@zhihui.com',       tier: 'silver', type: 'enterprise', status: 'active',   source: 'referral', lastContact: '2026-02-28', notes: '需要定制化培训方案' },
  { id: 'C006', name: '赵磊',  company: '—',                   phone: '150-2200-1111', email: 'zhao.lei@163.com',          tier: 'bronze', type: 'individual', status: 'churn',    source: 'online',   lastContact: '2025-11-10', notes: '价格问题流失，可考虑优惠回访' },
  { id: 'C007', name: '孙雪',  company: '明月广告创意',        phone: '151-3300-2222', email: 'sun.xue@mingyue.com',       tier: 'silver', type: 'enterprise', status: 'active',   source: 'direct',   lastContact: '2026-03-01', notes: '正在评估竞品，保持联系' },
  { id: 'C008', name: '吴强',  company: '博远物流科技',        phone: '152-4400-3333', email: 'wu.qiang@boyuan.com',       tier: 'gold',   type: 'enterprise', status: 'active',   source: 'event',    lastContact: '2026-03-07', notes: '已签署意向协议，等待法务审核' },
  { id: 'C009', name: '郑月',  company: '—',                   phone: '153-5500-4444', email: 'zheng.yue@outlook.com',    tier: 'bronze', type: 'individual', status: 'inactive', source: 'online',   lastContact: '2026-01-05', notes: '需要产品演示' },
  { id: 'C010', name: '林海',  company: '锐锋投资管理',        phone: '158-6600-5555', email: 'lin.hai@ruifeng.com',       tier: 'gold',   type: 'enterprise', status: 'active',   source: 'referral', lastContact: '2026-03-09', notes: '引荐人为C004，优先服务' },
  { id: 'C011', name: '黄芳',  company: '晨曦教育集团',        phone: '159-7700-6666', email: 'huang.fang@chenxi-edu.com', tier: 'silver', type: 'enterprise', status: 'active',   source: 'event',    lastContact: '2026-02-20', notes: '教育行业定制需求，方案中' },
  { id: 'C012', name: '徐明',  company: '—',                   phone: '176-8800-7777', email: 'xu.ming@foxmail.com',       tier: 'bronze', type: 'individual', status: 'churn',    source: 'online',   lastContact: '2025-10-03', notes: '已退款，注意不满情绪' },
];

// ── Config ─────────────────────────────────────────────────────────────────────

const TIER_CFG: Record<Tier, { bg: string; text: string }> = {
  gold:   { bg: 'bg-amber-500/10',  text: 'text-amber-600'  },
  silver: { bg: 'bg-slate-400/10',  text: 'text-slate-500'  },
  bronze: { bg: 'bg-orange-400/10', text: 'text-orange-500' },
};

const STATUS_CFG: Record<CStatus, { bg: string; text: string }> = {
  active:   { bg: 'bg-emerald-500/10', text: 'text-emerald-600'     },
  inactive: { bg: 'bg-muted',          text: 'text-muted-foreground' },
  churn:    { bg: 'bg-red-500/10',     text: 'text-red-600'          },
};

// ── StatCard ───────────────────────────────────────────────────────────────────

function StatCard({ label, value, valueClass = '' }: {
  label: string; value: string | number; valueClass?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
        <p className={cn('text-2xl font-bold tabular-nums', valueClass)}>{value}</p>
      </CardContent>
    </Card>
  );
}

// ── CustomerDialog ─────────────────────────────────────────────────────────────

const EMPTY_FORM: Omit<Customer, 'id' | 'lastContact'> = {
  name: '', company: '', phone: '', email: '',
  tier: 'bronze', type: 'individual', status: 'active', source: 'online', notes: '',
};

function CustomerDialog({
  open, onClose, initial, onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Customer;
  onSave: (c: Omit<Customer, 'id' | 'lastContact'>) => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Omit<Customer, 'id' | 'lastContact'>>(
    initial
      ? { name: initial.name, company: initial.company, phone: initial.phone,
          email: initial.email, tier: initial.tier, type: initial.type,
          status: initial.status, source: initial.source, notes: initial.notes }
      : EMPTY_FORM,
  );

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  function handleSave() {
    if (!form.name.trim()) return;
    onSave(form);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? t('customers.editTitle') : t('customers.createTitle')}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">{t('customers.nameLabel')} *</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('customers.companyLabel')}</Label>
            <Input value={form.company} onChange={e => set('company', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('customers.phoneLabel')}</Label>
            <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="138-xxxx-xxxx" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('customers.emailLabel')}</Label>
            <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('customers.tierLabel')}</Label>
            <Select value={form.tier} onValueChange={v => set('tier', v as Tier)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gold">{t('customers.gold')}</SelectItem>
                <SelectItem value="silver">{t('customers.silver')}</SelectItem>
                <SelectItem value="bronze">{t('customers.bronze')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('customers.typeLabel')}</Label>
            <Select value={form.type} onValueChange={v => set('type', v as CType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="enterprise">{t('customers.enterprise')}</SelectItem>
                <SelectItem value="individual">{t('customers.individual')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('customers.statusLabel')}</Label>
            <Select value={form.status} onValueChange={v => set('status', v as CStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t('customers.active')}</SelectItem>
                <SelectItem value="inactive">{t('customers.inactive')}</SelectItem>
                <SelectItem value="churn">{t('customers.churn')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('customers.sourceLabel')}</Label>
            <Select value={form.source} onValueChange={v => set('source', v as Source)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">{t('customers.direct')}</SelectItem>
                <SelectItem value="referral">{t('customers.referral')}</SelectItem>
                <SelectItem value="online">{t('customers.online')}</SelectItem>
                <SelectItem value="event">{t('customers.event')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">{t('customers.notesLabel')}</Label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('customers.cancel')}</Button>
          <Button onClick={handleSave} disabled={!form.name.trim()}>{t('customers.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const { t } = useTranslation();

  const [customers, setCustomers]         = useState<Customer[]>(MOCK);
  const [keyword, setKeyword]             = useState('');
  const [tierFilter, setTierFilter]       = useState<'all' | Tier>('all');
  const [statusFilter, setStatusFilter]   = useState<'all' | CStatus>('all');
  const [dialogOpen, setDialogOpen]       = useState(false);
  const [editing, setEditing]             = useState<Customer | undefined>(undefined);
  const [followedIds, setFollowedIds]     = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId]       = useState<string | null>(null);

  const filtered = useMemo(() =>
    customers.filter(c => {
      const kw = keyword.toLowerCase();
      const matchKw = !kw || c.name.includes(kw) || c.phone.includes(kw) || c.company.toLowerCase().includes(kw);
      const matchTier   = tierFilter === 'all'   || c.tier   === tierFilter;
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchKw && matchTier && matchStatus;
    }),
  [customers, keyword, tierFilter, statusFilter]);

  const stats = useMemo(() => ({
    total:     customers.length,
    newMonth:  customers.filter(c => c.lastContact >= '2026-03-01').length,
    active:    customers.filter(c => c.status === 'active').length,
    churnRate: ((customers.filter(c => c.status === 'churn').length / customers.length) * 100).toFixed(1) + '%',
  }), [customers]);

  function openCreate() { setEditing(undefined); setDialogOpen(true); }
  function openEdit(c: Customer) { setEditing(c); setDialogOpen(true); }

  function handleSave(data: Omit<Customer, 'id' | 'lastContact'>) {
    if (editing) {
      setCustomers(prev => prev.map(c => c.id === editing.id ? { ...editing, ...data } : c));
    } else {
      const newC: Customer = {
        ...data,
        id: `C${String(customers.length + 1).padStart(3, '0')}`,
        lastContact: new Date().toISOString().slice(0, 10),
      };
      setCustomers(prev => [newC, ...prev]);
    }
  }

  function toggleFollow(id: string) {
    setFollowedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleExpand(id: string) {
    setExpandedId(prev => prev === id ? null : id);
  }

  return (
    <div className="p-8 space-y-4">

      {/* 页头 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('customers.title')}</h1>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={15} />{t('customers.add')}
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('customers.total')}       value={stats.total} />
        <StatCard label={t('customers.newMonth')}    value={stats.newMonth}  valueClass="text-primary" />
        <StatCard label={t('customers.activeCount')} value={stats.active}    valueClass="text-emerald-600" />
        <StatCard label={t('customers.churnRate')}   value={stats.churnRate} valueClass="text-red-500" />
      </div>

      {/* 过滤栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder={t('customers.search')} value={keyword}
                onChange={e => setKeyword(e.target.value)} />
            </div>
            <div className="flex gap-1">
              {(['all', 'gold', 'silver', 'bronze'] as const).map(tier => (
                <Button
                  key={tier}
                  size="sm"
                  variant={tierFilter === tier ? 'default' : 'outline'}
                  className={
                    tier === 'gold'   && tierFilter === tier ? 'bg-amber-500 hover:bg-amber-600 border-amber-500 text-white' :
                    tier === 'silver' && tierFilter === tier ? 'bg-slate-500 hover:bg-slate-600 border-slate-500 text-white' :
                    tier === 'bronze' && tierFilter === tier ? 'bg-orange-500 hover:bg-orange-600 border-orange-500 text-white' : ''
                  }
                  onClick={() => setTierFilter(tier)}
                >
                  {tier === 'all' ? t('customers.all') : <><Star size={11} className="mr-0.5 fill-current" />{t(`customers.${tier}`)}</>}
                </Button>
              ))}
            </div>
            <div className="flex gap-1">
              {(['all', 'active', 'inactive', 'churn'] as const).map(s => (
                <Button key={s} size="sm" variant={statusFilter === s ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(s)}>
                  {s === 'all' ? t('customers.all') : t(`customers.${s}`)}
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
              <TableHead className="w-20">{t('customers.id')}</TableHead>
              <TableHead>{t('customers.name')}</TableHead>
              <TableHead>{t('customers.company')}</TableHead>
              <TableHead>{t('customers.contact')}</TableHead>
              <TableHead>{t('customers.tier')}</TableHead>
              <TableHead>{t('customers.type')}</TableHead>
              <TableHead>{t('customers.status')}</TableHead>
              <TableHead>{t('customers.lastContact')}</TableHead>
              <TableHead className="text-right">{t('customers.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => {
              const tc = TIER_CFG[c.tier];
              const sc = STATUS_CFG[c.status];
              const followed = followedIds.has(c.id);
              const expanded = expandedId === c.id;
              return (
                <>
                  <TableRow
                    key={c.id}
                    className={cn('cursor-pointer', expanded && 'bg-muted/30')}
                    onClick={() => toggleExpand(c.id)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">{c.id}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[140px] truncate">{c.company || '—'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-xs"><Phone size={10} className="text-muted-foreground shrink-0" />{c.phone}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Mail size={10} className="shrink-0" />{c.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full', tc.bg, tc.text)}>
                        <Star size={9} className="fill-current" />
                        {t(`customers.${c.tier}`)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs">
                        {c.type === 'enterprise'
                          ? <Building2 size={11} className="text-muted-foreground" />
                          : <UserCheck  size={11} className="text-muted-foreground" />}
                        {t(`customers.${c.type}`)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', sc.bg, sc.text)}>
                        {t(`customers.${c.status}`)}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.lastContact}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <Button
                          variant="ghost" size="icon-sm"
                          title={t('customers.followUp')}
                          className={followed ? 'text-amber-500 hover:text-amber-600' : ''}
                          onClick={() => toggleFollow(c.id)}
                        >
                          <Bell size={13} />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(c)}>
                          <Edit2 size={13} />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                          <MoreHorizontal size={13} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expanded && (
                    <TableRow key={`${c.id}-exp`} className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={9} className="py-3 px-8">
                        <div className="flex items-start gap-8">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">{t('customers.notesLabel')}</p>
                            <p className="text-sm">{c.notes || '—'}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">{t('customers.sourceLabel')}</p>
                            <p className="text-sm">{t(`customers.${c.source}`)}</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">{t('customers.noData')}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <CustomerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initial={editing}
        onSave={handleSave}
      />
    </div>
  );
}
