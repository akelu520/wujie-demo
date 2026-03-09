# 后台管理系统 - 后端配置

## 启动方式
```bash
cd admin/backend
npm install
npm run seed    # 初始化数据库和测试数据
npm run dev     # 开发模式（支持热重载）
npm start       # 生产模式
```

## API 地址
- 本地开发：http://localhost:3001
- 健康检查：http://localhost:3001/api/health

## 数据库
- 类型：SQLite（文件存储，路径：admin/backend/data/admin.db）
- 无需安装任何数据库服务

## 默认账号
| 用户名 | 密码 | 角色 |
|--------|------|------|
| superadmin | Admin@123456 | 超级管理员 |
| admin | Admin@123456 | 管理员 |
| viewer | Viewer@123456 | 查看者 |
