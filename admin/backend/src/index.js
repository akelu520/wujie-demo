import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';
import { initDb } from './db/database.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import rolesRoutes from './routes/roles.js';
import statsRoutes from './routes/stats.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(__dirname, '../data'), { recursive: true });

// 初始化数据库
initDb();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'] }));
app.use(express.json());

// 健康检查
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/stats', statsRoutes);

// 404
app.use((req, res) => res.status(404).json({ code: 404, message: '接口不存在' }));

// 全局错误处理
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ code: 500, message: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`🚀 后台管理 API 启动：http://localhost:${PORT}`);
  console.log(`📊 健康检查：http://localhost:${PORT}/api/health`);
});

export default app;
