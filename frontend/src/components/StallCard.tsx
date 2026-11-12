import { MapPin, Pencil, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatRating } from '../lib/format';
import { canDeleteStall, canEditStall } from '../lib/permissions';
import { btnPrimary, btnSecondary, btnDanger, btnSmall } from '../lib/ui';
import type { AuthUser, Stall } from '../types/stall';

interface StallCardProps {
  stall: Stall;
  user: AuthUser | null;
  onDelete: (stall: Stall) => void;
}

// Pita warna di atas kartu bergilir berdasarkan id supaya daftar tidak monoton.
const bands = [
  'bg-primary-soft text-primary',
  'bg-accent-soft text-accent',
  'bg-rose-soft text-rose',
];

export function StallCard({ stall, user, onDelete }: StallCardProps) {
  const band = bands[stall.id % bands.length];
  const initial = stall.name.trim().split(/\s+/).at(-1)?.charAt(0).toUpperCase() ?? '?';
  const isMine = user?.role === 'owner' && stall.owner_id === user.id;

  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card">
      <div className={`flex items-end justify-between px-4 pb-3 pt-6 ${band}`}>
        <span className="font-heading text-4xl font-bold leading-none" aria-hidden="true">
          {initial}
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {isMine ? <span className="rounded-full bg-text px-2.5 py-0.5 text-xs font-semibold text-white">Milikmu</span> : null}
          {stall.category ? (
            <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-text">{stall.category}</span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading text-[17px] font-bold text-text">{stall.name}</h3>
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-text-muted">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          {stall.location ?? 'Lokasi belum diisi'}
        </p>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-text-muted">{stall.description ?? 'Belum ada deskripsi.'}</p>

        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-warning">
          <Star className="size-4 fill-current" aria-hidden="true" />
          {stall.review_count > 0 ? formatRating(stall.avg_rating) : '-'}
          <span className="font-normal text-text-muted">
            {stall.review_count > 0 ? `(${stall.review_count} ulasan)` : 'Belum ada ulasan'}
          </span>
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/stalls/${stall.id}`} className={`${btnPrimary} ${btnSmall} flex-1`}>
            Lihat detail
          </Link>
          {canEditStall(user, stall) ? (
            <Link to={`/stalls/${stall.id}/edit`} className={`${btnSecondary} ${btnSmall}`} aria-label={`Ubah ${stall.name}`}>
              <Pencil className="size-3.5" aria-hidden="true" />
              Ubah
            </Link>
          ) : null}
          {canDeleteStall(user) ? (
            <button
              type="button"
              onClick={() => onDelete(stall)}
              className={`${btnDanger} ${btnSmall}`}
              aria-label={`Hapus ${stall.name}`}
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Hapus
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function StallSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-busy="true" aria-label="Memuat daftar warung">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="h-72 animate-pulse rounded-card border border-border bg-surface" />
      ))}
      <span className="sr-only">Memuat daftar warung...</span>
    </div>
  );
}
