import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/database.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/users
router.get('/', authMiddleware, (req, res) => {
  const { page = 1, pageSize = 10, keyword = '', status = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  const db = getDb();
  let where = 'u.is_deleted = 0';
  const params = [];

  if (keyword) {
    where += ' AND (u.username LIKE ? OR u.email LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (status) {
    where += ' AND u.status = ?';
    params.push(status);
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM users u WHERE ${where}`).get(...params).count;
  const users = db.prepare(`
    SELECT u.id, u.username, u.email, u.status, u.created_at, u.updated_at,
           r.name as role, r.label as roleLabel
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE ${where}
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(pageSize), offset);

  res.json({ code: 200, data: { list: users, total, page: parseInt(page), pageSize: parseInt(pageSize) } });
});

// GET /api/users/:id
router.get('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const user = db.prepare(`
    SELECT u.id, u.username, u.email, u.status, u.created_at, r.name as role, r.label as roleLabel, r.id as roleId
    FROM users u LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.id = ? AND u.is_deleted = 0
  `).get(req.params.id);

  if (!user) return res.status(404).json({ code: 404, message: '用户不存在' });
  res.json({ code: 200, data: user });
});

// POST /api/users
router.post('/', authMiddleware, requireRole('admin', 'superadmin'), (req, res) => {
  const { username, email, password, roleId, status = 'active' } = req.body;
  if (!username || !email || !password || !roleId) {
    return res.status(400).json({ code: 400, message: '缺少必填字段' });
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE (username = ? OR email = ?) AND is_deleted = 0').get(username, email);
  if (existing) return res.status(409).json({ code: 409, message: '用户名或邮箱已存在' });

  const hashedPwd = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (username, email, password, role_id, status) VALUES (?, ?, ?, ?, ?)'
  ).run(username, email, hashedPwd, roleId, status);

  res.status(201).json({ code: 201, message: '用户创建成功', data: { id: result.lastInsertRowid } });
});

// PUT /api/users/:id
router.put('/:id', authMiddleware, requireRole('admin', 'superadmin'), (req, res) => {
  const { email, roleId, status } = req.body;
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE id = ? AND is_deleted = 0').get(req.params.id);
  if (!user) return res.status(404).json({ code: 404, message: '用户不存在' });

  const fields = [];
  const params = [];
  if (email) { fields.push('email = ?'); params.push(email); }
  if (roleId) { fields.push('role_id = ?'); params.push(roleId); }
  if (status) { fields.push('status = ?'); params.push(status); }
  fields.push("updated_at = datetime('now')");
  params.push(req.params.id);

  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  res.json({ code: 200, message: '更新成功' });
});

// DELETE /api/users/:id (软删除)
router.delete('/:id', authMiddleware, requireRole('admin', 'superadmin'), (req, res) => {
  const db = getDb();
  if (String(req.params.id) === String(req.user.id)) {
    return res.status(400).json({ code: 400, message: '不能删除自己' });
  }
  const result = db.prepare("UPDATE users SET is_deleted = 1, updated_at = datetime('now') WHERE id = ? AND is_deleted = 0").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ code: 404, message: '用户不存在' });
  res.json({ code: 200, message: '删除成功' });
});

// PUT /api/users/:id/reset-password
router.put('/:id/reset-password', authMiddleware, requireRole('admin', 'superadmin'), (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ code: 400, message: '密码至少 6 位' });
  }
  const db = getDb();
  const hashed = bcrypt.hashSync(newPassword, 10);
  const result = db.prepare("UPDATE users SET password = ?, updated_at = datetime('now') WHERE id = ? AND is_deleted = 0").run(hashed, req.params.id);
  if (result.changes === 0) return res.status(404).json({ code: 404, message: '用户不存在' });
  res.json({ code: 200, message: '密码重置成功' });
});

export default router;
