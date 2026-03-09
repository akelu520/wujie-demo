import { Router } from 'express';
import { getDb } from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/stats
router.get('/', authMiddleware, (req, res) => {
  const db = getDb();
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_deleted = 0').get().count;
  const activeUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE is_deleted = 0 AND status = 'active'").get().count;
  const todayLogins = db.prepare("SELECT COUNT(*) as count FROM login_logs WHERE status = 'success' AND date(created_at) = date('now')").get().count;
  const totalRoles = db.prepare('SELECT COUNT(*) as count FROM roles').get().count;

  res.json({
    code: 200,
    data: { totalUsers, activeUsers, todayLogins, totalRoles },
  });
});

// GET /api/stats/login-logs
router.get('/login-logs', authMiddleware, (req, res) => {
  const { limit = 20 } = req.query;
  const db = getDb();
  const logs = db.prepare('SELECT * FROM login_logs ORDER BY created_at DESC LIMIT ?').all(parseInt(limit));
  res.json({ code: 200, data: logs });
});

export default router;
