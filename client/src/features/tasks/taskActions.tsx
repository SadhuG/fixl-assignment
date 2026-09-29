import { Pencil, Trash2 } from 'lucide-react';
import type { RowMenuItem } from '@/components/RowMenu';

interface TaskActionsArgs {
  canDelete: boolean;
  onOpen: () => void;
  onDelete: () => void;
}

// Row-menu items shared by the list row and (Task 20) the board card.
export function taskActions({ canDelete, onOpen, onDelete }: TaskActionsArgs): RowMenuItem[] {
  return [
    { label: 'Edit task', icon: <Pencil size={16} aria-hidden="true" />, onSelect: onOpen },
    {
      label: 'Delete task',
      icon: <Trash2 size={16} aria-hidden="true" />,
      tone: 'danger',
      onSelect: onDelete,
      disabled: !canDelete,
      reason: 'Only admins or the task’s creator can delete it.',
    },
  ];
}
