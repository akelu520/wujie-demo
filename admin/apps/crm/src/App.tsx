import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomersPage from '@/pages/CustomersPage.tsx';
import ProfilesPage from '@/pages/ProfilesPage.tsx';

interface AppProps {
  qiankunProps?: { language?: string; [key: string]: unknown };
}


export default function App({ qiankunProps }: AppProps) {
  const basename = (qiankunProps as any)?.container ? '/crm' : '/';
  const lang = qiankunProps?.language;
  useEffect(() => {
    if (lang) {
      import('i18next').then(({ default: i18next }) => { i18next.changeLanguage(lang); });
    }
  }, [lang]);
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
