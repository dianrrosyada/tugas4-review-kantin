import type { AuthUser, Stall } from '../types/stall';

// Aturan ini MENCERMINKAN backend (Tugas 3) hanya untuk mengatur tampilan.
// Penjaga sebenarnya tetap backend: request yang tidak berhak akan dijawab 401/403.

/** POST /stalls: owner dan admin. */
export function canCreateStall(user: AuthUser | null): boolean {
  return user?.role === 'owner' || user?.role === 'admin';
}

/** PUT /stalls/:id: admin, atau owner pemilik warung. */
export function canEditStall(user: AuthUser | null, stall: Pick<Stall, 'owner_id'>): boolean {
  if (!user) return false;
  return user.role === 'admin' || (user.role === 'owner' && stall.owner_id === user.id);
}

/** DELETE /stalls/:id: admin saja. */
export function canDeleteStall(user: AuthUser | null): boolean {
  return user?.role === 'admin';
}
