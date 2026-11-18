'use client';

import React, { useEffect, useState } from 'react';
import SongTextView from './SongTextView';
import { fetchSongTexts, fetchSongText } from '@/lib/api';
import { SongTextDetail, SongTextSummary } from '@/lib/types';

// The API is the source of truth for song texts. This component only renders them.
export default function SongTexts() {
  const [list, setList] = useState<SongTextSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [song, setSong] = useState<SongTextDetail | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    fetchSongTexts()
      .then((items) => {
        setList(items);
        setSelectedId((current) => current ?? items[0]?.id ?? null);
      })
      .catch(() => setListError('பாடல்களைப் பெற முடியவில்லை.'));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    setSong(null);
    setDetailError(null);
    fetchSongText(selectedId)
      .then((detail) => {
        if (active) setSong(detail);
      })
      .catch(() => {
        if (active) setDetailError('இந்தப் பாடலைப் பெற முடியவில்லை. வேறு பாடலைத் தேர்ந்தெடுக்கவும்.');
      });
    return () => {
      active = false;
    };
  }, [selectedId]);

  if (listError) return <p className="text-sm text-red-900">{listError}</p>;
  if (list === null) return <p className="text-sm text-stone-700">ஏற்றப்படுகிறது…</p>;
  if (list.length === 0) return <p className="text-sm text-stone-700">பாடல்கள் இல்லை.</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap gap-2">
        {list.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedId(s.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              s.id === selectedId ? 'bg-[#8B1A1A] text-amber-100 shadow-md' : 'bg-white border border-[#E3C896] text-[#8B1A1A] hover:bg-[#FBF5E9]'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {detailError && <p className="text-sm text-red-900">{detailError}</p>}

      {!detailError && song && (
        <>
          <div className="border-b-2 border-amber-400 pb-4">
            <span className="text-xs font-bold text-[#8B1A1A] uppercase tracking-widest">{song.eyebrow}</span>
            <h2 className="text-3xl font-extrabold text-[#660000] font-serif mt-1">{song.name}</h2>
            <p className="text-sm text-stone-700 mt-2">{song.title}</p>
          </div>

          {/* key resets the viewer's mode and position when the text changes */}
          <SongTextView key={song.id} text={song.text} />
        </>
      )}
      {!detailError && !song && <p className="text-sm text-stone-700">ஏற்றப்படுகிறது…</p>}
    </div>
  );
}
