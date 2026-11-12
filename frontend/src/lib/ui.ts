// Kelas Tailwind yang dipakai ulang di banyak komponen.
export const btnBase =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';
export const btnPrimary = `${btnBase} bg-primary text-white shadow-sm hover:bg-primary-hover`;
export const btnSecondary = `${btnBase} border border-border-strong bg-surface text-primary hover:bg-surface-muted`;
export const btnDanger = `${btnBase} bg-danger-bg text-danger hover:bg-danger/10`;
export const btnSmall = 'min-h-10 px-3 text-xs';

export const inputClass =
  'min-h-11 w-full rounded-control border border-border-strong bg-surface px-3.5 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60';
export const inputErrorClass = 'border-danger focus:border-danger focus:ring-danger/10';
export const labelClass = 'mb-1.5 block text-[13px] font-semibold text-text';
export const cardClass = 'rounded-card border border-border bg-surface shadow-card';
