import { useEffect, useState } from 'react';
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
  error: string;
}

function UserFormModal({ title, open, onClose, onSubmit, children, error }: UserFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {children}
          {error && <p className="text-destructive text-xs">{error}</p>}
          <Button onClick={onSubmit} className="w-full">确认</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function UsersPage() {
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
    } catch (e) { setError((e as Error).message || '操作失败'); }
  }

  async function handleEdit() {
    try {
      await usersApi.update(selected!.id, form);
      setModal(null); fetchUsers();
    } catch (e) { setError((e as Error).message || '操作失败'); }
  }

  async function handleDelete(u: User) {
    if (!confirm(`确认删除用户「${u.username}」？`)) return;
    await usersApi.delete(u.id);
    fetchUsers();
  }

  async function handleReset() {
    if (!form.newPassword) { setError('请输入新密码'); return; }
    try {
      await usersApi.resetPassword(selected!.id, form.newPassword);
      setModal(null);
    } catch (e) { setError((e as Error).message || '操作失败'); }
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">用户管理</h1>
        <Button data-testid="create-user-btn" onClick={openCreate} size="sm">
          <Plus size={15} />新增用户
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索用户名/邮箱"
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
              <TableHead>用户名</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">加载中...</TableCell></TableRow>
            )}
            {!loading && users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.username}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>{u.roleLabel}</TableCell>
                <TableCell>
                  <Badge variant={u.status === 'active' ? 'default' : 'secondary'}>
                    {u.status === 'active' ? '启用' : '禁用'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{(u as User & { created_at?: string }).created_at?.slice(0, 10)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(u)} title="编辑">
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => openReset(u)} title="重置密码">
                      <KeyRound size={14} />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(u)} title="删除" className="text-destructive hover:text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!loading && users.length === 0 && (
              <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">暂无数据</TableCell></TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm">
            <span className="text-muted-foreground">共 {total} 条</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>上一页</Button>
              <span className="px-2 py-1 text-muted-foreground">{page}/{totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>下一页</Button>
            </div>
          </div>
        )}
      </Card>

      {/* 新增弹窗 */}
      <UserFormModal title="新增用户" open={modal === 'create'} onClose={() => setModal(null)} onSubmit={handleCreate} error={error}>
        <div className="space-y-1.5">
          <Label>用户名</Label>
          <Input placeholder="用户名*" value={form.username || ''} onChange={e => setForm({...form, username: e.target.value})} />
        </div>
        <div className="space-y-1.5">
          <Label>邮箱</Label>
          <Input placeholder="邮箱*" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <div className="space-y-1.5">
          <Label>密码</Label>
          <Input type="password" placeholder="密码*" value={form.password || ''} onChange={e => setForm({...form, password: e.target.value})} />
        </div>
        <div className="space-y-1.5">
          <Label>角色</Label>
          <Select value={form.roleId || ''} onValueChange={v => setForm({...form, roleId: v})}>
            <SelectTrigger><SelectValue placeholder="选择角色*" /></SelectTrigger>
            <SelectContent>{roles.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>状态</Label>
          <Select value={form.status || 'active'} onValueChange={v => setForm({...form, status: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">启用</SelectItem>
              <SelectItem value="disabled">禁用</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </UserFormModal>

      {/* 编辑弹窗 */}
      <UserFormModal title={`编辑用户：${selected?.username}`} open={modal === 'edit'} onClose={() => setModal(null)} onSubmit={handleEdit} error={error}>
        <div className="space-y-1.5">
          <Label>邮箱</Label>
          <Input placeholder="邮箱" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <div className="space-y-1.5">
          <Label>角色</Label>
          <Select value={form.roleId || ''} onValueChange={v => setForm({...form, roleId: v})}>
            <SelectTrigger><SelectValue placeholder="选择角色" /></SelectTrigger>
            <SelectContent>{roles.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>状态</Label>
          <Select value={form.status || 'active'} onValueChange={v => setForm({...form, status: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">启用</SelectItem>
              <SelectItem value="disabled">禁用</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </UserFormModal>

      {/* 重置密码弹窗 */}
      <UserFormModal title={`重置密码：${selected?.username}`} open={modal === 'reset'} onClose={() => setModal(null)} onSubmit={handleReset} error={error}>
        <div className="space-y-1.5">
          <Label>新密码</Label>
          <Input type="password" placeholder="至少 6 位" value={form.newPassword || ''} onChange={e => setForm({...form, newPassword: e.target.value})} />
        </div>
      </UserFormModal>
    </div>
  );
}
