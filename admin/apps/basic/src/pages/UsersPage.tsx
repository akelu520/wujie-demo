import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usersApi, rolesApi } from '@/api/index.ts';
import {
  Plus, Pencil, Trash2, KeyRound, Search,
  Mail, Lock, Eye, EyeOff, Shield,
  CheckCircle2, XCircle, UserPlus, UserCog, X,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table.tsx';
import {
  Dialog, DialogContent, DialogTitle,
} from '@/components/ui/dialog.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { cn } from '@/lib/utils.ts';
import type { User, Role } from '@/types/index.ts';

// ── FormField ────────────────────────────────────────────────────────────────

function FormField({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-destructive">
          <XCircle size={10} className="shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

// ── FieldDivider ─────────────────────────────────────────────────────────────

function FieldDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

// ── StatusToggle ─────────────────────────────────────────────────────────────

function StatusToggle({
  value, onChange, enabledLabel, disabledLabel,
}: {
  value: string; onChange: (v: 'active' | 'disabled') => void; enabledLabel: string; disabledLabel: string;
}) {
  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        onClick={() => onChange('active')}
        className={cn(
          'flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border text-xs font-semibold transition-all cursor-pointer',
          value === 'active'
            ? 'border-emerald-500/30 bg-emerald-500/8 text-emerald-600'
            : 'border-border text-muted-foreground hover:border-muted-foreground/30',
        )}
      >
        <CheckCircle2 size={12} />{enabledLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange('disabled')}
        className={cn(
          'flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border text-xs font-semibold transition-all cursor-pointer',
          value === 'disabled'
            ? 'border-border bg-muted/60 text-foreground/60'
            : 'border-border text-muted-foreground hover:border-muted-foreground/30',
        )}
      >
        <XCircle size={12} />{disabledLabel}
      </button>
    </div>
  );
}

// ── ModalBase ─────────────────────────────────────────────────────────────────

interface ModalBaseProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  description?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  submitLabel: string;
  cancelLabel: string;
  error: string;
  avatar?: string;
  submitDisabled?: boolean;
  children: React.ReactNode;
}

function ModalBase({
  open, onClose, onSubmit, title, description, icon: Icon,
  submitLabel, cancelLabel, error, avatar, submitDisabled, children,
}: ModalBaseProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden" showCloseButton={false}>

        {/* ── 深色头部 ── */}
        <div className="bg-sidebar relative overflow-hidden px-6 py-5">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="modal-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.08" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#modal-grid)" />
            <circle cx="400" cy="0" r="160" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.04" />
          </svg>

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-sidebar-foreground" />
                </div>
                <DialogTitle className="text-sidebar-foreground font-semibold text-base leading-snug">
                  {title}
                </DialogTitle>
              </div>
              {description && (
                <p className="text-sidebar-foreground/40 text-xs ml-9 leading-relaxed">{description}</p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {avatar !== undefined && (
                <div className="w-9 h-9 rounded-xl bg-white/12 flex items-center justify-center text-sidebar-foreground font-bold text-base ring-1 ring-white/10 select-none transition-all duration-200">
                  {avatar ? avatar.slice(0, 1).toUpperCase() : <span className="text-sidebar-foreground/30 font-normal text-sm">?</span>}
                </div>
              )}
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* ── 表单区 ── */}
        <div className="px-6 py-5 space-y-4">
          {children}

          {error && (
            <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/8 rounded-lg px-3 py-2.5 border border-destructive/15">
              <XCircle size={13} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose}>{cancelLabel}</Button>
            <Button className="flex-1" onClick={onSubmit} disabled={submitDisabled}>{submitLabel}</Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [selected, setSelected] = useState<User | null>(null);
  const [form, setForm] = useState<Partial<{
    username: string; email: string; password: string;
    roleId: string; status: 'active' | 'disabled'; newPassword: string;
  }>>({});
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const pageSize = 10;

  function touch(field: string) {
    setTouched(prev => new Set([...prev, field]));
  }

  function validate(field: string, value: string | undefined): string {
    switch (field) {
      case 'username':    return !value?.trim() ? t('users.usernameRequired') : '';
      case 'email':       if (!value?.trim()) return '';
                          return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value!) ? t('users.emailInvalid') : '';
      case 'password':    if (!value?.trim()) return t('users.passwordRequired');
                          return value!.length < 6 ? t('users.passwordTooShort') : '';
      case 'newPassword': if (!value?.trim()) return t('users.passwordRequired');
                          return value!.length < 6 ? t('users.passwordTooShort') : '';
      case 'roleId':      return !value ? t('users.roleRequired') : '';
      default:            return '';
    }
  }

  function ferr(field: string, value: string | undefined): string {
    return touched.has(field) ? validate(field, value) : '';
  }

  function inputCls(field: string, value: string | undefined, base = ''): string {
    const err = ferr(field, value);
    return cn(base, err ? 'border-destructive focus-visible:ring-destructive/20' : '');
  }

  function fetchUsers() {
    setLoading(true);
    usersApi.list({ page, pageSize, keyword })
      .then((res) => { setUsers(res.data.list); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { rolesApi.list().then((r) => setRoles(r.data)); }, []);
  useEffect(() => { fetchUsers(); }, [page, keyword]);

  function openCreate() {
    setForm({ status: 'active' }); setError(''); setShowPwd(false); setTouched(new Set()); setModal('create');
  }
  function openEdit(u: User) {
    setSelected(u);
    setForm({ email: u.email, roleId: String((u as User & { roleId?: number }).roleId ?? ''), status: u.status });
    setError(''); setTouched(new Set()); setModal('edit');
  }
  function openReset(u: User) {
    setSelected(u); setForm({ newPassword: '' }); setError(''); setShowNewPwd(false); setTouched(new Set()); setModal('reset');
  }

  async function handleCreate() {
    try { await usersApi.create(form); setModal(null); fetchUsers(); }
    catch (e) { setError((e as Error).message || t('users.failed')); }
  }
  async function handleEdit() {
    try { await usersApi.update(selected!.id, form); setModal(null); fetchUsers(); }
    catch (e) { setError((e as Error).message || t('users.failed')); }
  }
  async function handleDelete(u: User) {
    if (!confirm(t('users.confirmDelete', { username: u.username }))) return;
    await usersApi.delete(u.id); fetchUsers();
  }
  async function handleReset() {
    if (!form.newPassword) { setError(t('users.enterNewPwd')); return; }
    try { await usersApi.resetPassword(selected!.id, form.newPassword); setModal(null); }
    catch (e) { setError((e as Error).message || t('users.failed')); }
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-8 space-y-4">

      {/* 页头 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('users.title')}</h1>
        <Button data-testid="create-user-btn" onClick={openCreate} size="sm">
          <Plus size={15} />{t('users.addUser')}
        </Button>
      </div>

      {/* 搜索 */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('users.search')}
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* 表格 */}
      <Card className="overflow-hidden">
        <Table data-testid="users-table">
          <TableHeader>
            <TableRow>
              <TableHead>{t('users.username') ?? 'Username'}</TableHead>
              <TableHead>{t('users.email')}</TableHead>
              <TableHead>{t('users.role')}</TableHead>
              <TableHead>{t('users.status')}</TableHead>
              <TableHead>{t('users.createdAt')}</TableHead>
              <TableHead className="text-right">{t('users.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  {t('users.loading')}
                </TableCell>
              </TableRow>
            )}
            {!loading && users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.username}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>{u.roleLabel}</TableCell>
                <TableCell>
                  <Badge variant={u.status === 'active' ? 'default' : 'secondary'}>
                    {u.status === 'active' ? t('users.enabled') : t('users.disabled')}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {(u as User & { created_at?: string }).created_at?.slice(0, 10)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(u)} title={t('users.edit')}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => openReset(u)} title={t('users.resetPwd')}>
                      <KeyRound size={14} />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(u)} title={t('users.delete')} className="text-destructive hover:text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  {t('users.noData')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('users.total', { count: total })}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                {t('users.prev')}
              </Button>
              <span className="px-2 py-1 text-muted-foreground">{page}/{totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                {t('users.next')}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── 新增弹窗 ── */}
      <ModalBase
        title={t('users.addTitle')}
        description={t('users.addDesc') || '填写以下信息以创建新用户账号'}
        icon={UserPlus}
        open={modal === 'create'}
        onClose={() => setModal(null)}
        onSubmit={handleCreate}
        submitLabel={t('users.confirm')}
        cancelLabel={t('users.cancel') || '取消'}
        error={error}
        avatar={form.username ?? ''}
        submitDisabled={!form.username?.trim() || !form.password?.trim() || (form.password?.length ?? 0) < 6 || !form.roleId}
      >
        <FormField label={t('users.username') ?? 'Username'} error={ferr('username', form.username)}>
          <div className="relative">
            <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
            <Input
              type="text"
              className={inputCls('username', form.username, 'pl-9 h-11')}
              placeholder={t('users.usernamePlaceholder')}
              value={form.username || ''}
              onChange={e => setForm({ ...form, username: e.target.value })}
              onBlur={() => touch('username')}
            />
          </div>
        </FormField>

        <FormField label={t('users.email')} error={ferr('email', form.email)}>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
            <Input
              type="email"
              className={inputCls('email', form.email, 'pl-9 h-11')}
              placeholder={t('users.emailPlaceholder')}
              value={form.email || ''}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onBlur={() => touch('email')}
            />
          </div>
        </FormField>

        <FormField label={t('users.password') ?? 'Password'} error={ferr('password', form.password)}>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
            <Input
              type={showPwd ? 'text' : 'password'}
              className={inputCls('password', form.password, 'pl-9 pr-9 h-11')}
              placeholder={t('users.passwordPlaceholder')}
              value={form.password || ''}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onBlur={() => touch('password')}
            />
            <button
              type="button"
              onClick={() => setShowPwd(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
            >
              {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </FormField>

        <FieldDivider label={t('users.accountConfig') || '账号配置'} />

        <FormField label={t('users.role')} error={ferr('roleId', form.roleId)}>
          <div className="relative">
            <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 z-10 pointer-events-none" />
            <Select value={form.roleId || ''} onValueChange={v => { setForm({ ...form, roleId: v }); touch('roleId'); }}>
              <SelectTrigger className={inputCls('roleId', form.roleId, 'pl-9 h-11')}>
                <SelectValue placeholder={t('users.selectRole')} />
              </SelectTrigger>
              <SelectContent>
                {roles.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </FormField>

        <FormField label={t('users.status')}>
          <StatusToggle
            value={form.status || 'active'}
            onChange={v => setForm({ ...form, status: v })}
            enabledLabel={t('users.enabled')}
            disabledLabel={t('users.disabled')}
          />
        </FormField>
      </ModalBase>

      {/* ── 编辑弹窗 ── */}
      <ModalBase
        title={t('users.editTitle', { username: selected?.username })}
        description={t('users.editDesc', { username: selected?.username }) || `正在编辑 ${selected?.username} 的账号信息`}
        icon={UserCog}
        open={modal === 'edit'}
        onClose={() => setModal(null)}
        onSubmit={handleEdit}
        submitLabel={t('users.confirm')}
        cancelLabel={t('users.cancel') || '取消'}
        error={error}
        avatar={selected?.username}
        submitDisabled={!form.roleId}
      >
        <FormField label={t('users.email')} error={ferr('email', form.email)}>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
            <Input
              type="email"
              className={inputCls('email', form.email, 'pl-9 h-11')}
              placeholder={t('users.emailPlaceholder')}
              value={form.email || ''}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onBlur={() => touch('email')}
            />
          </div>
        </FormField>

        <FieldDivider label={t('users.accountConfig') || '账号配置'} />

        <FormField label={t('users.role')} error={ferr('roleId', form.roleId)}>
          <div className="relative">
            <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 z-10 pointer-events-none" />
            <Select value={form.roleId || ''} onValueChange={v => { setForm({ ...form, roleId: v }); touch('roleId'); }}>
              <SelectTrigger className={inputCls('roleId', form.roleId, 'pl-9 h-11')}>
                <SelectValue placeholder={t('users.selectRole')} />
              </SelectTrigger>
              <SelectContent>
                {roles.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </FormField>

        <FormField label={t('users.status')}>
          <StatusToggle
            value={form.status || 'active'}
            onChange={v => setForm({ ...form, status: v })}
            enabledLabel={t('users.enabled')}
            disabledLabel={t('users.disabled')}
          />
        </FormField>
      </ModalBase>

      {/* ── 重置密码弹窗 ── */}
      <ModalBase
        title={t('users.resetTitle', { username: selected?.username })}
        description={t('users.resetDesc', { username: selected?.username }) || `为 ${selected?.username} 设置新的登录密码`}
        icon={KeyRound}
        open={modal === 'reset'}
        onClose={() => setModal(null)}
        onSubmit={handleReset}
        submitLabel={t('users.confirm')}
        cancelLabel={t('users.cancel') || '取消'}
        error={error}
        avatar={selected?.username}
      >
        <FormField label={t('users.newPassword')}>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
            <Input
              type={showNewPwd ? 'text' : 'password'}
              className="pl-9 pr-9 h-11"
              placeholder={t('users.pwdPlaceholder')}
              value={form.newPassword || ''}
              onChange={e => setForm({ ...form, newPassword: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowNewPwd(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
            >
              {showNewPwd ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </FormField>
      </ModalBase>

    </div>
  );
}
