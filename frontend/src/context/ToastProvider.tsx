import { useCallback, useMemo, useState, type ReactNode } from 'react';
import Toast, { type ToastData } from '../components/Toast';
import { ToastContext } from './toast-context';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = useCallback((next: ToastData) => setToast(next), []);
  const closeToast = useCallback(() => setToast(null), []);
  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? <Toast toast={toast} onClose={closeToast} /> : null}
    </ToastContext.Provider>
  );
}
