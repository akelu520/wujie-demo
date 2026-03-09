import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ArticlesPage from '@/pages/ArticlesPage.tsx';
import CategoriesPage from '@/pages/CategoriesPage.tsx';
import MediaPage from '@/pages/MediaPage.tsx';

interface AppProps {
  qiankunProps?: { language?: string; [key: string]: unknown };
}

const basename = window.__POWERED_BY_QIANKUN__ ? '/cms' : '/';

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
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="*" element={<Navigate to="/articles" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
