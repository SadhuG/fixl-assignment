import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiError } from '@/api/client';
import type { Project } from '@/api/types';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import TextField from '@/components/TextField';
import { useOrg } from '@/context/OrgContext';
import { useSaveProject } from '@/hooks/useProjects';
import { applyServerErrors } from '@/lib/formErrors';
import { projectSchema, type ProjectValues } from './schemas';

interface ProjectFormModalProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
}

export default function ProjectFormModal({ open, project, onClose }: ProjectFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={project ? 'Edit project' : 'New project'}>
      <ProjectForm key={project?.id ?? 'new'} project={project} onDone={onClose} />
    </Modal>
  );
}

function ProjectForm({ project, onDone }: { project: Project | null; onDone: () => void }) {
  const { org } = useOrg();
  const save = useSaveProject(org.id);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: project?.name ?? '', description: project?.description ?? '' },
  });

  async function onSubmit(values: ProjectValues) {
    setFormError(null);
    try {
      await save.mutateAsync({ projectId: project?.id, values });
      onDone();
    } catch (err) {
      const inline = err instanceof ApiError && [400, 409].includes(err.status);
      if (!applyServerErrors(err, setError, ['name', 'description']) && inline) setFormError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {formError && <Banner tone="danger">{formError}</Banner>}
      <TextField label="Name" autoFocus error={errors.name?.message} {...register('name')} />
      <TextField
        label="Description"
        as="textarea"
        rows={4}
        hint="Optional, up to 1,000 characters"
        error={errors.description?.message}
        {...register('description')}
      />
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={save.isPending}>
          {project ? 'Save changes' : 'Create project'}
        </Button>
      </div>
    </form>
  );
}
