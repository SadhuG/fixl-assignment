import type { TaskBody } from '@/api/tasks';
import type { Member, Priority, Status, Task } from '@/api/types';
import { PriorityBars, StatusGlyph } from '@/components/Badges';
import InlineSelect from '@/components/InlineSelect';
import RowMenu from '@/components/RowMenu';
import { PRIORITIES, PRIORITY_LABEL, STATUS_OPTIONS } from '@/lib/taskMeta';
import { cn } from '@/lib/utils';
import { assigneeOptions } from './assigneeOptions';
import { taskActions } from './taskActions';

const priorityOptions = PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABEL[p] }));

export type TaskChangeHandler = (changes: Partial<TaskBody>, optimistic?: Partial<Task>) => void;

interface TaskRowProps {
  task: Task;
  members: Member[];
  canDelete: boolean;
  onOpen: () => void;
  onChange: TaskChangeHandler;
  onDelete: () => void;
}

export default function TaskRow({ task, members, canDelete, onOpen, onChange, onDelete }: TaskRowProps) {
  const actions = taskActions({ canDelete, onOpen, onDelete });

  function changeAssignee(id: string) {
    const person = members.find((m) => m.id === id);
    onChange(
      { assignee: id || null },
      { assignee: person ? { id: person.id, name: person.name, email: person.email } : null },
    );
  }

  return (
    <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <span
          className={cn(
            'block truncate font-medium underline-offset-2 hover:underline',
            task.status === 'DONE' && 'text-muted-foreground line-through',
          )}
        >
          {task.title}
        </span>
        {task.description && (
          <span className="block truncate text-small text-muted-foreground">{task.description}</span>
        )}
      </button>
      <div className="flex flex-wrap items-center gap-2">
        <InlineSelect<Status>
          label={`Status of ${task.title}`}
          value={task.status}
          icon={<StatusGlyph status={task.status} />}
          options={STATUS_OPTIONS}
          onChange={(status) => onChange({ status })}
        />
        <InlineSelect<Priority>
          label={`Priority of ${task.title}`}
          value={task.priority}
          icon={<PriorityBars priority={task.priority} />}
          options={priorityOptions}
          onChange={(priority) => onChange({ priority })}
        />
        <InlineSelect
          label={`Assignee of ${task.title}`}
          value={task.assignee?.id ?? ''}
          options={assigneeOptions(members, task.assignee)}
          onChange={changeAssignee}
          className="max-w-[13rem]"
        />
        <RowMenu label={`Actions for ${task.title}`} items={actions} />
      </div>
    </li>
  );
}
