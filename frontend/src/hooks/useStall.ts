import { useCallback, useEffect, useState } from 'react';
import { ApiError, getStallById } from '../lib/api';
import type { Stall } from '../types/stall';

export interface StallLoadError {
  message: string;
  status: number;
}

/** Ambil satu warung (GET /stalls/:id). Status error disimpan agar 404 bisa dibedakan dari gagal lain. */
export function useStall(id: number) {
  const [stall, setStall] = useState<Stall | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<StallLoadError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((current) => current + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getStallById(id);
        if (!cancelled) setStall(data);
      } catch (caught) {
        if (cancelled) return;
        setStall(null);
        if (caught instanceof ApiError) {
          setError({ message: caught.message, status: caught.status });
        } else {
          setError({ message: 'Gagal memuat detail warung.', status: 0 });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  return { stall, isLoading, error, reload };
}
