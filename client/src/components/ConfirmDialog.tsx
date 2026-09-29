import type { ReactNode } from 'react';
import Banner from './Banner';
import Button from './Button';
import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
}

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
  loading = false,
  error,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-muted-foreground">{body}</p>
      {error && (
        <div className="mt-3">
          <Banner tone="danger">{error}</Banner>
        </div>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
