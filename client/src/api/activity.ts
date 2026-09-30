import { api, unwrap } from './client';
import type { ActivityEntry, ActivityPage, ListResponse } from './types';

export const activityApi = {
  org: (orgId: string, page: number) =>
    unwrap(api.get<ActivityPage>(`/organizations/${orgId}/activity`, { params: { page, limit: 10 } })),
  task: (taskId: string) =>
    unwrap(api.get<ListResponse<ActivityEntry>>(`/tasks/${taskId}/activity`)).then((body) => body.data),
};
