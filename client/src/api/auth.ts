import { api, unwrap } from './client';
import type { User } from './types';

// skipAuthRedirect: a 401 here is an expected answer, not an expired session.
const quiet = { skipAuthRedirect: true };

export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody extends LoginBody {
  name: string;
}

export const authApi = {
  me: () => unwrap(api.get<User>('/auth/me', quiet)),
  login: (body: LoginBody) => unwrap(api.post<User>('/auth/login', body, quiet)),
  register: (body: RegisterBody) => unwrap(api.post<User>('/auth/register', body, quiet)),
  logout: () => api.post('/auth/logout', null, quiet),
};
