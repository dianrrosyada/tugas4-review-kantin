import { AlertCircle, Inbox, Lock, RefreshCw, ShieldAlert, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { btnPrimary } from '../lib/ui';

type Variant = 'loading' | 'empty' | 'error' | 'unauthorized' | 'forbidden';

interface StatePanelProps {
  variant: Variant;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Kalau diisi, aksi menjadi tautan ke rute ini. */
  actionTo?: string;
}

const config: Record<Exclude<Variant, 'loading'>, { icon: LucideIcon; tone: string; code?: string; title: string; message: string }> = {
  empty: {
    icon: Inbox,
    tone: 'bg-primary-soft text-primary',
    title: 'Belum ada data',
    message: 'Data akan muncul di sini setelah ditambahkan.',
  },
  error: {
    icon: AlertCircle,
    tone: 'bg-danger-bg text-danger',
    title: 'Gagal memuat data',
    message: 'Periksa koneksi backend lalu coba lagi.',
  },
  unauthorized: {
    icon: Lock,
    tone: 'bg-warning-bg text-warning',
    code: '401',
    title: 'Silakan masuk dulu',
    message: 'Sesi tidak ditemukan atau sudah berakhir. Masuk untuk melanjutkan.',
  },
  forbidden: {
    icon: ShieldAlert,
    tone: 'bg-danger-bg text-danger',
    code: '403',
    title: 'Tidak punya akses',
    message: 'Akunmu tidak diizinkan melakukan aksi ini.',
  },
};

function StatePanel({ variant, title, message, actionLabel, onAction, actionTo }: StatePanelProps) {
  if (variant === 'loading') {
    return (
      <div className="space-y-3" role="status" aria-busy="true" aria-label="Memuat data">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-24 animate-pulse rounded-card border border-border bg-surface" />
        ))}
        <span className="sr-only">Memuat data...</span>
      </div>
    );
  }

  const { icon: Icon, tone, code, title: defaultTitle, message: defaultMessage } = config[variant];
  const hasAction = Boolean(actionLabel && (onAction || actionTo));

  return (
    <div className="rounded-card border border-border bg-surface px-5 py-12 text-center shadow-card" role={variant === 'error' ? 'alert' : undefined}>
      <div className={`mx-auto grid size-12 place-items-center rounded-dialog ${tone}`}>
        {code ? <span className="font-heading text-sm font-bold">{code}</span> : <Icon className="size-6" aria-hidden="true" />}
      </div>

      <h2 className="mt-4 font-heading text-xl font-bold text-text">{title ?? defaultTitle}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-muted">{message ?? defaultMessage}</p>

      {hasAction ? (
        actionTo ? (
          <Link to={actionTo} className={`${btnPrimary} mt-5`}>
            {actionLabel}
          </Link>
        ) : (
          <button type="button" onClick={onAction} className={`${btnPrimary} mt-5`}>
            {variant === 'error' ? <RefreshCw className="size-4" aria-hidden="true" /> : null}
            {actionLabel}
          </button>
        )
      ) : null}
    </div>
  );
}

export default StatePanel;
