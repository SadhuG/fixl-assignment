import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { qk } from './queryKeys';

// Retry only failures that might go away (network, cold start, 5xx), never 4xx.
const shouldRetry = (failureCount: number, error: { status?: number }) =>
  (error.status === 0 || (error.status ?? 0) >= 500) && failureCount < 2;

// Forms show 400/409 inline and 401 is handled by AuthContext; everything else gets a toast.
const HANDLED_INLINE = new Set([400, 401, 409]);

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (error.status === 403) queryClient.invalidateQueries({ queryKey: qk.orgs });
    },
  }),
  mutationCache: new MutationCache({
    // Mutations that render every error next to a field opt out with meta: { inlineErrors: true }.
    onError: (error, _variables, _context, mutation) => {
      if (HANDLED_INLINE.has(error.status) || mutation.meta?.inlineErrors) return;
      toast.error(error.message);
      // The role may have changed under us; refresh it so the UI hides what we can't do.
      if (error.status === 403 || error.status === 404) queryClient.invalidateQueries({ queryKey: qk.orgs });
    },
  }),
  defaultOptions: {
    queries: { retry: shouldRetry, staleTime: 30_000 },
    mutations: { retry: false },
  },
});
