import { useRef, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  variant?: 'center' | 'right' | 'left';
  children: ReactNode;
}

const header = 'flex min-h-14 items-center border-b border-line py-3 pr-14 pl-5';

// Centered dialog or side sheet (Radix): traps focus, closes on Esc and outside click,
// and returns focus to the opener on close.
export default function Modal({ open, onClose, title, variant = 'center', children }: ModalProps) {
  const onOpenChange = (next: boolean) => {
    if (!next) onClose();
  };
  // Radix only restores focus to a DialogTrigger; these modals are controlled, so remember the opener.
  const openerRef = useRef<HTMLElement | null>(null);
  const focusProps = {
    onOpenAutoFocus: () => {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    },
    onCloseAutoFocus: (event: Event) => {
      if (!openerRef.current?.isConnected) return;
      event.preventDefault();
      openerRef.current.focus();
    },
  };

  if (variant === 'center') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          {...focusProps}
          aria-describedby={undefined}
          className="gap-0 rounded-modal bg-surface p-0 text-body text-ink sm:max-w-md [&>[data-slot=dialog-close]]:top-3 [&>[data-slot=dialog-close]]:right-3 [&>[data-slot=dialog-close]]:size-8"
        >
          <header className={header}>
            <DialogTitle className="text-h2 font-semibold">{title}</DialogTitle>
          </header>
          <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto p-5">{children}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        {...focusProps}
        side={variant}
        aria-describedby={undefined}
        className={cn(
          'gap-0 bg-surface p-0 text-body text-ink',
          variant === 'right' ? 'w-full sm:max-w-[480px] sm:rounded-l-modal' : 'w-[85%] max-w-xs',
        )}
      >
        <header className={header}>
          <SheetTitle className="text-h2 font-semibold">{title}</SheetTitle>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
