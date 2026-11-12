export type UserRole = 'admin' | 'owner' | 'customer';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

export interface LoginResult {
  token: string;
  token_type: 'Bearer';
  expires_in: string;
  user: AuthUser;
}

/** Baris tabel STALLS persis seperti dikirim backend (snake_case). */
export interface Stall {
  id: number;
  owner_id: number;
  name: string;
  category: string | null;
  location: string | null;
  description: string | null;
  avg_rating: number;
  review_count: number;
  created_at: string;
}

/** Body POST /stalls dan PUT /stalls/:id. owner_id sengaja tidak ada: diambil dari token. */
export interface StallPayload {
  name: string;
  category: string | null;
  location: string | null;
  description: string | null;
}

export type SortBy = 'name' | 'avg_rating' | 'review_count' | 'created_at';
export type SortOrder = 'asc' | 'desc';

/** Query GET /stalls. */
export interface StallQuery {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  location?: string;
  min_rating?: number;
  sort_by: SortBy;
  order: SortOrder;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ApiEnvelope<T> {
  status: 'success';
  message?: string;
  data: T;
  meta?: PageMeta;
}

export interface ApiErrorDetail {
  field: string;
  message: string;
}
