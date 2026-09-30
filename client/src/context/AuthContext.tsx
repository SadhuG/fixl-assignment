import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi, type LoginBody, type RegisterBody } from '@/api/auth';
import { ApiError, setUnauthorizedHandler } from '@/api/client';
import type { User } from '@/api/types';

// 'error': the session check itself failed (server unreachable), so we don't know yet whether you're signed in.
type AuthState =
  | { status: 'checking'; user: null; sessionEnded: false; error: null }
  | { status: 'error'; user: null; sessionEnded: false; error: Error }
  | { status: 'out'; user: null; sessionEnded: boolean; error: null; loggedOut?: true }
  | { status: 'in'; user: User; sessionEnded: false; error: null };

interface AuthValue {
  status: AuthState['status'];
  user: User | null;
  sessionEnded: boolean;
  loggedOut: boolean;
  error: Error | null;
  retry: () => void;
  login: (credentials: LoginBody) => Promise<User>;
  register: (details: RegisterBody) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

const CHECKING: AuthState = { status: 'checking', user: null, sessionEnded: false, error: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>(CHECKING);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    authApi
      .me()
      .then((user) => alive && setState({ status: 'in', user, sessionEnded: false, error: null }))
      .catch((error: unknown) => {
        if (!alive) return;
        // Only a 401 means "signed out"; anything else must not bounce you to the login page.
        if (error instanceof ApiError && error.status === 401) {
          setState({ status: 'out', user: null, sessionEnded: false, error: null });
        } else {
          setState({
            status: 'error',
            user: null,
            sessionEnded: false,
            error: error instanceof Error ? error : new Error('Something went wrong. Please try again.'),
          });
        }
      });
    return () => {
      alive = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState(CHECKING);
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.clear();
      setState((prev) =>
        prev.status === 'in' ? { status: 'out', user: null, sessionEnded: true, error: null } : prev,
      );
    });
  }, [queryClient]);

  const signIn = useCallback(
    (user: User) => {
      queryClient.clear();
      setState({ status: 'in', user, sessionEnded: false, error: null });
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
      // Explicit logout must not carry this user's protected page into the next login.
      setState({ status: 'out', user: null, sessionEnded: false, error: null, loggedOut: true });
    }
  }, [queryClient]);

  const value = useMemo<AuthValue>(
    () => ({ ...state, loggedOut: state.status === 'out' && state.loggedOut === true, retry, login, register, logout }),
    [state, retry, login, register, logout],
  );
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
