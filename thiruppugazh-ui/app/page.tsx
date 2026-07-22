'use client';

import React, { useEffect, useState } from 'react';
import { fetchSongs, fetchPlaces } from '@/lib/api';
import { SongSummary, PlaceMapping } from '@/lib/types';
import Header from './components/Header';
import Sidebar, { TabType } from './components/Sidebar';
import HeroBanner from './components/HeroBanner';
import SongsSearch from './components/SongsSearch';
import PlacesDirectory from './components/PlacesDirectory';
import SongModal from './components/SongModal';

const FONT_SIZES = [14, 16, 18, 20, 22];
const DEFAULT_FONT_SIZE = 16;

export default function LandingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Font size state — scales the entire page via html root font-size (rem)
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    return () => {
      // Reset to browser default when component unmounts
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

  // Shared Data States
  const [songs, setSongs] = useState<SongSummary[]>([]);
  const [places, setPlaces] = useState<PlaceMapping[]>([]);
  const [totalSongs, setTotalSongs] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState('');
  const [selectedSongNumber, setSelectedSongNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [placesLoading, setPlacesLoading] = useState(false);

  // Load places directory on initial mount
  useEffect(() => {
    setPlacesLoading(true);
    fetchPlaces()
      .then(setPlaces)
      .catch((err) => console.error("Error loading places:", err))
      .finally(() => setPlacesLoading(false));
  }, []);

  // Fetch songs when filters or page change
  useEffect(() => {
    setLoading(true);
    fetchSongs({
      q: searchQuery,
      place: selectedPlace,
      page,
      limit: 12,
    })
      .then((data) => {
        setSongs(data.results);
        setTotalSongs(data.total);
      })
      .catch((err) => console.error("Error fetching songs:", err))
      .finally(() => setLoading(false));
  }, [searchQuery, selectedPlace, page]);

  // Handler for clicking top header logo / title
  const handleGoHome = () => {
    setActiveTab('overview');
    setSelectedPlace('');
    setSearchQuery('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] text-stone-900 font-sans flex flex-col">
      {/* Clickable Header */}
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
        {/* Navigation Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          activeTab={activeTab}
          totalSongs={totalSongs}
          onSelectTab={setActiveTab}
          onCloseSidebar={() => setSidebarOpen(false)}
        />

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-8 space-y-10 overflow-x-hidden">

          {/* TAB 1: OVERVIEW - EXCLUSIVELY DEDICATED TO LORD MURUGAN */}
          {activeTab === 'overview' && (
            <div className="space-y-10 animate-fade-in">
              <HeroBanner />
            </div>
          )}

          {/* TAB 2: SAINT ARUNAGIRINATHAR */}
          {activeTab === 'arunagirinathar' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b-2 border-amber-400 pb-4">
                <span className="text-xs font-bold text-[#8B1A1A] uppercase tracking-widest">
                  Saint's Divine Life
                </span>
                <h2 className="text-3xl font-extrabold text-[#660000] font-serif mt-1">
                  Saint Arunagirinathar (அருணகிரிநாதர்)
                </h2>
              </div>

              <div className="prose max-w-none text-stone-800 space-y-6 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  <strong>Saint Arunagirinathar</strong> was a revered 15th-century poet-saint born in <strong>Tiruvannamalai</strong>. His profound compositions laid the foundation for Tamil devotional music and meter.
                </p>

                <div className="bg-[#F9EED9] border-l-4 border-[#8B1A1A] p-5 rounded-r-2xl my-6 italic text-[#5C0000] shadow-xs">
                  "At the northern Gopuram of the Annamalaiyar Temple, Lord Murugan caught Arunagirinathar in His arms, inscribing the divine syllable 'Muthu' on his tongue with His Vel."
                </div>

                <h3 className="text-xl font-bold text-[#7A0000] font-serif pt-2">
                  Pilgrimage Across Sacred Shrines
                </h3>
                <p>
                  After receiving divine grace, Arunagirinathar traveled on foot to hundreds of ancient temples, singing the glory of Lord Murugan at each holy abode.
                </p>

                <h3 className="text-xl font-bold text-[#7A0000] font-serif pt-2">
                  Literary Legacy
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-stone-800">
                  <li><strong>Thiruppugazh (திருப்புகழ்):</strong> Over 1,300 surviving gems celebrating language, rhythm, and devotion.</li>
                  <li><strong>Kandar Anubhuti (கந்தர் அனுபூதி):</strong> Philosophical verses on spiritual enlightenment.</li>
                  <li><strong>Kandar Alangaram (கந்தர் அலங்காரம்):</strong> Hymns praising Lord Murugan's grace and protective power.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: THIRUPPUGAZH & SONGS SEARCH */}
          {activeTab === 'thiruppugazh' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b-2 border-amber-400 pb-4">
                <span className="text-xs font-bold text-[#8B1A1A] uppercase tracking-widest">
                  Prosody & Songs Treasury
                </span>
                <h2 className="text-3xl font-extrabold text-[#660000] font-serif mt-1">
                  Thiruppugazh Songs & Chandam Rhythms
                </h2>
              </div>

              <div className="bg-gradient-to-r from-[#FCE8C3] to-[#F5D8A0] border-2 border-[#D4AF37] rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-[#660000] font-serif">Example Chandam Pattern</h3>
                <div className="bg-white/90 p-4 rounded-xl border border-amber-300 font-mono text-sm text-[#5C0000] space-y-1 font-bold shadow-xs">
                  <p>தத்தன தனதன தத்தன தனதன</p>
                  <p>தத்தன தனதன ...... தனதான</p>
                </div>
              </div>

              {/* Songs Search Engine */}
              <SongsSearch
                songs={songs}
                places={places}
                totalSongs={totalSongs}
                page={page}
                loading={loading}
                searchQuery={searchQuery}
                selectedPlace={selectedPlace}
                onSearchChange={(q) => {
                  setSearchQuery(q);
                  setPage(1);
                }}
                onPlaceChange={(p) => {
                  setSelectedPlace(p);
                  setPage(1);
                }}
                onPageChange={setPage}
                onSelectSong={setSelectedSongNumber}
              />
            </div>
          )}

          {/* TAB 4: SACRED PLACES DIRECTORY */}
          {activeTab === 'places' && (
            <div className="space-y-8 animate-fade-in">
              <PlacesDirectory
                places={places}
                loading={placesLoading}
                onSelectPlace={(placeName) => {
                  setSelectedPlace(placeName);
                  setActiveTab('thiruppugazh');
                }}
              />
            </div>
          )}

        </main>
      </div>

      {/* Song Lyrics Reader Modal */}
      <SongModal
        songNumber={selectedSongNumber}
        onClose={() => setSelectedSongNumber(null)}
      />

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#F2E3C6] via-[#EAD2A8] to-[#F2E3C6] border-t-2 border-[#D4AF37] text-stone-900 py-6 mt-12 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-serif text-sm font-extrabold text-[#7A0000]">
            வெற்றிவேல் முருகனுக்கு அரோகரா!
          </p>
          <p className="text-stone-700 font-medium">
            Thiruppugazh Digital Treasury • Devotional Heritage Project
          </p>
        </div>
      </footer>
    </div>
  );
}