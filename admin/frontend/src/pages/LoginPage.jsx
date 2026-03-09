import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/auth.jsx';
import { Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Label } from '@/components/ui/label.jsx';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const result = await login(form.username, form.password);
    if (result.ok) {
      navigate('/dashboard');
    } else {
      setError(result.message || '登录失败');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">后台管理系统</CardTitle>
          <CardDescription>请登录您的账号继续操作</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">用户名</Label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  data-testid="username"
                  placeholder="请输入用户名"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  data-testid="password"
                  type="password"
                  placeholder="请输入密码"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            {error && (
              <p className="text-destructive text-sm text-center" data-testid="login-error">{error}</p>
            )}
            <Button
              data-testid="login-btn"
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-2">测试账号</p>
            <div className="space-y-1 text-xs text-muted-foreground text-center">
              <p>超管: superadmin / Admin@123456</p>
              <p>管理员: admin / Admin@123456</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
