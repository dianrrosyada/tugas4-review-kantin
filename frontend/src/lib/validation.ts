import type { ApiErrorDetail, LoginPayload, RegisterPayload, StallPayload } from '../types/stall';

// Aturan di bawah disamakan dengan skema zod di backend (src/dtos/*.dto.ts)
// supaya kesalahan umum tertangkap sebelum request dikirim.

export interface StallFormValues {
  name: string;
  category: string;
  location: string;
  description: string;
}

export type FormErrors<K extends string> = Partial<Record<K, string>>;
export type StallFormErrors = FormErrors<keyof StallFormValues>;

export const STALL_LIMITS = { name: [3, 100], category: 50, location: 100, description: 1000 } as const;

export function validateStallForm(values: StallFormValues): StallFormErrors {
  const errors: StallFormErrors = {};
  const name = values.name.trim();

  if (!name) {
    errors.name = 'Nama warung wajib diisi.';
  } else if (name.length < STALL_LIMITS.name[0]) {
    errors.name = `Nama warung minimal ${STALL_LIMITS.name[0]} karakter.`;
  } else if (name.length > STALL_LIMITS.name[1]) {
    errors.name = `Nama warung maksimal ${STALL_LIMITS.name[1]} karakter.`;
  }

  if (values.category.trim().length > STALL_LIMITS.category) {
    errors.category = `Kategori maksimal ${STALL_LIMITS.category} karakter.`;
  }
  if (values.location.trim().length > STALL_LIMITS.location) {
    errors.location = `Lokasi maksimal ${STALL_LIMITS.location} karakter.`;
  }
  if (values.description.trim().length > STALL_LIMITS.description) {
    errors.description = `Deskripsi maksimal ${STALL_LIMITS.description} karakter.`;
  }

  return errors;
}

/** Field kosong dikirim sebagai null supaya database tidak berisi string kosong. */
export function toStallPayload(values: StallFormValues): StallPayload {
  const orNull = (value: string): string | null => value.trim() || null;
  return {
    name: values.name.trim(),
    category: orNull(values.category),
    location: orNull(values.location),
    description: orNull(values.description),
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LoginErrors = FormErrors<keyof LoginPayload>;
export type RegisterErrors = FormErrors<keyof RegisterPayload>;

export function validateLogin(values: LoginPayload): LoginErrors {
  const errors: LoginErrors = {};
  if (!values.email.trim()) errors.email = 'Email wajib diisi.';
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Format email tidak valid.';
  if (!values.password) errors.password = 'Password wajib diisi.';
  return errors;
}

export function validateRegister(values: RegisterPayload): RegisterErrors {
  const errors: RegisterErrors = {};
  const name = values.name.trim();

  if (!name) errors.name = 'Nama wajib diisi.';
  else if (name.length < 3) errors.name = 'Nama minimal 3 karakter.';
  else if (name.length > 100) errors.name = 'Nama maksimal 100 karakter.';

  if (!values.email.trim()) errors.email = 'Email wajib diisi.';
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Format email tidak valid.';
  else if (values.email.trim().length > 150) errors.email = 'Email maksimal 150 karakter.';

  if (!values.password) errors.password = 'Password wajib diisi.';
  else if (values.password.length < 8) errors.password = 'Password minimal 8 karakter.';
  else if (values.password.length > 72) errors.password = 'Password maksimal 72 karakter.';

  return errors;
}

/** Ambil pesan error validasi dari backend (errors[]) per field; pesan pertama yang dipakai. */
export function mapServerErrors<K extends string>(
  details: ApiErrorDetail[],
  allowed: readonly K[],
): FormErrors<K> {
  const result: FormErrors<K> = {};
  for (const detail of details) {
    const field = allowed.find((key) => key === detail.field);
    if (field && !result[field]) result[field] = detail.message;
  }
  return result;
}
