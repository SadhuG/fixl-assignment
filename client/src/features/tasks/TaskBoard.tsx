import type { TaskBody } from '@/api/tasks';
import type { Status, Task } from '@/api/types';
import { PriorityBars, StatusGlyph } from '@/components/Badges';
import InlineSelect from '@/components/InlineSelect';
import RowMenu from '@/components/RowMenu';
import { PRIORITY_LABEL, STATUSES, STATUS_LABEL, STATUS_OPTIONS } from '@/lib/taskMeta';
import { cn } from '@/lib/utils';
import { taskActions } from './taskActions';

interface TaskBoardProps {
  tasks: Task[];
  canDelete: (task: Task) => boolean;
  onOpen: (task: Task) => void;
  onChange: (taskId: string, changes: Partial<TaskBody>, optimistic?: Partial<Task>) => void;
  onDelete: (task: Task) => void;
}

// Cards move between columns with the status select: keyboard- and screen-reader-friendly, no drag-and-drop.
export default function TaskBoard({ tasks, canDelete, onOpen, onChange, onDelete }: TaskBoardProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {STATUSES.map((status) => {
        const column = tasks.filter((t) => t.status === status);
        const headingId = `column-${status}`;
        return (
          <section
            key={status}
            aria-labelledby={headingId}
            className="rounded-panel border border-line bg-surface/60 p-3"
          >
            <h2 id={headingId} className="flex items-center gap-2 px-1 pb-2 text-small font-semibold">
              <StatusGlyph status={status} />
              {STATUS_LABEL[status]}
              <span className="ml-auto font-normal text-muted-foreground tabular-nums">{column.length}</span>
            </h2>
            {column.length === 0 ? (
              <p className="px-1 py-6 text-center text-small text-muted-foreground">No tasks</p>
            ) : (
              <ul className="space-y-2">
                {column.map((task) => (
                  <li key={task.id} className="rounded-card border border-line bg-surface p-3">
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => onOpen(task)}
                        className={cn(
                          'min-w-0 flex-1 text-left font-medium break-words underline-offset-2 hover:underline',
                          task.status === 'DONE' && 'text-muted-foreground line-through',
                        )}
                      >
                        {task.title}
                      </button>
                      <RowMenu
                        label={`Actions for ${task.title}`}
                        items={taskActions({
                          canDelete: canDelete(task),
                          onOpen: () => onOpen(task),
                          onDelete: () => onDelete(task),
                        })}
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <InlineSelect<Status>
                        label={`Move ${task.title}`}
                        value={task.status}
                        icon={<StatusGlyph status={task.status} />}
                        options={STATUS_OPTIONS}
                        onChange={(next) => onChange(task.id, { status: next })}
                      />
                      <span className="inline-flex items-center gap-1 text-small text-muted-foreground">
                        <PriorityBars priority={task.priority} />
                        {PRIORITY_LABEL[task.priority]}
                      </span>
                      <span className="ml-auto max-w-[10rem] truncate text-small text-muted-foreground">
                        {task.assignee?.name ?? 'Unassigned'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
