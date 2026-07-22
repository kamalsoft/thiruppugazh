'use client';

import React from 'react';
import GoldenVelIcon from './icons/GoldenVelIcon';
import PeacockFeatherIcon from './icons/PeacockFeatherIcon';
import AgalVilakkuIcon from './icons/AgalVilakkuIcon';

// Path to your local static image saved in public/images/
const LORD_MURUGAN_STATIC_IMAGE = "/images/lord-murugan-abodes.jpg";

export default function HeroBanner() {
    return (
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#FAF0D7] via-[#FFFDF7] to-[#FCE8C3] text-stone-900 p-6 sm:p-10 shadow-sm border-2 border-[#D4AF37] space-y-6">

            {/* Top Banner: Prominent Tagline */}
            <div className="bg-gradient-to-r from-[#8B1A1A] via-[#990000] to-[#8B1A1A] rounded-2xl p-4 text-center border-2 border-[#D4AF37] shadow-sm flex items-center justify-center gap-3">
                {/* Vel 1 — glow + sway, starts immediately */}
                <GoldenVelIcon
                    className="w-5 h-5 shrink-0 animate-vel-glow animate-vel-sway"
                    style={{ animationDelay: '0s, 0s' } as React.CSSProperties}
                />
                <span className="text-amber-300 text-sm sm:text-base font-bold font-serif tracking-wide drop-shadow-xs">
                    ✨ திருப்புகழைப் பாடப் பாட வாய் மணக்கும் ✨
                </span>
                {/* Vel 2 — same glow, sway offset so they alternate */}
                <GoldenVelIcon
                    className="w-5 h-5 shrink-0 animate-vel-glow animate-vel-sway"
                    style={{ animationDelay: '1.25s, 0.8s' } as React.CSSProperties}
                />
            </div>

            {/* Hero Image Frame with float + shimmer animation */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-md bg-[#00381c] flex justify-center items-center">

                {/* Floating Murugan Image */}
                <img
                    src={LORD_MURUGAN_STATIC_IMAGE}
                    alt="அருள்மிகு அறுபடை வீடு முருகப்பெருமான்"
                    className="w-full h-auto max-h-[500px] sm:max-h-[560px] object-contain bg-[#00381c] p-2 sm:p-4 animate-hero-float"
                />

                {/* Golden shimmer overlay that sweeps across the image */}
                <div
                    className="absolute inset-0 pointer-events-none rounded-2xl"
                    style={{
                        background: 'linear-gradient(105deg, transparent 40%, rgba(255,215,0,0.08) 50%, transparent 60%)',
                        backgroundSize: '200% 100%',
                        animation: 'shine-slide 4s linear infinite',
                    }}
                />

                {/* Subtle Bottom Gradient and Blended Chant */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-6 text-center text-amber-100 z-10 backdrop-blur-[1px]">
                    <p className="text-sm sm:text-lg text-amber-100 font-serif italic max-w-xl mx-auto font-semibold drop-shadow-md">
                        "வேலும் மயிலும் துணை... வெற்றிவேல் முருகனுக்கு அரோகரா!"
                    </p>
                </div>
            </div>

            {/* Structured Thiruppugazh Key Highlights Card (Overview Section) */}
            <div className="bg-[#FFF9F0] border-2 border-[#E3C896] rounded-2xl p-6 sm:p-8 text-left space-y-5 shadow-2xs relative">
                <div className="border-b border-amber-300 pb-3 flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#7A0000] font-serif">
                        திருப்புகழ்: வரலாற்றுச் சிறப்புகளும் ஆன்மீக மகத்துவமும்
                    </h3>
                    <span className="text-xs font-bold text-[#8B1A1A] bg-[#FCE8C3] px-3 py-1 rounded-full border border-amber-300 hidden sm:inline-block">
                        15-ஆம் நூற்றாண்டு இலக்கியம்
                    </span>
                </div>

                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                    <strong>திருப்புகழ்</strong> என்பது 15-ஆம் நூற்றாண்டில் <strong>அருணகிரிநாதரால்</strong> முருகப்பெருமான் மீது பாடப்பட்ட மிகச்சிறந்த பக்தி மற்றும் தத்துவ நூலாகும். இது முருகனின் பெருமைகளைப் பாடுவதோடு, மனித வாழ்வின் தத்துவங்களை உணர்த்தி ஆன்மீக ஞானத்தை வழங்கும் சக்திவாய்ந்த மந்திர நூலாகப் போற்றப்படுகிறது.
                </p>

                {/* Key Points Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">

                    <div className="bg-[#FFFDF7] p-4 rounded-xl border border-amber-300/80 space-y-1">
                        <h4 className="text-sm font-bold text-[#8B1A1A] font-serif flex items-center gap-2">
                            <span>🥁</span> சந்த நயம் &amp; இசைச்சிறப்பு
                        </h4>
                        <p className="text-xs text-stone-700 leading-relaxed">
                            1088-க்கும் மேற்பட்ட தனித்துவமான சந்த வேறுபாடுகளும் (Rhythm variations) இசை நூல்களிலும் அடங்காத அபூர்வத் தாள நயங்களும் கொண்டது.
                        </p>
                    </div>

                    <div className="bg-[#FFFDF7] p-4 rounded-xl border border-amber-300/80 space-y-1">
                        <h4 className="text-sm font-bold text-[#8B1A1A] font-serif flex items-center gap-2">
                            <span>☸️</span> மெய்ஞானத் தத்துவங்கள்
                        </h4>
                        <p className="text-xs text-stone-700 leading-relaxed">
                            வெறும் வழிபாட்டுப் பாடலாக மட்டுமல்லாமல், மனதை ஒருமுகப்படுத்திப் பிறவிப் பிணியை அறுக்கும் மெய்ஞானத் தத்துவங்களை வழங்குகிறது.
                        </p>
                    </div>

                    <div className="bg-[#FFFDF7] p-4 rounded-xl border border-amber-300/80 space-y-1">
                        <h4 className="text-sm font-bold text-[#8B1A1A] font-serif flex items-center gap-2">
                            <span>✨</span> தீவினை &amp; நோய் தீர்க்கும் சக்தி
                        </h4>
                        <p className="text-xs text-stone-700 leading-relaxed">
                            உளமாரத் திருப்புகழைப் பாடுவதால் கொடிய நோய்கள், மனக்கவலைகள் மற்றும் இன்னல்கள் அகலும் என்பது பக்தர்களின் நம்பிக்கை.
                        </p>
                    </div>

                    <div className="bg-[#FFFDF7] p-4 rounded-xl border border-amber-300/80 space-y-1">
                        <h4 className="text-sm font-bold text-[#8B1A1A] font-serif flex items-center gap-2">
                            <span>📜</span> 24 ஆண்டுகள் தேடி மீட்கப்பட்ட வரலாறு
                        </h4>
                        <p className="text-xs text-stone-700 leading-relaxed">
                            மறைந்துபோன திருப்புகழ் பாடல்களை 24 ஆண்டுகள் அரும்பாடுபட்டுத் தேடி நமக்கு மீட்டுக் கொடுத்தவர் அறிஞர் <strong>வ.த.சுப்பிரமணிய பிள்ளை</strong> ஆவார்.
                        </p>
                    </div>

                </div>
            </div>

            {/* 3 Spacious Bottom Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">

                {/* Card 1: Vel — glow + sway */}
                <div className="bg-[#FFFDF7] border-2 border-[#E3C896] hover:border-[#8B1A1A] rounded-2xl p-6 text-center space-y-3 transition shadow-2xs hover:shadow-xs">
                    <div className="flex justify-center">
                        <GoldenVelIcon
                            className="w-10 h-10 animate-vel-glow animate-vel-sway"
                            style={{ animationDelay: '0.4s, 0.4s' } as React.CSSProperties}
                        />
                    </div>
                    <h3 className="text-base font-bold font-serif text-[#7A0000]">
                        சந்தக் கவி
                    </h3>
                    <p className="text-xs text-stone-700 leading-relaxed font-medium">
                        தத்தன தனதன எனும் தாளக் கட்டமைப்போடு அமைந்த தனித்துவமான சந்த நடைச் சிறப்புகள்.
                    </p>
                </div>

                {/* Card 2: Peacock feather — levitate */}
                <div className="bg-[#FFFDF7] border-2 border-[#E3C896] hover:border-[#8B1A1A] rounded-2xl p-6 text-center space-y-3 transition shadow-2xs hover:shadow-xs">
                    <div className="flex justify-center">
                        <PeacockFeatherIcon
                            className="w-10 h-10 animate-icon-levitate"
                            style={{ animationDelay: '0.6s' } as React.CSSProperties}
                        />
                    </div>
                    <h3 className="text-base font-bold font-serif text-[#7A0000]">
                        தலங்களின் சிறப்பு
                    </h3>
                    <p className="text-xs text-stone-700 leading-relaxed font-medium">
                        அறுபடை வீடுகள் உட்பட இருநூற்றுக்கும் மேற்பட்ட புண்ணியத் தலங்களை தரிசித்து பாடிய நற்பாடல்கள்.
                    </p>
                </div>

                {/* Card 3: Agal Vilakku — levitate with offset delay */}
                <div className="bg-[#FFFDF7] border-2 border-[#E3C896] hover:border-[#8B1A1A] rounded-2xl p-6 text-center space-y-3 transition shadow-2xs hover:shadow-xs">
                    <div className="flex justify-center">
                        <AgalVilakkuIcon
                            className="w-10 h-10 animate-icon-levitate"
                            style={{ animationDelay: '1.2s' } as React.CSSProperties}
                        />
                    </div>
                    <h3 className="text-base font-bold font-serif text-[#7A0000]">
                        ஆன்மீக வழிகாட்டி
                    </h3>
                    <p className="text-xs text-stone-700 leading-relaxed font-medium">
                        மனக்கவலை அகற்றி அருள் ஒளி வழங்கும் மெய்யறிவு நூலாகத் திகழும் இறை அமுதம்.
                    </p>
                </div>

            </div>

        </section>
    );
}