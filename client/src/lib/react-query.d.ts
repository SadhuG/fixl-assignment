import '@tanstack/react-query';
import type { ApiError } from '@/api/client';

// Every query and mutation rejects with ApiError (see the axios interceptor).
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
    mutationMeta: { inlineErrors?: boolean };
  }
}
