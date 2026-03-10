import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search, Plus, Mail, MessageSquare, Bell, Share2,
  Play, Pause, TrendingUp, Users, Target,
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

type CampaignType   = 'email' | 'sms' | 'push' | 'social';
type CampaignStatus = 'draft' | 'running' | 'paused' | 'ended';

interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  channel: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  target: number;
  reach: number;
  openRate: number;
  conversion: number;
  budget: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK: Campaign[] = [
  { id: 'CA001', name: '2026春季大促 — 全品类折扣',  type: 'email',  channel: 'SendGrid',  status: 'running', startDate: '2026-03-01', endDate: '2026-03-31', target: 50000, reach: 38420, openRate: 28.5, conversion: 6.2,  budget: 15 },
  { id: 'CA002', name: '3月会员积分翻倍活动',          type: 'sms',    channel: '阿里云SMS', status: 'running', startDate: '2026-03-05', endDate: '2026-03-20', target: 20000, reach: 19850, openRate: 91.0, conversion: 9.8,  budget: 8  },
  { id: 'CA003', name: '新用户注册欢迎推送',            type: 'push',   channel: 'Firebase', status: 'running', startDate: '2026-01-01', endDate: '2026-12-31', target: 99999, reach: 5620,  openRate: 64.3, conversion: 22.1, budget: 5  },
  { id: 'CA004', name: '沉默用户唤醒计划 Q1',          type: 'email',  channel: 'SendGrid',  status: 'paused',  startDate: '2026-02-15', endDate: '2026-03-15', target: 8000,  reach: 4100,  openRate: 18.2, conversion: 2.4,  budget: 6  },
  { id: 'CA005', name: '微博话题营销 — #智能工作日#',   type: 'social', channel: '微博',      status: 'ended',   startDate: '2026-02-01', endDate: '2026-02-28', target: 100000, reach: 245000, openRate: 45.8, conversion: 3.1, budget: 30 },
  { id: 'CA006', name: 'Q2 产品发布预热邮件',           type: 'email',  channel: 'SendGrid',  status: 'draft',   startDate: '2026-04-01', endDate: '2026-04-07', target: 30000, reach: 0,     openRate: 0,    conversion: 0,    budget: 10 },
  { id: 'CA007', name: '年度客户答谢礼品短信通知',       type: 'sms',    channel: '腾讯云SMS', status: 'ended',   startDate: '2026-01-15', endDate: '2026-01-20', target: 5000,  reach: 4985,  openRate: 99.7, conversion: 31.2, budget: 3  },
  { id: 'CA008', name: '小程序新功能上线推送',           type: 'push',   channel: '微信',      status: 'running', startDate: '2026-03-08', endDate: '2026-03-15', target: 15000, reach: 11230, openRate: 72.1, conversion: 15.8, budget: 2  },
];

// ── Config ─────────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<CampaignType, {
  bg: string; text: string; icon: React.ComponentType<{ size?: number; className?: string }>;
}> = {
  email:  { bg: 'bg-blue-500/10',   text: 'text-blue-600',   icon: Mail         },
  sms:    { bg: 'bg-green-500/10',  text: 'text-green-600',  icon: MessageSquare },
  push:   { bg: 'bg-purple-500/10', text: 'text-purple-600', icon: Bell          },
  social: { bg: 'bg-pink-500/10',   text: 'text-pink-600',   icon: Share2        },
};

const STATUS_CFG: Record<CampaignStatus, { bg: string; text: string }> = {
  draft:   { bg: 'bg-muted',          text: 'text-muted-foreground' },
  running: { bg: 'bg-emerald-500/10', text: 'text-emerald-600'      },
  paused:  { bg: 'bg-orange-500/10',  text: 'text-orange-600'       },
  ended:   { bg: 'bg-slate-500/10',   text: 'text-slate-500'        },
};

// ── Progress ───────────────────────────────────────────────────────────────────

function ReachBar({ reach, target }: { reach: number; target: number }) {
  const pct = target > 0 ? Math.min(100, (reach / target) * 100) : 0;
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-orange-400';
  return (
    <div>
      <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
        <span>{reach.toLocaleString()}</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="w-28 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── CreateDialog ───────────────────────────────────────────────────────────────

function CreateDialog({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void;
  onCreate: (c: Omit<Campaign, 'id' | 'reach' | 'openRate' | 'conversion'>) => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '', type: 'email' as CampaignType, channel: '', status: 'draft' as CampaignStatus,
    startDate: '', endDate: '', target: 10000, budget: 10,
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  function handleSave() {
    if (!form.name.trim()) return;
    onCreate(form);
    onClose();
  }

  const TYPE_ICONS: Record<CampaignType, React.ComponentType<{ size?: number; className?: string }>> = {
    email: Mail, sms: MessageSquare, push: Bell, social: Share2,
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{t('campaigns.createTitle')}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">{t('campaigns.nameLabel')} *</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('campaigns.typeLabel')}</Label>
            <Select value={form.type} onValueChange={v => set('type', v as CampaignType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(['email','sms','push','social'] as CampaignType[]).map(ty => {
                  const Icon = TYPE_ICONS[ty];
                  return (
                    <SelectItem key={ty} value={ty}>
                      <span className="flex items-center gap-2"><Icon size={13} />{t(`campaigns.${ty}`)}</span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('campaigns.channelLabel')}</Label>
            <Input value={form.channel} onChange={e => set('channel', e.target.value)} placeholder="SendGrid / 阿里云..." />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('campaigns.startDate')}</Label>
            <Input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('campaigns.endDate')}</Label>
            <Input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('campaigns.targetLabel')}</Label>
            <Input type="number" min={0} value={form.target}
              onChange={e => set('target', parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t('campaigns.budgetLabel')}</Label>
            <Input type="number" min={0} value={form.budget}
              onChange={e => set('budget', parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('campaigns.cancel')}</Button>
          <Button onClick={handleSave} disabled={!form.name.trim()}>{t('campaigns.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const { t } = useTranslation();

  const [campaigns, setCampaigns]         = useState<Campaign[]>(MOCK);
  const [keyword, setKeyword]             = useState('');
  const [typeFilter, setTypeFilter]       = useState<'all' | CampaignType>('all');
  const [statusFilter, setStatusFilter]   = useState<'all' | CampaignStatus>('all');
  const [dialogOpen, setDialogOpen]       = useState(false);

  const filtered = useMemo(() =>
    campaigns.filter(c => {
      const kw = keyword.toLowerCase();
      const matchKw = !kw || c.name.toLowerCase().includes(kw) || c.id.toLowerCase().includes(kw);
      const matchT  = typeFilter   === 'all' || c.type   === typeFilter;
      const matchS  = statusFilter === 'all' || c.status === statusFilter;
      return matchKw && matchT && matchS;
    }),
  [campaigns, keyword, typeFilter, statusFilter]);

  const stats = useMemo(() => ({
    activeCount:  campaigns.filter(c => c.status === 'running').length,
    totalReach:   campaigns.reduce((s, c) => s + c.reach, 0),
    avgOpenRate:  (campaigns.filter(c => c.reach > 0).reduce((s, c) => s + c.openRate, 0) /
                   Math.max(1, campaigns.filter(c => c.reach > 0).length)).toFixed(1) + '%',
    roi:          ((campaigns.reduce((s, c) => s + c.conversion * c.reach / 100, 0) /
                    Math.max(1, campaigns.reduce((s, c) => s + c.budget, 0))) * 100).toFixed(0) + '%',
  }), [campaigns]);

  function togglePause(id: string) {
    setCampaigns(prev => prev.map(c => {
      if (c.id !== id) return c;
      const next: CampaignStatus = c.status === 'running' ? 'paused' : 'running';
      return { ...c, status: next };
    }));
  }

  function handleCreate(data: Omit<Campaign, 'id' | 'reach' | 'openRate' | 'conversion'>) {
    const newC: Campaign = {
      ...data,
      id: `CA${String(campaigns.length + 1).padStart(3, '0')}`,
      reach: 0, openRate: 0, conversion: 0,
    };
    setCampaigns(prev => [newC, ...prev]);
  }

  return (
    <div className="p-8 space-y-4">

      {/* 页头 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('campaigns.title')}</h1>
        <Button onClick={() => setDialogOpen(true)} className="gap-1.5">
          <Plus size={15} />{t('campaigns.add')}
        </Button>
      </div>

      {/* 统计 */}
      <div data-hoverable className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1.5"><Play size={13} className="text-emerald-500" /><p className="text-xs text-muted-foreground">{t('campaigns.activeCount')}</p></div>
            <p className="text-2xl font-bold text-emerald-600">{stats.activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1.5"><Users size={13} className="text-muted-foreground" /><p className="text-xs text-muted-foreground">{t('campaigns.totalReach')}</p></div>
            <p className="text-2xl font-bold tabular-nums">{stats.totalReach.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1.5"><TrendingUp size={13} className="text-muted-foreground" /><p className="text-xs text-muted-foreground">{t('campaigns.avgOpenRate')}</p></div>
            <p className="text-2xl font-bold tabular-nums text-primary">{stats.avgOpenRate}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-1.5"><Target size={13} className="text-muted-foreground" /><p className="text-xs text-muted-foreground">{t('campaigns.roi')}</p></div>
            <p className="text-2xl font-bold tabular-nums">{stats.roi}</p>
          </CardContent>
        </Card>
      </div>

      {/* 过滤栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder={t('campaigns.search')} value={keyword}
                onChange={e => setKeyword(e.target.value)} />
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant={typeFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setTypeFilter('all')}>{t('campaigns.all')}</Button>
              {(['email','sms','push','social'] as CampaignType[]).map(ty => {
                const cfg = TYPE_CFG[ty];
                const Icon = cfg.icon;
                return (
                  <Button key={ty} size="sm" variant={typeFilter === ty ? 'default' : 'outline'}
                    onClick={() => setTypeFilter(ty)}>
                    <Icon size={12} className="mr-1" />{t(`campaigns.${ty}`)}
                  </Button>
                );
              })}
            </div>
            <div className="flex gap-1">
              {(['all','draft','running','paused','ended'] as const).map(s => (
                <Button key={s} size="sm" variant={statusFilter === s ? 'default' : 'outline'}
                  className={s === 'running' && statusFilter === 'running' ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white' : ''}
                  onClick={() => setStatusFilter(s)}>
                  {s === 'all' ? t('campaigns.all') : t(`campaigns.${s}`)}
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
              <TableHead className="w-24">{t('campaigns.id')}</TableHead>
              <TableHead>{t('campaigns.name')}</TableHead>
              <TableHead className="w-24">{t('campaigns.type')}</TableHead>
              <TableHead className="w-24">{t('campaigns.status')}</TableHead>
              <TableHead>{t('campaigns.dateRange')}</TableHead>
              <TableHead>{t('campaigns.reach')}</TableHead>
              <TableHead className="text-right w-24">{t('campaigns.openRate')}</TableHead>
              <TableHead className="text-right w-24">{t('campaigns.conversion')}</TableHead>
              <TableHead className="text-right w-24">{t('campaigns.budget')}</TableHead>
              <TableHead className="text-right w-24">{t('campaigns.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => {
              const tc = TYPE_CFG[c.type];
              const sc = STATUS_CFG[c.status];
              const TypeIcon = tc.icon;
              const canToggle = c.status === 'running' || c.status === 'paused';
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{c.id}</TableCell>
                  <TableCell>
                    <p className="text-sm font-medium max-w-[220px] truncate">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">{c.channel}</p>
                  </TableCell>
                  <TableCell>
                    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full', tc.bg, tc.text)}>
                      <TypeIcon size={10} />
                      {t(`campaigns.${c.type}`)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', sc.bg, sc.text)}>
                      {t(`campaigns.${c.status}`)}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {c.startDate}<br />{c.endDate}
                  </TableCell>
                  <TableCell><ReachBar reach={c.reach} target={c.target} /></TableCell>
                  <TableCell className={cn('text-right text-sm font-medium tabular-nums', c.openRate > 0 ? 'text-foreground' : 'text-muted-foreground')}>
                    {c.openRate > 0 ? `${c.openRate}%` : '—'}
                  </TableCell>
                  <TableCell className={cn('text-right text-sm font-semibold tabular-nums', c.conversion > 0 ? 'text-primary' : 'text-muted-foreground')}>
                    {c.conversion > 0 ? `${c.conversion}%` : '—'}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">{c.budget}万</TableCell>
                  <TableCell className="text-right">
                    {canToggle && (
                      <Button variant="outline" size="sm" onClick={() => togglePause(c.id)}
                        className="gap-1">
                        {c.status === 'running'
                          ? <><Pause size={11} />{t('campaigns.pause')}</>
                          : <><Play  size={11} />{t('campaigns.resume')}</>}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="py-12 text-center text-muted-foreground">
                  {t('campaigns.noData')}
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
