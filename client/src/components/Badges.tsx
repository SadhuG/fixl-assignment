import type { Priority, Role, Status } from '@/api/types';
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

const STATUS_COLOR: Record<Status, string> = {
  TODO: 'text-status-todo',
  IN_PROGRESS: 'text-status-progress',
  DONE: 'text-status-done',
};

// Ring, half and check shapes keep status readable without colour.
export function StatusGlyph({ status, size = 14 }: { status: Status; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn('shrink-0', STATUS_COLOR[status])}
    >
      <circle
        cx="8"
        cy="8"
        r="6.5"
        fill={status === 'DONE' ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {status === 'IN_PROGRESS' && <path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor" />}
      {status === 'DONE' && (
        <path
          d="M5 8.2l2 2 4-4.2"
          fill="none"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

const PRIORITY_COLOR: Record<Priority, string> = {
  LOW: 'text-priority-low',
  MEDIUM: 'text-priority-medium',
  HIGH: 'text-priority-high',
};
const PRIORITY_LEVEL: Record<Priority, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };

// One, two or three bars, so priority is readable without colour.
export function PriorityBars({ priority, size = 14 }: { priority: Priority; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn('shrink-0', PRIORITY_COLOR[priority])}
    >
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={2 + i * 5}
          y={10 - i * 4}
          width="3"
          height={4 + i * 4}
          rx="1"
          fill="currentColor"
          opacity={i < PRIORITY_LEVEL[priority] ? 1 : 0.2}
        />
      ))}
    </svg>
  );
}
