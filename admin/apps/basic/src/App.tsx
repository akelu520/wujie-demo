import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '@/pages/DashboardPage.tsx';
import UsersPage from '@/pages/UsersPage.tsx';
import RolesPage from '@/pages/RolesPage.tsx';
import type { User } from '@/types/index.ts';

interface AppProps {
  qiankunProps?: { user?: User; [key: string]: unknown };
}

// 在 qiankun 内运行时使用 /basic 作为 basename，独立运行时使用 /
const basename = window.__POWERED_BY_QIANKUN__ ? '/basic' : '/';

export default function App({ qiankunProps }: AppProps) {
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
