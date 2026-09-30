import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi, type ProjectBody } from '@/api/projects';
import { qk } from '@/lib/queryKeys';

export const useProjects = (orgId: string) =>
  useQuery({ queryKey: qk.projects(orgId), queryFn: () => projectsApi.list(orgId) });

export const useProject = (projectId: string) =>
  useQuery({ queryKey: qk.project(projectId), queryFn: () => projectsApi.get(projectId) });

export function useSaveProject(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, values }: { projectId?: string; values: ProjectBody }) =>
      projectId ? projectsApi.update(projectId, values) : projectsApi.create(orgId, values),
    onSuccess: (project) => {
      qc.setQueryData(qk.project(project.id), project);
      qc.invalidateQueries({ queryKey: qk.projects(orgId) });
      qc.invalidateQueries({ queryKey: qk.stats(orgId) });
      qc.invalidateQueries({ queryKey: qk.activityOf(orgId) });
    },
  });
}

export function useDeleteProject(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => projectsApi.remove(projectId),
    onSuccess: (_data, projectId) => {
      qc.removeQueries({ queryKey: qk.project(projectId) });
      qc.invalidateQueries({ queryKey: qk.projects(orgId) });
      qc.invalidateQueries({ queryKey: qk.stats(orgId) });
      qc.invalidateQueries({ queryKey: qk.activityOf(orgId) });
    },
  });
}
