import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { membersApi, type MemberAddBody } from '@/api/members';
import type { Role } from '@/api/types';
import { qk } from '@/lib/queryKeys';

export const useMembers = (orgId: string) =>
  useQuery({ queryKey: qk.members(orgId), queryFn: () => membersApi.list(orgId) });

export function useAddMember(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: MemberAddBody) => membersApi.add(orgId, body),
    // 404 (no such account) and 409 (already a member) belong on the email field, not in a toast.
    meta: { inlineErrors: true },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.members(orgId) }),
  });
}

export function useChangeRole(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) => membersApi.changeRole(orgId, userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.members(orgId) });
      qc.invalidateQueries({ queryKey: qk.orgs }); // my own role may have changed
    },
  });
}

export function useRemoveMember(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => membersApi.remove(orgId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.members(orgId) });
      qc.invalidateQueries({ queryKey: qk.orgs });
      qc.invalidateQueries({ queryKey: qk.stats(orgId) });
      qc.invalidateQueries({ queryKey: ['project'] }); // their open tasks were unassigned
    },
  });
}
