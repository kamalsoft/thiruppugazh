'use client';

import React, { useState } from 'react';
import SongTextView from './SongTextView';
import { SONG_TEXTS } from '@/app/constants/song-texts';

export default function SongTexts() {
  const [selectedId, setSelectedId] = useState(SONG_TEXTS[0]?.id);
  const song = SONG_TEXTS.find((s) => s.id === selectedId) ?? SONG_TEXTS[0];
  if (!song) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap gap-2">
        {SONG_TEXTS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedId(s.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              s.id === song.id ? 'bg-[#8B1A1A] text-amber-100 shadow-md' : 'bg-white border border-[#E3C896] text-[#8B1A1A] hover:bg-[#FBF5E9]'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="border-b-2 border-amber-400 pb-4">
        <span className="text-xs font-bold text-[#8B1A1A] uppercase tracking-widest">{song.eyebrow}</span>
        <h2 className="text-3xl font-extrabold text-[#660000] font-serif mt-1">{song.name}</h2>
        <p className="text-sm text-stone-700 mt-2">{song.title}</p>
      </div>

      {/* key resets the viewer's mode and position when the text changes */}
      <SongTextView key={song.id} text={song.text} />
    </div>
  );
}
