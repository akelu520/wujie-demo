import { useEffect, useState } from 'react';
import { rolesApi } from '@/api/index.ts';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Card } from '@/components/ui/card.tsx';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table.tsx';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import type { Role } from '@/types/index.ts';

const allPermissions = [
  { key: 'users:read', label: '查看用户' },
  { key: 'users:write', label: '管理用户' },
  { key: 'roles:read', label: '查看角色' },
  { key: 'roles:write', label: '管理角色' },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [modal, setModal] = useState<string | null>(null);
  const [selected, setSelected] = useState<Role | null>(null);
  const [form, setForm] = useState<{ name: string; label: string; permissions: string[] }>({ name: '', label: '', permissions: [] });
  const [error, setError] = useState('');

  function fetchRoles() { rolesApi.list().then(r => setRoles(r.data)); }
  useEffect(() => { fetchRoles(); }, []);

  function openCreate() { setForm({ name: '', label: '', permissions: [] }); setError(''); setModal('create'); }
  function openEdit(r: Role) {
    let perms: string[] = [];
    try { perms = JSON.parse(r.permissions); } catch {}
    setSelected(r);
    setForm({ label: r.label, permissions: perms, name: r.name });
    setError('');
    setModal('edit');
  }

  function togglePerm(key: string) {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter(p => p !== key)
        : [...f.permissions, key]
    }));
  }

  async function handleCreate() {
    try {
      await rolesApi.create(form);
      setModal(null); fetchRoles();
    } catch (e) { setError((e as Error).message || '操作失败'); }
  }

  async function handleEdit() {
    try {
      await rolesApi.update(selected!.id, { label: form.label, permissions: form.permissions });
      setModal(null); fetchRoles();
    } catch (e) { setError((e as Error).message || '操作失败'); }
  }

  async function handleDelete(r: Role) {
    if (!confirm(`确认删除角色「${r.label}」？`)) return;
    try {
      await rolesApi.delete(r.id);
      fetchRoles();
    } catch (e) { alert((e as Error).message || '删除失败'); }
  }

  function PermissionCheckboxes() {
    return (
      <div className="space-y-2">
        <Label>权限分配</Label>
        <div className="space-y-2 pl-1">
          {allPermissions.map(p => (
            <label key={p.key} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={form.permissions.includes(p.key)}
                onChange={() => togglePerm(p.key)}
                className="accent-primary"
              />
              <span>{p.label}</span>
              <span className="text-muted-foreground text-xs">({p.key})</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">角色权限</h1>
        <Button onClick={openCreate} size="sm">
          <Plus size={15} />新增角色
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>角色名</TableHead>
              <TableHead>标签</TableHead>
              <TableHead>权限</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map(r => {
              let perms: string[] = [];
              try { perms = JSON.parse(r.permissions); } catch {}
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-muted-foreground">{r.name}</TableCell>
                  <TableCell className="font-medium">{r.label}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {perms.includes('*') ? (
                        <Badge>全部权限</Badge>
                      ) : perms.map(p => (
                        <Badge key={p} variant="secondary">{p}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.created_at?.slice(0, 10)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(r)}><Pencil size={14} /></Button>
                      {r.name !== 'superadmin' && (
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(r)} className="text-destructive hover:text-destructive">
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* 新增弹窗 */}
      <Dialog open={modal === 'create'} onOpenChange={(v) => !v && setModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>新增角色</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label>角色标识（英文）</Label>
              <Input placeholder="如: manager" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label>角色标签</Label>
              <Input placeholder="如: 经理" value={form.label} onChange={e => setForm({...form, label: e.target.value})} />
            </div>
            <PermissionCheckboxes />
            {error && <p className="text-destructive text-xs">{error}</p>}
            <Button onClick={handleCreate} className="w-full">确认创建</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 编辑弹窗 */}
      <Dialog open={modal === 'edit'} onOpenChange={(v) => !v && setModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>编辑角色：{selected?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label>角色标签</Label>
              <Input placeholder="标签" value={form.label} onChange={e => setForm({...form, label: e.target.value})} />
            </div>
            <PermissionCheckboxes />
            {error && <p className="text-destructive text-xs">{error}</p>}
            <Button onClick={handleEdit} className="w-full">保存修改</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
