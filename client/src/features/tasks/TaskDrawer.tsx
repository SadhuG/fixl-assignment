import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { ApiError } from '@/api/client';
import type { TaskBody } from '@/api/tasks';
import type { Member, Task } from '@/api/types';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import ConfirmDialog from '@/components/ConfirmDialog';
import Modal from '@/components/Modal';
import TextField from '@/components/TextField';
import { useCurrentUser } from '@/context/AuthContext';
import { useOrg } from '@/context/OrgContext';
import { useCreateTask, useDeleteTask, useUpdateTask } from '@/hooks/useTasks';
import { applyServerErrors } from '@/lib/formErrors';
import { PRIORITIES, PRIORITY_LABEL, STATUSES, STATUS_LABEL } from '@/lib/taskMeta';
import { assigneeOptions } from './assigneeOptions';
import { taskSchema, type TaskValues } from './schemas';

const FIELDS = ['title', 'description', 'status', 'priority', 'assignee'] as const;

export type DrawerState = { mode: 'create' } | { mode: 'edit'; task: Task } | null;

interface TaskDrawerProps {
  state: DrawerState;
  projectId: string;
  members: Member[];
  onClose: () => void;
}

export default function TaskDrawer({ state, projectId, members, onClose }: TaskDrawerProps) {
  const task = state?.mode === 'edit' ? state.task : null;
  return (
    <Modal open={state !== null} onClose={onClose} title={task ? 'Edit task' : 'New task'} variant="right">
      {state && (
        <TaskForm key={task?.id ?? 'new'} task={task} projectId={projectId} members={members} onDone={onClose} />
      )}
    </Modal>
  );
}

interface TaskFormProps {
  task: Task | null;
  projectId: string;
  members: Member[];
  onDone: () => void;
}

function TaskForm({ task, projectId, members, onDone }: TaskFormProps) {
  const { org, isAdmin } = useOrg();
  const user = useCurrentUser();
  const createTask = useCreateTask(projectId, org.id);
  const updateTask = useUpdateTask(projectId, org.id);
  const deleteTask = useDeleteTask(projectId, org.id);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const reasonId = useId();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<TaskValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? 'TODO',
      priority: task?.priority ?? 'MEDIUM',
      assignee: task?.assignee?.id ?? '',
    },
  });

  const canDelete = task !== null && (isAdmin || task.createdBy?.id === user.id);

  async function onSubmit(values: TaskValues) {
    setFormError(null);
    const body: TaskBody = { ...values, assignee: values.assignee || null };
    try {
      if (task) {
        // Send only what changed: an untouched former-member assignee would otherwise fail validation.
        const changed = FIELDS.filter((key) => dirtyFields[key]);
        if (changed.length > 0) {
          const changes: Partial<TaskBody> = Object.fromEntries(changed.map((key) => [key, body[key]]));
          const person = members.find((m) => m.id === changes.assignee);
          const optimistic: Partial<Task> | undefined =
            'assignee' in changes
              ? {
                  ...(changes as Partial<Task>),
                  assignee: person ? { id: person.id, name: person.name, email: person.email } : null,
                }
              : undefined;
          await updateTask.mutateAsync({ taskId: task.id, changes, optimistic });
        }
      } else {
        await createTask.mutateAsync(body);
      }
      onDone();
    } catch (err) {
      const inline = err instanceof ApiError && [400, 409].includes(err.status);
      if (!applyServerErrors(err, setError, FIELDS) && inline) setFormError(err.message);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {formError && <Banner tone="danger">{formError}</Banner>}
        <TextField label="Title" autoFocus error={errors.title?.message} {...register('title')} />
        <TextField
          label="Description"
          as="textarea"
          rows={5}
          error={errors.description?.message}
          {...register('description')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Status" as="select" error={errors.status?.message} {...register('status')}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </TextField>
          <TextField label="Priority" as="select" error={errors.priority?.message} {...register('priority')}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </TextField>
        </div>
        <TextField
          label="Assignee"
          as="select"
          hint="Only members of this organization can be assigned."
          error={errors.assignee?.message}
          {...register('assignee')}
        >
          {assigneeOptions(members, task?.assignee).map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </TextField>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {task ? 'Save changes' : 'Create task'}
          </Button>
        </div>
      </form>

      {task && (
        <div className="mt-8 border-t border-line pt-4">
          <Button
            variant="secondary"
            className="text-danger"
            disabled={!canDelete}
            aria-describedby={canDelete ? undefined : reasonId}
            onClick={() => setConfirming(true)}
          >
            <Trash2 size={16} aria-hidden="true" /> Delete task
          </Button>
          {!canDelete && (
            <p id={reasonId} className="mt-2 text-small text-muted-foreground">
              Only admins or the person who created this task can delete it.
            </p>
          )}
          <ConfirmDialog
            open={confirming}
            title="Delete task?"
            body={`"${task.title}" will be permanently deleted.`}
            confirmLabel="Delete task"
            loading={deleteTask.isPending}
            onClose={() => setConfirming(false)}
            onConfirm={() => deleteTask.mutate(task.id, { onSuccess: onDone, onSettled: () => setConfirming(false) })}
          />
        </div>
      )}
    </>
  );
}
