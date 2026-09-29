import type { ReactNode } from 'react';
import { Navigate, useSearchParams } from 'react-router';
import { FullPageSpinner } from '@/components/States';
import { useAuth } from '@/context/AuthContext';
import { safeNext } from '@/lib/safeNext';

// Sends signed-in users to the same place LoginPage would, so the two redirects never disagree.
export default function GuestOnly({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [params] = useSearchParams();
  if (status === 'checking') return <FullPageSpinner label="Checking your session" />;
  if (status === 'in') return <Navigate to={safeNext(params.get('next'))} replace />;
  return children;
}
