import { Link } from 'react-router';
import type { OrgStats } from '@/api/types';
import { PriorityBars, RoleBadge, StatusGlyph } from '@/components/Badges';
import { EmptyState, ErrorState } from '@/components/States';
import { useOrg } from '@/context/OrgContext';
import { useStats } from '@/hooks/useStats';
import { formatDate } from '@/lib/format';
import { PRIORITY_LABEL, STATUSES, STATUS_LABEL } from '@/lib/taskMeta';
import ActivityFeed from '@/features/activity/ActivityFeed';

export default function DashboardPage() {
  const { org } = useOrg();
  const statsQuery = useStats(org.id);

  let body;
  if (statsQuery.isPending) body = <DashboardLoading />;
  else if (statsQuery.isError) body = <ErrorState error={statsQuery.error} onRetry={statsQuery.refetch} />;
  else body = <DashboardBody stats={statsQuery.data} orgSlug={org.slug} />;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-h1 font-semibold">{org.name}</h1>
        <RoleBadge role={org.role} />
      </div>
      {body}
      <ActivityFeed key={org.id} orgId={org.id} />
    </div>
  );
}

function DashboardLoading() {
  return (
    <div role="status" aria-label="Loading dashboard" className="space-y-8">
      <section aria-labelledby="status-heading">
        <h2 id="status-heading" className="text-h2 font-semibold">
          Tasks by status
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {STATUSES.map((status) => (
            <li key={status} className="rounded-panel border border-line bg-surface p-4">
              <p className="flex items-center gap-2 text-small text-muted-foreground">
                <StatusGlyph status={status} />
                {STATUS_LABEL[status]}
              </p>
              <p className="mt-1 text-display font-semibold" aria-hidden="true">
                <span className="inline-block w-8 animate-pulse rounded bg-line/60 text-transparent">0</span>
              </p>
            </li>
          ))}
        </ul>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        {['Assigned to me', 'Recent projects'].map((heading) => (
          <section key={heading} className="space-y-3">
            <h2 className="text-h2 font-semibold">{heading}</h2>
            <div className="divide-y divide-line overflow-hidden rounded-panel border border-line bg-surface" aria-hidden="true">
              {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className="flex h-[68px] flex-col justify-center gap-2 px-4">
                  <span className="h-4 w-2/3 animate-pulse rounded bg-line/60" />
                  <span className="h-3 w-1/3 animate-pulse rounded bg-line/60" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function DashboardBody({ stats, orgSlug }: { stats: OrgStats; orgSlug: string }) {
  return (
    <>
      <section aria-labelledby="status-heading">
        <h2 id="status-heading" className="text-h2 font-semibold">
          Tasks by status
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {STATUSES.map((status) => (
            <li key={status} className="rounded-panel border border-line bg-surface p-4">
              <p className="flex items-center gap-2 text-small text-muted-foreground">
                <StatusGlyph status={status} />
                {STATUS_LABEL[status]}
              </p>
              <p className="mt-1 text-display font-semibold tabular-nums">{stats.byStatus[status]}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="mine-heading" className="space-y-3">
          <h2 id="mine-heading" className="text-h2 font-semibold">
            Assigned to me
          </h2>
          {stats.assignedToMe.length === 0 ? (
            <EmptyState
              title="Nothing assigned to you"
              body="Open tasks assigned to you in this organization show up here."
            />
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-panel border border-line bg-surface">
              {stats.assignedToMe.map((task) => (
                <li key={task.id}>
                  <Link
                    to={`/o/${orgSlug}/projects/${task.project.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-paper"
                  >
                    <StatusGlyph status={task.status} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{task.title}</span>
                      <span className="block truncate text-small text-muted-foreground">
                        {task.project.name}
                        <span className="sr-only">
                          , {STATUS_LABEL[task.status]}, {PRIORITY_LABEL[task.priority]} priority
                        </span>
                      </span>
                    </span>
                    <PriorityBars priority={task.priority} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="recent-heading" className="space-y-3">
          <h2 id="recent-heading" className="text-h2 font-semibold">
            Recent projects
          </h2>
          {stats.recentProjects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              action={
                <Link
                  to={`/o/${orgSlug}/projects`}
                  className="font-medium text-action underline-offset-2 hover:underline"
                >
                  Create a project
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-panel border border-line bg-surface">
              {stats.recentProjects.map((project) => (
                <li key={project.id}>
                  <Link
                    to={`/o/${orgSlug}/projects/${project.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-paper"
                  >
                    <span className="truncate font-medium">{project.name}</span>
                    <span className="shrink-0 text-small text-muted-foreground">
                      Updated {formatDate(project.updatedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
