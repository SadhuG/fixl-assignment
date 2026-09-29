import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { useAddMember } from '@/hooks/useMembers';
import { applyServerErrors } from '@/lib/formErrors';

const addMemberSchema = z.object({
  email: z.string().trim().min(1, 'Enter an email').email('Enter a valid email address'),
  role: z.enum(['MEMBER', 'ADMIN']),
});
type AddMemberValues = z.infer<typeof addMemberSchema>;

export default function AddMemberForm({ orgId }: { orgId: string }) {
  const addMember = useAddMember(orgId);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AddMemberValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { email: '', role: 'MEMBER' },
  });

  function onSubmit(values: AddMemberValues) {
    addMember.mutate(values, {
      onSuccess: (member) => {
        toast.success(`${member.name} added`);
        reset();
      },
      onError: (err) => {
        if (!applyServerErrors(err, setError, ['email', 'role'])) {
          setError('email', { type: 'server', message: err.message });
        }
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-panel border border-line bg-surface p-4">
      <h2 className="text-h2 font-semibold">Add a member</h2>
      <p className="mt-1 text-small text-muted-foreground">
        They need a TaskHive account first. There are no email invites in this version.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
        <TextField
          className="flex-1"
          label="Email"
          type="email"
          autoComplete="off"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField className="sm:w-40" label="Role" as="select" {...register('role')}>
          <option value="MEMBER">Member</option>
          <option value="ADMIN">Admin</option>
        </TextField>
        <Button type="submit" className="sm:mt-6" loading={addMember.isPending}>
          Add member
        </Button>
      </div>
    </form>
  );
}
