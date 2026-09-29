import { useRef, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { setFocusReturnTarget } from '@/lib/focusReturn';
import { cn } from '@/lib/utils';

export interface RowMenuItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  tone?: 'danger';
  disabled?: boolean;
  reason?: string;
}

interface RowMenuProps {
  label: string;
  items: RowMenuItem[];
}

// "…" button with row actions. Disabled items stay visible with their reason (docs/ui-plan.md principle 2).
export default function RowMenu({ label, items }: RowMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  if (items.length === 0) return null;

  function select(item: RowMenuItem) {
    // A dialog opened by onSelect returns focus to this trigger when it closes.
    setFocusReturnTarget(triggerRef.current);
    item.onSelect();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          aria-label={label}
          title={label}
          className="grid size-10 place-items-center rounded-control text-muted-foreground hover:bg-paper hover:text-ink"
        >
          <MoreHorizontal size={18} aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 rounded-panel border border-line bg-surface p-1 shadow-lg">
        {items.map((item) => (
          <div key={item.label}>
            <DropdownMenuItem
              disabled={item.disabled}
              onSelect={() => select(item)}
              className={cn('min-h-10 gap-2 px-2 text-small', item.tone === 'danger' ? 'text-danger' : 'text-ink')}
            >
              {item.icon}
              {item.label}
            </DropdownMenuItem>
            {item.disabled && item.reason && (
              <p className="px-2 pb-1 text-micro text-muted-foreground">{item.reason}</p>
            )}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
