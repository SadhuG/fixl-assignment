import { Navigate, Outlet, useLocation } from 'react-router';
import { ErrorState, FullPageSpinner } from '@/components/States';
import { useAuth } from '@/context/AuthContext';

export default function RequireAuth() {
  const { status, sessionEnded, loggedOut, error, retry } = useAuth();
  const location = useLocation();

  if (status === 'checking') return <FullPageSpinner label="Restoring your session" />;
  if (status === 'error') {
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <div className="w-full max-w-md">
          <ErrorState title="Couldn't load TaskHive" error={error} onRetry={retry} />
        </div>
      </main>
    );
  }
  if (status === 'out') {
    if (loggedOut) return <Navigate to="/login" replace />;
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}${sessionEnded ? '&reason=session' : ''}`} replace />;
  }
  return <Outlet />;
}
