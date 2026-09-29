import { api, unwrap } from './client';
import type { ListResponse, Member, Role } from './types';

export interface MemberAddBody {
  email: string;
  role: Role;
}

export const membersApi = {
  list: (orgId: string) =>
    unwrap(api.get<ListResponse<Member>>(`/organizations/${orgId}/members`)).then((body) => body.data),
  add: (orgId: string, body: MemberAddBody) => unwrap(api.post<Member>(`/organizations/${orgId}/members`, body)),
  changeRole: (orgId: string, userId: string, role: Role) =>
    unwrap(api.patch<Member>(`/organizations/${orgId}/members/${userId}`, { role })),
  remove: (orgId: string, userId: string) => api.delete(`/organizations/${orgId}/members/${userId}`),
};
