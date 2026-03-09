import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'admin-system-secret-2026';

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
  }

  const db = getDb();
  const user = db.prepare(`
    SELECT u.*, r.name as role_name, r.label as role_label
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.username = ? AND u.is_deleted = 0
  `).get(username);

  const ip = req.ip || req.connection.remoteAddress;

  if (!user || !bcrypt.compareSync(password, user.password)) {
    db.prepare('INSERT INTO login_logs (username, ip, status) VALUES (?, ?, ?)').run(username, ip, 'failed');
    return res.status(401).json({ code: 401, message: '用户名或密码错误' });
  }

  if (user.status === 'disabled') {
    return res.status(403).json({ code: 403, message: '账号已被禁用，请联系管理员' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role_name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  db.prepare('INSERT INTO login_logs (user_id, username, ip, status) VALUES (?, ?, ?, ?)').run(user.id, username, ip, 'success');

  res.json({
    code: 200,
    message: '登录成功',
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role_name,
        roleLabel: user.role_label,
      },
    },
  });
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ code: 200, message: '已退出登录' });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const db = getDb();
  const user = db.prepare(`
    SELECT u.id, u.username, u.email, u.status, r.name as role, r.label as roleLabel
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.id = ? AND u.is_deleted = 0
  `).get(req.user.id);

  if (!user) return res.status(404).json({ code: 404, message: '用户不存在' });
  res.json({ code: 200, data: user });
});

export default router;
