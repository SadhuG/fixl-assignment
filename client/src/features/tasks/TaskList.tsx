import type { TaskBody } from '@/api/tasks';
import type { Member, Task } from '@/api/types';
import TaskRow from './TaskRow';

interface TaskListProps {
  tasks: Task[];
  members: Member[];
  canDelete: (task: Task) => boolean;
  onOpen: (task: Task) => void;
  onChange: (taskId: string, changes: Partial<TaskBody>, optimistic?: Partial<Task>) => void;
  onDelete: (task: Task) => void;
}

export default function TaskList({ tasks, members, canDelete, onOpen, onChange, onDelete }: TaskListProps) {
  return (
    <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          members={members}
          canDelete={canDelete(task)}
          onOpen={() => onOpen(task)}
          onChange={(changes, optimistic) => onChange(task.id, changes, optimistic)}
          onDelete={() => onDelete(task)}
        />
      ))}
    </ul>
  );
}
