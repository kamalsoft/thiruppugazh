'use client';

import React, { useState } from 'react';
import { PlaceMapping } from '@/lib/types';

interface Props {
    places: PlaceMapping[];
    loading: boolean;
    onSelectPlace: (placeName: string) => void;
}

export default function PlacesDirectory({ places, loading, onSelectPlace }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPlaces = places.filter((p) =>
        p.place.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-[#FFFDF7] border-2 border-[#E3C896] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b-2 border-amber-300 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                    <h3 className="text-2xl font-extrabold text-[#660000] font-serif">
                        புண்ணியத் தலங்கள் (Sacred Places Directory)
                    </h3>
                    <p className="text-xs text-stone-600 font-medium mt-1">
                        Explore sacred shrines glorified by Saint Arunagirinathar
                    </p>
                </div>

                <span className="text-xs font-bold text-[#8B1A1A] bg-[#FCE8C3] px-3.5 py-1.5 rounded-full border border-amber-300 self-start sm:self-auto">
                    மொத்த தலங்கள்: {places.length}
                </span>
            </div>

            <div>
                <input
                    type="text"
                    placeholder="தலங்களின் பெயர் தேடுக (Search place name)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] text-sm font-medium"
                />
            </div>

            {loading ? (
                <div className="py-12 text-center text-stone-600 font-semibold space-y-2">
                    <span className="text-2xl block animate-bounce">🛕</span>
                    <p>தரவுகள் பெறப்படுகின்றன (Loading sacred places)...</p>
                </div>
            ) : filteredPlaces.length === 0 ? (
                <div className="py-8 text-center text-stone-500 text-sm font-medium">
                    தலங்கள் ஏதும் கண்டறியப்படவில்லை (No places match search).
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[550px] overflow-y-auto pr-2">
                    {filteredPlaces.map((item) => (
                        <div
                            key={item.place}
                            onClick={() => onSelectPlace(item.place)}
                            className="bg-[#FFF9F0] border border-[#E3C896] hover:border-[#8B1A1A] p-4 rounded-xl shadow-2xs hover:shadow-sm transition cursor-pointer flex items-center justify-between group"
                        >
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-[#7A0000] font-serif group-hover:text-[#8B1A1A]">
                                    {item.place}
                                </h4>
                                <p className="text-[11px] text-stone-600 font-medium">
                                    பாடல்கள்: <strong className="text-stone-900">{item.total_songs}</strong>
                                </p>
                            </div>

                            <span className="text-xs font-bold text-[#8B1A1A] bg-[#FCE8C3] px-2.5 py-1 rounded-lg border border-amber-300/80 group-hover:bg-[#8B1A1A] group-hover:text-amber-100 transition">
                                காண்க →
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}