import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AccountsPage from '@/pages/AccountsPage.tsx';
import TradesPage from '@/pages/TradesPage.tsx';
import MarketPage from '@/pages/MarketPage.tsx';
import RiskPage from '@/pages/RiskPage.tsx';

interface AppProps {
  qiankunProps?: Record<string, unknown>;
}

const basename = window.__POWERED_BY_QIANKUN__ ? '/securities' : '/';

export default function App({ qiankunProps }: AppProps) {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/trades" element={<TradesPage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/risk" element={<RiskPage />} />
        <Route path="*" element={<Navigate to="/accounts" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
