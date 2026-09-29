import { useQuery } from '@tanstack/react-query';
import { membersApi } from '@/api/members';
import { qk } from '@/lib/queryKeys';

export const useMembers = (orgId: string) =>
  useQuery({ queryKey: qk.members(orgId), queryFn: () => membersApi.list(orgId) });
