'use client';

import React, { useEffect, useRef, useState } from 'react';
import { fetchSongs, fetchPlaces, fetchRagas, fetchThalas } from '@/lib/api';
import { SongSummary, PlaceMapping } from '@/lib/types';
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
  const [savedSongs, setSavedSongs] = useState<number[]>([]);

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
  }, [filters, page, reloadKey]);

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
        உள்ளடக்கத்திற்குச் செல் (Skip to content)
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

              <div className="prose max-w-none text-stone-800 space-y-6 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  <strong>அருணகிரிநாதர்</strong> பாரம்பரியமாக 15ஆம் நூற்றாண்டைச் சேர்ந்தவர் எனக்
                  கருதப்படும் சிறந்த தமிழ்ப் புலவரும் முருகப் பெருமானின் பக்தரும் ஆவார். இவர்{' '}
                  <strong>திருவண்ணாமலையில்</strong> பிறந்தார்.
                </p>
                <p>
                  மரபுவழிச் செய்தியின்படி, இளமையில் ஒழுக்கமற்ற வாழ்வில் ஈடுபட்ட அருணகிரியார்,
                  தமக்கையின் அறிவுரையாலும் முருகப் பெருமானின் அருளாலும் மனம் மாறி பக்தி வழிக்குத்
                  திரும்பினார். அதன் பின்னர் தம் வாழ்வை முருகனைப் பாடுவதற்கு அர்ப்பணித்தார்.
                </p>
                <p>
                  <strong>திருப்புகழ்</strong> என்பது &ldquo;திரு&rdquo; (தெய்வீகம்) + &ldquo;புகழ்&rdquo;
                  (போற்றுதல்) என்று பொருள்படும். முருகப் பெருமானையும் அவரது தலங்களையும் போற்றி,
                  சந்தங்களில் அமைந்த 1,300க்கும் மேற்பட்ட பாடல்களின் தொகுப்பே திருப்புகழ்.
                </p>
                <p>
                  திருப்புகழ் தவிர, <em>கந்தர் அனுபூதி</em>, <em>கந்தர் அலங்காரம்</em>, <em>வேல் விருத்தம்</em>{' '}
                  ஆகிய நூல்களும் இவர் இயற்றியவை.
                </p>

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