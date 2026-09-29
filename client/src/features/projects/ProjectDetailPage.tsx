import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { TaskBody, TaskFilterValues } from '@/api/tasks';
import type { Task } from '@/api/types';
import Button from '@/components/Button';
import ConfirmDialog from '@/components/ConfirmDialog';
import { EmptyState, ErrorState, NotFoundView, SkeletonRows } from '@/components/States';
import { useCurrentUser } from '@/context/AuthContext';
import { useOrg } from '@/context/OrgContext';
import { useMembers } from '@/hooks/useMembers';
import { useDeleteProject, useProject } from '@/hooks/useProjects';
import { useDeleteTask, useTasks, useUpdateTask } from '@/hooks/useTasks';
import { EMPTY_FILTERS } from '../tasks/filters';
import TaskDrawer, { type DrawerState } from '../tasks/TaskDrawer';
import TaskFilters from '../tasks/TaskFilters';
import TaskList from '../tasks/TaskList';
import ProjectFormModal from './ProjectFormModal';

export default function ProjectDetailPage() {
  const { projectId = '' } = useParams();
  const { org, orgs, isAdmin } = useOrg();
  const user = useCurrentUser();
  const navigate = useNavigate();
  const projectQuery = useProject(projectId);
  const membersQuery = useMembers(org.id);
  const [filters, setFilters] = useState<TaskFilterValues>(EMPTY_FILTERS);
  const tasksQuery = useTasks(projectId, filters);
  const updateTask = useUpdateTask(projectId, org.id);
  const deleteTask = useDeleteTask(projectId, org.id);
  const deleteProject = useDeleteProject(org.id);
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [editingProject, setEditingProject] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const backToProjects = { backTo: `/o/${org.slug}/projects`, backLabel: 'Back to projects' };

  if (projectQuery.isPending) return <SkeletonRows rows={6} label="Loading project" />;
  if (projectQuery.isError) {
    return projectQuery.error.status === 404 ? (
      <NotFoundView title="Project not found" {...backToProjects} />
    ) : (
      <ErrorState error={projectQuery.error} onRetry={projectQuery.refetch} />
    );
  }

  const project = projectQuery.data;
  // The API allowed this read, but the project lives in another of my orgs: reopen it in that org's frame.
  if (project.organization !== org.id) {
    const owner = orgs.find((o) => o.id === project.organization);
    if (owner) return <Navigate to={`/o/${owner.slug}/projects/${project.id}`} replace />;
    return <NotFoundView title="Project not found" {...backToProjects} />;
  }

  const members = membersQuery.data ?? [];
  const canEditProject = isAdmin || project.createdBy?.id === user.id;
  const canDeleteTask = (task: Task) => isAdmin || task.createdBy?.id === user.id;
  const filtersActive = Object.values(filters).some((value) => value !== '');
  const openCreate = () => setDrawer({ mode: 'create' });

  function changeTask(taskId: string, changes: Partial<TaskBody>, optimistic?: Partial<Task>) {
    updateTask.mutate(
      { taskId, changes, optimistic },
      {
        onError: (err) => {
          // 5xx/403/404 are toasted globally; inline edits have no field to show 400/409 on.
          if ([400, 409].includes(err.status)) toast.error(err.message);
        },
      },
    );
  }

  let tasksBody;
  if (tasksQuery.isPending) tasksBody = <SkeletonRows label="Loading tasks" />;
  else if (tasksQuery.isError) tasksBody = <ErrorState error={tasksQuery.error} onRetry={tasksQuery.refetch} />;
  else if (tasksQuery.data.length === 0) {
    tasksBody = filtersActive ? (
      <EmptyState
        title="No tasks match these filters"
        action={
          <Button variant="secondary" onClick={() => setFilters(EMPTY_FILTERS)}>
            Clear filters
          </Button>
        }
      />
    ) : (
      <EmptyState
        title="No tasks yet"
        body="Add the first task for this project."
        action={<Button onClick={openCreate}>Create a task</Button>}
      />
    );
  } else {
    tasksBody = (
      <TaskList
        tasks={tasksQuery.data}
        members={members}
        canDelete={canDeleteTask}
        onOpen={(task) => setDrawer({ mode: 'edit', task })}
        onChange={changeTask}
        onDelete={setDeletingTask}
      />
    );
  }

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-small text-muted-foreground">
        <Link to={`/o/${org.slug}/projects`} className="underline-offset-2 hover:underline">
          Projects
        </Link>{' '}
        <span aria-hidden="true">/</span> <span aria-current="page">{project.name}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-h1 font-semibold break-words">{project.name}</h1>
          {project.description && (
            <p className="mt-1 max-w-2xl whitespace-pre-line text-muted-foreground">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {canEditProject && (
            <Button variant="secondary" onClick={() => setEditingProject(true)}>
              <Pencil size={16} aria-hidden="true" /> Edit
            </Button>
          )}
          {isAdmin && (
            <Button variant="secondary" className="text-danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={16} aria-hidden="true" /> Delete
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TaskFilters filters={filters} onChange={setFilters} members={members} />
        <Button onClick={openCreate}>
          <Plus size={16} aria-hidden="true" /> New task
        </Button>
      </div>

      {tasksBody}

      <TaskDrawer state={drawer} projectId={project.id} members={members} onClose={() => setDrawer(null)} />
      <ConfirmDialog
        open={deletingTask !== null}
        title="Delete task?"
        body={`"${deletingTask?.title ?? ''}" will be permanently deleted.`}
        confirmLabel="Delete task"
        loading={deleteTask.isPending}
        onClose={() => setDeletingTask(null)}
        onConfirm={() => deletingTask && deleteTask.mutate(deletingTask.id, { onSettled: () => setDeletingTask(null) })}
      />
      <ProjectFormModal open={editingProject} project={project} onClose={() => setEditingProject(false)} />
      <ConfirmDialog
        open={confirmDelete}
        title="Delete project?"
        body={`"${project.name}" and all of its tasks will be permanently deleted.`}
        confirmLabel="Delete project"
        loading={deleteProject.isPending}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() =>
          deleteProject.mutate(project.id, {
            onSuccess: () => navigate(`/o/${org.slug}/projects`, { replace: true }),
            onSettled: () => setConfirmDelete(false),
          })
        }
      />
    </div>
  );
}
