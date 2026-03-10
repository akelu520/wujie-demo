import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, AlertTriangle, Clock, CheckCircle2, Inbox } from 'lucide-react';
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

type Priority  = 'p1' | 'p2' | 'p3' | 'p4';
type TStatus   = 'open' | 'processing' | 'resolved' | 'closed';
type Category  = 'tech' | 'billing' | 'complaint' | 'inquiry';
type SLAState  = 'ok' | 'warn' | 'over';

interface Ticket {
  id: string;
  subject: string;
  customer: string;
  priority: Priority;
  category: Category;
  assignee: string;
  status: TStatus;
  sla: SLAState;
  createdAt: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const AGENTS = ['王晓梅', '李志远', '张文静', '刘海波', '陈晓宇'];

const MOCK: Ticket[] = [
  { id: 'T-2026-001', subject: '系统登录后持续弹出报错弹窗',       customer: '张伟',   priority: 'p1', category: 'tech',      assignee: '王晓梅', status: 'open',       sla: 'over', createdAt: '2026-03-08 09:15' },
  { id: 'T-2026-002', subject: '3月账单金额与预期不符',             customer: '李婷',   priority: 'p2', category: 'billing',   assignee: '李志远', status: 'processing', sla: 'warn', createdAt: '2026-03-08 11:30' },
  { id: 'T-2026-003', subject: '数据导出功能无法正常使用',           customer: '刘洋',   priority: 'p2', category: 'tech',      assignee: '张文静', status: 'processing', sla: 'ok',   createdAt: '2026-03-09 08:05' },
  { id: 'T-2026-004', subject: '请求增加子账号管理权限',             customer: '陈佳',   priority: 'p3', category: 'inquiry',   assignee: '刘海波', status: 'open',       sla: 'ok',   createdAt: '2026-03-09 10:22' },
  { id: 'T-2026-005', subject: '服务态度问题投诉',                  customer: '赵磊',   priority: 'p2', category: 'complaint', assignee: '陈晓宇', status: 'processing', sla: 'warn', createdAt: '2026-03-09 13:47' },
  { id: 'T-2026-006', subject: '如何配置 Webhook 回调地址',         customer: '林海',   priority: 'p4', category: 'inquiry',   assignee: '王晓梅', status: 'resolved',   sla: 'ok',   createdAt: '2026-03-07 16:10' },
  { id: 'T-2026-007', subject: '批量导入模板格式说明',              customer: '孙雪',   priority: 'p4', category: 'inquiry',   assignee: '李志远', status: 'resolved',   sla: 'ok',   createdAt: '2026-03-07 14:00' },
  { id: 'T-2026-008', subject: 'API 调用频率限制问题',              customer: '吴强',   priority: 'p2', category: 'tech',      assignee: '张文静', status: 'open',       sla: 'ok',   createdAt: '2026-03-10 09:33' },
  { id: 'T-2026-009', subject: '账号被锁定无法登录',                customer: '黄芳',   priority: 'p1', category: 'tech',      assignee: '刘海波', status: 'processing', sla: 'over', createdAt: '2026-03-10 07:55' },
  { id: 'T-2026-010', subject: '申请退款 — 功能不满足需求',          customer: '徐明',   priority: 'p3', category: 'billing',   assignee: '陈晓宇', status: 'closed',     sla: 'ok',   createdAt: '2026-03-06 15:20' },
];

// ── Config ─────────────────────────────────────────────────────────────────────

const PRI_CFG: Record<Priority, { bg: string; text: string; border: string }> = {
  p1: { bg: 'bg-red-500/10',    text: 'text-red-600',    border: 'border-red-200'    },
  p2: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-200' },
  p3: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-200' },
  p4: { bg: 'bg-muted',         text: 'text-muted-foreground', border: 'border-border' },
};

const STA_CFG: Record<TStatus, { bg: string; text: string }> = {
  open:       { bg: 'bg-red-500/10',     text: 'text-red-600'         },
  processing: { bg: 'bg-orange-500/10',  text: 'text-orange-600'      },
  resolved:   { bg: 'bg-emerald-500/10', text: 'text-emerald-600'     },
  closed:     { bg: 'bg-muted',          text: 'text-muted-foreground' },
};

const SLA_CFG: Record<SLAState, { bg: string; text: string }> = {
  ok:   { bg: 'bg-emerald-500/10', text: 'text-emerald-600'    },
  warn: { bg: 'bg-amber-500/10',   text: 'text-amber-600'      },
  over: { bg: 'bg-red-500/10',     text: 'text-red-600'        },
};

// ── StatCard ───────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, valueClass = '' }: {
  icon?: React.ReactNode; label: string; value: string | number; valueClass?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-1.5">{icon}<p className="text-xs text-muted-foreground">{label}</p></div>
        <p className={cn('text-2xl font-bold tabular-nums', valueClass)}>{value}</p>
      </CardContent>
    </Card>
  );
}

// ── CreateDialog ───────────────────────────────────────────────────────────────

function CreateDialog({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void;
  onCreate: (t: Omit<Ticket, 'id' | 'createdAt' | 'sla'>) => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    subject: '', customer: '', priority: 'p3' as Priority,
    category: 'inquiry' as Category, assignee: AGENTS[0], status: 'open' as TStatus,
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  function handleSave() {
    if (!form.subject.trim() || !form.customer.trim()) return;
    onCreate(form);
    onClose();
    setForm({ subject: '', customer: '', priority: 'p3', category: 'inquiry', assignee: AGENTS[0], status: 'open' });
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{t('tickets.createTitle')}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">{t('tickets.subjectLabel')} *</Label>
            <Input value={form.subject} onChange={e => set('subject', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('tickets.customerLabel')} *</Label>
            <Input value={form.customer} onChange={e => set('customer', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{t('tickets.priorityLabel')}</Label>
              <Select value={form.priority} onValueChange={v => set('priority', v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['p1','p2','p3','p4'] as Priority[]).map(p => (
                    <SelectItem key={p} value={p}>{t(`tickets.${p}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('tickets.categoryLabel')}</Label>
              <Select value={form.category} onValueChange={v => set('category', v as Category)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['tech','billing','complaint','inquiry'] as Category[]).map(c => (
                    <SelectItem key={c} value={c}>{t(`tickets.${c}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('tickets.assigneeLabel')}</Label>
            <Select value={form.assignee} onValueChange={v => set('assignee', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {AGENTS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('tickets.cancel')}</Button>
          <Button onClick={handleSave} disabled={!form.subject.trim() || !form.customer.trim()}>{t('tickets.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TicketsPage() {
  const { t } = useTranslation();

  const [tickets, setTickets]             = useState<Ticket[]>(MOCK);
  const [keyword, setKeyword]             = useState('');
  const [statusFilter, setStatusFilter]   = useState<'all' | TStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [dialogOpen, setDialogOpen]       = useState(false);

  const filtered = useMemo(() =>
    tickets.filter(t => {
      const kw = keyword.toLowerCase();
      const matchKw = !kw || t.id.toLowerCase().includes(kw) || t.subject.includes(kw) || t.customer.includes(kw);
      const matchS = statusFilter   === 'all' || t.status   === statusFilter;
      const matchP = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchKw && matchS && matchP;
    }),
  [tickets, keyword, statusFilter, priorityFilter]);

  const stats = useMemo(() => ({
    total:         tickets.length,
    open:          tickets.filter(t => t.status === 'open').length,
    processing:    tickets.filter(t => t.status === 'processing').length,
    resolvedToday: tickets.filter(t => t.status === 'resolved').length,
  }), [tickets]);

  function handleCreate(data: Omit<Ticket, 'id' | 'createdAt' | 'sla'>) {
    const now = new Date();
    const newT: Ticket = {
      ...data,
      id: `T-2026-${String(tickets.length + 1).padStart(3, '0')}`,
      sla: 'ok',
      createdAt: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
    };
    setTickets(prev => [newT, ...prev]);
  }

  function resolveTicket(id: string) {
    setTickets(prev => prev.map(t =>
      t.id === id ? { ...t, status: 'resolved' as TStatus } : t,
    ));
  }

  return (
    <div className="p-8 space-y-4">

      {/* 页头 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('tickets.title')}</h1>
        <Button onClick={() => setDialogOpen(true)} className="gap-1.5">
          <Plus size={15} />{t('tickets.add')}
        </Button>
      </div>

      {/* 统计 */}
      <div data-hoverable className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('tickets.total')}         value={stats.total} icon={<Inbox size={14} className="text-muted-foreground" />} />
        <StatCard label={t('tickets.open')}          value={stats.open}          valueClass={stats.open > 0 ? 'text-red-500' : ''} icon={<AlertTriangle size={14} className={stats.open > 0 ? 'text-red-500' : 'text-muted-foreground'} />} />
        <StatCard label={t('tickets.processing')}    value={stats.processing}    valueClass="text-orange-500" icon={<Clock size={14} className="text-orange-500" />} />
        <StatCard label={t('tickets.resolvedToday')} value={stats.resolvedToday} valueClass="text-emerald-600" icon={<CheckCircle2 size={14} className="text-emerald-600" />} />
      </div>

      {/* 过滤栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder={t('tickets.search')} value={keyword}
                onChange={e => setKeyword(e.target.value)} />
            </div>
            <div className="flex gap-1">
              {(['all', 'open', 'processing', 'resolved', 'closed'] as const).map(s => (
                <Button key={s} size="sm" variant={statusFilter === s ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(s)}>
                  {s === 'all' ? t('tickets.all') : t(`tickets.${s === 'open' ? 'openStatus' : s === 'processing' ? 'processingStatus' : s}`)}
                </Button>
              ))}
            </div>
            <div className="flex gap-1">
              {(['all', 'p1', 'p2', 'p3', 'p4'] as const).map(p => (
                <Button
                  key={p}
                  size="sm"
                  variant={priorityFilter === p ? 'default' : 'outline'}
                  className={
                    p === 'p1' && priorityFilter === p ? 'bg-red-600 hover:bg-red-700 border-red-600 text-white' :
                    p === 'p2' && priorityFilter === p ? 'bg-orange-500 hover:bg-orange-600 border-orange-500 text-white' : ''
                  }
                  onClick={() => setPriorityFilter(p)}
                >
                  {p === 'all' ? t('tickets.all') : t(`tickets.${p}`)}
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
              <TableHead className="w-32">{t('tickets.id')}</TableHead>
              <TableHead>{t('tickets.subject')}</TableHead>
              <TableHead className="w-24">{t('tickets.customer')}</TableHead>
              <TableHead className="w-24">{t('tickets.priority')}</TableHead>
              <TableHead className="w-24">{t('tickets.category')}</TableHead>
              <TableHead className="w-24">{t('tickets.assignee')}</TableHead>
              <TableHead className="w-20">{t('tickets.sla')}</TableHead>
              <TableHead className="w-24">{t('tickets.status')}</TableHead>
              <TableHead className="w-36">{t('tickets.createdAt')}</TableHead>
              <TableHead className="text-right w-28">{t('tickets.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(ticket => {
              const pc  = PRI_CFG[ticket.priority];
              const sc  = STA_CFG[ticket.status];
              const slc = SLA_CFG[ticket.sla];
              const canResolve = ticket.status === 'open' || ticket.status === 'processing';
              return (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{ticket.id}</TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="text-sm font-medium truncate">{ticket.subject}</p>
                  </TableCell>
                  <TableCell className="text-sm">{ticket.customer}</TableCell>
                  <TableCell>
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded border', pc.bg, pc.text, pc.border)}>
                      {t(`tickets.${ticket.priority}`)}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t(`tickets.${ticket.category}`)}</TableCell>
                  <TableCell className="text-sm">{ticket.assignee}</TableCell>
                  <TableCell>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', slc.bg, slc.text)}>
                      {t(`tickets.sla${ticket.sla.slice(0, 1).toUpperCase()}${ticket.sla.slice(1)}`)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', sc.bg, sc.text)}>
                      {t(`tickets.${ticket.status === 'open' ? 'openStatus' : ticket.status === 'processing' ? 'processingStatus' : ticket.status}`)}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{ticket.createdAt}</TableCell>
                  <TableCell className="text-right">
                    {canResolve && (
                      <Button variant="outline" size="sm" onClick={() => resolveTicket(ticket.id)}>
                        {t('tickets.resolve')}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="py-12 text-center text-muted-foreground">
                  {t('tickets.noData')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <CreateDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreate={handleCreate} />
    </div>
  );
}
