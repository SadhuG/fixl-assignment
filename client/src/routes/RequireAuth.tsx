import { Navigate, Outlet, useLocation } from 'react-router';
import { FullPageSpinner } from '@/components/States';
import { useAuth } from '@/context/AuthContext';

export default function RequireAuth() {
  const { status, sessionEnded } = useAuth();
  const location = useLocation();

  if (status === 'checking') return <FullPageSpinner label="Restoring your session" />;
  if (status === 'out') {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}${sessionEnded ? '&reason=session' : ''}`} replace />;
  }
  return <Outlet />;
}
