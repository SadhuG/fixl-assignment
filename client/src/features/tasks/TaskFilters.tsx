import { useEffect, useState, type ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import type { TaskFilterValues } from '@/api/tasks';
import type { Member } from '@/api/types';
import { STATUSES, STATUS_LABEL } from '@/lib/taskMeta';

const selectClass = 'h-10 rounded-control border border-line bg-surface px-2 text-small sm:h-8';

interface SearchBoxProps {
  initial: string;
  onSearch: (q: string) => void;
}

// Local text with a 300 ms debounce. The parent remounts this (via key) to clear it.
function SearchBox({ initial, onSearch }: SearchBoxProps) {
  const [text, setText] = useState(initial);
  useEffect(() => {
    const timer = setTimeout(() => onSearch(text.trim()), 300);
    return () => clearTimeout(timer);
  }, [text, onSearch]);
  return (
    <label className="relative">
      <span className="sr-only">Search tasks by title</span>
      <Search
        size={14}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="search"
        value={text}
        maxLength={100}
        placeholder="Search tasks"
        onChange={(event) => setText(event.target.value)}
        className="h-10 w-48 rounded-control border border-line bg-surface pr-2 pl-8 text-small sm:h-8"
      />
    </label>
  );
}

interface TaskFiltersProps {
  filters: TaskFilterValues;
  onChange: (filters: TaskFilterValues) => void;
  members: Member[];
}

export default function TaskFilters({ filters, onChange, members }: TaskFiltersProps) {
  const set = (key: 'status' | 'assignee') => (event: ChangeEvent<HTMLSelectElement>) =>
    onChange({ ...filters, [key]: event.target.value });
  const q = filters.q ?? '';
  return (
    <div className="flex flex-wrap gap-2">
      <SearchBox initial={q} onSearch={(next) => next !== q && onChange({ ...filters, q: next })} />
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
