'use client';
import React from 'react';

const ARUPADAI_VEEDU = [
  { name: 'திருப்பரங்குன்றம்', label: '1. திருப்பரங்குன்றம்' },
  { name: 'திருச்செந்தூர்', label: '2. திருச்செந்தூர்' },
  { name: 'பழநி', label: '3. பழநி' },
  { name: 'சுவாமி மலை', label: '4. சுவாமிமலை' },
  { name: 'திருத்தணிகை', label: '5. திருத்தணி' },
  { name: 'பழமுதிர்சோலை', label: '6. பழமுதிர்ச்சோலை' },
];

interface Props {
  selectedPlace: string;
  onSelectPlace: (place: string) => void;
}

export default function ArupadaiVeedu({ selectedPlace, onSelectPlace }: Props) {
  return (
    <div className="my-6">
      <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
        அறுபடை வீடுகள் (Sacred 6 Abodes)
      </h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectPlace('')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            selectedPlace === '' 
              ? 'bg-amber-600 text-white shadow' 
              : 'bg-white border text-gray-700 hover:bg-amber-50'
          }`}
        >
          அனைத்தும் (All)
        </button>

        {ARUPADAI_VEEDU.map((abode) => (
          <button
            key={abode.name}
            onClick={() => onSelectPlace(abode.name)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedPlace === abode.name 
                ? 'bg-red-800 text-white shadow' 
                : 'bg-white border border-red-200 text-red-900 hover:bg-red-50'
            }`}
          >
            {abode.label}
          </button>
        ))}
      </div>
    </div>
  );
}
