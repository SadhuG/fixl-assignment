import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';

export default function Root() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster position="bottom-right" richColors closeButton />
    </AuthProvider>
  );
}
