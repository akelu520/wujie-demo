import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { registerMicroApps, start, initGlobalState } from 'qiankun';
import type { RegistrableApp } from 'qiankun';
import { AuthProvider, useAuth } from '@/store/auth.tsx';
import ProtectedRoute from '@/components/ProtectedRoute.tsx';
import Layout from '@/components/Layout.tsx';
import LoginPage from '@/pages/LoginPage.tsx';

// 子应用注册配置
const microApps: Parameters<typeof registerMicroApps>[0] = [
  { name: 'basic',      entry: '//localhost:5176', activeRule: '/basic',      container: '#subapp-container' },
  { name: 'securities', entry: '//localhost:5177', activeRule: '/securities', container: '#subapp-container' },
  { name: 'cms',        entry: '//localhost:5178', activeRule: '/cms',        container: '#subapp-container' },
  { name: 'crm',        entry: '//localhost:5179', activeRule: '/crm',        container: '#subapp-container' },
  { name: 'service',    entry: '//localhost:5180', activeRule: '/service',    container: '#subapp-container' },
  { name: 'operations', entry: '//localhost:5181', activeRule: '/operations', container: '#subapp-container' },
];

// 全局状态初始化
export const globalActions = initGlobalState({
  user: null,
  language: localStorage.getItem('admin-language') ?? 'zh-CN',
});

function MicroAppContainer() {
  const { user } = useAuth();

  useEffect(() => {
    registerMicroApps(
      microApps.map(app => ({
        ...app,
        props: { user },
      })),
      {
        beforeLoad: [() => Promise.resolve()],
        beforeMount: [() => Promise.resolve()],
        afterUnmount: [() => Promise.resolve()],
      }
    );

    start({
      sandbox: { strictStyleIsolation: false, experimentalStyleIsolation: true },
      prefetch: false,
    });
  }, []);

  // 用户信息变化时同步给子应用
  useEffect(() => {
    globalActions.setGlobalState({ user });
  }, [user]);

  // 语言变化时同步给子应用
  useEffect(() => {
    const handleLangChange = (lang: string) => {
      globalActions.setGlobalState({ language: lang });
    };
    import('i18next').then(({ default: i18next }) => {
      i18next.on('languageChanged', handleLangChange);
      return () => { i18next.off('languageChanged', handleLangChange); };
    });
  }, []);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <MicroAppContainer />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/basic/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
