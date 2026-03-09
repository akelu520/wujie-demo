import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomersPage from '@/pages/CustomersPage.tsx';
import ProfilesPage from '@/pages/ProfilesPage.tsx';

interface AppProps {
  qiankunProps?: Record<string, unknown>;
}

const basename = window.__POWERED_BY_QIANKUN__ ? '/crm' : '/';

export default function App({ qiankunProps }: AppProps) {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/profiles" element={<ProfilesPage />} />
        <Route path="*" element={<Navigate to="/customers" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
