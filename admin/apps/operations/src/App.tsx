import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CampaignsPage from '@/pages/CampaignsPage.tsx';
import ReportsPage from '@/pages/ReportsPage.tsx';

interface AppProps {
  qiankunProps?: { language?: string; [key: string]: unknown };
}


export default function App({ qiankunProps }: AppProps) {
  const basename = (qiankunProps as any)?.container ? '/operations' : '/';
  const lang = qiankunProps?.language;
  useEffect(() => {
    if (lang) {
      import('i18next').then(({ default: i18next }) => { i18next.changeLanguage(lang); });
    }
  }, [lang]);
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
