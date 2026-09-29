import axios, { type AxiosError, type AxiosResponse } from 'axios';

export interface FieldError {
  field: string;
  message: string;
}

interface ApiErrorInit {
  status: number;
  code: string;
  message: string;
  details?: FieldError[];
}

// `status` 0 means the request never reached the server.
export class ApiError extends Error {
  status: number;
  code: string;
  details: FieldError[];

  constructor({ status, code, message, details }: ApiErrorInit) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details ?? [];
  }
}

declare module 'axios' {
  interface AxiosRequestConfig {
    // A 401 on this request is an expected answer, not an expired session.
    skipAuthRedirect?: boolean;
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  // Render's free tier can take ~30 s to wake up.
  timeout: 45_000,
});

let onUnauthorized: () => void = () => {};
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

interface ErrorBody {
  error?: { code?: string; message?: string; details?: FieldError[] };
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorBody>) => {
    if (!error.response) {
      return Promise.reject(
        new ApiError({
          status: 0,
          code: 'NETWORK',
          message: "Can't reach the server. It may be waking up, so try again in about 30 seconds.",
        }),
      );
    }
    const { status, data } = error.response;
    const body = data?.error ?? {};
    const apiError = new ApiError({
      status,
      code: body.code ?? 'UNKNOWN',
      message: body.message ?? 'Something went wrong. Please try again.',
      details: body.details,
    });
    if (status === 401 && !error.config?.skipAuthRedirect) onUnauthorized();
    return Promise.reject(apiError);
  },
);

export const unwrap = <T>(promise: Promise<AxiosResponse<T>>): Promise<T> => promise.then((response) => response.data);
