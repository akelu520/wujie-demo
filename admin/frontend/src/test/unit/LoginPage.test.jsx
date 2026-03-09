import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage.jsx';
import { AuthProvider } from '@/store/auth.jsx';

// Mock API
vi.mock('@/api/index.js', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
  },
  default: {},
}));

import { authApi } from '@/api/index.js';

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('LoginPage 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('TC-E2E-001 渲染登录表单', () => {
    renderLogin();
    expect(screen.getByTestId('username')).toBeTruthy();
    expect(screen.getByTestId('password')).toBeTruthy();
    expect(screen.getByTestId('login-btn')).toBeTruthy();
  });

  it('TC-E2E-002 显示错误提示', async () => {
    authApi.login.mockRejectedValueOnce({ message: '用户名或密码错误' });
    renderLogin();

    fireEvent.change(screen.getByTestId('username'), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByTestId('password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toBeTruthy();
    });
  });

  it('空表单提交调用 login', async () => {
    authApi.login.mockResolvedValueOnce({ data: { token: 'tok', user: { id: 1, username: 'admin', role: 'admin', roleLabel: '管理员' } } });
    renderLogin();

    fireEvent.change(screen.getByTestId('username'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByTestId('password'), { target: { value: 'Admin@123456' } });
    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({ username: 'admin', password: 'Admin@123456' });
    });
  });
});
