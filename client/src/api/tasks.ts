import { api, unwrap } from './client';
import type { ListResponse, Priority, Status, Task } from './types';

export interface TaskFilterValues {
  status: Status | '';
  assignee: string;
  q?: string;
}

export interface TaskBody {
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignee: string | null;
  dueDate: string | null;
}

const cleanParams = (filters: object) =>
  Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value != null));

export const tasksApi = {
  list: (projectId: string, filters: TaskFilterValues) =>
    unwrap(api.get<ListResponse<Task>>(`/projects/${projectId}/tasks`, { params: cleanParams(filters) })).then(
      (body) => body.data,
    ),
  create: (projectId: string, body: TaskBody) => unwrap(api.post<Task>(`/projects/${projectId}/tasks`, body)),
  update: (taskId: string, body: Partial<TaskBody>) => unwrap(api.patch<Task>(`/tasks/${taskId}`, body)),
  remove: (taskId: string) => api.delete(`/tasks/${taskId}`),
};
