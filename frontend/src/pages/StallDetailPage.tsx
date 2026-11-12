import { ArrowLeft, MapPin, Pencil, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import StatePanel from '../components/StatePanel';
import { useAuth } from '../hooks/useAuth';
import { useStall } from '../hooks/useStall';
import { useToast } from '../hooks/useToast';
import { deleteStall } from '../lib/api';
import { formatDate, formatRating, getErrorMessage } from '../lib/format';
import { canDeleteStall, canEditStall } from '../lib/permissions';
import { btnDanger, btnSecondary, cardClass } from '../lib/ui';

function StallDetailPage() {
  const { id } = useParams();
  const stallId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { stall, isLoading, error, reload } = useStall(stallId);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(): Promise<void> {
    if (!stall) return;
    try {
      await deleteStall(stall.id);
      showToast({ type: 'success', message: `Warung "${stall.name}" berhasil dihapus.` });
      navigate('/', { replace: true });
    } catch (caught) {
      showToast({ type: 'error', message: getErrorMessage(caught, 'Gagal menghapus warung.') });
    }
  }

  const backLink = (
    <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary">
      <ArrowLeft className="size-4" aria-hidden="true" />
      Kembali ke daftar warung
    </Link>
  );

  if (isLoading) {
    return (
      <>
        {backLink}
        <div className="h-72 animate-pulse rounded-card border border-border bg-surface" role="status" aria-busy="true" aria-label="Memuat detail warung" />
      </>
    );
  }

  if (error || !stall) {
    const notFound = error?.status === 404 || error?.status === 400;
    return (
      <>
        {backLink}
        <StatePanel
          variant={notFound ? 'empty' : 'error'}
          title={notFound ? 'Warung tidak ditemukan' : 'Detail warung gagal dimuat'}
          message={notFound ? 'Warung dengan ID tersebut tidak ada atau sudah dihapus.' : error?.message}
          actionLabel={notFound ? 'Lihat semua warung' : 'Coba lagi'}
          actionTo={notFound ? '/' : undefined}
          onAction={notFound ? undefined : reload}
        />
      </>
    );
  }

  const canEdit = canEditStall(user, stall);
  const canDelete = canDeleteStall(user);
  const isOwnerRole = user?.role === 'owner';

  return (
    <>
      {backLink}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className={`${cardClass} overflow-hidden`}>
          <div className="flex flex-wrap items-end justify-between gap-4 bg-primary px-6 pb-6 pt-10 text-white">
            <div>
              {stall.category ? (
                <span className="rounded-full bg-surface px-3 py-0.5 text-xs font-semibold text-primary">{stall.category}</span>
              ) : null}
              <h1 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">{stall.name}</h1>
            </div>
            <p className="font-heading text-4xl font-bold">{stall.review_count > 0 ? formatRating(stall.avg_rating) : '-'}</p>
          </div>

          <div className="p-6">
            <p className="inline-flex items-center gap-1.5 text-base font-semibold text-warning">
              <Star className="size-5 fill-current" aria-hidden="true" />
              {stall.review_count > 0 ? `${stall.review_count} ulasan` : 'Belum ada ulasan'}
            </p>

            <h2 className="mt-6 font-heading text-lg font-bold">Tentang warung</h2>
            <p className="mt-1 text-text-muted">{stall.description ?? 'Belum ada deskripsi.'}</p>

            <dl className="mt-6 grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-text-muted">Lokasi</dt>
                <dd className="mt-0.5 inline-flex items-center gap-1.5 font-semibold">
                  <MapPin className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
                  {stall.location ?? '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Pemilik</dt>
                <dd className="mt-0.5 font-semibold">{user && stall.owner_id === user.id ? 'Kamu' : `Owner #${stall.owner_id}`}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Terdaftar sejak</dt>
                <dd className="mt-0.5 font-semibold">{formatDate(stall.created_at)}</dd>
              </div>
            </dl>
          </div>
        </article>

        {user && user.role !== 'customer' ? (
          <aside className={`${cardClass} self-start p-5`} aria-label="Kelola warung">
            <h2 className="font-heading text-lg font-bold">Kelola warung</h2>

            {canEdit ? (
              <Link to={`/stalls/${stall.id}/edit`} className={`${btnSecondary} mt-4 w-full`}>
                <Pencil className="size-4" aria-hidden="true" />
                Ubah warung
              </Link>
            ) : (
              <p className="mt-3 text-sm text-text-muted">Warung ini milik owner lain, jadi kamu hanya bisa melihatnya.</p>
            )}

            {canDelete ? (
              <button type="button" onClick={() => setIsDeleting(true)} className={`${btnDanger} mt-3 w-full`}>
                <Trash2 className="size-4" aria-hidden="true" />
                Hapus warung
              </button>
            ) : isOwnerRole ? (
              <p className="mt-4 text-xs text-text-muted">Menghapus warung hanya bisa dilakukan oleh admin.</p>
            ) : null}
          </aside>
        ) : null}
      </div>

      {isDeleting ? (
        <ConfirmDialog
          title="Hapus warung?"
          message={`"${stall.name}" beserta menu, ulasan, dan like-nya akan dihapus permanen dari database.`}
          confirmLabel="Hapus warung"
          onClose={() => setIsDeleting(false)}
          onConfirm={handleDelete}
        />
      ) : null}
    </>
  );
}

export default StallDetailPage;
