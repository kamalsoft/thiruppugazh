'use client';

import React, { useState } from 'react';
import { PlaceMapping } from '@/lib/types';

interface Props {
    places: PlaceMapping[];
    loading: boolean;
}

// Known coordinates for Arupadai Veedu (Six Abodes of Murugan)
const ARUPADAI_VEEDU: Record<string, { lat: number; lng: number }> = {
    'திருச்செந்தூர்': { lat: 8.4882, lng: 78.1228 },
    'Thiruchendur': { lat: 8.4882, lng: 78.1228 },
    'பழனி': { lat: 10.4503, lng: 77.5234 },
    'Palani': { lat: 10.4503, lng: 77.5234 },
    'திருப்பரங்குன்றம்': { lat: 8.8922, lng: 77.7342 },
    'Thiruparankundram': { lat: 8.8922, lng: 77.7342 },
    'சுவாமிமலை': { lat: 10.9547, lng: 79.3339 },
    'Swamimalai': { lat: 10.9547, lng: 79.3339 },
    'திருத்தணி': { lat: 13.1877, lng: 79.6149 },
    'Thiruthani': { lat: 13.1877, lng: 79.6149 },
    'பழமுதிர்சோலை': { lat: 10.0014, lng: 77.4706 },
    'Pazhamudircholai': { lat: 10.0014, lng: 77.4706 },
};

function getMapsUrl(placeName: string): string {
    // Check if we have known coords
    const key = Object.keys(ARUPADAI_VEEDU).find(
        (k) => placeName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(placeName.toLowerCase())
    );
    if (key) {
        const { lat, lng } = ARUPADAI_VEEDU[key];
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    // Fall back to Google Maps text search — great for Tamil temple names
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName + ' temple Tamil Nadu')}`;
}

export default function PlacesMap({ places, loading }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredPlace, setHoveredPlace] = useState<string | null>(null);

    const filteredPlaces = places.filter((p) =>
        p.place.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="border-b-2 border-amber-400 pb-4">
                <span className="text-xs font-bold text-[#8B1A1A] uppercase tracking-widest">
                    Sacred Geography
                </span>
                <h2 className="text-3xl font-extrabold text-[#660000] font-serif mt-1">
                    தலங்கள் வரைபடம் — Places Map
                </h2>
                <p className="text-sm text-stone-600 font-medium mt-1.5">
                    Locate the sacred shrines glorified by Saint Arunagirinathar. Click &quot;Pin on Map&quot; to open Google Maps.
                </p>
            </div>

            {/* Arupadai Veedu Quick Pins */}
            <div className="bg-gradient-to-r from-[#8B1A1A] via-[#990000] to-[#8B1A1A] rounded-2xl p-5 border-2 border-[#D4AF37] shadow-md">
                <h3 className="text-amber-300 font-extrabold font-serif text-base mb-3 flex items-center gap-2">
                    <span>⚔️</span> அறுபடை வீடுகள் — Six Abodes of Murugan
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                        { name: 'திருச்செந்தூர்', en: 'Thiruchendur' },
                        { name: 'பழனி', en: 'Palani' },
                        { name: 'திருப்பரங்குன்றம்', en: 'Thiruparankundram' },
                        { name: 'சுவாமிமலை', en: 'Swamimalai' },
                        { name: 'திருத்தணி', en: 'Thiruthani' },
                        { name: 'பழமுதிர்சோலை', en: 'Pazhamudircholai' },
                    ].map((abode) => (
                        <a
                            key={abode.en}
                            href={getMapsUrl(abode.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-amber-400/10 hover:bg-amber-400/25 border border-amber-400/40 hover:border-amber-300 rounded-xl px-3 py-2.5 transition group"
                        >
                            <span className="text-base group-hover:scale-125 transition-transform">📍</span>
                            <div>
                                <p className="text-amber-200 text-xs font-bold leading-tight">{abode.name}</p>
                                <p className="text-amber-400/70 text-[10px] font-medium">{abode.en}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* Embedded Map placeholder / iframe using OpenStreetMap */}
            <div className="rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-md">
                <div className="bg-[#F7EEDD] border-b border-amber-300 px-4 py-2.5 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8B1A1A] flex items-center gap-1.5">
                        🗺️ Sacred Sites — South India Overview
                    </span>
                    <a
                        href="https://www.google.com/maps/search/Murugan+temples+Tamil+Nadu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-[#8B1A1A] hover:text-amber-700 underline transition"
                    >
                        Open Full Map →
                    </a>
                </div>
                <iframe
                    title="Tamil Nadu Sacred Places Map"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=76.0,8.0,80.5,14.0&layer=mapnik&marker=10.0,78.5"
                    className="w-full h-64 sm:h-80"
                    loading="lazy"
                />
            </div>

            {/* Search + All Places Grid */}
            <div className="bg-[#FFFDF7] border-2 border-[#E3C896] rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-amber-300 pb-4">
                    <h3 className="text-lg font-extrabold text-[#7A0000] font-serif">
                        அனைத்துத் தலங்களும் (All Sacred Places)
                    </h3>
                    <span className="text-xs font-bold text-[#8B1A1A] bg-[#FCE8C3] px-3 py-1 rounded-full border border-amber-300 self-start sm:self-auto">
                        {places.length} தலங்கள்
                    </span>
                </div>

                <input
                    type="text"
                    placeholder="தலத்தின் பெயர் தேடுக (Search place)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] text-sm font-medium"
                />

                {loading ? (
                    <div className="py-12 text-center text-stone-600 font-semibold space-y-2">
                        <span className="text-2xl block animate-bounce">🛕</span>
                        <p>தலங்கள் ஏற்றப்படுகின்றன (Loading places)...</p>
                    </div>
                ) : filteredPlaces.length === 0 ? (
                    <div className="py-8 text-center text-stone-500 text-sm font-medium">
                        பொருந்தும் தலங்கள் இல்லை (No places match).
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-1">
                        {filteredPlaces.map((item) => {
                            const mapsUrl = getMapsUrl(item.place);
                            return (
                                <div
                                    key={item.place}
                                    onMouseEnter={() => setHoveredPlace(item.place)}
                                    onMouseLeave={() => setHoveredPlace(null)}
                                    className={`
                                        bg-[#FFF9F0] border rounded-xl p-4 shadow-2xs transition
                                        flex flex-col gap-2
                                        ${hoveredPlace === item.place
                                            ? 'border-[#8B1A1A] shadow-sm -translate-y-0.5'
                                            : 'border-[#E3C896]'}
                                    `}
                                >
                                    {/* Place name + song count */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h4 className="text-sm font-bold text-[#7A0000] font-serif leading-snug">
                                                {item.place}
                                            </h4>
                                            <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                                                {item.total_songs} பாடல்கள்
                                            </p>
                                        </div>
                                        <span className="text-xs font-bold text-[#8B1A1A] bg-[#FCE8C3] px-2 py-0.5 rounded-md border border-amber-300/80 shrink-0">
                                            #{item.total_songs}
                                        </span>
                                    </div>

                                    {/* Pin on Map button */}
                                    <a
                                        href={mapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-1.5 w-full mt-auto py-1.5 rounded-lg bg-[#8B1A1A] hover:bg-[#701212] text-amber-100 text-xs font-bold transition active:scale-95"
                                        title={`Open ${item.place} in Google Maps`}
                                    >
                                        <span>📍</span>
                                        <span>Pin on Map</span>
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
