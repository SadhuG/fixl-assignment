import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi, type TaskBody, type TaskFilterValues } from '@/api/tasks';
import type { Task } from '@/api/types';
import { qk } from '@/lib/queryKeys';

// keepPreviousData only spans filter changes inside one project; keys never cross projects or orgs.
export const useTasks = (projectId: string, filters: TaskFilterValues) =>
  useQuery({
    queryKey: qk.tasks(projectId, filters),
    queryFn: () => tasksApi.list(projectId, filters),
    placeholderData: keepPreviousData,
  });

function useInvalidateTaskViews(projectId: string, orgId: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: qk.tasksOf(projectId) });
    qc.invalidateQueries({ queryKey: qk.projects(orgId) });
    qc.invalidateQueries({ queryKey: qk.stats(orgId) });
  };
}

export function useCreateTask(projectId: string, orgId: string) {
  const invalidate = useInvalidateTaskViews(projectId, orgId);
  return useMutation({ mutationFn: (body: TaskBody) => tasksApi.create(projectId, body), onSuccess: invalidate });
}

export interface TaskUpdate {
  taskId: string;
  changes: Partial<TaskBody>;
  // What the cached row should look like meanwhile (e.g. a populated assignee instead of an id).
  optimistic?: Partial<Task>;
}

// Inline edits feel instant: patch every cached list for this project, and roll back if the API refuses.
export function useUpdateTask(projectId: string, orgId: string) {
  const qc = useQueryClient();
  const invalidate = useInvalidateTaskViews(projectId, orgId);
  return useMutation({
    mutationFn: ({ taskId, changes }: TaskUpdate) => tasksApi.update(taskId, changes),
    onMutate: async ({ taskId, changes, optimistic }: TaskUpdate) => {
      await qc.cancelQueries({ queryKey: qk.tasksOf(projectId) });
      const snapshots = qc.getQueriesData<Task[]>({ queryKey: qk.tasksOf(projectId) });
      const patch = optimistic ?? (changes as Partial<Task>);
      qc.setQueriesData<Task[]>({ queryKey: qk.tasksOf(projectId) }, (old) =>
        old?.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
      );
      return { snapshots };
    },
    onError: (_error, _vars, context) => {
      context?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: invalidate,
  });
}

export function useDeleteTask(projectId: string, orgId: string) {
  const invalidate = useInvalidateTaskViews(projectId, orgId);
  return useMutation({ mutationFn: (taskId: string) => tasksApi.remove(taskId), onSuccess: invalidate });
}
