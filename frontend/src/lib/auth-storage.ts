const TOKEN_KEY = 'review-kantin:token';

/** Token JWT disimpan di localStorage supaya sesi bertahan setelah refresh halaman. */
export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* penyimpanan tidak tersedia: sesi hanya berlaku selama tab terbuka */
  }
}

export function clearToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* abaikan */
  }
}
