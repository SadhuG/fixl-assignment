import { useState } from 'react';
import Button from '@/components/Button';
import { ErrorState, SkeletonRows } from '@/components/States';
import { useOrgActivity } from '@/hooks/useActivity';
import { ActivityRows } from './ActivityList';

export default function ActivityFeed({ orgId }: { orgId: string }) {
  const [page, setPage] = useState(1);
  const query = useOrgActivity(orgId, page);
  const totalPages = query.data ? Math.ceil(query.data.total / query.data.limit) : 0;
  return (
    <section aria-labelledby="activity-heading" className="space-y-3">
      <h2 id="activity-heading" className="text-h2 font-semibold">
        Recent activity
      </h2>
      {query.isPending ? (
        <SkeletonRows rows={3} label="Loading activity" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={query.refetch} />
      ) : query.data.data.length ? (
        <ActivityRows entries={query.data.data} />
      ) : (
        <p className="text-small text-muted-foreground">No activity in this organization yet.</p>
      )}
      {totalPages > 1 && (
        <nav aria-label="Activity pages" className="flex items-center justify-end gap-3">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
            Previous
          </Button>
          <span className="text-small text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>
            Next
          </Button>
        </nav>
      )}
    </section>
  );
}
