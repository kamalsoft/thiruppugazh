'use client';

import React from 'react';
import { Constants } from '@/app/constants/images';

interface Props {
    onToggleSidebar: () => void;
    onGoHome?: () => void;
}

export default function Header({ onToggleSidebar, onGoHome }: Props) {
    const handleHomeClick = () => {
        if (onGoHome) {
            onGoHome();
        } else {
            window.location.href = '/';
        }
    };

    return (
        <header className="bg-gradient-to-r from-[#8B1A1A] via-[#990000] to-[#B33B00] text-amber-100 border-b-4 border-[#D4AF37] sticky top-0 z-40 shadow-md">
            <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onToggleSidebar}
                        className="lg:hidden p-2 rounded-lg bg-red-950/40 hover:bg-red-950/60 border border-amber-400/30 text-amber-200 transition"
                        aria-label="Toggle Sidebar"
                    >
                        ☰
                    </button>

                    {/* Clickable Header Icon and Title */}
                    <button
                        onClick={handleHomeClick}
                        className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
                    >
                        <img
                            src={Constants.THIRUCHENDUR_GOPURAM_URL}
                            alt="Thiruchendur Temple Rajagopuram"
                            className="w-10 h-10 sm:w-11 sm:h-11 object-cover rounded-xl border-2 border-[#D4AF37] shadow-sm group-hover:scale-105 transition-transform"
                        />
                        <div>
                            <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide text-amber-300 font-serif group-hover:text-amber-200 transition-colors">
                                திருப்புகழ்
                            </h1>
                            <p className="text-[11px] sm:text-xs text-amber-100/90 font-medium">
                                ✨ திருப்புகழைப் பாடப் பாட வாய் மணக்கும் ✨
                            </p>
                        </div>
                    </button>
                </div>

                 
            </div>
        </header>
    );
}