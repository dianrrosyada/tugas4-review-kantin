import { RotateCcw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CATEGORIES, SORT_OPTIONS } from '../lib/query';
import { btnSecondary, cardClass, inputClass, labelClass } from '../lib/ui';
import type { StallQuery } from '../types/stall';

export interface FilterPatch {
  search?: string;
  category?: string;
  location?: string;
  min_rating?: string;
  sort?: string;
}

interface StallFiltersProps {
  query: StallQuery;
  hasFilters: boolean;
  onChange: (patch: FilterPatch) => void;
  onReset: () => void;
}

const DEBOUNCE_MS = 400;

/** Komponen ini di-remount (lewat key) saat reset, jadi state lokal tidak perlu disinkronkan manual. */
function StallFilters({ query, hasFilters, onChange, onReset }: StallFiltersProps) {
  const [searchText, setSearchText] = useState(query.search ?? '');
  const [locationText, setLocationText] = useState(query.location ?? '');

  // Ketik dulu, request belakangan: tunggu pengguna berhenti mengetik agar tidak spam GET /stalls.
  useEffect(() => {
    const trimmed = searchText.trim();
    if (trimmed === (query.search ?? '')) return;
    const timer = window.setTimeout(() => onChange({ search: trimmed }), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchText, query.search, onChange]);

  useEffect(() => {
    const trimmed = locationText.trim();
    if (trimmed === (query.location ?? '')) return;
    const timer = window.setTimeout(() => onChange({ location: trimmed }), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [locationText, query.location, onChange]);

  return (
    <aside className={`${cardClass} p-5 lg:sticky lg:top-24 lg:self-start`} aria-label="Filter warung">

      <div>
        <label htmlFor="stall-search" className={labelClass}>
          Cari warung
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
          <input
            id="stall-search"
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Nama atau deskripsi"
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      <fieldset className="mt-4">
        <legend className={labelClass}>Kategori</legend>
        <div className="flex flex-wrap gap-2">
          {['Semua', ...CATEGORIES].map((category) => {
            const active = category === 'Semua' ? !query.category : query.category === category;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ category: category === 'Semua' ? '' : category })}
                className={`min-h-9 rounded-full border px-3 text-xs font-semibold transition ${
                  active
                    ? 'border-primary bg-primary text-white'
                    : 'border-border-strong bg-surface text-text-muted hover:border-primary hover:text-primary'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-4">
        <label htmlFor="stall-location" className={labelClass}>
          Lokasi
        </label>
        <input
          id="stall-location"
          type="text"
          value={locationText}
          onChange={(event) => setLocationText(event.target.value)}
          placeholder="Mis. Kantin FEB"
          className={inputClass}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="stall-rating" className={labelClass}>
          Rating minimal
        </label>
        <select
          id="stall-rating"
          value={query.min_rating !== undefined ? String(query.min_rating) : ''}
          onChange={(event) => onChange({ min_rating: event.target.value })}
          className={inputClass}
        >
          <option value="">Semua rating</option>
          <option value="3">3 ke atas</option>
          <option value="4">4 ke atas</option>
          <option value="4.5">4,5 ke atas</option>
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="stall-sort" className={labelClass}>
          Urutkan
        </label>
        <select
          id="stall-sort"
          value={`${query.sort_by}:${query.order}`}
          onChange={(event) => onChange({ sort: event.target.value })}
          className={inputClass}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button type="button" onClick={onReset} disabled={!hasFilters} className={`${btnSecondary} mt-5 w-full`}>
        <RotateCcw className="size-4" aria-hidden="true" />
        Reset filter
      </button>
    </aside>
  );
}

export default StallFilters;
