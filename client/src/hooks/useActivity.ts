import { useQuery } from '@tanstack/react-query';
import { activityApi } from '@/api/activity';
import { qk } from '@/lib/queryKeys';

export const useOrgActivity = (orgId: string, page: number) =>
  useQuery({ queryKey: qk.activity(orgId, page), queryFn: () => activityApi.org(orgId, page) });

export const useTaskActivity = (orgId: string, taskId: string) =>
  useQuery({ queryKey: qk.taskActivity(orgId, taskId), queryFn: () => activityApi.task(taskId), enabled: !!taskId });
