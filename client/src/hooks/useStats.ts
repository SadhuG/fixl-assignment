import { useQuery } from '@tanstack/react-query';
import { orgsApi } from '@/api/orgs';
import { qk } from '@/lib/queryKeys';

export const useStats = (orgId: string) => useQuery({ queryKey: qk.stats(orgId), queryFn: () => orgsApi.stats(orgId) });
