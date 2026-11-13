'use client';

import React, { useEffect, useRef, useState } from 'react';
import { fetchSongs, fetchPlaces, fetchRagas, fetchThalas, fetchSongDetail } from '@/lib/api';
import { SongSummary, PlaceMapping, SongDetail } from '@/lib/types';
import Header from './components/Header';
import Sidebar, { TabType } from './components/Sidebar';
import HeroBanner from './components/HeroBanner';
import SongsSearch from './components/SongsSearch';
import PlacesDirectory from './components/PlacesDirectory';
import PlacesMap from './components/PlacesMap';
import SongModal from './components/SongModal';
import ArupadaiVeedu from './components/ArupadaiVeedu';

const FONT_SIZES = [14, 16, 18, 20, 22];
const DEFAULT_FONT_SIZE = 16;
const FEATURED_SONG_NUMBER = 1;

// Works by Arunagirinathar other than Thiruppugazh. Texts are added later; notes only where verified.
const ARUNAGIRI_WORKS = [
  { tamil: 'திருவகுப்பு', english: 'Tiruvaguppu', note: undefined },
  { tamil: 'கந்தர் அனுபூதி', english: 'Kandar Anubhuti', note: '51 பாடல்கள்; ஏறத்தாழ 1500 ஆம் ஆண்டு' },
  { tamil: 'கந்தர் அலங்காரம்', english: 'Kandar Alankaram', note: 'கந்தர் அனுபூதியின் துணைநூல்' },
  { tamil: 'கந்தர் அந்தாதி', english: 'Kandar Andadhi', note: undefined },
  { tamil: 'வேல் விருத்தம்', english: 'Vel Viruttam', note: undefined },
  { tamil: 'மயில் விருத்தம்', english: 'Mayil Viruttam', note: undefined },
  { tamil: 'செவல் விருத்தம்', english: 'Seval Viruttam', note: undefined },
  { tamil: 'திருஏழுகூற்றிருக்கை', english: 'Tiruelukutrirukkai', note: undefined },
];

// The API sends lyrics as one string; the first line is the one shown on the card.
const firstLineOf = (song: SongDetail): string => {
  const lyrics: unknown = song.lyrics;
  const lines = Array.isArray(lyrics) ? lyrics : typeof lyrics === 'string' ? lyrics.split('\n') : [];
  return lines.find((line) => /^[\u0B80-\u0BFF]/.test(line.trim()))?.trim() ?? '';
};

type Filters = {
  q: string;
  place: string;
  raga: string;
  thala: string;
  chandam: string;
};

const initialFilters: Filters = {
  q: '',
  place: '',
  raga: '',
  thala: '',
  chandam: '',
};

export default function LandingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const songsSearchRef = useRef<HTMLDivElement | null>(null);

  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [fontSize]);

  const handleIncreaseFontSize = () => {
    setFontSize((prev) => {
      const idx = FONT_SIZES.indexOf(prev);
      return idx < FONT_SIZES.length - 1 ? FONT_SIZES[idx + 1] : prev;
    });
  };

  const handleDecreaseFontSize = () => {
    setFontSize((prev) => {
      const idx = FONT_SIZES.indexOf(prev);
      return idx > 0 ? FONT_SIZES[idx - 1] : prev;
    });
  };

  const [songs, setSongs] = useState<SongSummary[]>([]);
  const [places, setPlaces] = useState<PlaceMapping[]>([]);
  const [totalSongs, setTotalSongs] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [selectedSongNumber, setSelectedSongNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [ragas, setRagas] = useState<string[]>([]);
  const [thalas, setThalas] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [indexedTotal, setIndexedTotal] = useState<number | null>(null);
  const [songOfDay, setSongOfDay] = useState<SongDetail | null>(null);
  const [savedSongs, setSavedSongs] = useState<number[]>([]);
  const [sort, setSort] = useState('number');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setPlacesLoading(true);
    fetchPlaces()
      .then(setPlaces)
      .catch((err) => console.error('Error loading places:', err))
      .finally(() => setPlacesLoading(false));

    fetchRagas().then(setRagas).catch((err) => console.error('Error loading ragas:', err));
    fetchThalas().then(setThalas).catch((err) => console.error('Error loading thalas:', err));
    // Unfiltered total for the sidebar; the search total changes with filters.
    fetchSongs({ limit: 1 })
      .then((data) => setIndexedTotal(data.total))
      .catch((err) => console.error('Error loading song count:', err));
  }, []);

  // Song of the day: the same song for everyone on a given date.
  useEffect(() => {
    const total = indexedTotal ?? 1326;
    if (total < 1) return;
    const dayNumber = Math.floor(Date.now() / 86400000);
    const number = (dayNumber % total) + 1;
    fetchSongDetail(number)
      .then(setSongOfDay)
      .catch((err) => console.error('Error loading song of the day:', err));
  }, [indexedTotal]);

  // Share links: ?song=243 opens that song, and the address follows the open song.
  useEffect(() => {
    const requested = Number(new URLSearchParams(window.location.search).get('song'));
    if (Number.isInteger(requested) && requested > 0) setSelectedSongNumber(requested);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedSongNumber !== null) url.searchParams.set('song', String(selectedSongNumber));
    else url.searchParams.delete('song');
    window.history.replaceState(null, '', url);
  }, [selectedSongNumber]);

  // Saved songs live in this browser only; blocked storage just means they don't persist.
  useEffect(() => {
    try {
      setSavedSongs(JSON.parse(localStorage.getItem('saved-songs') ?? '[]'));
    } catch {
      setSavedSongs([]);
    }
  }, []);

  const toggleSaved = (num: number) => {
    const next = savedSongs.includes(num) ? savedSongs.filter((n) => n !== num) : [...savedSongs, num];
    setSavedSongs(next);
    try {
      localStorage.setItem('saved-songs', JSON.stringify(next));
    } catch {
      // Storage unavailable; the list still works for this visit.
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      // One search box: digits are a song number, anything else is a text search.
      const isNumber = /^\d+$/.test(filters.q.trim());
      fetchSongs({
        q: isNumber ? '' : filters.q.normalize('NFC'),
        number: isNumber ? filters.q.trim() : '',
        sort,
        order,
        place: filters.place,
        raga: filters.raga,
        thala: filters.thala,
        chandam: filters.chandam,
        page,
        limit: 12,
      })
        .then((data) => {
          setSongs(data.results);
          setTotalSongs(data.total);
          setError(null);
        })
        .catch((err) => {
          console.error('Error fetching songs:', err);
          setError('Songs could not be loaded. Check your connection and try again.');
        })
        .finally(() => setLoading(false));
    }, filters.q ? 300 : 0);

    return () => clearTimeout(timer);
  }, [filters, page, reloadKey, sort, order]);

  const handleGoHome = () => {
    setActiveTab('overview');
    setPage(1);
    setFilters(initialFilters);
  };

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const openSongSearch = () => {
    setActiveTab('thiruppugazh');
    setTimeout(() => {
      songsSearchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const changeSort = (nextSort: string, nextOrder: 'asc' | 'desc') => {
    setSort(nextSort);
    setOrder(nextOrder);
    setPage(1);
  };

  const openSongsForPlace = (place: string) => {
    setFilters({ ...initialFilters, place });
    setPage(1);
    openSongSearch();
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] text-stone-900 font-sans flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold"
      >
        உள்ளடக்கத்திற்குச் செல்க (Skip to content)
      </a>

      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onGoHome={handleGoHome}
        fontSize={fontSize}
        onIncreaseFontSize={handleIncreaseFontSize}
        onDecreaseFontSize={handleDecreaseFontSize}
        minFontSize={FONT_SIZES[0]}
        maxFontSize={FONT_SIZES[FONT_SIZES.length - 1]}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          sidebarOpen={sidebarOpen}
          activeTab={activeTab}
          totalSongs={indexedTotal}
          onSelectTab={setActiveTab}
          onCloseSidebar={() => setSidebarOpen(false)}
        />

        <main id="main" className="flex-1 p-4 sm:p-8 space-y-10 overflow-x-hidden">
          {activeTab === 'overview' && (
            <div className="space-y-10 animate-fade-in">
              <HeroBanner />

              <div className="bg-white border-2 border-amber-300 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-[#660000] font-serif">
                    Search Thiruppugazh Songs
                  </h3>
                  <p className="text-sm text-stone-600 mt-1">
                    Search by song number or a word.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openSongSearch}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-[#8B1A1A] text-white font-bold shadow-md hover:bg-[#660000] transition"
                >
                  🔍 Open Song Search
                </button>

                <div className="mt-6 p-5 rounded-2xl bg-white border-2 border-[#E3C896] space-y-3">
                  <p className="text-sm font-bold text-[#8B1A1A] uppercase tracking-wider">
                    இங்கிருந்து தொடங்குங்கள் (Start here)
                  </p>
                  <p className="text-base text-stone-700">முதல் பாடல் — விநாயகர் துதி</p>
                  <button
                    type="button"
                    onClick={() => setSelectedSongNumber(FEATURED_SONG_NUMBER)}
                    className="px-5 py-3 rounded-xl bg-[#8B1A1A] text-white text-base font-bold hover:bg-[#660000] transition"
                  >
                    பாடல் {FEATURED_SONG_NUMBER} படிக்க
                  </button>
                </div>

                {songOfDay && (
                  <div className="mt-6 p-5 rounded-2xl bg-amber-50 border-2 border-[#D4AF37] space-y-3">
                    <p className="text-sm font-bold text-[#8B1A1A] uppercase tracking-wider">இன்றைய பாடல் (Song of the day)</p>
                    <p className="text-base text-stone-700">
                      {songOfDay.title} · {songOfDay.category_or_place}
                    </p>
                    <p className="text-lg text-[#5C0000] font-serif">{firstLineOf(songOfDay)}</p>
                    <button
                      type="button"
                      onClick={() => setSelectedSongNumber(songOfDay.song_number)}
                      className="px-5 py-3 rounded-xl bg-[#8B1A1A] text-white text-base font-bold hover:bg-[#660000] transition"
                    >
                      இன்றைய பாடலைப் படிக்க
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'arunagirinathar' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b-2 border-amber-400 pb-4">
                <span className="text-xs font-bold text-[#8B1A1A] uppercase tracking-widest">
                  புனிதரின் தெய்வீக வாழ்வு
                </span>
                <h2 className="text-3xl font-extrabold text-[#660000] font-serif mt-1">
                  அருணகிரிநாதர்
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
                <figure className="bg-white p-3 rounded-2xl border-2 border-[#E3C896] shadow-sm">
                  <img
                    src="/images/arunagirinathar.jpg"
                    alt="புனிதர் அருணகிரிநாதர்"
                    width={267}
                    height={373}
                    className="w-full h-auto rounded-xl"
                  />
                  <figcaption className="mt-3 text-xs text-stone-600 leading-relaxed">
                    படம்: Mahalakshmi.S,{' '}
                    <a
                      href="https://commons.wikimedia.org/wiki/File:Arunagirinathar.jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-[#8B1A1A]"
                    >
                      Wikimedia Commons
                    </a>{' '}
                    · உரிமம்{' '}
                    <a
                      href="https://creativecommons.org/licenses/by-sa/4.0/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-[#8B1A1A]"
                    >
                      CC BY-SA 4.0
                    </a>
                  </figcaption>
                </figure>

                <div className="prose max-w-none text-stone-800 space-y-5 text-sm sm:text-base leading-relaxed font-medium">
                  <p>
                    <strong>அருணகிரிநாதர்</strong> ஒரு சிறந்த தமிழ்ப் புலவரும் முருகப் பெருமானின் பக்தரும் ஆவார்.
                    வரலாற்று ஆய்வாளர்கள் இவரது காலத்தை <strong>கி.பி. 1370 – 1450</strong> எனக் குறிப்பிடுகின்றனர்.
                    மரபுவழியாக இவர் 15ஆம் நூற்றாண்டைச் சேர்ந்தவர். இவர் <strong>திருவண்ணாமலையில்</strong> பிறந்தார்;
                    அக்காலத்தில் அது விஜயநகரப் பேரரசின் பகுதியாக இருந்தது.
                  </p>

                  <div>
                    <h3 className="text-base font-bold text-[#8B1A1A] mb-2">இளமையும் மாற்றமும்</h3>
                    <p>
                      மரபுவழிச் செய்தியின்படி, இளமையில் ஒழுக்கமற்ற வாழ்வில் ஈடுபட்ட அருணகிரியார், தமக்கையின்
                      பராமரிப்பிலிருந்த காலத்தில் தவறான பழக்கங்களுக்கு ஆளானார். ஒரு கட்டத்தில் தற்கொலை
                      முயற்சி செய்தபோது முருகப் பெருமான் காப்பாற்றி, அவரை பக்தி வழிக்குத் திருப்பினார் என்பது
                      நம்பிக்கை. இவரது சொந்தப் பாடல் ஒன்றில் குடும்பத்தின் புறக்கணிப்பு பற்றிய குறிப்பும்
                      உள்ளது; இந்தக் கதைகளின் விவரங்களில் ஆய்வாளர்களுக்கு கருத்து வேறுபாடு உண்டு.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#8B1A1A] mb-2">திருப்புகழ்</h3>
                    <p>
                      <strong>திருப்புகழ்</strong> என்பது &ldquo;திரு&rdquo; (தெய்வீகம்) + &ldquo;புகழ்&rdquo;
                      (போற்றுதல்) என்று பொருள்படும். முருகப் பெருமானையும் அவரது தலங்களையும் போற்றி, சந்தங்களில்
                      அமைந்த பாடல்களின் தொகுப்பு இது. மரபுவழியாக இவர் 16,000 பாடல்கள் இயற்றியதாகக் கூறப்படுகிறது;
                      இன்று கிடைப்பவை சுமார் <strong>1,334</strong> பாடல்கள். இந்தச் செயலியில் <strong>1,326</strong> பாடல்கள் உள்ளன.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#8B1A1A] mb-3">இவரது நூல்கள்</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 not-prose">
                      {ARUNAGIRI_WORKS.map((work) => (
                        <div key={work.tamil} className="p-4 rounded-2xl bg-white border-2 border-[#E3C896] space-y-1">
                          <p className="text-lg font-bold text-[#660000]">{work.tamil}</p>
                          <p className="text-sm text-stone-600">{work.english}</p>
                          {work.note && <p className="text-sm text-stone-700">{work.note}</p>}
                          <p className="text-xs text-stone-500">பாடல்கள் இன்னும் சேர்க்கப்படவில்லை.</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#8B1A1A] mb-2">பாடல்கள் மீட்கப்பட்ட வரலாறு</h3>
                    <p>
                      நீண்ட காலம் கைப்பிரதிகளில் மட்டுமே இருந்த இப்பாடல்கள் மறக்கப்படும் நிலையில் இருந்தன.
                      வ.த. சுப்பிரமணிய பிள்ளை அவற்றைத் தேடி எடுத்து, 1894 மற்றும் 1901 ஆம் ஆண்டுகளில்
                      இரு தொகுதிகளாக வெளியிட்டார். பாடல்களின் மூல இசை இன்று இல்லை; பின்னர் காஞ்சீபுரம் நைனா பிள்ளை,
                      சித்தூர் சுப்பிரமணியப் பிள்ளை, ஜி.என். பாலசுப்ரமணியம், ஏ.எஸ். ராகவன் போன்ற இசைக் கலைஞர்கள்
                      பல மெட்டுகளில் அமைத்துப் பாடினர்.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#8B1A1A] mb-2">மரபும் நினைவுகளும்</h3>
                    <p>
                      1964 ஆம் ஆண்டு வெளியான திரைப்படத்தில் டி.எம். சௌந்தரராஜன் இவராக நடித்தார்.
                      இன்றும் பல குடும்பங்களில் திருப்புகழ் பாராயணம் தொடர்கிறது.
                    </p>
                  </div>

                  <p className="text-xs text-stone-600 bg-amber-50 border border-amber-300 rounded-xl p-3">
                    குறிப்பு: இந்தப் பக்கத்தின் வாழ்க்கை விவரங்கள் வரலாற்று ஆய்வுகள் மற்றும் மரபுவழிக் கதைகளின் கலவை.
                    மரபுவழிச் செய்திகளை வரலாற்று உண்மைகளிலிருந்து பிரித்துப் பார்க்கவும். ஆதாரங்கள்:{' '}
                    <a href="https://en.wikipedia.org/wiki/Arunagirinathar" target="_blank" rel="noopener noreferrer" className="underline">
                      Wikipedia (Arunagirinathar)
                    </a>
                    ,{' '}
                    <a href="https://en.wikipedia.org/wiki/Kandar_Anubhuti" target="_blank" rel="noopener noreferrer" className="underline">
                      Kandar Anubhuti
                    </a>
                    .
                  </p>
                </div>
              </div>

              <div>
                <ArupadaiVeedu selectedPlace={filters.place} onSelectPlace={openSongsForPlace} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#8B1A1A] mb-3">பிறந்த ஊர்</h3>
                <button
                  type="button"
                  onClick={() => openSongsForPlace('திருவருணை')}
                  className="px-4 py-2 rounded-full bg-white border border-red-200 text-red-900 text-sm font-medium hover:bg-red-50 transition"
                >
                  திருவண்ணாமலை (திருவருணை) பாடல்கள்
                </button>
              </div>

              <button
                type="button"
                onClick={openSongSearch}
                className="px-5 py-3 rounded-xl bg-[#8B1A1A] text-white text-sm font-bold shadow-md hover:bg-[#660000] transition"
              >
                அனைத்துப் பாடல்களையும் காண்க
              </button>
            </div>
          )}

          {activeTab === 'thiruppugazh' && (
            <div className="space-y-4 animate-fade-in">
              <div ref={songsSearchRef}>
                <SongsSearch
                  songs={songs}
                  places={places}
                  ragas={ragas}
                  thalas={thalas}
                  totalSongs={totalSongs}
                  page={page}
                  loading={loading}
                  error={error}
                  onRetry={() => setReloadKey((k) => k + 1)}
                  filters={filters}
                  onFilterChange={updateFilter}
                  onPageChange={setPage}
                  onSelectSong={setSelectedSongNumber}
                  saved={savedSongs}
                  sort={sort}
                  order={order}
                  onSortChange={changeSort}
                />
              </div>

              <p className="text-sm text-stone-600 text-center">
                பாடல்களை ஒரு ஆசிரியரிடமிருந்து கற்றுக்கொள்வது சிறந்தது. எழுத்துப்பெயர்ப்பு படிக்க மட்டுமே உதவும்.
              </p>
            </div>
          )}

          {activeTab === 'places' && (
            <div className="space-y-8 animate-fade-in">
              <PlacesDirectory
                places={places}
                loading={placesLoading}
                onSelectPlace={(placeName) => {
                  updateFilter('place', placeName);
                  setActiveTab('thiruppugazh');
                }}
              />
            </div>
          )}

          {activeTab === 'map' && (
            <div className="space-y-8 animate-fade-in">
              <PlacesMap places={places} loading={placesLoading} />
            </div>
          )}
        </main>
      </div>

      <SongModal
        songNumber={selectedSongNumber}
        songNumbers={songs.map((song) => song.song_number)}
        onNavigate={setSelectedSongNumber}
        onClose={() => setSelectedSongNumber(null)}
        isSaved={selectedSongNumber !== null && savedSongs.includes(selectedSongNumber)}
        onToggleSaved={() => {
          if (selectedSongNumber !== null) toggleSaved(selectedSongNumber);
        }}
      />

      <footer className="bg-gradient-to-r from-[#F2E3C6] via-[#EAD2A8] to-[#F2E3C6] border-t-2 border-[#D4AF37] text-stone-900 py-6 mt-12 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-serif text-sm font-extrabold text-[#7A0000]">வெற்றிவேல் முருகனுக்கு அரோகரா!</p>
          <p className="text-stone-700 font-medium">Thiruppugazh Digital Treasury • Devotional Heritage Project</p>
        </div>
      </footer>
    </div>
  );
}