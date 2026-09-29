import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { RoleBadge } from '@/components/Badges';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { useOrg } from '@/context/OrgContext';
import { useRenameOrg } from '@/hooks/useOrgs';
import { applyServerErrors } from '@/lib/formErrors';
import { formatDate } from '@/lib/format';
import { orgSchema, type OrgValues } from './schemas';

export default function OrgDetailsPanel() {
  const { org, isAdmin } = useOrg();
  const rename = useRenameOrg(org.id);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<OrgValues>({ resolver: zodResolver(orgSchema), defaultValues: { name: org.name } });

  useEffect(() => {
    reset({ name: org.name });
  }, [org.name, reset]);

  function onSubmit(values: OrgValues) {
    rename.mutate(values, {
      onSuccess: () => toast.success('Organization renamed'),
      onError: (err) => {
        if (!applyServerErrors(err, setError, ['name']) && [400, 409].includes(err.status)) {
          setError('name', { type: 'server', message: err.message });
        }
      },
    });
  }

  return (
    <section aria-labelledby="org-details-heading" className="rounded-panel border border-line bg-surface p-4">
      <h2 id="org-details-heading" className="text-h2 font-semibold">
        Organization
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start"
      >
        <TextField
          className="flex-1"
          label="Name"
          readOnly={!isAdmin}
          hint={isAdmin ? undefined : 'Only admins can rename the organization.'}
          error={errors.name?.message}
          {...register('name')}
        />
        {isAdmin && (
          <Button type="submit" variant="secondary" className="sm:mt-6" disabled={!isDirty} loading={rename.isPending}>
            Save name
          </Button>
        )}
      </form>
      <dl className="mt-4 grid gap-3 text-small sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Address</dt>
          <dd className="font-mono">/o/{org.slug}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Created</dt>
          <dd>{formatDate(org.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Your role</dt>
          <dd>
            <RoleBadge role={org.role} />
          </dd>
        </div>
      </dl>
    </section>
  );
}
