import { api, unwrap } from './client';
import type { ListResponse, Organization, OrgStats } from './types';

export interface OrgBody {
  name: string;
}

export const orgsApi = {
  list: () => unwrap(api.get<ListResponse<Organization>>('/organizations')).then((body) => body.data),
  create: (body: OrgBody) => unwrap(api.post<Organization>('/organizations', body)),
  rename: (orgId: string, body: OrgBody) => unwrap(api.patch<Organization>(`/organizations/${orgId}`, body)),
  stats: (orgId: string) => unwrap(api.get<OrgStats>(`/organizations/${orgId}/stats`)),
};
