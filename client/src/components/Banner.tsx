import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const TONES = {
  danger: 'border-danger/30 bg-danger-tint text-danger',
  warn: 'border-warn/30 bg-warn-tint text-warn',
  info: 'border-line bg-surface text-muted-foreground',
} as const;

interface BannerProps {
  tone?: keyof typeof TONES;
  children: ReactNode;
}

export default function Banner({ tone = 'info', children }: BannerProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('rounded-card border px-3 py-2 text-small', TONES[tone])}
    >
      {children}
    </div>
  );
}
