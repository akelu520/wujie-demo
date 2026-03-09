import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5175';

test.describe('登录流程', () => {
  test('TC-E2E-001: 正常登录跳转仪表盘', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"]', 'Admin@123456');
    await page.click('[data-testid="login-btn"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
    await expect(page.locator('text=仪表盘')).toBeVisible();
  });

  test('TC-E2E-002: 错误密码显示错误提示', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="login-btn"]');
    await expect(page.locator('[data-testid="login-error"]')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('用户管理', () => {
  test.beforeEach(async ({ page }) => {
    // 先登录
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"]', 'Admin@123456');
    await page.click('[data-testid="login-btn"]');
    await page.waitForURL(/\/dashboard/);
  });

  test('TC-E2E-003: 用户管理页面显示列表', async ({ page }) => {
    await page.click('text=用户管理');
    await page.waitForURL(/\/users/);
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
  });

  test('TC-E2E-004: 退出登录跳转登录页', async ({ page }) => {
    await page.click('text=退出登录');
    await expect(page).toHaveURL(/\/login/);
  });
});
