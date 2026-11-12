import { ChevronLeft, ChevronRight } from 'lucide-react';
import { btnPrimary, btnSecondary } from '../lib/ui';
import type { PageMeta } from '../types/stall';

interface PaginationProps {
  meta: PageMeta;
  onPageChange: (page: number) => void;
}

function buildPages(current: number, total: number): number[] {
  const start = Math.max(1, Math.min(current - 2, total - 4));
  const end = Math.min(total, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function Pagination({ meta, onPageChange }: PaginationProps) {
  if (meta.total_pages <= 1) return null;

  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Halaman daftar warung">
      <button
        type="button"
        onClick={() => onPageChange(meta.page - 1)}
        disabled={meta.page <= 1}
        className={`${btnSecondary} min-h-10`}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Sebelumnya
      </button>

      {buildPages(meta.page, meta.total_pages).map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          aria-current={page === meta.page ? 'page' : undefined}
          className={`${page === meta.page ? btnPrimary : btnSecondary} min-h-10 min-w-10 px-0`}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(meta.page + 1)}
        disabled={meta.page >= meta.total_pages}
        className={`${btnSecondary} min-h-10`}
      >
        Berikutnya
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}

export default Pagination;
