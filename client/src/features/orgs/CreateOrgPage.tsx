import { Link, useNavigate } from 'react-router';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { useAuth } from '@/context/AuthContext';
import { useCreateOrg, useOrgs } from '@/hooks/useOrgs';
import { applyServerErrors } from '@/lib/formErrors';
import { slugify } from '@/lib/slugify';
import AuthCard from '../auth/AuthCard';
import { orgSchema, type OrgValues } from './schemas';

export default function CreateOrgPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: orgs } = useOrgs();
  const createOrg = useCreateOrg();
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<OrgValues>({ resolver: zodResolver(orgSchema), defaultValues: { name: '' } });

  const name = useWatch({ control, name: 'name' });
  const slugPreview = name.trim() ? slugify(name) : 'your-org';
  const firstRun = orgs?.length === 0;

  function onSubmit(values: OrgValues) {
    createOrg.mutate(values, {
      onSuccess: (org) => navigate(`/o/${org.slug}`),
      onError: (err) => {
        if (!applyServerErrors(err, setError, ['name'])) setError('name', { type: 'server', message: err.message });
      },
    });
  }

  return (
    <AuthCard
      title={firstRun ? 'Create your first organization' : 'Create an organization'}
      subtitle={firstRun ? 'Organizations hold your projects, tasks and teammates.' : "You'll be its admin."}
      footer={
        firstRun ? (
          <button type="button" onClick={logout} className="font-medium text-action underline-offset-2 hover:underline">
            Log out
          </button>
        ) : (
          <Link to="/" className="font-medium text-action underline-offset-2 hover:underline">
            Cancel
          </Link>
        )
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <TextField
          label="Organization name"
          autoComplete="organization"
          autoFocus
          error={errors.name?.message}
          hint={
            <>
              Address: <span className="font-mono">/o/{slugPreview}</span> (a number is added if it's taken)
            </>
          }
          {...register('name')}
        />
        <Button type="submit" className="w-full" loading={createOrg.isPending}>
          Create organization
        </Button>
      </form>
    </AuthCard>
  );
}
