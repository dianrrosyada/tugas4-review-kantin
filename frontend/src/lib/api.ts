import axios, { type AxiosResponse } from 'axios';
import { clearToken, getToken } from './auth-storage';
import type {
  ApiEnvelope,
  ApiErrorDetail,
  AuthUser,
  LoginPayload,
  LoginResult,
  PageMeta,
  RegisterPayload,
  Stall,
  StallPayload,
  StallQuery,
} from '../types/stall';

// Base URL dikelola lewat .env (VITE_API_BASE_URL) supaya mudah diganti tanpa ubah kode.
const fallbackBaseUrl = 'http://localhost:3000/api/v1';
const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
export const API_BASE_URL = (envBaseUrl || fallbackBaseUrl).replace(/\/$/, '');

/** Event yang dikirim saat backend menjawab 401 padahal token tersimpan (token kedaluwarsa/tidak valid). */
export const UNAUTHORIZED_EVENT = 'review-kantin:unauthorized';

/** Error seragam untuk semua kegagalan request (jaringan, 4xx, 5xx). status 0 = tidak ada respons. */
export class ApiError extends Error {
  readonly status: number;
  readonly details: ApiErrorDetail[];

  constructor(message: string, status: number, details: ApiErrorDetail[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isErrorDetail(value: unknown): value is ApiErrorDetail {
  return isRecord(value) && typeof value.field === 'string' && typeof value.message === 'string';
}

/** Ubah error Axios menjadi ApiError, memakai format error backend: { status, message, errors? }. */
function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    if (error.response) {
      const body: unknown = error.response.data;
      const failure = isRecord(body) ? body : {};
      const message =
        typeof failure.message === 'string'
          ? failure.message
          : `Permintaan gagal dengan status ${error.response.status}`;
      const details = Array.isArray(failure.errors) ? failure.errors.filter(isErrorDetail) : [];
      return new ApiError(message, error.response.status, details);
    }

    if (error.code === 'ECONNABORTED') {
      return new ApiError('Server terlalu lama merespons. Coba lagi sebentar lagi.', 0);
    }

    return new ApiError('Tidak dapat terhubung ke server. Pastikan backend berjalan.', 0);
  }

  return new ApiError(error instanceof Error ? error.message : 'Terjadi kesalahan tak terduga.', 0);
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { Accept: 'application/json' },
});

// Request: sisipkan JWT (Authorization: Bearer <token>) otomatis di setiap request.
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

// Response: seragamkan error; kalau 401 padahal token ada, bersihkan sesi dan beri tahu aplikasi.
http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error);
    const isLoginRequest = axios.isAxiosError(error) && error.config?.url?.includes('/auth/login');

    if (apiError.status === 401 && getToken() && !isLoginRequest) {
      clearToken();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    return Promise.reject(apiError);
  },
);

async function unwrap<T>(request: Promise<AxiosResponse<ApiEnvelope<T>>>): Promise<ApiEnvelope<T>> {
  const response = await request;
  const body: unknown = response.data;

  if (!isRecord(body) || !('data' in body)) {
    throw new ApiError('Respons server tidak memiliki format yang valid.', response.status);
  }

  return body as unknown as ApiEnvelope<T>;
}

// ------------------------------------------------------------------ STALLS

export interface StallList {
  rows: Stall[];
  meta: PageMeta;
}

/** GET /stalls — query parameter: search, category, location, min_rating, sort_by, order, page, limit. */
export async function getStalls(query: StallQuery): Promise<StallList> {
  const envelope = await unwrap<Stall[]>(http.get('/stalls', { params: query }));
  const rows = envelope.data;
  const meta = envelope.meta ?? {
    page: query.page,
    limit: query.limit,
    total: rows.length,
    total_pages: 1,
  };
  return { rows, meta };
}

/** GET /stalls/:id — path parameter. */
export async function getStallById(id: number): Promise<Stall> {
  return (await unwrap<Stall>(http.get(`/stalls/${id}`))).data;
}

/** POST /stalls — owner & admin. */
export async function createStall(payload: StallPayload): Promise<Stall> {
  return (await unwrap<Stall>(http.post('/stalls', payload))).data;
}

/** PUT /stalls/:id — owner (hanya miliknya) & admin. */
export async function updateStall(id: number, payload: StallPayload): Promise<Stall> {
  return (await unwrap<Stall>(http.put(`/stalls/${id}`, payload))).data;
}

/** DELETE /stalls/:id — admin saja. */
export async function deleteStall(id: number): Promise<void> {
  await unwrap<null>(http.delete(`/stalls/${id}`));
}

// -------------------------------------------------------------------- AUTH

/** POST /auth/register — pendaftaran mandiri selalu berperan customer. */
export async function registerUser(payload: RegisterPayload): Promise<AuthUser> {
  return (await unwrap<{ user: AuthUser }>(http.post('/auth/register', payload))).data.user;
}

/** POST /auth/login — mengembalikan token JWT dan data user. */
export async function loginUser(payload: LoginPayload): Promise<LoginResult> {
  return (await unwrap<LoginResult>(http.post('/auth/login', payload))).data;
}

/** GET /auth/me — memeriksa token dan mengambil identitas user yang sedang login. */
export async function getMe(): Promise<AuthUser> {
  return (await unwrap<AuthUser>(http.get('/auth/me'))).data;
}
