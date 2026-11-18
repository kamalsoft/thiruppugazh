'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { parseSections } from '@/lib/parse-stanzas';

type Mode = 'read' | 'sing';
type Tempo = 'slow' | 'medium' | 'fast';

const TEMPO_MS: Record<Tempo, number> = { slow: 6000, medium: 4000, fast: 2500 };
const TEMPO_LABEL: Record<Tempo, string> = { slow: 'மெதுவாக', medium: 'நடுத்தரம்', fast: 'வேகமாக' };

export default function KandhaKavachamView({ text }: { text: string }) {
  const sections = useMemo(() => parseSections(text), [text]);
  const stanzas = useMemo(
    () => sections.flatMap((section) => section.stanzas.map((stanza) => ({ ...stanza, title: section.title }))),
    [sections],
  );

  // Sing mode walks through every line in order; `pos` indexes that flat list.
  const lines = useMemo(
    () => stanzas.flatMap((stanza, stanzaIndex) => stanza.lines.map((line) => ({ line, stanzaIndex }))),
    [stanzas],
  );
  const last = lines.length - 1;

  const [mode, setMode] = useState<Mode>('read');
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tempo, setTempo] = useState<Tempo>('medium');

  // Auto-advance: each line stays for the tempo, then the next line takes over.
  useEffect(() => {
    if (!playing) return;
    if (pos >= last) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setPos((p) => p + 1), TEMPO_MS[tempo]);
    return () => clearTimeout(id);
  }, [playing, pos, tempo, last]);

  const activeStanzaIndex = lines[pos]?.stanzaIndex ?? 0;
  const activeStanza = stanzas[activeStanzaIndex];
  const stanzaStartPos = lines.findIndex((l) => l.stanzaIndex === activeStanzaIndex);

  const buttonBase = 'px-4 py-2 rounded-full text-sm font-semibold transition';
  const buttonOn = 'bg-[#8B1A1A] text-amber-100 shadow-md';
  const buttonOff = 'bg-white border border-[#E3C896] text-[#8B1A1A] hover:bg-[#FBF5E9]';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => { setPlaying(false); setMode('read'); }} className={`${buttonBase} ${mode === 'read' ? buttonOn : buttonOff}`}>
          படிக்க (Read)
        </button>
        <button type="button" onClick={() => setMode('sing')} className={`${buttonBase} ${mode === 'sing' ? buttonOn : buttonOff}`}>
          பாட (Sing)
        </button>
      </div>

      {mode === 'read' && (
        <div className="space-y-8">
          {sections.map((section, si) => (
            <section key={si} className="space-y-4">
              {section.title && (
                <h3 className="text-lg font-bold text-[#8B1A1A] border-l-4 border-amber-400 pl-3">{section.title}</h3>
              )}
              {section.stanzas.map((stanza, sti) => (
                <article key={sti} className="relative p-5 pr-14 rounded-2xl bg-white border-2 border-[#E3C896] font-serif text-stone-900 text-lg leading-loose">
                  {stanza.no !== null && (
                    <span className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-[#F7EEDD] border border-amber-400 text-xs font-bold text-[#8B1A1A]">
                      {stanza.no}
                    </span>
                  )}
                  {stanza.lines.map((line, li) => (
                    <p key={li}>{line}</p>
                  ))}
                </article>
              ))}
            </section>
          ))}
        </div>
      )}

      {mode === 'sing' && lines.length > 0 && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-sm text-stone-700">
            <span>
              பாடல் {activeStanza?.no ?? '—'} · {activeStanzaIndex + 1} / {stanzas.length}
            </span>
            {activeStanza?.title && <span className="text-[#8B1A1A] font-semibold">· {activeStanza.title}</span>}
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-[#FBF5E9] border-2 border-[#E3C896] font-serif text-stone-900 text-2xl sm:text-3xl leading-loose text-center min-h-[14rem] flex flex-col justify-center">
            {activeStanza?.lines.map((line, li) => {
              const globalIndex = stanzaStartPos + li;
              const active = globalIndex === pos;
              return (
                <p
                  key={li}
                  className={`px-2 rounded-lg transition ${active ? 'bg-amber-200 text-[#660000] font-bold' : 'text-stone-500'}`}
                >
                  {line}
                </p>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setPos((p) => Math.max(0, p - 1))} disabled={pos === 0} className={`${buttonBase} ${buttonOff} disabled:opacity-40`}>
              ◀ முந்தைய
            </button>
            <button type="button" onClick={() => setPlaying((p) => !p)} className={`${buttonBase} ${buttonOn}`}>
              {playing ? '⏸ நிறுத்து' : '▶ பாடு'}
            </button>
            <button type="button" onClick={() => setPos((p) => Math.min(last, p + 1))} disabled={pos >= last} className={`${buttonBase} ${buttonOff} disabled:opacity-40`}>
              அடுத்தது ▶
            </button>
            <button type="button" onClick={() => { setPlaying(false); setPos(0); }} className={`${buttonBase} ${buttonOff}`}>
              மீண்டும்
            </button>
            <label className="ml-auto flex items-center gap-2 text-sm text-stone-700">
              வேகம்
              <select
                value={tempo}
                onChange={(e) => setTempo(e.target.value as Tempo)}
                className="rounded-lg border border-[#E3C896] bg-white px-2 py-1 text-sm"
              >
                {(Object.keys(TEMPO_MS) as Tempo[]).map((t) => (
                  <option key={t} value={t}>{TEMPO_LABEL[t]}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
