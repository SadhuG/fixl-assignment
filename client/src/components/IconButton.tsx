import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

interface IconButtonProps extends ComponentProps<'button'> {
  label: string;
  tone?: 'default' | 'danger';
}

// Square 40 px icon-only button; `label` becomes the accessible name and tooltip.
export default function IconButton({ label, tone = 'default', className, children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'grid size-10 place-items-center rounded-control',
        tone === 'danger' ? 'text-danger hover:bg-danger/10' : 'text-muted-foreground hover:bg-paper hover:text-ink',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
