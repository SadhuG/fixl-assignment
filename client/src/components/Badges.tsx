import type { Role } from '@/api/types';
import { cn } from '@/lib/utils';

export function RoleBadge({ role, inverted = false }: { role: Role; inverted?: boolean }) {
  const tone = inverted
    ? 'bg-white/15 text-white'
    : role === 'ADMIN'
      ? 'bg-org-tint text-org'
      : 'bg-paper text-muted-foreground';
  return (
    <span className={cn('rounded-badge px-1.5 py-0.5 text-micro font-medium', tone)}>
      {role === 'ADMIN' ? 'Admin' : 'Member'}
    </span>
  );
}
