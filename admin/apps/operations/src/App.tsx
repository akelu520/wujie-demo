import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CampaignsPage from '@/pages/CampaignsPage.tsx';
import ReportsPage from '@/pages/ReportsPage.tsx';

interface AppProps {
  qiankunProps?: Record<string, unknown>;
}

const basename = window.__POWERED_BY_QIANKUN__ ? '/operations' : '/';

export default function App({ qiankunProps }: AppProps) {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/campaigns" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
