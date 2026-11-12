import type { SortBy, SortOrder, StallQuery } from '../types/stall';

export const PAGE_SIZE = 9;

// Backend tidak punya endpoint daftar kategori, jadi pilihan filter ditulis di sini.
// Tambahkan kategori baru di sini bila perlu (filter di backend memakai kecocokan persis).
export const CATEGORIES = ['Nasi', 'Bakso', 'Mie', 'Minuman', 'Sate', 'Soto', 'Kwetiau', 'Western'] as const;

export const SORT_OPTIONS: { value: string; label: string; sort_by: SortBy; order: SortOrder }[] = [
  { value: 'created_at:desc', label: 'Terbaru', sort_by: 'created_at', order: 'desc' },
  { value: 'avg_rating:desc', label: 'Rating tertinggi', sort_by: 'avg_rating', order: 'desc' },
  { value: 'review_count:desc', label: 'Ulasan terbanyak', sort_by: 'review_count', order: 'desc' },
  { value: 'name:asc', label: 'Nama A-Z', sort_by: 'name', order: 'asc' },
  { value: 'name:desc', label: 'Nama Z-A', sort_by: 'name', order: 'desc' },
];

const sortFields: SortBy[] = ['name', 'avg_rating', 'review_count', 'created_at'];

/** Baca query string URL menjadi query GET /stalls. URL jadi sumber kebenaran (bisa di-bookmark & di-refresh). */
export function parseStallQuery(params: URLSearchParams): StallQuery {
  const page = Number.parseInt(params.get('page') ?? '', 10);
  const minRating = Number.parseFloat(params.get('min_rating') ?? '');
  const sortBy = params.get('sort_by') as SortBy | null;
  const order = params.get('order');

  return {
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    limit: PAGE_SIZE,
    search: params.get('search')?.trim() || undefined,
    category: params.get('category')?.trim() || undefined,
    location: params.get('location')?.trim() || undefined,
    min_rating: Number.isFinite(minRating) && minRating > 0 ? Math.min(minRating, 5) : undefined,
    sort_by: sortBy && sortFields.includes(sortBy) ? sortBy : 'created_at',
    order: order === 'asc' ? 'asc' : 'desc',
  };
}

export function hasActiveFilters(query: StallQuery): boolean {
  return Boolean(
    query.search ||
      query.category ||
      query.location ||
      query.min_rating !== undefined ||
      query.sort_by !== 'created_at' ||
      query.order !== 'desc',
  );
}
