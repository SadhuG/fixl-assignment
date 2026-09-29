import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiError } from '@/api/client';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { useAuth } from '@/context/AuthContext';
import { applyServerErrors } from '@/lib/formErrors';
import { safeNext } from '@/lib/safeNext';
import AuthCard from './AuthCard';
import { loginSchema, type LoginValues } from './schemas';

const LOCKOUT_MS = 60_000;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  useEffect(() => {
    if (!locked) return undefined;
    const timer = setTimeout(() => setLocked(false), LOCKOUT_MS);
    return () => clearTimeout(timer);
  }, [locked]);

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      await login(values);
      navigate(safeNext(params.get('next')), { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) setLocked(true);
      if (!applyServerErrors(err, setError, ['email', 'password'])) {
        setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      }
    }
  }

  return (
    <AuthCard
      title="Log in to TaskHive"
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-medium text-action underline-offset-2 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {params.get('reason') === 'session' && !formError && (
        <Banner tone="warn">Your session ended. Log in again to continue.</Banner>
      )}
      {formError && <Banner tone="danger">{formError}</Banner>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" className="w-full" loading={isSubmitting} disabled={locked}>
          Log in
        </Button>
      </form>
      <p className="text-small text-muted-foreground">
        Demo: <span className="font-mono">demo@taskhive.dev</span> / <span className="font-mono">TaskHive#2026</span>
      </p>
    </AuthCard>
  );
}
