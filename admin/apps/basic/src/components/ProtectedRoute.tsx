import { Navigate } from 'react-router-dom';
import { useAuth } from '@/store/auth.tsx';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
