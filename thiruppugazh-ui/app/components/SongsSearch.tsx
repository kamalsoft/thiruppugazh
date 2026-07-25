'use client';

import React from 'react';
import { SongSummary, PlaceMapping } from '@/lib/types';

interface Props {
  songs: SongSummary[];
  places: PlaceMapping[];
  totalSongs: number;
  page: number;
  loading: boolean;
  filters: {
    q: string;
    place: string;
    raga: string;
    thala: string;
    chandam: string;
    category: string;
    language: string;
    composer: string;
    number: string;
  };
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onFilterChange: (key: keyof Props['filters'], value: string) => void;
  onPageChange: (p: number) => void;
  onSelectSong: (num: number) => void;
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

export default function SongsSearch({
  songs,
  places,
  totalSongs,
  page,
  loading,
  filters,
  collapsed,
  onToggleCollapsed,
  onFilterChange,
  onPageChange,
  onSelectSong,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalSongs / 12));

  return (
    <section className="bg-[#FFFDF7] border-2 border-[#E3C896] rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 border-b border-amber-200 pb-3">
        <div>
          <h3 className="text-xl font-extrabold text-[#660000] font-serif">
            பாடல்கள் தேடல் கருவூலம்
          </h3>
          <p className="text-xs text-stone-600 mt-1">
            Search by place or song number
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleCollapsed}
          className="px-4 py-2 rounded-2xl bg-[#8B1A1A] text-white text-xs font-bold shadow-md hover:bg-[#660000] transition"
        >
          {collapsed ? 'Show Filters' : 'Collapse Search'}
        </button>
      </div>

      {!collapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={filters.q}
            onChange={(e) => onFilterChange('q', e.target.value)}
            placeholder="Search songs..."
            className="w-full px-4 py-3 rounded-xl border border-amber-300 bg-white text-stone-900"
          />

          <select
            value={filters.place}
            onChange={(e) => onFilterChange('place', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-amber-300 bg-white text-stone-900"
          >
            <option value="">All Sacred Places</option>
            {places.map((p, idx) => (
              <option key={`${p.place}-${idx}`} value={p.place}>
                {p.place} ({p.total_songs})
              </option>
            ))}
          </select>

          <input
            type="text"
            value={filters.number}
            onChange={(e) => onFilterChange('number', e.target.value)}
            placeholder="Song number"
            className="w-full px-4 py-3 rounded-xl border border-amber-300 bg-white text-stone-900"
          />
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-stone-600">Loading songs...</div>
      ) : songs.length === 0 ? (
        <div className="py-10 text-center text-stone-600">No songs found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.map((song, idx) => {
            const songNumber = resolveSongNumber(song);

            return (
              <div
                key={`${songNumber ?? 'no-id'}-${song.title ?? 'untitled'}-${idx}`}
                className="bg-white border-2 border-[#E3C896] rounded-2xl p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="text-sm font-bold text-[#660000]">{song.title}</div>
                      <div className="text-[11px] text-stone-500">
                        Song #{songNumber ?? 'N/A'}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-900 bg-[#FCE8C3] px-2 py-0.5 rounded border border-amber-300">
                      {song.category_or_place}
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-stone-600">
                    ராகம்: <strong>{song.raga || 'பொது'}</strong> · தாளம்:{' '}
                    <strong>{song.thala || 'பொது'}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={songNumber === null}
                  onClick={() => {
                    if (songNumber !== null) onSelectSong(songNumber);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#8B1A1A] text-white text-sm font-bold hover:bg-[#660000] transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  View Song
                </button>
              </div>
            );
          })}
        </div>
      )}

      {totalSongs > 12 && (
        <div className="flex items-center justify-center gap-4 pt-3 border-t border-amber-200">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            className="px-4 py-2 rounded-xl border border-amber-300 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs font-bold text-stone-700">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-4 py-2 rounded-xl border border-amber-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}