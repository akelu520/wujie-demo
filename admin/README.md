# 后台管理系统

> 基于 React + Express + SQLite 的完整后台管理系统

## 快速开始

### 1. 安装依赖

```bash
cd admin/backend && npm install
cd admin/frontend && npm install
```

### 2. 初始化数据库（首次运行必须）

```bash
cd admin/backend
npm run seed
```

输出：
```
✅ 数据库初始化完成！

测试账号：
  超级管理员: superadmin / Admin@123456
  管理员:     admin / Admin@123456
  查看者:     viewer / Viewer@123456
```

### 3. 启动服务

**后端**（端口 3001）：
```bash
cd admin/backend
npm run dev
```

**前端**（端口 5175）：
```bash
cd admin/frontend
npm run dev
```

打开 http://localhost:5175

---

## 项目结构

```
admin/
├── docs/
│   ├── requirements/
│   │   └── v1.0.0-requirements.md    # 需求文档
│   └── testing/
│       ├── v1.0.0-test-plan.md       # 测试计划
│       └── v1.0.0-test-cases.md      # 测试用例
├── backend/                           # Express + SQLite 后端
│   ├── src/
│   │   ├── db/                        # 数据库
│   │   ├── middleware/                # 中间件
│   │   ├── routes/                    # API 路由
│   │   └── index.js                   # 入口
│   ├── tests/
│   │   └── api.test.js                # 接口自动化测试
│   └── data/                          # SQLite 数据库文件（gitignore）
└── frontend/                          # React 前端
    ├── src/
    │   ├── api/                       # API 调用
    │   ├── components/                # 组件
    │   ├── pages/                     # 页面
    │   ├── store/                     # 状态
    │   └── test/                      # 单元测试
    └── tests/e2e/                     # E2E 测试（Playwright）
```

---

## 运行测试

### 后端接口测试（Vitest + Supertest）
```bash
cd admin/backend
npm test
```

### 前端单元测试（Vitest + Testing Library）
```bash
cd admin/frontend
npm test
```

### E2E 测试（Playwright）
> 需要同时启动后端和前端

```bash
cd admin/frontend
npm run test:e2e
```

---

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19 + Vite + Tailwind CSS + React Router |
| 后端 | Node.js + Express |
| 数据库 | SQLite（better-sqlite3，本地文件，无需安装服务） |
| 认证 | JWT（jsonwebtoken + bcryptjs） |
| 测试 | Vitest + Supertest + Playwright |

---

## 文档版本历史

所有文档均存放于 `admin/docs/` 下，以版本号命名，保留历史：

| 文件 | 版本 | 说明 |
|------|------|------|
| docs/requirements/v1.0.0-requirements.md | v1.0.0 | 初始需求文档 |
| docs/testing/v1.0.0-test-plan.md | v1.0.0 | 测试计划 |
| docs/testing/v1.0.0-test-cases.md | v1.0.0 | 测试用例 |
