export function formatRating(value: number): string {
  return Number(value).toFixed(2);
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

export function getErrorMessage(error: unknown, fallback = 'Terjadi kesalahan.'): string {
  return error instanceof Error ? error.message : fallback;
}
