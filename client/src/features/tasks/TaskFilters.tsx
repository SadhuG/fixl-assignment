import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import type { TaskFilterValues } from '@/api/tasks';
import type { Member, Status } from '@/api/types';
import InlineSelect, { type SelectOption } from '@/components/InlineSelect';
import { STATUSES, STATUS_LABEL } from '@/lib/taskMeta';

const STATUS_FILTER_OPTIONS: SelectOption<Status | ''>[] = [
  { value: '', label: 'All statuses' },
  ...STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] })),
];

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
  const q = filters.q ?? '';
  return (
    <div className="flex flex-wrap gap-2">
      <SearchBox initial={q} onSearch={(next) => next !== q && onChange({ ...filters, q: next })} />
      <InlineSelect<Status | ''>
        label="Filter by status"
        value={filters.status}
        options={STATUS_FILTER_OPTIONS}
        onChange={(status) => onChange({ ...filters, status })}
      />
      <InlineSelect
        label="Filter by assignee"
        value={filters.assignee}
        options={[
          { value: '', label: 'Anyone' },
          { value: 'me', label: 'Assigned to me' },
          { value: 'none', label: 'Unassigned' },
          ...members.map((m) => ({ value: m.id, label: m.name })),
        ]}
        onChange={(assignee) => onChange({ ...filters, assignee })}
        className="max-w-[13rem]"
      />
    </div>
  );
}
