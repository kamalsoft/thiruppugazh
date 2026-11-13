'use client';

import React from 'react';
import GoldenVelIcon from './icons/GoldenVelIcon';
import PeacockFeatherIcon from './icons/PeacockFeatherIcon';
import AgalVilakkuIcon from './icons/AgalVilakkuIcon';
import { Constants } from '@/app/constants/images';

export type TabType = 'overview' | 'arunagirinathar' | 'thiruppugazh' | 'places' | 'map';

interface Props {
    sidebarOpen: boolean;
    activeTab: TabType;
    totalSongs: number | null;
    onSelectTab: (tab: TabType) => void;
    onCloseSidebar: () => void;
}

export default function Sidebar({ sidebarOpen, activeTab, totalSongs, onSelectTab, onCloseSidebar }: Props) {
    const handleTabClick = (tab: TabType) => {
        onSelectTab(tab);
        onCloseSidebar();
    };

    return (
        <>
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-72 bg-[#F7EEDD] text-stone-900 border-r-2 border-amber-300 transform transition-transform duration-300 ease-in-out flex flex-col justify-between
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="p-5 space-y-6 overflow-y-auto">

                    <div className="text-center p-4 rounded-2xl bg-gradient-to-b from-[#F2E3C6] to-[#EAD2A8] border-2 border-[#C99700]/40 flex flex-col items-center shadow-xs">
                        <div className="mb-1.5">
                            <GoldenVelIcon className="w-9 h-9 filter drop-shadow-[0_2px_4px_rgba(139,26,26,0.25)]" />
                        </div>
                        <h3 className="text-sm font-bold text-[#7A0000] tracking-wide">வேலும் மயிலும் துணை</h3>
                        <p className="text-[10px] text-stone-700 mt-1 font-medium">
                            Dedicated to Lord Murugan & Saint Arunagirinathar
                        </p>
                    </div>

                    <nav className="space-y-2 text-sm font-semibold">
                        <button
                            onClick={() => handleTabClick('overview')}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition ${activeTab === 'overview' ? 'bg-[#8B1A1A] text-amber-100 shadow-md' : 'hover:bg-[#EAD6B5] text-stone-800'
                                }`}
                        >
                            <AgalVilakkuIcon className="w-5 h-5" />
                            <span>முகப்பு (Overview)</span>
                        </button>

                        <button
                            onClick={() => handleTabClick('arunagirinathar')}
                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'arunagirinathar' ? 'bg-[#8B1A1A] text-amber-100 shadow-md' : 'hover:bg-[#EAD6B5] text-stone-800'
                                }`}
                        >
                            <GoldenVelIcon className="w-5 h-5" />
                            <span>அருணகிரிநாதர் (Saint)</span>
                        </button>

                        <button
                            onClick={() => handleTabClick('thiruppugazh')}
                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'thiruppugazh' ? 'bg-[#8B1A1A] text-amber-100 shadow-md' : 'hover:bg-[#EAD6B5] text-stone-800'
                                }`}
                        >
                            <PeacockFeatherIcon className="w-5 h-5" />
                            <span>சந்த நடை (Musicology)</span>
                        </button>

                        <button
                            onClick={() => handleTabClick('places')}
                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'places' ? 'bg-[#8B1A1A] text-amber-100 shadow-md' : 'hover:bg-[#EAD6B5] text-stone-800'
                                }`}
                        >
                            <img
                                src={Constants.THIRUCHENDUR_GOPURAM_URL}
                                alt="Lord Murugan"
                                className="w-5 h-5 rounded-full object-cover border border-amber-400"
                            />
                            <span>புண்ணியத் தலங்கள் (Sacred Abodes)</span>
                        </button>

                        <button
                            onClick={() => handleTabClick('map')}
                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'map' ? 'bg-[#8B1A1A] text-amber-100 shadow-md' : 'hover:bg-[#EAD6B5] text-stone-800'
                                }`}
                        >
                            <span className="text-base leading-none">📍</span>
                            <span>வரைபடம் (Places Map)</span>
                        </button>
                    </nav>
                </div>

                <div className="p-4 border-t border-amber-300 text-center text-[11px] text-stone-600 font-semibold">
                    {totalSongs !== null && `${totalSongs} Songs Indexed • `}Digital Devotional Treasury
                </div>
            </aside>

            {sidebarOpen && (
                <div
                    onClick={onCloseSidebar}
                    className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-20 lg:hidden"
                />
            )}
        </>
    );
}