import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { useAuth } from '@/context/AuthContext';
import { applyServerErrors } from '@/lib/formErrors';
import AuthCard from './AuthCard';
import { registerSchema, type RegisterValues } from './schemas';

export default function RegisterPage() {
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  async function onSubmit(values: RegisterValues) {
    setFormError(null);
    try {
      await registerAccount(values);
      navigate('/app', { replace: true });
    } catch (err) {
      if (!applyServerErrors(err, setError, ['name', 'email', 'password'])) {
        setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      }
    }
  }

  return (
    <AuthCard
      title="Create your account"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-action underline-offset-2 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {formError && <Banner tone="danger">{formError}</Banner>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <TextField label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
