import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getMe, loginUser, registerUser, UNAUTHORIZED_EVENT } from '../lib/api';
import { clearToken, getToken, setToken } from '../lib/auth-storage';
import { useToast } from '../hooks/useToast';
import type { AuthUser, LoginPayload, RegisterPayload } from '../types/stall';
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);
  // Kalau ada token tersimpan, status awal "loading" sampai GET /auth/me menjawab.
  const [status, setStatus] = useState<AuthStatus>(() => (getToken() ? 'loading' : 'guest'));

  // Pulihkan sesi saat aplikasi dibuka: validasi token lewat GET /auth/me.
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;

    getMe()
      .then((me) => {
        if (cancelled) return;
        setUser(me);
        setStatus('authenticated');
      })
      .catch(() => {
        if (cancelled) return;
        clearToken();
        setUser(null);
        setStatus('guest');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Backend menjawab 401 (token kedaluwarsa/tidak valid): keluar dari sesi dan beri tahu pengguna.
  useEffect(() => {
    function handleUnauthorized(): void {
      setUser(null);
      setStatus('guest');
      showToast({ type: 'error', message: 'Sesi berakhir atau tidak valid. Silakan masuk lagi.' });
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [showToast]);

  const login = useCallback(async (payload: LoginPayload): Promise<AuthUser> => {
    const result = await loginUser(payload);
    setToken(result.token);
    setUser(result.user);
    setStatus('authenticated');
    return result.user;
  }, []);

  const register = useCallback(
    async (payload: RegisterPayload): Promise<AuthUser> => {
      await registerUser(payload);
      // Backend hanya membuat akun; langsung login agar pengguna tidak mengetik ulang.
      return login({ email: payload.email, password: payload.password });
    },
    [login],
  );

  // JWT bersifat stateless: logout = menghapus token di sisi client (backend tidak punya endpoint logout).
  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setStatus('guest');
    showToast({ type: 'success', message: 'Kamu sudah keluar.' });
  }, [showToast]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
