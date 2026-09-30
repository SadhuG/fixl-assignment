import type { UseQueryResult } from '@tanstack/react-query';
import type { ActivityEntry } from '@/api/types';
import { ErrorState, SkeletonRows } from '@/components/States';
import { formatDate } from '@/lib/format';
import { PRIORITY_LABEL, STATUS_LABEL } from '@/lib/taskMeta';
import type { Priority, Status } from '@/api/types';

const ACTIONS: Record<string, string> = {
  PROJECT_CREATED: 'created project',
  PROJECT_UPDATED: 'updated project',
  PROJECT_DELETED: 'deleted project',
  TASK_CREATED: 'created task',
  TASK_UPDATED: 'updated task',
  TASK_DELETED: 'deleted task',
  MEMBER_ADDED: 'added member',
  MEMBER_ROLE_CHANGED: 'changed member role for',
  MEMBER_REMOVED: 'removed member',
};
const FIELDS: Record<string, string> = {
  title: 'title',
  name: 'name',
  status: 'status',
  priority: 'priority',
  assignee: 'assignee',
  dueDate: 'due date',
  role: 'role',
  description: 'description',
};

function displayValue(field: string, value: string | null) {
  if (value === null) return 'none';
  if (field === 'status') return STATUS_LABEL[value as Status] ?? value;
  if (field === 'priority') return PRIORITY_LABEL[value as Priority] ?? value;
  return value;
}

export function ActivityRows({ entries }: { entries: ActivityEntry[] }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-panel border border-line bg-surface">
      {entries.map((entry) => (
        <li key={entry.id} className="px-4 py-3">
          <p className="text-small">
            <span className="font-medium">{entry.actorName}</span> {ACTIONS[entry.action] ?? entry.action.toLowerCase()}{' '}
            <span className="font-medium">{entry.memberName ?? entry.taskTitle ?? entry.projectName}</span>
            {entry.taskTitle && entry.projectName && (
              <span className="text-muted-foreground"> in {entry.projectName}</span>
            )}
          </p>
          {entry.changes.length > 0 && (
            <ul className="mt-1 text-small text-muted-foreground">
              {entry.changes.map((change) => (
                <li key={change.field}>
                  {FIELDS[change.field] ?? change.field}: {displayValue(change.field, change.from)} →{' '}
                  {displayValue(change.field, change.to)}
                </li>
              ))}
            </ul>
          )}
          <time dateTime={entry.createdAt} className="mt-1 block text-small text-muted-foreground">
            {formatDate(entry.createdAt)}
          </time>
        </li>
      ))}
    </ul>
  );
}

export default function ActivityList({
  query,
  empty,
}: {
  query: UseQueryResult<ActivityEntry[], Error>;
  empty: string;
}) {
  if (query.isPending) return <SkeletonRows rows={2} label="Loading activity" />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (!query.data.length) return <p className="mt-3 text-small text-muted-foreground">{empty}</p>;
  return (
    <div className="mt-3">
      <ActivityRows entries={query.data} />
    </div>
  );
}
