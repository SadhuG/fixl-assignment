// Every org-scoped key starts with the org id, so switching orgs never reuses another org's cache.
export const qk = {
  orgs: ['orgs'] as const,
  stats: (orgId: string) => ['org', orgId, 'stats'] as const,
  members: (orgId: string) => ['org', orgId, 'members'] as const,
  activityOf: (orgId: string) => ['org', orgId, 'activity'] as const,
  activity: (orgId: string, page: number) => ['org', orgId, 'activity', page] as const,
  taskActivity: (orgId: string, taskId: string) => ['org', orgId, 'task', taskId, 'activity'] as const,
  projects: (orgId: string) => ['org', orgId, 'projects'] as const,
  project: (id: string) => ['project', id] as const,
  tasksOf: (projectId: string) => ['project', projectId, 'tasks'] as const,
  tasks: (projectId: string, filters: object) => ['project', projectId, 'tasks', filters] as const,
};
