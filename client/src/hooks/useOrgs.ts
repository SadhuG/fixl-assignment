import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orgsApi, type OrgBody } from '@/api/orgs';
import type { Organization } from '@/api/types';
import { qk } from '@/lib/queryKeys';

export const useOrgs = () => useQuery({ queryKey: qk.orgs, queryFn: orgsApi.list });

export function useCreateOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: orgsApi.create,
    onSuccess: (org) => {
      // Put the new org in the cache before navigating so OrgLayout can resolve its slug at once.
      qc.setQueryData<Organization[]>(qk.orgs, (old) => [...(old ?? []), org]);
      qc.invalidateQueries({ queryKey: qk.orgs });
    },
  });
}

export function useRenameOrg(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: OrgBody) => orgsApi.rename(orgId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.orgs }),
  });
}
