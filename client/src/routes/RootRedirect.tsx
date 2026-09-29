import { Navigate } from 'react-router';
import { ErrorState, FullPageSpinner } from '@/components/States';
import { useCurrentUser } from '@/context/AuthContext';
import { useOrgs } from '@/hooks/useOrgs';
import { getLastOrg } from '@/lib/lastOrg';

export default function RootRedirect() {
  const user = useCurrentUser();
  const { data: orgs, isPending, isError, error, refetch } = useOrgs();

  if (isPending) return <FullPageSpinner label="Loading your organizations" />;
  if (isError) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <ErrorState error={error} onRetry={refetch} />
      </div>
    );
  }
  if (orgs.length === 0) return <Navigate to="/orgs/new" replace />;

  const last = getLastOrg(user.id);
  const target = orgs.find((o) => o.slug === last) ?? orgs[0];
  return <Navigate to={`/o/${target.slug}`} replace />;
}
