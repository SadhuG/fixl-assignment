import type { ReactNode } from 'react';
import { Link } from 'react-router';
import Button from './Button';
import Spinner from './Spinner';

export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="grid min-h-dvh place-items-center text-muted-foreground">
      <Spinner label={label} />
    </div>
  );
}

export function SkeletonRows({ rows = 4, label = 'Loading' }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-2">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-card bg-line/60" />
      ))}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  body?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="rounded-panel border border-dashed border-line bg-surface px-6 py-12 text-center">
      <h2 className="text-h2 font-semibold">{title}</h2>
      {body && <p className="mx-auto mt-1 max-w-md text-muted-foreground">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  error?: { message: string } | null;
  onRetry?: () => unknown;
  title?: string;
}

export function ErrorState({ error, onRetry, title = "Couldn't load this" }: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-panel border border-danger/30 bg-surface px-6 py-10 text-center">
      <h2 className="text-h2 font-semibold">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-muted-foreground">{error?.message ?? 'Something went wrong.'}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={() => onRetry()}>
          Try again
        </Button>
      )}
    </div>
  );
}

interface NotFoundViewProps {
  title?: string;
  body?: string;
  backTo?: string;
  backLabel?: string;
}

// One message for "doesn't exist" and "not yours", matching the API's 404 strategy.
export function NotFoundView({
  title = 'Not found',
  body = "It doesn't exist, or you don't have access to it.",
  backTo = '/',
  backLabel = 'Go to my organizations',
}: NotFoundViewProps) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="font-mono text-small text-muted-foreground">404</p>
      <h1 className="mt-2 text-h1 font-semibold">{title}</h1>
      <p className="mt-2 text-muted-foreground">{body}</p>
      <Link to={backTo} className="mt-6 inline-block font-medium text-action underline-offset-2 hover:underline">
        {backLabel}
      </Link>
    </div>
  );
}
