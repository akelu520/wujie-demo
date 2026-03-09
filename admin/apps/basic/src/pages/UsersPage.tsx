import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usersApi, rolesApi } from '@/api/index.ts';
import { Plus, Pencil, Trash2, KeyRound, Search } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { Label } from '@/components/ui/label.tsx';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table.tsx';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import type { User, Role } from '@/types/index.ts';

interface UserFormModalProps {
  children: React.ReactNode;
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  error: string;
}

function UserFormModal({ title, open, onClose, onSubmit, children, submitLabel, error }: UserFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {children}
          {error && <p className="text-destructive text-xs">{error}</p>}
          <Button onClick={onSubmit} className="w-full">{submitLabel}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
  const [form, setForm] = useState<Partial<{ username: string; email: string; password: string; roleId: string; status: string; newPassword: string }>>({});
  const [error, setError] = useState('');

  const pageSize = 10;

  function fetchUsers() {
    setLoading(true);
    usersApi.list({ page, pageSize, keyword })
      .then((res) => { setUsers(res.data.list); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { rolesApi.list().then((r) => setRoles(r.data)); }, []);
  useEffect(() => { fetchUsers(); }, [page, keyword]);

  function openCreate() { setForm({ status: 'active' }); setError(''); setModal('create'); }
  function openEdit(u: User) {
    setSelected(u);
    setForm({ email: u.email, roleId: String((u as User & { roleId?: number }).roleId ?? ''), status: u.status });
    setError('');
    setModal('edit');
  }
  function openReset(u: User) { setSelected(u); setForm({ newPassword: '' }); setError(''); setModal('reset'); }

  async function handleCreate() {
    try {
      await usersApi.create(form);
      setModal(null); fetchUsers();
    } catch (e) { setError((e as Error).message || t('users.failed')); }
  }

  async function handleEdit() {
    try {
      await usersApi.update(selected!.id, form);
      setModal(null); fetchUsers();
    } catch (e) { setError((e as Error).message || t('users.failed')); }
  }

  async function handleDelete(u: User) {
    if (!confirm(t('users.confirmDelete', { username: u.username }))) return;
    await usersApi.delete(u.id);
    fetchUsers();
  }

  async function handleReset() {
    if (!form.newPassword) { setError(t('users.enterNewPwd')); return; }
    try {
      await usersApi.resetPassword(selected!.id, form.newPassword);
      setModal(null);
    } catch (e) { setError((e as Error).message || t('users.failed')); }
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('users.title')}</h1>
        <Button data-testid="create-user-btn" onClick={openCreate} size="sm">
          <Plus size={15} />{t('users.addUser')}
        </Button>
      </div>

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
              <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">{t('users.loading')}</TableCell></TableRow>
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
                <TableCell className="text-muted-foreground">{(u as User & { created_at?: string }).created_at?.slice(0, 10)}</TableCell>
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
              <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">{t('users.noData')}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('users.total', { count: total })}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>{t('users.prev')}</Button>
              <span className="px-2 py-1 text-muted-foreground">{page}/{totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>{t('users.next')}</Button>
            </div>
          </div>
        )}
      </Card>

      {/* 新增弹窗 */}
      <UserFormModal title={t('users.addTitle')} open={modal === 'create'} onClose={() => setModal(null)} onSubmit={handleCreate} submitLabel={t('users.confirm')} error={error}>
        <div className="space-y-1.5">
          <Label>{t('users.username') ?? 'Username'}</Label>
          <Input placeholder={t('users.usernamePlaceholder')} value={form.username || ''} onChange={e => setForm({...form, username: e.target.value})} />
        </div>
        <div className="space-y-1.5">
          <Label>{t('users.email')}</Label>
          <Input placeholder={t('users.emailPlaceholder')} value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <div className="space-y-1.5">
          <Label>{t('users.password') ?? 'Password'}</Label>
          <Input type="password" placeholder={t('users.passwordPlaceholder')} value={form.password || ''} onChange={e => setForm({...form, password: e.target.value})} />
        </div>
        <div className="space-y-1.5">
          <Label>{t('users.role')}</Label>
          <Select value={form.roleId || ''} onValueChange={v => setForm({...form, roleId: v})}>
            <SelectTrigger><SelectValue placeholder={t('users.selectRole')} /></SelectTrigger>
            <SelectContent>{roles.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>{t('users.status')}</Label>
          <Select value={form.status || 'active'} onValueChange={v => setForm({...form, status: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t('users.enabled')}</SelectItem>
              <SelectItem value="disabled">{t('users.disabled')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </UserFormModal>

      {/* 编辑弹窗 */}
      <UserFormModal title={t('users.editTitle', { username: selected?.username })} open={modal === 'edit'} onClose={() => setModal(null)} onSubmit={handleEdit} submitLabel={t('users.confirm')} error={error}>
        <div className="space-y-1.5">
          <Label>{t('users.email')}</Label>
          <Input placeholder={t('users.emailPlaceholder')} value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <div className="space-y-1.5">
          <Label>{t('users.role')}</Label>
          <Select value={form.roleId || ''} onValueChange={v => setForm({...form, roleId: v})}>
            <SelectTrigger><SelectValue placeholder={t('users.selectRole')} /></SelectTrigger>
            <SelectContent>{roles.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>{t('users.status')}</Label>
          <Select value={form.status || 'active'} onValueChange={v => setForm({...form, status: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t('users.enabled')}</SelectItem>
              <SelectItem value="disabled">{t('users.disabled')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </UserFormModal>

      {/* 重置密码弹窗 */}
      <UserFormModal title={t('users.resetTitle', { username: selected?.username })} open={modal === 'reset'} onClose={() => setModal(null)} onSubmit={handleReset} submitLabel={t('users.confirm')} error={error}>
        <div className="space-y-1.5">
          <Label>{t('users.newPassword')}</Label>
          <Input type="password" placeholder={t('users.pwdPlaceholder')} value={form.newPassword || ''} onChange={e => setForm({...form, newPassword: e.target.value})} />
        </div>
      </UserFormModal>
    </div>
  );
}
