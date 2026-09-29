import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { returnFocus } from '@/lib/focusReturn';
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
  const focusProps = { onCloseAutoFocus: returnFocus };

  if (variant === 'center') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          {...focusProps}
          aria-describedby={undefined}
          className="gap-0 rounded-modal bg-surface p-0 text-body text-ink sm:max-w-md [&>[data-slot=dialog-close]]:top-2 [&>[data-slot=dialog-close]]:right-2 [&>[data-slot=dialog-close]]:size-10"
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
          // 40 px close button (tap target), centred in the 56 px header.
          'gap-0 bg-surface p-0 text-body text-ink [&>[data-slot=sheet-close]]:top-2 [&>[data-slot=sheet-close]]:right-2 [&>[data-slot=sheet-close]]:size-10',
          // Same data-[side] variants as the shadcn defaults, so these override them instead of losing on specificity.
          variant === 'right'
            ? 'data-[side=right]:w-full data-[side=right]:sm:max-w-[480px] data-[side=right]:sm:rounded-l-modal'
            : 'data-[side=left]:w-[85%] data-[side=left]:max-w-xs data-[side=left]:sm:max-w-xs',
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
