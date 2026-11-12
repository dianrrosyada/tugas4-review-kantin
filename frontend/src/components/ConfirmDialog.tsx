import { Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { btnDanger, btnSecondary } from '../lib/ui';
import Modal from './Modal';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  onClose: () => void;
  /** Dijalankan saat dikonfirmasi; dialog menutup diri setelah selesai (berhasil atau gagal). */
  onConfirm: () => Promise<void>;
}

function ConfirmDialog({ title, message, confirmLabel, onClose, onConfirm }: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm(): Promise<void> {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  }

  return (
    <Modal title={title} description={message} icon={<Trash2 className="size-5" aria-hidden="true" />} onClose={onClose}>
      <div className="flex justify-end gap-2 px-5 py-4 sm:px-6">
        <button type="button" onClick={onClose} disabled={isSubmitting} className={btnSecondary} data-autofocus>
          Batal
        </button>
        <button type="button" onClick={() => void handleConfirm()} disabled={isSubmitting} className={btnDanger}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {isSubmitting ? 'Menghapus...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
