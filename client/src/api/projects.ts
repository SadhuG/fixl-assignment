import { api, unwrap } from './client';
import type { ListResponse, Project, ProjectWithCounts } from './types';

export interface ProjectBody {
  name: string;
  description: string;
}

export const projectsApi = {
  list: (orgId: string) =>
    unwrap(api.get<ListResponse<ProjectWithCounts>>(`/organizations/${orgId}/projects`)).then((body) => body.data),
  get: (projectId: string) => unwrap(api.get<Project>(`/projects/${projectId}`)),
  create: (orgId: string, body: ProjectBody) => unwrap(api.post<Project>(`/organizations/${orgId}/projects`, body)),
  update: (projectId: string, body: Partial<ProjectBody>) => unwrap(api.patch<Project>(`/projects/${projectId}`, body)),
  remove: (projectId: string) => api.delete(`/projects/${projectId}`),
};
