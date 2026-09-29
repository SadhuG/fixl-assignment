import type { ComponentProps } from 'react';
import { Button as UiButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Spinner from './Spinner';

// App-level variants mapped onto the shadcn button, with TaskHive sizing and a loading state.
const VARIANTS = {
  primary: { variant: 'default', className: 'hover:bg-action-hover' },
  secondary: { variant: 'outline', className: 'bg-surface text-ink hover:bg-paper' },
  danger: { variant: 'default', className: 'bg-danger text-white hover:bg-danger/90' },
  ghost: { variant: 'ghost', className: 'text-ink' },
} as const;

// sm stays 40 px tall on touch screens and shrinks to 32 px from the sm breakpoint.
const SIZES = { sm: 'h-10 px-3 text-small sm:h-8', md: 'h-10 px-4 text-body' } as const;

export interface ButtonProps extends Omit<ComponentProps<'button'>, 'size'> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  loading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const v = VARIANTS[variant];
  return (
    <UiButton
      type={type}
      variant={v.variant}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn('gap-2 rounded-control font-medium', SIZES[size], v.className, className)}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </UiButton>
  );
}
