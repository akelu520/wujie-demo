import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TicketsPage from '@/pages/TicketsPage.tsx';
import AgentsPage from '@/pages/AgentsPage.tsx';

interface AppProps {
  qiankunProps?: Record<string, unknown>;
}

const basename = window.__POWERED_BY_QIANKUN__ ? '/service' : '/';

export default function App({ qiankunProps }: AppProps) {
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
