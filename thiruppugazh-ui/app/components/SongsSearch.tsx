'use client';

import React, { useState } from 'react';
import { SongSummary, PlaceMapping } from '@/lib/types';

interface Props {
  songs: SongSummary[];
  places: PlaceMapping[];
  ragas: string[];
  thalas: string[];
  totalSongs: number;
  page: number;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  filters: {
    q: string;
    place: string;
    raga: string;
    thala: string;
  };
  onFilterChange: (key: keyof Props['filters'], value: string) => void;
  onPageChange: (p: number) => void;
  onSelectSong: (num: number) => void;
  saved: number[];
  sort: string;
  order: 'asc' | 'desc';
  onSortChange: (sort: string, order: 'asc' | 'desc') => void;
}

const extractNumberFromText = (value: unknown): number | null => {
  if (typeof value !== 'string') return null;
  const m = value.match(/(\d+)/);
  return m ? Number(m[1]) : null;
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const direct = Number(trimmed);
    if (Number.isFinite(direct)) return direct;
    return extractNumberFromText(trimmed);
  }
  return null;
};

const resolveSongNumber = (song: SongSummary): number | null => {
  const s = song as SongSummary & {
    song_number?: unknown;
    songNumber?: unknown;
    number?: unknown;
    id?: unknown;
    file_path?: unknown;
    title?: unknown;
  };

  const direct =
    toNumber(s.song_number) ??
    toNumber(s.songNumber) ??
    toNumber(s.number) ??
    toNumber(s.id);

  if (direct !== null) return direct;

  if (typeof s.file_path === 'string') {
    const m = s.file_path.match(/song[_-](\d+)\.json/i);
    if (m) return Number(m[1]);
  }

  return extractNumberFromText(s.title);
};

// Hide junk values such as "....", and tidy spacing, before showing a card detail.
const detail = (value?: string): string => {
  const text = (value ?? '').split(/\s+/).join(' ').trim();
  return /[a-zA-Z஀-௿]/.test(text) && !text.includes('தாளம்') ? text : '';
};

const GRID_COLS = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
};

const placeIcon = (place?: string): string => (place === 'பொது' ? '🙏' : '🛕');

const toggleClass = (on: boolean): string =>
  `min-w-[44px] h-11 px-3 rounded-xl border-2 flex items-center justify-center text-base font-bold transition ${
    on ? 'bg-[#8B1A1A] border-[#8B1A1A] text-white' : 'bg-white border-[#E3C896] text-[#660000] hover:border-[#8B1A1A]'
  }`;

const ListIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01" />
  </svg>
);

const GridIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const PAGE_SIZE = 12;
const selectClass =
  'w-full px-4 py-3 rounded-xl border-2 border-amber-300 bg-white text-stone-900 text-base';

// First and last pages, plus the current page and one page either side; gaps become "…".
const pageNumbers = (page: number, totalPages: number): (number | '…')[] => {
  const shown = [1, totalPages, page - 1, page, page + 1]
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b)
    .filter((n, i, all) => all.indexOf(n) === i);
  return shown.flatMap((n, i) => (i > 0 && n - shown[i - 1] > 1 ? (['…', n] as const) : [n]));
};

const navClass =
  'h-11 px-4 rounded-xl border-2 border-amber-400 bg-white text-base font-bold text-[#660000] hover:bg-amber-50 disabled:opacity-40 disabled:hover:bg-white transition';

function Pager({
  page,
  totalPages,
  totalSongs,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalSongs: number;
  onPageChange: (p: number) => void;
}) {
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, totalSongs);

  return (
    <nav aria-label="பக்கங்கள்" className="flex flex-wrap items-center justify-center gap-2">
      <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)} className={navClass}>
        ← முந்தைய
      </button>
      {pageNumbers(page, totalPages).map((n, i) =>
        n === '…' ? (
          <span key={`gap-${i}`} className="px-1 text-lg text-stone-500" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            onClick={() => onPageChange(n)}
            aria-current={n === page ? 'page' : undefined}
            aria-label={`பக்கம் ${n}`}
            className={toggleClass(n === page)}
          >
            {n}
          </button>
        )
      )}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={navClass}
      >
        அடுத்த →
      </button>
      <span className="w-full text-center text-base text-stone-600 sm:w-auto sm:pl-3">
        {from}–{to} / {totalSongs}
      </span>
    </nav>
  );
}

export default function SongsSearch({
  songs,
  places,
  ragas,
  thalas,
  totalSongs,
  page,
  loading,
  error,
  onRetry,
  filters,
  onFilterChange,
  onPageChange,
  onSelectSong,
  saved,
  sort,
  order,
  onSortChange,
}: Props) {
  const [showMore, setShowMore] = useState(false);
  const [view, setView] = useState<'list' | 'grid'>('grid');
  const [cols, setCols] = useState<2 | 3 | 4>(2);
  const totalPages = Math.max(1, Math.ceil(totalSongs / PAGE_SIZE));

  return (
    <section className="bg-[#FFFDF7] border-2 border-[#E3C896] rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#660000] font-serif">
          பாடல்கள்
        </h2>

        <input
          type="search"
          value={filters.q}
          onChange={(e) => onFilterChange('q', e.target.value)}
          placeholder="பாடல் எண் (எ.கா. 243)"
          aria-label="பாடல் எண் அல்லது சொல்"
          className="w-40 sm:w-64 px-4 py-2.5 rounded-xl border-2 border-amber-400 bg-white text-stone-900 text-base"
        />
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          aria-expanded={showMore}
          className="shrink-0 px-4 py-2.5 rounded-xl border-2 border-[#8B1A1A] text-[#8B1A1A] font-bold text-sm hover:bg-red-50 transition"
        >
          {showMore ? 'மறைக்க' : 'வடிகட்டிகள்'}
        </button>
      </div>

      <div>

        {showMore && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <label className="space-y-2">
              <span className="block text-base font-bold text-stone-700">ஸ்தலம்</span>
              <select
                value={filters.place}
                onChange={(e) => onFilterChange('place', e.target.value)}
                className={selectClass}
              >
                <option value="">அனைத்து ஸ்தலங்கள்</option>
                {places.map((p, idx) => (
                  <option key={`${p.place}-${idx}`} value={p.place}>
                    {p.place} ({p.total_songs})
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="block text-base font-bold text-stone-700">ராகம்</span>
              <select
                value={filters.raga}
                onChange={(e) => onFilterChange('raga', e.target.value)}
                className={selectClass}
              >
                <option value="">அனைத்து ராகங்கள்</option>
                {ragas.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="block text-base font-bold text-stone-700">தாளம்</span>
              <select
                value={filters.thala}
                onChange={(e) => onFilterChange('thala', e.target.value)}
                className={selectClass}
              >
                <option value="">அனைத்து தாளங்கள்</option>
                {thalas.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>

      {saved.length > 0 && (
        <div className="space-y-2">
          <p className="text-base font-bold text-stone-700">சேமித்த பாடல்கள்</p>
          <div className="flex flex-wrap gap-2">
            {saved.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onSelectSong(n)}
                className="px-4 py-2 rounded-full bg-amber-50 border-2 border-[#E3C896] text-base font-bold text-[#660000] hover:border-[#8B1A1A] transition"
              >
                பாடல் {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-lg text-stone-600">பாடல்கள் ஏற்றப்படுகின்றன...</p>
      ) : error ? (
        <div className="py-10 text-center text-[#8B1A1A] space-y-4">
          <p className="text-lg">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="px-6 py-3 rounded-xl bg-[#8B1A1A] text-white text-base font-bold hover:bg-[#660000] transition"
          >
            மீண்டும் முயற்சி
          </button>
        </div>
      ) : songs.length === 0 ? (
        <p className="py-10 text-center text-lg text-stone-600">பாடல்கள் எதுவும் கிடைக்கவில்லை.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-base font-bold text-stone-700">{totalSongs} பாடல்கள்</p>
              <label className="flex items-center gap-2 text-base font-bold text-stone-700">
                வரிசை:
                <select
                  value={sort}
                  onChange={(e) => onSortChange(e.target.value, order)}
                  className="h-11 px-3 rounded-xl border-2 border-amber-300 bg-white text-base text-stone-900"
                >
                  <option value="number">பாடல் எண்</option>
                  <option value="place">ஸ்தலம்</option>
                  <option value="raga">ராகம்</option>
                  <option value="thala">தாளம்</option>
                </select>
              </label>
              <button
                type="button"
                onClick={() => onSortChange(sort, order === 'asc' ? 'desc' : 'asc')}
                aria-label={order === 'asc' ? 'ஏறுவரிசை (மாற்ற அழுத்தவும்)' : 'இறங்குவரிசை (மாற்ற அழுத்தவும்)'}
                className={toggleClass(false)}
              >
                {order === 'asc' ? '↑' : '↓'}
              </button>
            </div>
            <div className="flex items-center gap-2" role="group" aria-label="பார்க்கும் விதம்">
              <button
                type="button"
                onClick={() => setView('list')}
                aria-pressed={view === 'list'}
                aria-label="பட்டியல் வடிவம்"
                className={toggleClass(view === 'list')}
              >
                <ListIcon />
              </button>
              <button
                type="button"
                onClick={() => setView('grid')}
                aria-pressed={view === 'grid'}
                aria-label="கட்ட வடிவம்"
                className={toggleClass(view === 'grid')}
              >
                <GridIcon />
              </button>
              {view === 'grid' &&
                ([2, 3, 4] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCols(n)}
                    aria-pressed={cols === n}
                    aria-label={`${n} நெடுவரிசை`}
                    className={toggleClass(cols === n)}
                  >
                    {n}
                  </button>
                ))}
            </div>
          </div>

          {totalSongs > PAGE_SIZE && (
            <Pager page={page} totalPages={totalPages} totalSongs={totalSongs} onPageChange={onPageChange} />
          )}

          <ul className={view === 'list' ? 'space-y-3' : `grid gap-3 ${GRID_COLS[cols]}`}>
          {songs.map((song, idx) => {
            const songNumber = resolveSongNumber(song);

            return (
              <li key={`${songNumber ?? 'no-id'}-${idx}`}>
                <button
                  type="button"
                  disabled={songNumber === null}
                  onClick={() => {
                    if (songNumber !== null) onSelectSong(songNumber);
                  }}
                  className={`w-full min-h-[72px] text-left px-5 py-4 rounded-2xl bg-white border-2 border-[#E3C896] hover:border-[#8B1A1A] hover:bg-amber-50 transition flex gap-4 disabled:opacity-40 ${
                    view === 'grid' ? 'flex-col items-start' : 'items-center justify-between'
                  }`}
                >
                  <span className="min-w-0 space-y-1">
                    <span className="block text-xl font-bold text-[#660000]">
                      {song.title || `பாடல் ${songNumber ?? ''}`}
                    </span>
                    <span className="block text-base text-stone-700">
                      {placeIcon(song.category_or_place)} {song.category_or_place}
                    </span>
                    {detail(song.first_line) && (
                      <span className="block text-base text-[#5C0000] font-serif">{detail(song.first_line)}</span>
                    )}
                    <span className="flex flex-wrap gap-x-4 text-sm text-stone-600">
                      {detail(song.raga) && <span>ராகம்: <strong>{detail(song.raga)}</strong></span>}
                      {detail(song.thala) && <span>தாளம்: <strong>{detail(song.thala)}</strong></span>}
                    </span>
                  </span>
                  <span className="text-base font-bold text-[#8B1A1A] whitespace-nowrap">படிக்க →</span>
                </button>
              </li>
            );
          })}
          </ul>
        </>
      )}

      {totalSongs > PAGE_SIZE && (
        <Pager page={page} totalPages={totalPages} totalSongs={totalSongs} onPageChange={onPageChange} />
      )}
    </section>
  );
}
