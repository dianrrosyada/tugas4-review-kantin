import { createContext } from 'react';
import type { ToastData } from '../components/Toast';

export interface ToastContextValue {
  showToast: (toast: ToastData) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
