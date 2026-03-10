import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search, Phone, Mail, Star, Tag, X, Plus, MessageSquare,
  PhoneCall, Send, Users, Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { cn } from '@/lib/utils.ts';

// ── Types ──────────────────────────────────────────────────────────────────────

type Tier   = 'gold' | 'silver' | 'bronze';
type IType  = 'call' | 'email_type' | 'visit' | 'meeting' | 'note';

interface Interaction {
  id: string;
  type: IType;
  summary: string;
  date: string;
  agent: string;
}

interface ProfileCustomer {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  tier: Tier;
  source: string;
  created: string;
  lastContact: string;
  tags: string[];
  interactions: Interaction[];
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const CUSTOMERS: ProfileCustomer[] = [
  {
    id: 'C001', name: '张伟', company: '星辰科技有限公司',
    phone: '138-0010-1234', email: 'zhang.wei@xingchen.com',
    tier: 'gold', source: '直销', created: '2024-06-15', lastContact: '2026-03-08',
    tags: ['VIP', '年度续约', '高决策权', '科技行业'],
    interactions: [
      { id: 'i1', type: 'call',       summary: '确认年度合同续约意向，对方表示积极，需本周发送方案', date: '2026-03-08', agent: '王销售' },
      { id: 'i2', type: 'meeting',    summary: '季度复盘会议，客户对Q4数据满意，提出新功能需求', date: '2026-02-20', agent: '李客户经理' },
      { id: 'i3', type: 'email_type', summary: '发送Q1产品升级报告，客户已确认收到', date: '2026-02-05', agent: '王销售' },
      { id: 'i4', type: 'visit',      summary: '拜访公司CTO，演示新版API集成方案', date: '2026-01-15', agent: '赵总监' },
      { id: 'i5', type: 'note',       summary: '客户反馈上月账单金额有疑问，已转交财务核查', date: '2025-12-20', agent: '王销售' },
    ],
  },
  {
    id: 'C002', name: '李婷', company: '未来数字传媒',
    phone: '139-2200-5678', email: 'li.ting@future.com',
    tier: 'silver', source: '转介绍', created: '2025-01-10', lastContact: '2026-03-05',
    tags: ['媒体行业', '对标竞品', '决策中'],
    interactions: [
      { id: 'i1', type: 'call',    summary: '初步了解需求，客户需要内容分发和数据分析模块', date: '2026-03-05', agent: '陈销售' },
      { id: 'i2', type: 'meeting', summary: '产品演示，客户对竞品A更熟悉，需提供对比文档', date: '2026-02-18', agent: '陈销售' },
      { id: 'i3', type: 'email_type', summary: '发送竞品对比分析报告', date: '2026-02-22', agent: '陈销售' },
    ],
  },
  {
    id: 'C004', name: '刘洋', company: '鸿远集团股份有限公司',
    phone: '136-8800-3456', email: 'liu.yang@hongyuan.com',
    tier: 'gold', source: '活动', created: '2023-11-20', lastContact: '2026-03-09',
    tags: ['集团客户', 'VIP', '多产品线', '有转介绍'],
    interactions: [
      { id: 'i1', type: 'meeting',    summary: '季度业务复盘，确认Q2采购计划，金额约80万', date: '2026-03-09', agent: '赵总监' },
      { id: 'i2', type: 'call',       summary: '跟进引荐C010（林海）进展，已初步接触', date: '2026-03-02', agent: '王销售' },
      { id: 'i3', type: 'visit',      summary: '高管答谢晚宴，维系关系', date: '2026-02-14', agent: '赵总监' },
      { id: 'i4', type: 'email_type', summary: '发送年度账单及服务报告', date: '2026-01-08', agent: '王销售' },
    ],
  },
  {
    id: 'C010', name: '林海', company: '锐锋投资管理',
    phone: '158-6600-5555', email: 'lin.hai@ruifeng.com',
    tier: 'gold', source: '转介绍', created: '2026-02-01', lastContact: '2026-03-09',
    tags: ['金融行业', '高净值', '转介绍-刘洋'],
    interactions: [
      { id: 'i1', type: 'call',    summary: '首次沟通，了解基本需求，对风控模块有兴趣', date: '2026-03-09', agent: '陈销售' },
      { id: 'i2', type: 'meeting', summary: '线上演示，展示风控看板和报表功能', date: '2026-03-05', agent: '陈销售' },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const TIER_CFG: Record<Tier, { bg: string; text: string }> = {
  gold:   { bg: 'bg-amber-500/10',  text: 'text-amber-600'  },
  silver: { bg: 'bg-slate-400/10',  text: 'text-slate-500'  },
  bronze: { bg: 'bg-orange-400/10', text: 'text-orange-500' },
};

const ITYPE_ICON: Record<IType, React.ComponentType<{ size?: number; className?: string }>> = {
  call:       PhoneCall,
  email_type: Send,
  visit:      Users,
  meeting:    Calendar,
  note:       MessageSquare,
};

const ITYPE_COLOR: Record<IType, string> = {
  call:       'bg-blue-500/10 text-blue-600',
  email_type: 'bg-purple-500/10 text-purple-600',
  visit:      'bg-emerald-500/10 text-emerald-600',
  meeting:    'bg-orange-500/10 text-orange-600',
  note:       'bg-muted text-muted-foreground',
};

// ── Page ───────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'timeline' | 'tags';

export default function ProfilesPage() {
  const { t } = useTranslation();

  const [search, setSearch]           = useState('');
  const [selectedId, setSelectedId]   = useState<string | null>(CUSTOMERS[0].id);
  const [activeTab, setActiveTab]     = useState<Tab>('overview');
  const [tagInput, setTagInput]       = useState('');
  const [noteInput, setNoteInput]     = useState('');
  const [tags, setTags]               = useState<Record<string, string[]>>(
    Object.fromEntries(CUSTOMERS.map(c => [c.id, [...c.tags]])),
  );
  const [interactions, setInteractions] = useState<Record<string, Interaction[]>>(
    Object.fromEntries(CUSTOMERS.map(c => [c.id, [...c.interactions]])),
  );

  const filtered = useMemo(() =>
    CUSTOMERS.filter(c => {
      const kw = search.toLowerCase();
      return !kw || c.name.includes(kw) || c.company.toLowerCase().includes(kw);
    }),
  [search]);

  const selected = selectedId ? CUSTOMERS.find(c => c.id === selectedId) ?? null : null;
  const selTags  = selectedId ? (tags[selectedId] ?? []) : [];
  const selIacts = selectedId ? (interactions[selectedId] ?? []) : [];

  function addTag() {
    const v = tagInput.trim();
    if (!v || !selectedId) return;
    setTags(prev => ({ ...prev, [selectedId]: [...(prev[selectedId] ?? []), v] }));
    setTagInput('');
  }

  function removeTag(tag: string) {
    if (!selectedId) return;
    setTags(prev => ({ ...prev, [selectedId]: (prev[selectedId] ?? []).filter(t => t !== tag) }));
  }

  function addNote() {
    const v = noteInput.trim();
    if (!v || !selectedId) return;
    const newI: Interaction = {
      id: `i${Date.now()}`,
      type: 'note',
      summary: v,
      date: new Date().toISOString().slice(0, 10),
      agent: 'Me',
    };
    setInteractions(prev => ({ ...prev, [selectedId]: [newI, ...(prev[selectedId] ?? [])] }));
    setNoteInput('');
    setActiveTab('timeline');
  }

  return (
    <div className="flex h-[calc(100vh-112px)] overflow-hidden">

      {/* ── 左侧客户列表 ── */}
      <div className="w-56 shrink-0 border-r border-border flex flex-col bg-card">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8 h-8 text-xs" placeholder={t('profiles.search')} value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-1.5 space-y-px px-1.5">
          {filtered.map(c => {
            const tc = TIER_CFG[c.tier];
            const isActive = c.id === selectedId;
            return (
              <button
                key={c.id}
                onClick={() => { setSelectedId(c.id); setActiveTab('overview'); }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer',
                  isActive ? 'bg-primary/8 text-foreground' : 'hover:bg-muted/60 text-foreground/80',
                )}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {c.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium truncate', isActive && 'text-primary')}>{c.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{c.company}</p>
                </div>
                <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0', tc.bg, tc.text)}>
                  {t(`customers.${c.tier}`)}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── 右侧详情 ── */}
      {selected ? (
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* 客户头部信息 */}
          <div className="p-6 border-b border-border bg-card shrink-0">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
                {selected.name.slice(0, 1)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold">{selected.name}</h2>
                  <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', TIER_CFG[selected.tier].bg, TIER_CFG[selected.tier].text)}>
                    <Star size={10} className="inline fill-current mr-0.5" />{t(`customers.${selected.tier}`)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{selected.company}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Phone size={11} />{selected.phone}</span>
                  <span className="flex items-center gap-1"><Mail size={11} />{selected.email}</span>
                  <span className="flex items-center gap-1"><Star size={11} />{t('profiles.source')}: {selected.source}</span>
                </div>
              </div>
              {/* 快速统计 */}
              <div className="flex gap-4 shrink-0">
                {[
                  { label: t('profiles.statInteractions'), value: selIacts.length },
                  { label: t('profiles.statTags'),         value: selTags.length },
                  { label: t('profiles.statDays'),
                    value: Math.floor((Date.now() - new Date(selected.created).getTime()) / 86400000) },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-xl font-bold tabular-nums">{s.value}</p>
                    <p className="text-[11px] text-muted-foreground whitespace-nowrap">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 快捷备注输入 */}
            <div className="flex gap-2 mt-4">
              <Input
                className="text-sm"
                placeholder={t('profiles.notePlaceholder')}
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addNote()}
              />
              <Button size="sm" onClick={addNote} disabled={!noteInput.trim()}>
                <Plus size={14} className="mr-1" />{t('profiles.addNote')}
              </Button>
            </div>
          </div>

          {/* 标签页 */}
          <div className="flex items-center gap-px border-b border-border shrink-0 px-6 bg-card">
            {(['overview', 'timeline', 'tags'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-2.5 text-sm transition-colors cursor-pointer border-b-2 -mb-px',
                  activeTab === tab
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {t(`profiles.${tab}`)}
                {tab === 'timeline' && selIacts.length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-0.5">
                    {selIacts.length}
                  </span>
                )}
                {tab === 'tags' && selTags.length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-0.5">
                    {selTags.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* 内容区 */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{t('profiles.overview')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: t('profiles.company'),     value: selected.company },
                      { label: t('profiles.phone'),       value: selected.phone },
                      { label: t('profiles.email'),       value: selected.email },
                      { label: t('profiles.tier'),        value: t(`customers.${selected.tier}`) },
                      { label: t('profiles.source'),      value: selected.source },
                      { label: t('profiles.created'),     value: selected.created },
                      { label: t('profiles.lastContact'), value: selected.lastContact },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground text-xs font-medium">{row.label}</span>
                        <span className="font-medium text-right">{row.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{t('profiles.tags')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5 mb-3 min-h-[40px]">
                      {selTags.length === 0
                        ? <p className="text-xs text-muted-foreground">{t('profiles.noTags')}</p>
                        : selTags.map(tag => (
                          <span key={tag}
                            className="inline-flex items-center gap-1 bg-primary/8 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                            <Tag size={9} />
                            {tag}
                            <button onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors ml-0.5">
                              <X size={9} />
                            </button>
                          </span>
                        ))
                      }
                    </div>
                    <div className="flex gap-2">
                      <Input
                        className="h-7 text-xs"
                        placeholder={t('profiles.tagPlaceholder')}
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addTag()}
                      />
                      <Button size="xs" onClick={addTag} disabled={!tagInput.trim()}>
                        {t('profiles.addTag')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="space-y-3 max-w-2xl">
                {selIacts.length === 0
                  ? <p className="text-sm text-muted-foreground text-center py-12">{t('profiles.noTimeline')}</p>
                  : selIacts.map((ia, idx) => {
                    const Icon = ITYPE_ICON[ia.type];
                    const colorCls = ITYPE_COLOR[ia.type];
                    return (
                      <div key={ia.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', colorCls)}>
                            <Icon size={13} />
                          </div>
                          {idx < selIacts.length - 1 && (
                            <div className="w-px flex-1 bg-border mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded', colorCls)}>
                              {t(`profiles.${ia.type}`)}
                            </span>
                            <span className="text-xs text-muted-foreground">{ia.date}</span>
                            <span className="text-xs text-muted-foreground">· {ia.agent}</span>
                          </div>
                          <p className="text-sm leading-relaxed">{ia.summary}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Tags Tab */}
            {activeTab === 'tags' && (
              <div className="max-w-lg space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder={t('profiles.tagPlaceholder')}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} disabled={!tagInput.trim()}>
                    <Plus size={14} className="mr-1" />{t('profiles.addTag')}
                  </Button>
                </div>
                {selTags.length === 0
                  ? <p className="text-sm text-muted-foreground text-center py-8">{t('profiles.noTags')}</p>
                  : (
                    <div className="flex flex-wrap gap-2">
                      {selTags.map(tag => (
                        <div key={tag}
                          className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5">
                          <Tag size={12} className="text-muted-foreground" />
                          <span className="text-sm">{tag}</span>
                          <button
                            onClick={() => removeTag(tag)}
                            className="w-4 h-4 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center transition-colors ml-0.5"
                          >
                            <X size={10} className="text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          {t('profiles.selectHint')}
        </div>
      )}
    </div>
  );
}
