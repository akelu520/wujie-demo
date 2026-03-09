import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TicketsPage from '@/pages/TicketsPage.tsx';
import AgentsPage from '@/pages/AgentsPage.tsx';

interface AppProps {
  qiankunProps?: { language?: string; [key: string]: unknown };
}

const basename = window.__POWERED_BY_QIANKUN__ ? '/service' : '/';

export default function App({ qiankunProps }: AppProps) {
  const lang = qiankunProps?.language;
  useEffect(() => {
    if (lang) {
      import('i18next').then(({ default: i18next }) => { i18next.changeLanguage(lang); });
    }
  }, [lang]);
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="*" element={<Navigate to="/tickets" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
