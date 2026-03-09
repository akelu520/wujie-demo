import { Router } from 'express';
import { getDb } from '../db/database.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/roles
router.get('/', authMiddleware, (req, res) => {
  const db = getDb();
  const roles = db.prepare('SELECT * FROM roles ORDER BY id').all();
  res.json({ code: 200, data: roles });
});

// POST /api/roles
router.post('/', authMiddleware, requireRole('superadmin'), (req, res) => {
  const { name, label, permissions = [] } = req.body;
  if (!name || !label) return res.status(400).json({ code: 400, message: '角色名称和标签必填' });

  const db = getDb();
  const existing = db.prepare('SELECT id FROM roles WHERE name = ?').get(name);
  if (existing) return res.status(409).json({ code: 409, message: '角色名已存在' });

  const result = db.prepare('INSERT INTO roles (name, label, permissions) VALUES (?, ?, ?)').run(name, label, JSON.stringify(permissions));
  res.status(201).json({ code: 201, message: '角色创建成功', data: { id: result.lastInsertRowid } });
});

// PUT /api/roles/:id
router.put('/:id', authMiddleware, requireRole('superadmin'), (req, res) => {
  const { label, permissions } = req.body;
  const db = getDb();
  const fields = [];
  const params = [];
  if (label) { fields.push('label = ?'); params.push(label); }
  if (permissions) { fields.push('permissions = ?'); params.push(JSON.stringify(permissions)); }
  if (!fields.length) return res.status(400).json({ code: 400, message: '没有要更新的字段' });
  params.push(req.params.id);
  db.prepare(`UPDATE roles SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  res.json({ code: 200, message: '更新成功' });
});

// DELETE /api/roles/:id
router.delete('/:id', authMiddleware, requireRole('superadmin'), (req, res) => {
  const db = getDb();
  const inUse = db.prepare('SELECT COUNT(*) as count FROM users WHERE role_id = ? AND is_deleted = 0').get(req.params.id);
  if (inUse.count > 0) return res.status(400).json({ code: 400, message: '该角色下有用户，无法删除' });
  const result = db.prepare('DELETE FROM roles WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ code: 404, message: '角色不存在' });
  res.json({ code: 200, message: '删除成功' });
});

export default router;
