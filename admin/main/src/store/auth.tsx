import { createContext, useContext, useState } from 'react';
import { authApi } from '@/api/index.ts';
import type { User } from '@/api/index.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('user') ?? 'null'); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  async function login(username: string, password: string): Promise<{ ok: boolean; message?: string }> {
    setLoading(true);
    try {
      const res = await authApi.login({ username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return { ok: true };
    } catch (err: unknown) {
      const e = err as { message?: string };
      return { ok: false, message: e.message || '登录失败' };
    } finally {
      setLoading(false);
    }
  }

  async function logout(): Promise<void> {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
