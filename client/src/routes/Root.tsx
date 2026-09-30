import { Outlet, ScrollRestoration } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';

export default function Root() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster position="bottom-right" richColors closeButton />
      {/* New pages open at the top; back/forward returns to where you were. */}
      <ScrollRestoration />
    </AuthProvider>
  );
}
