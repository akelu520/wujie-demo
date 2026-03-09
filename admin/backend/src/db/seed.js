import bcrypt from 'bcryptjs';
import { initDb } from './database.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(__dirname, '../../data'), { recursive: true });

const db = initDb();

// 插入角色
const insertRole = db.prepare(`
  INSERT OR IGNORE INTO roles (name, label, permissions) VALUES (?, ?, ?)
`);

insertRole.run('superadmin', '超级管理员', JSON.stringify(['*']));
insertRole.run('admin', '管理员', JSON.stringify(['users:read', 'users:write', 'roles:read']));
insertRole.run('viewer', '查看者', JSON.stringify(['users:read']));

// 获取角色 ID
const superadminRole = db.prepare('SELECT id FROM roles WHERE name = ?').get('superadmin');
const adminRole = db.prepare('SELECT id FROM roles WHERE name = ?').get('admin');
const viewerRole = db.prepare('SELECT id FROM roles WHERE name = ?').get('viewer');

// 插入用户（密码都是 password 加盐）
const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (username, email, password, role_id, status) VALUES (?, ?, ?, ?, ?)
`);

const hash = (pwd) => bcrypt.hashSync(pwd, 10);

insertUser.run('superadmin', 'superadmin@admin.com', hash('Admin@123456'), superadminRole.id, 'active');
insertUser.run('admin', 'admin@admin.com', hash('Admin@123456'), adminRole.id, 'active');
insertUser.run('viewer', 'viewer@admin.com', hash('Viewer@123456'), viewerRole.id, 'active');
insertUser.run('test_user1', 'test1@example.com', hash('Test@123456'), viewerRole.id, 'active');
insertUser.run('test_user2', 'test2@example.com', hash('Test@123456'), adminRole.id, 'disabled');

console.log('✅ 数据库初始化完成！');
console.log('');
console.log('测试账号：');
console.log('  超级管理员: superadmin / Admin@123456');
console.log('  管理员:     admin / Admin@123456');
console.log('  查看者:     viewer / Viewer@123456');
