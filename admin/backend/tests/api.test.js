import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 设置测试数据库路径（独立于开发数据库）
process.env.TEST_DB = '1';

const __dirname = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(__dirname, '../data'), { recursive: true });

// 动态 import app（需要在设置环境变量之后）
let app;
beforeAll(async () => {
  const mod = await import('../src/index.js');
  app = mod.default;
});

describe('Auth API', () => {
  it('TC-AUTH-001: 正常登录返回 token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'Admin@123456' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.username).toBe('admin');
  });

  it('TC-AUTH-002: 错误密码返回 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('TC-AUTH-003: 禁用账号返回 403', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test_user2', password: 'Test@123456' });
    expect(res.status).toBe(403);
  });

  it('TC-AUTH-004: 无 Token 访问返回 401', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('TC-AUTH-005: 过期/无效 Token 返回 401', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer invalid_token_here');
    expect(res.status).toBe(401);
  });
});

describe('Users API', () => {
  let adminToken;
  let viewerToken;
  let createdUserId;

  beforeAll(async () => {
    const r1 = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'Admin@123456' });
    adminToken = r1.body.data.token;
    const r2 = await request(app).post('/api/auth/login').send({ username: 'viewer', password: 'Viewer@123456' });
    viewerToken = r2.body.data.token;
  });

  it('TC-USER-001: 获取用户列表', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.list)).toBe(true);
    expect(typeof res.body.data.total).toBe('number');
  });

  it('TC-USER-002: 分页查询', async () => {
    const res = await request(app)
      .get('/api/users?page=1&pageSize=2')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.body.data.list.length).toBeLessThanOrEqual(2);
  });

  it('TC-USER-003: 关键词搜索', async () => {
    const res = await request(app)
      .get('/api/users?keyword=admin')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.body.data.list.every(u => u.username.includes('admin') || u.email.includes('admin'))).toBe(true);
  });

  it('TC-USER-004: 创建用户', async () => {
    const roles = await request(app).get('/api/roles').set('Authorization', `Bearer ${adminToken}`);
    const roleId = roles.body.data[1].id; // admin role
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'test_auto_user', email: 'autotest@test.com', password: 'Test@123456', roleId, status: 'active' });
    expect(res.status).toBe(201);
    createdUserId = res.body.data.id;
  });

  it('TC-USER-005: 重复用户名返回 409', async () => {
    const roles = await request(app).get('/api/roles').set('Authorization', `Bearer ${adminToken}`);
    const roleId = roles.body.data[1].id;
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'admin', email: 'dup@test.com', password: 'Test@123456', roleId });
    expect(res.status).toBe(409);
  });

  it('TC-USER-006: 更新用户状态', async () => {
    const res = await request(app)
      .put(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'disabled' });
    expect(res.status).toBe(200);
  });

  it('TC-USER-007: 软删除用户', async () => {
    const res = await request(app)
      .delete(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    // 确认用户不在列表中
    const listRes = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
    const found = listRes.body.data.list.find(u => u.id === createdUserId);
    expect(found).toBeUndefined();
  });

  it('TC-USER-010: viewer 无权创建用户', async () => {
    const roles = await request(app).get('/api/roles').set('Authorization', `Bearer ${viewerToken}`);
    const roleId = roles.body.data[0].id;
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ username: 'unauthorized_user', email: 'unauth@test.com', password: 'Test@123456', roleId });
    expect(res.status).toBe(403);
  });
});

describe('Roles API', () => {
  let superadminToken;
  let adminToken;
  let createdRoleId;

  beforeAll(async () => {
    const r1 = await request(app).post('/api/auth/login').send({ username: 'superadmin', password: 'Admin@123456' });
    superadminToken = r1.body.data.token;
    const r2 = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'Admin@123456' });
    adminToken = r2.body.data.token;
  });

  it('TC-ROLE-001: 获取角色列表包含内置角色', async () => {
    const res = await request(app).get('/api/roles').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    const names = res.body.data.map(r => r.name);
    expect(names).toContain('superadmin');
    expect(names).toContain('admin');
    expect(names).toContain('viewer');
  });

  it('TC-ROLE-002: superadmin 可创建角色', async () => {
    const res = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({ name: 'test_role', label: '测试角色', permissions: ['users:read'] });
    expect(res.status).toBe(201);
    createdRoleId = res.body.data.id;
  });

  it('TC-ROLE-003: admin 无权创建角色', async () => {
    const res = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'another_role', label: '另一角色' });
    expect(res.status).toBe(403);
  });

  it('TC-ROLE-004: 删除有用户的角色返回 400', async () => {
    const res = await request(app)
      .delete('/api/roles/2') // admin role
      .set('Authorization', `Bearer ${superadminToken}`);
    expect(res.status).toBe(400);
  });

  it('清理：删除测试角色', async () => {
    if (createdRoleId) {
      const res = await request(app)
        .delete(`/api/roles/${createdRoleId}`)
        .set('Authorization', `Bearer ${superadminToken}`);
      expect(res.status).toBe(200);
    }
  });
});

describe('Stats API', () => {
  let token;
  beforeAll(async () => {
    const r = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'Admin@123456' });
    token = r.body.data.token;
  });

  it('获取统计数据', async () => {
    const res = await request(app).get('/api/stats').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalUsers).toBe('number');
  });

  it('获取登录日志', async () => {
    const res = await request(app).get('/api/stats/login-logs').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
