import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi, type LoginBody, type RegisterBody } from '@/api/auth';
import { setUnauthorizedHandler } from '@/api/client';
import type { User } from '@/api/types';

type AuthState =
  | { status: 'checking'; user: null; sessionEnded: false }
  | { status: 'out'; user: null; sessionEnded: boolean }
  | { status: 'in'; user: User; sessionEnded: false };

interface AuthValue {
  status: AuthState['status'];
  user: User | null;
  sessionEnded: boolean;
  login: (credentials: LoginBody) => Promise<User>;
  register: (details: RegisterBody) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({ status: 'checking', user: null, sessionEnded: false });

  useEffect(() => {
    let alive = true;
    authApi
      .me()
      .then((user) => alive && setState({ status: 'in', user, sessionEnded: false }))
      .catch(() => alive && setState({ status: 'out', user: null, sessionEnded: false }));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.clear();
      setState((prev) => (prev.status === 'in' ? { status: 'out', user: null, sessionEnded: true } : prev));
    });
  }, [queryClient]);

  const signIn = useCallback(
    (user: User) => {
      queryClient.clear();
      setState({ status: 'in', user, sessionEnded: false });
      return user;
    },
    [queryClient],
  );

  const login = useCallback(async (credentials: LoginBody) => signIn(await authApi.login(credentials)), [signIn]);
  const register = useCallback(async (details: RegisterBody) => signIn(await authApi.register(details)), [signIn]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      queryClient.clear();
      setState({ status: 'out', user: null, sessionEnded: false });
    }
  }, [queryClient]);

  const value = useMemo<AuthValue>(() => ({ ...state, login, register, logout }), [state, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// The hook and provider stay together on purpose.
// eslint-disable-next-line react/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// For screens that only render inside RequireAuth.
// eslint-disable-next-line react/only-export-components
export function useCurrentUser(): User {
  const { user } = useAuth();
  if (!user) throw new Error('useCurrentUser must be used inside <RequireAuth>');
  return user;
}
