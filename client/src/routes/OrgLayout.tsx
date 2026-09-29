import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router';
import AppShell from '@/components/AppShell';
import { ErrorState, FullPageSpinner, NotFoundView } from '@/components/States';
import { useCurrentUser } from '@/context/AuthContext';
import { OrgProvider } from '@/context/OrgContext';
import { useOrgs } from '@/hooks/useOrgs';
import { setLastOrg } from '@/lib/lastOrg';

// Resolves :orgSlug against *my* org list. The API independently enforces membership on every call.
export default function OrgLayout() {
  const { orgSlug } = useParams();
  const user = useCurrentUser();
  const { data: orgs, isPending, isError, error, refetch } = useOrgs();
  const org = orgs?.find((o) => o.slug === orgSlug);

  useEffect(() => {
    if (org) setLastOrg(user.id, org.slug);
  }, [org, user.id]);

  if (isPending) return <FullPageSpinner label="Loading organization" />;
  if (isError) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <ErrorState error={error} onRetry={refetch} />
      </div>
    );
  }
  if (!org) {
    return (
      <main className="px-4">
        <NotFoundView title="Organization not found" />
      </main>
    );
  }

  return (
    <OrgProvider org={org} orgs={orgs}>
      <AppShell>
        {/* Keyed by org so page-local state (filters, open drawers) resets on switch. */}
        <Outlet key={org.id} />
      </AppShell>
    </OrgProvider>
  );
}
