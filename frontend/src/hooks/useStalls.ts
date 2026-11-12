import { useCallback, useEffect, useRef, useState } from 'react';
import { getStalls } from '../lib/api';
import { getErrorMessage } from '../lib/format';
import type { PageMeta, Stall, StallQuery } from '../types/stall';

/** Ambil daftar warung (GET /stalls). `query` harus stabil (useMemo) supaya tidak memicu request berulang. */
export function useStalls(query: StallQuery) {
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const requestIdRef = useRef(0);

  const reload = useCallback(() => setReloadKey((current) => current + 1), []);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    let cancelled = false;

    async function load(): Promise<void> {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getStalls(query);
        if (cancelled || requestId !== requestIdRef.current) return;
        setStalls(result.rows);
        setMeta(result.meta);
      } catch (caught) {
        if (cancelled || requestId !== requestIdRef.current) return;
        setError(getErrorMessage(caught, 'Gagal memuat data warung.'));
      } finally {
        if (!cancelled && requestId === requestIdRef.current) setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [query, reloadKey]);

  return { stalls, meta, isLoading, error, reload };
}
