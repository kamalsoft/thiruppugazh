'use client';

import React, { useEffect, useRef, useState } from 'react';
import { SongDetail } from '@/lib/types';
import { fetchSongDetail } from '@/lib/api';

interface Props {
  songNumber: number | null;
  // Song numbers of the list on screen, so the reader can move to the previous or next song.
  songNumbers: number[];
  onNavigate: (songNumber: number) => void;
  onClose: () => void;
  isSaved: boolean;
  onToggleSaved: () => void;
}

const FONT_SIZES = [16, 18, 20, 22, 26];
const READER_FONT_SIZES = [22, 26, 30, 34, 38];
const FONT_KEY = 'lyrics-font-index';

// Sing-along speeds, in lines per minute.
const SPEEDS = [
  { label: 'மெதுவாக', linesPerMinute: 8 },
  { label: 'நடுத்தரம்', linesPerMinute: 14 },
  { label: 'வேகமாக', linesPerMinute: 22 },
];

const readFontIndex = (): number => {
  try {
    const raw = localStorage.getItem(FONT_KEY);
    const stored = Number(raw);
    return raw !== null && Number.isInteger(stored) && stored >= 0 && stored < FONT_SIZES.length ? stored : 1;
  } catch {
    return 1;
  }
};

const startsWithTamil = (line: string): boolean => "஀" <= line.charAt(0) && line.charAt(0) <= "௿";

// Simple reading: drop notation headers and turn the meter pauses ("......") into a dash.
const simplify = (line: string): string =>
  line
    .replace(/\.{3,}/g, '—')
    .replace(/\s*—\s*/g, ' — ')
    .replace(/\s{2,}/g, ' ')
    .trim();

export default function SongModal({
  songNumber,
  songNumbers,
  onNavigate,
  onClose,
  isSaved,
  onToggleSaved,
}: Props) {
  const [song, setSong] = useState<SongDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [readerMode, setReaderMode] = useState(false);
  const [simpleReading, setSimpleReading] = useState(false);
  const [singMode, setSingMode] = useState(false);
  const [activeLine, setActiveLine] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1);
  const [fontIndex, setFontIndex] = useState(1);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  const position = songNumber === null ? -1 : songNumbers.indexOf(songNumber);
  const previous = position > 0 ? songNumbers[position - 1] : null;
  const next = position >= 0 && position < songNumbers.length - 1 ? songNumbers[position + 1] : null;

  useEffect(() => {
    setFontIndex(readFontIndex());
  }, []);

  const changeFont = (delta: number) => {
    setFontIndex((current) => {
      const nextIndex = Math.min(FONT_SIZES.length - 1, Math.max(0, current + delta));
      try {
        localStorage.setItem(FONT_KEY, String(nextIndex));
      } catch {
        // Storage blocked: the size still changes for this visit.
      }
      return nextIndex;
    });
  };

  // Keyboard: Escape closes, arrows move between songs, Tab stays inside the panel.
  useEffect(() => {
    if (songNumber === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && previous !== null) {
        onNavigate(previous);
      } else if (e.key === 'ArrowRight' && next !== null) {
        onNavigate(next);
      } else if (e.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [songNumber, previous, next, onClose, onNavigate]);

  // Open: lock page scroll and focus the panel. Close: give focus back to the card.
  useEffect(() => {
    if (songNumber === null) return;
    const returnFocusTo = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      returnFocusTo?.focus?.();
    };
  }, [songNumber === null]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (songNumber === null || !Number.isFinite(songNumber)) {
      setSong(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadSong = async () => {
      setLoading(true);
      setError(null);
      setSong(null);
      setActiveLine(0);
      setPlaying(false);

      try {
        const data = await fetchSongDetail(songNumber);
        if (!cancelled) setSong(data);
      } catch (err) {
        console.error('Failed to load song detail', err);
        if (!cancelled) setError('பாடலை ஏற்ற முடியவில்லை.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSong();

    return () => {
      cancelled = true;
    };
  }, [songNumber, retryKey]);

  const lyricsValue: unknown = song?.lyrics;
  const rawLines: string[] = Array.isArray(lyricsValue)
    ? lyricsValue
    : typeof lyricsValue === 'string'
      ? lyricsValue.split('\n').filter(Boolean)
      : [];

  // Simple reading keeps only sung lines; the classic view shows everything, as written.
  const lines = simpleReading
    ? rawLines.filter((line) => startsWithTamil(line.trim())).map(simplify)
    : rawLines;

  // Sing-along: advance one line per beat while playing, and stop at the last line.
  useEffect(() => {
    if (!playing || !singMode) return;
    const timer = setInterval(() => {
      setActiveLine((current) => {
        if (current >= lines.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 60000 / SPEEDS[speedIndex].linesPerMinute);
    return () => clearInterval(timer);
  }, [playing, singMode, speedIndex, lines.length]);

  // Keep the highlighted line in view inside the scrolling lyrics area.
  useEffect(() => {
    if (singMode) activeRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [activeLine, singMode]);

  if (songNumber === null) return null;

  const navButton =
    'h-11 px-4 rounded-xl border-2 border-amber-400 bg-white text-base font-bold text-[#660000] hover:bg-amber-50 disabled:opacity-40 disabled:hover:bg-white transition';
  // A selected toggle needs its own full class set; mixing it with navButton leaves white text on white.
  const toggleButton = (on: boolean) =>
    on
      ? 'h-11 px-4 rounded-xl border-2 border-[#8B1A1A] bg-[#8B1A1A] text-base font-bold text-white hover:bg-[#701212] transition'
      : navButton;

  const lyricsSize = readerMode ? READER_FONT_SIZES[fontIndex] : FONT_SIZES[fontIndex];

  return (
    <div
      className={`fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center ${
        readerMode ? '' : 'p-0 sm:p-4'
      }`}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="song-title"
        tabIndex={-1}
        className={`bg-[#FFFDF7] flex flex-col overflow-hidden shadow-2xl w-full h-full ${
          readerMode
            ? 'bg-[#FFFBF0]'
            : 'sm:rounded-3xl sm:border-2 sm:border-[#D4AF37] sm:h-[88vh] sm:w-[80vw] lg:w-[72vw] xl:w-[64vw] 2xl:w-[56vw] 2xl:max-w-6xl'
        }`}
      >
        <div
          className={`text-amber-100 flex-none flex justify-between items-start ${
            readerMode
              ? 'bg-[#8B1A1A] p-3 sm:p-4'
              : 'bg-gradient-to-r from-[#8B1A1A] via-[#990000] to-[#B33B00] p-5 sm:p-6'
          }`}
        >
          <div className="min-w-0">
            {!readerMode && (
              <span className="bg-[#D4AF37] text-red-950 font-extrabold text-sm px-2.5 py-1 rounded-md">
                🛕 {song?.category_or_place || 'பாடல்'}
              </span>
            )}
            <h2
              id="song-title"
              className={`font-bold font-serif text-amber-200 truncate ${readerMode ? 'text-xl' : 'text-2xl mt-2'}`}
            >
              {song?.title || `பாடல் ${songNumber}`}
            </h2>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="மூடுக"
            className="text-amber-200 hover:text-white text-3xl font-bold p-2 transition shrink-0"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12 text-lg text-stone-600 font-semibold">
            பாடல் ஏற்றப்படுகிறது...
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
            <p className="text-lg text-red-700 font-semibold">{error}</p>
            <button
              type="button"
              onClick={() => setRetryKey((k) => k + 1)}
              className="px-6 py-3 rounded-xl bg-[#8B1A1A] text-white text-base font-bold hover:bg-[#660000] transition"
            >
              மீண்டும் முயற்சி
            </button>
          </div>
        ) : song ? (
          <>
            {!readerMode && !singMode && (
              <div className="flex-none p-4 sm:p-5 pb-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 bg-[#F7EEDD] p-3 rounded-xl text-base text-stone-800 border border-amber-300/60 font-semibold">
                  <div>
                    <span className="text-[#8B1A1A]">ராகம்:</span> {song.raga || 'பொது'}
                  </div>
                  <div>
                    <span className="text-[#8B1A1A]">தாளம்:</span> {song.thala || 'பொது'}
                  </div>
                  <div>
                    <span className="text-[#8B1A1A]">எண்:</span> {song.song_number}
                  </div>
                </div>
              </div>
            )}

            <div className="flex-none flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 pt-3">
              <div className="flex items-center gap-2" role="group" aria-label="எழுத்து அளவு">
                <span className="text-base font-bold text-stone-700">எழுத்து:</span>
                <button
                  type="button"
                  onClick={() => changeFont(-1)}
                  disabled={fontIndex === 0}
                  aria-label="எழுத்தை சிறிதாக்கு"
                  className={navButton}
                >
                  A−
                </button>
                <button
                  type="button"
                  onClick={() => changeFont(1)}
                  disabled={fontIndex === FONT_SIZES.length - 1}
                  aria-label="எழுத்தை பெரிதாக்கு"
                  className={navButton}
                >
                  A+
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSimpleReading((v) => !v)}
                  aria-pressed={simpleReading}
                  className={toggleButton(simpleReading)}
                >
                  {simpleReading ? '✓ எளிய வாசிப்பு' : 'எளிய வாசிப்பு'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSingMode((v) => !v);
                    setPlaying(false);
                  }}
                  aria-pressed={singMode}
                  className={toggleButton(singMode)}
                >
                  🎤 பாடுக
                </button>
                <button
                  type="button"
                  onClick={() => setReaderMode((v) => !v)}
                  aria-pressed={readerMode}
                  className={toggleButton(readerMode)}
                >
                  📖 வாசிப்பு முறை
                </button>
              </div>
            </div>

            {singMode && lines.length > 0 && (
              <div className="flex-none flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPlaying((v) => !v)}
                    className="h-11 px-5 rounded-xl bg-[#8B1A1A] text-white text-base font-bold hover:bg-[#701212] transition"
                  >
                    {playing ? '⏸ நிறுத்து' : '▶ தொடங்கு'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLine((i) => Math.max(0, i - 1))}
                    disabled={activeLine === 0}
                    className={navButton}
                  >
                    ↑ முந்தைய வரி
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLine((i) => Math.min(lines.length - 1, i + 1))}
                    disabled={activeLine >= lines.length - 1}
                    className={navButton}
                  >
                    அடுத்த வரி ↓
                  </button>
                </div>
                <div className="flex items-center gap-2" role="group" aria-label="பாடும் வேகம்">
                  <span className="text-base font-bold text-stone-700">வேகம்:</span>
                  {SPEEDS.map((speed, i) => (
                    <button
                      key={speed.label}
                      type="button"
                      onClick={() => setSpeedIndex(i)}
                      aria-pressed={speedIndex === i}
                      className={toggleButton(speedIndex === i)}
                    >
                      {speed.label}
                    </button>
                  ))}
                  <span className="text-base text-stone-600">
                    வரி {activeLine + 1} / {lines.length}
                  </span>
                </div>
              </div>
            )}

            {/* Only this area scrolls; the header, details and buttons stay in place. */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-4 space-y-5">
              {singMode ? (
                <div className="space-y-2 text-center text-[#3B0000] font-serif leading-loose" style={{ fontSize: lyricsSize }}>
                  {lines.map((line, idx) => {
                    const isActive = idx === activeLine;
                    return (
                      <button
                        key={idx}
                        type="button"
                        ref={isActive ? activeRef : undefined}
                        onClick={() => setActiveLine(idx)}
                        aria-current={isActive ? 'true' : undefined}
                        className={`block w-full rounded-xl px-3 py-2 transition ${
                          isActive
                            ? 'bg-amber-200 text-[#5C0000] font-bold scale-105'
                            : 'text-[#5C0000]/70 hover:text-[#3B0000]'
                        }`}
                      >
                        {line}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="space-y-1 text-center text-[#3B0000] font-serif leading-loose"
                  style={{ fontSize: lyricsSize }}
                >
                  {lines.length > 0 ? (
                    lines.map((line, idx) => (
                      <p key={idx} className="hover:bg-amber-100/50 p-1 rounded transition">
                        {line}
                      </p>
                    ))
                  ) : (
                    <p className="text-stone-500 text-base">வரிகள் கிடைக்கவில்லை.</p>
                  )}
                </div>
              )}
            </div>
          </>
        ) : null}

        <div className="flex-none p-3 sm:p-4 border-t border-amber-200 bg-[#F7EEDD] flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button type="button" onClick={() => previous !== null && onNavigate(previous)} disabled={previous === null} className={navButton}>
              ← முந்தைய
            </button>
            <button type="button" onClick={() => next !== null && onNavigate(next)} disabled={next === null} className={navButton}>
              அடுத்த →
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onToggleSaved}
              className="h-11 px-4 border-2 border-[#8B1A1A] text-[#8B1A1A] text-base font-bold rounded-xl hover:bg-red-50 transition"
            >
              {isSaved ? '✓ சேமிக்கப்பட்டது' : '☆ சேமிக்க'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 bg-[#8B1A1A] text-amber-100 text-base font-bold rounded-xl hover:bg-[#701212] transition"
            >
              மூடுக
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
