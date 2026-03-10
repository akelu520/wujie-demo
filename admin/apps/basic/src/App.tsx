import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '@/pages/DashboardPage.tsx';
import UsersPage from '@/pages/UsersPage.tsx';
import RolesPage from '@/pages/RolesPage.tsx';
import type { User } from '@/types/index.ts';

interface AppProps {
  qiankunProps?: { user?: User; language?: string; [key: string]: unknown };
}


export default function App({ qiankunProps }: AppProps) {
  const basename = (qiankunProps as any)?.container ? '/basic' : '/';
  const lang = qiankunProps?.language;

  useEffect(() => {
    if (lang) {
      import('i18next').then(({ default: i18next }) => { i18next.changeLanguage(lang); });
    }
  }, [lang]);

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
