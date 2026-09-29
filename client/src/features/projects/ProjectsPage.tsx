import { useState } from 'react';
import { Link } from 'react-router';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { Project, ProjectWithCounts } from '@/api/types';
import Button from '@/components/Button';
import ConfirmDialog from '@/components/ConfirmDialog';
import RowMenu, { type RowMenuItem } from '@/components/RowMenu';
import { EmptyState, ErrorState, SkeletonRows } from '@/components/States';
import { useCurrentUser } from '@/context/AuthContext';
import { useOrg } from '@/context/OrgContext';
import { useDeleteProject, useProjects } from '@/hooks/useProjects';
import { formatDate } from '@/lib/format';
import ProjectFormModal from './ProjectFormModal';

export default function ProjectsPage() {
  const { org, isAdmin } = useOrg();
  const user = useCurrentUser();
  const projectsQuery = useProjects(org.id);
  const deleteProject = useDeleteProject(org.id);
  const [editing, setEditing] = useState<Project | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const canEdit = (project: Project) => isAdmin || project.createdBy?.id === user.id;
  const openCreate = () => setEditing('new');

  let body;
  if (projectsQuery.isPending) body = <SkeletonRows label="Loading projects" />;
  else if (projectsQuery.isError) body = <ErrorState error={projectsQuery.error} onRetry={projectsQuery.refetch} />;
  else if (projectsQuery.data.length === 0) {
    body = (
      <EmptyState
        title="No projects yet"
        body="Projects group related tasks. Create one to get started."
        action={<Button onClick={openCreate}>Create a project</Button>}
      />
    );
  } else {
    body = (
      <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
        {projectsQuery.data.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            orgSlug={org.slug}
            canEdit={canEdit(project)}
            canDelete={isAdmin}
            onEdit={() => setEditing(project)}
            onDelete={() => setDeleting(project)}
          />
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h1 font-semibold">Projects</h1>
        <Button onClick={openCreate}>
          <Plus size={16} aria-hidden="true" /> New project
        </Button>
      </div>
      {body}
      <ProjectFormModal
        open={editing !== null}
        project={editing === 'new' ? null : editing}
        onClose={() => setEditing(null)}
      />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete project?"
        body={`"${deleting?.name ?? ''}" and all of its tasks will be permanently deleted.`}
        confirmLabel="Delete project"
        loading={deleteProject.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteProject.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
      />
    </div>
  );
}

interface ProjectRowProps {
  project: ProjectWithCounts;
  orgSlug: string;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function ProjectRow({ project, orgSlug, canEdit, canDelete, onEdit, onDelete }: ProjectRowProps) {
  const { TODO, IN_PROGRESS, DONE } = project.taskCounts;
  // Members see only what they can do: edit if they created it; delete is admin-only and hidden.
  const actions: RowMenuItem[] = [];
  if (canEdit) actions.push({ label: 'Edit project', icon: <Pencil size={16} aria-hidden="true" />, onSelect: onEdit });
  if (canDelete) {
    actions.push({
      label: 'Delete project',
      icon: <Trash2 size={16} aria-hidden="true" />,
      tone: 'danger',
      onSelect: onDelete,
    });
  }
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <Link
          to={`/o/${orgSlug}/projects/${project.id}`}
          className="font-semibold text-ink underline-offset-2 hover:underline"
        >
          {project.name}
        </Link>
        {project.description && <p className="truncate text-small text-muted-foreground">{project.description}</p>}
        <p className="mt-1 text-micro text-muted-foreground">
          {TODO} to do · {IN_PROGRESS} in progress · {DONE} done
        </p>
      </div>
      <p className="hidden w-36 shrink-0 text-small text-muted-foreground lg:block">
        Updated {formatDate(project.updatedAt)}
      </p>
      <div className="w-10 shrink-0">
        <RowMenu label={`Actions for ${project.name}`} items={actions} />
      </div>
    </li>
  );
}
