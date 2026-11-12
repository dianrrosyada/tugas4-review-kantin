import { Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import StallFilters, { type FilterPatch } from '../components/StallFilters';
import { StallCard, StallSkeletonGrid } from '../components/StallCard';
import StatePanel from '../components/StatePanel';
import { useAuth } from '../hooks/useAuth';
import { useStalls } from '../hooks/useStalls';
import { useToast } from '../hooks/useToast';
import { deleteStall } from '../lib/api';
import { getErrorMessage } from '../lib/format';
import { canCreateStall } from '../lib/permissions';
import { hasActiveFilters, parseStallQuery } from '../lib/query';
import { btnPrimary } from '../lib/ui';
import type { Stall } from '../types/stall';

function StallListPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => parseStallQuery(searchParams), [searchParams]);
  const { stalls, meta, isLoading, error, reload } = useStalls(query);
  const [deletingStall, setDeletingStall] = useState<Stall | null>(null);
  const [filterResetKey, setFilterResetKey] = useState(0);
  const filtersActive = hasActiveFilters(query);

  // Semua filter disimpan di URL (?search=...&category=...), jadi bisa di-refresh dan dibagikan.
  const handleFilterChange = useCallback(
    (patch: FilterPatch) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          const setOrDelete = (key: string, value: string | undefined) => {
            if (value) next.set(key, value);
            else next.delete(key);
          };

          if (patch.search !== undefined) setOrDelete('search', patch.search);
          if (patch.category !== undefined) setOrDelete('category', patch.category);
          if (patch.location !== undefined) setOrDelete('location', patch.location);
          if (patch.min_rating !== undefined) setOrDelete('min_rating', patch.min_rating);
          if (patch.sort !== undefined) {
            const [sortBy, order] = patch.sort.split(':');
            if (patch.sort === 'created_at:desc') {
              next.delete('sort_by');
              next.delete('order');
            } else {
              next.set('sort_by', sortBy);
              next.set('order', order);
            }
          }

          next.delete('page'); // filter berubah -> kembali ke halaman 1
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  function handleReset(): void {
    setSearchParams({}, { replace: true });
    setFilterResetKey((current) => current + 1);
  }

  function handlePageChange(page: number): void {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (page <= 1) next.delete('page');
      else next.set('page', String(page));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(): Promise<void> {
    if (!deletingStall) return;
    try {
      await deleteStall(deletingStall.id);
      showToast({ type: 'success', message: `Warung "${deletingStall.name}" berhasil dihapus.` });
      reload();
    } catch (caught) {
      showToast({ type: 'error', message: getErrorMessage(caught, 'Gagal menghapus warung.') });
    }
  }

  const from = meta && stalls.length > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
  const to = meta && stalls.length > 0 ? from + stalls.length - 1 : 0;
  const pageOutOfRange = !isLoading && !error && stalls.length === 0 && meta !== null && meta.total > 0;

  return (
    <>
      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-[28px] font-bold leading-tight text-text sm:text-[32px]">Cari warung kantin favoritmu</h1>
          <p className="mt-1 text-text-muted" aria-live="polite">
            {isLoading
              ? 'Memuat daftar warung...'
              : meta && meta.total > 0
                ? `Menampilkan ${from}-${to} dari ${meta.total} warung`
                : 'Tidak ada warung yang cocok'}
          </p>
        </div>

        {canCreateStall(user) ? (
          <Link to="/stalls/new" className={`${btnPrimary} w-full shrink-0 sm:w-auto`}>
            <Plus className="size-4" aria-hidden="true" />
            Tambah warung
          </Link>
        ) : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <StallFilters
          key={filterResetKey}
          query={query}
          hasFilters={filtersActive}
          onChange={handleFilterChange}
          onReset={handleReset}
        />

        <section aria-label="Daftar warung">
          {isLoading ? (
            <StallSkeletonGrid />
          ) : error ? (
            <StatePanel
              variant="error"
              title="Daftar warung gagal dimuat"
              message={error}
              actionLabel="Coba lagi"
              onAction={reload}
            />
          ) : pageOutOfRange ? (
            <StatePanel
              variant="empty"
              title="Halaman tidak ada"
              message="Halaman ini melebihi jumlah data yang tersedia."
              actionLabel="Ke halaman pertama"
              onAction={() => handlePageChange(1)}
            />
          ) : stalls.length === 0 ? (
            <StatePanel
              variant="empty"
              title={filtersActive ? 'Warung tidak ditemukan' : 'Belum ada warung'}
              message={
                filtersActive
                  ? 'Coba ubah kata kunci atau reset filter untuk melihat warung lainnya.'
                  : canCreateStall(user)
                    ? 'Tambahkan warung pertama agar muncul di sini.'
                    : 'Warung akan tampil di sini setelah ditambahkan oleh owner.'
              }
              actionLabel={filtersActive ? 'Reset filter' : canCreateStall(user) ? 'Tambah warung' : undefined}
              onAction={filtersActive ? handleReset : undefined}
              actionTo={!filtersActive && canCreateStall(user) ? '/stalls/new' : undefined}
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {stalls.map((stall) => (
                  <StallCard key={stall.id} stall={stall} user={user} onDelete={setDeletingStall} />
                ))}
              </div>
              {meta ? <Pagination meta={meta} onPageChange={handlePageChange} /> : null}
            </>
          )}
        </section>
      </div>

      {deletingStall ? (
        <ConfirmDialog
          title="Hapus warung?"
          message={`"${deletingStall.name}" beserta menu, ulasan, dan like-nya akan dihapus permanen dari database.`}
          confirmLabel="Hapus warung"
          onClose={() => setDeletingStall(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </>
  );
}

export default StallListPage;
