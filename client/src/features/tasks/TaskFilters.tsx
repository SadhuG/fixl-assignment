import type { ChangeEvent } from 'react';
import type { TaskFilterValues } from '@/api/tasks';
import type { Member } from '@/api/types';
import { STATUSES, STATUS_LABEL } from '@/lib/taskMeta';

const selectClass = 'h-10 rounded-control border border-line bg-surface px-2 text-small sm:h-8';

interface TaskFiltersProps {
  filters: TaskFilterValues;
  onChange: (filters: TaskFilterValues) => void;
  members: Member[];
}

export default function TaskFilters({ filters, onChange, members }: TaskFiltersProps) {
  const set = (key: keyof TaskFilterValues) => (event: ChangeEvent<HTMLSelectElement>) =>
    onChange({ ...filters, [key]: event.target.value });
  return (
    <div className="flex flex-wrap gap-2">
      <label>
        <span className="sr-only">Filter by status</span>
        <select value={filters.status} onChange={set('status')} className={selectClass}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">Filter by assignee</span>
        <select value={filters.assignee} onChange={set('assignee')} className={selectClass}>
          <option value="">Anyone</option>
          <option value="me">Assigned to me</option>
          <option value="none">Unassigned</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
