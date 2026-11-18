'use client';

import React, { useEffect, useRef, useState } from 'react';
import SongTextView from './SongTextView';
import { fetchAuthors, fetchSongTexts, fetchSongText } from '@/lib/api';
import { AuthorSummary, SongTextDetail, SongTextSummary } from '@/lib/types';

const PAGE_SIZE = 6;

// Song texts are grouped by author. The API is the source of truth; this component only renders.
export default function SongTexts() {
  const [authors, setAuthors] = useState<AuthorSummary[] | null>(null);
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [cards, setCards] = useState<SongTextSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [opened, setOpened] = useState<SongTextDetail | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);

  // The author that is on screen now; a late "more" response for another author is ignored.
  const authorRef = useRef<string | null>(null);
  authorRef.current = authorId;

  useEffect(() => {
    fetchAuthors()
      .then((list) => {
        setAuthors(list);
        setAuthorId((current) => current ?? list[0]?.id ?? null);
      })
      .catch(() => setListError('ஆசிரியர்களைப் பெற முடியவில்லை.'));
  }, []);

  // Changing the author starts again at the first page.
  useEffect(() => {
    if (!authorId) return;
    let active = true;
    setCards([]);
    setTotal(0);
    setPage(0);
    setOpened(null);
    setOpenError(null);
    setListError(null);
    setLoading(true);
    fetchSongTexts({ author: authorId, page: 1, limit: PAGE_SIZE })
      .then((data) => {
        if (!active) return;
        setCards(data.results);
        setTotal(data.total);
        setPage(1);
      })
      .catch(() => {
        if (active) setListError('பாடல்களைப் பெற முடியவில்லை.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [authorId]);

  function loadMore() {
    const requested = authorId;
    if (!requested) return;
    const next = page + 1;
    setLoading(true);
    fetchSongTexts({ author: requested, page: next, limit: PAGE_SIZE })
      .then((data) => {
        if (authorRef.current !== requested) return;
        setCards((current) => [...current, ...data.results]);
        setTotal(data.total);
        setPage(next);
      })
      .catch(() => {
        if (authorRef.current === requested) setListError('மேலும் பாடல்களைப் பெற முடியவில்லை.');
      })
      .finally(() => setLoading(false));
  }

  function openSong(id: string) {
    setOpenError(null);
    fetchSongText(id)
      .then(setOpened)
      .catch(() => setOpenError('இந்தப் பாடலைப் பெற முடியவில்லை. வேறு பாடலைத் தேர்ந்தெடுக்கவும்.'));
  }

  if (listError && !authors) return <p className="text-sm text-red-900">{listError}</p>;
  if (authors === null) return <p className="text-sm text-stone-700">ஏற்றப்படுகிறது…</p>;
  if (authors.length === 0) return <p className="text-sm text-stone-700">பாடல்கள் இல்லை.</p>;

  const chipClass = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition ${
      active ? 'bg-[#8B1A1A] text-amber-100 shadow-md' : 'bg-white border border-[#E3C896] text-[#8B1A1A] hover:bg-[#FBF5E9]'
    }`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap gap-2">
        {authors.map((a) => (
          <button key={a.id} type="button" onClick={() => setAuthorId(a.id)} className={chipClass(a.id === authorId)}>
            {a.name} ({a.count})
          </button>
        ))}
      </div>

      {opened ? (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => setOpened(null)}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-white border border-[#E3C896] text-[#8B1A1A] hover:bg-[#FBF5E9]"
          >
            ← பாடல்களுக்குத் திரும்பு
          </button>
          <div className="border-b-2 border-amber-400 pb-4">
            <span className="text-xs font-bold text-[#8B1A1A] uppercase tracking-widest">{opened.eyebrow}</span>
            <h2 className="text-3xl font-extrabold text-[#660000] font-serif mt-1">{opened.name}</h2>
            <p className="text-sm text-stone-700 mt-2">{opened.title}</p>
          </div>
          {/* key resets the viewer's mode and position when the song changes */}
          <SongTextView key={opened.id} text={opened.text} />
        </div>
      ) : (
        <div className="space-y-4">
          {openError && <p className="text-sm text-red-900">{openError}</p>}
          {listError && authors && <p className="text-sm text-red-900">{listError}</p>}

          <p className="text-sm text-stone-700">
            {total} பாடல்கள்
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => openSong(c.id)}
                className="text-left p-5 rounded-2xl bg-white border-2 border-[#E3C896] hover:border-amber-400 hover:shadow-md transition space-y-2"
              >
                <span className="text-xs font-bold text-[#8B1A1A] uppercase tracking-widest">{c.eyebrow}</span>
                <h3 className="text-xl font-extrabold text-[#660000] font-serif">{c.name}</h3>
                <p className="text-sm text-stone-700 line-clamp-2">{c.title}</p>
              </button>
            ))}
          </div>

          {cards.length < total && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loading}
                className="px-5 py-3 rounded-xl bg-[#8B1A1A] text-white text-sm font-bold shadow-md hover:bg-[#660000] transition disabled:opacity-50"
              >
                {loading ? 'ஏற்றப்படுகிறது…' : 'மேலும்'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
