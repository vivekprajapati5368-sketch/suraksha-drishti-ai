import React, { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import indianJetsSkyBg from '../../assets/images/indian_jets_sky_bg.jpg';

/**
 * Detailed IAF Fighter Jet Component
 * Features delta wings, forward canards, cockpit canopy, and live twin afterburner flames.
 */
function IafFighterJet({ size = 'md', tipColor = '#FF671F' }) {
  const sizeClasses = {
    sm: 'w-16 h-12 sm:w-20 sm:h-15',
    md: 'w-20 h-15 sm:w-24 sm:h-18',
    lg: 'w-24 h-18 sm:w-28 sm:h-22',
  }[size] || 'w-20 h-15 sm:w-24 sm:h-18';

  return (
    <div className="relative z-20 flex items-center select-none pointer-events-none">
      {/* Glowing Supersonic Twin Afterburner Flames */}
      <div className="flex flex-col gap-1 -mr-2.5 animate-afterburner">
        <div className="w-5 h-2 bg-gradient-to-r from-[#ff5500] via-[#ffaa00] to-[#38bdf8] rounded-full shadow-[0_0_12px_#ff5500]" />
        <div className="w-5 h-2 bg-gradient-to-r from-[#ff5500] via-[#ffaa00] to-[#38bdf8] rounded-full shadow-[0_0_12px_#ff5500]" />
      </div>

      {/* IAF Delta-Wing Fighter Airframe (Su-30MKI / Rafale / Tejas) */}
      <svg
        viewBox="0 0 120 90"
        className={`${sizeClasses} text-slate-900 dark:text-slate-100 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]`}
      >
        <path
          d="M 115 45 L 82 38 L 68 12 L 60 12 L 65 38 L 34 40 L 22 26 L 14 26 L 19 43 L 4 43 L 2 45 L 4 47 L 19 47 L 14 64 L 22 64 L 34 50 L 65 52 L 60 78 L 68 78 L 82 52 L 115 45 Z"
          fill="currentColor"
        />
        <path d="M 92 45 L 80 34 L 75 35 L 82 45 L 75 55 L 80 56 Z" fill="currentColor" />
        <path d="M 90 43 L 105 45 L 90 47 Z" fill="#38bdf8" />
        <circle cx="64" cy="14" r="3" fill={tipColor} />
        <circle cx="64" cy="76" r="3" fill={tipColor} />
      </svg>
    </div>
  );
}

/**
 * LiveIndianSkyBackground (5-Jet Echelon & Patriotic Flag Edition)
 * -------------------------------------------------------------------
 * Seamlessly matches the iconic Indian flag watercolor artwork transitioning
 * into sweeping, curved Tri-Colour smoke trails (Orange, White, Green),
 * with 5 Indian Air Force fighter jets soaring diagonally into the sky!
 */
export function LiveIndianSkyBackground() {
  const { isDark } = useTheme();

  // Telemetry radar points on India map
  const radarStations = useMemo(() => [
    { name: 'Joshimath / Chamoli (UK)', x: 48, y: 28, status: 'HIGH-ALERT', color: '#ef4444' },
    { name: 'Wayanad Ghats (KL)', x: 44, y: 78, status: 'MONITORED', color: '#f59e0b' },
    { name: 'Majuli / Brahmaputra (AS)', x: 82, y: 34, status: 'ELEVATED', color: '#f59e0b' },
    { name: 'Kinnaur Valley (HP)', x: 44, y: 24, status: 'ACTIVE', color: '#10b981' },
    { name: 'Kendrapara Coastal (OD)', x: 67, y: 53, status: 'STABLE', color: '#3b82f6' },
  ], []);

  return (
    <div
      aria-hidden="true"
      className="live-sky-bg fixed inset-0 pointer-events-none select-none z-0 overflow-hidden transition-colors duration-500 [transform:translateZ(0)]"
    >
      {/* 1. CORE MASTERPIECE ARTWORK: BILLOWING INDIAN FLAG & 5 JETS IN SKY (TRANSPARENT WATERMARK) */}
      <div className="absolute inset-0 overflow-hidden [contain:strict]">
        <img
          src={indianJetsSkyBg}
          alt="Indian Air Force Fighter Jets & Waving Flag"
          className={`w-full h-full object-cover object-center transition-all duration-700 select-none pointer-events-none scale-[1.01] ${
            isDark
              ? 'opacity-[0.14] brightness-90 contrast-125 saturate-110'
              : 'opacity-[0.20] brightness-105 contrast-110'
          }`}
        />

        {/* Tactical Dark Mode Overlay / Twilight Airshow Glow */}
        {isDark && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/70 via-[#07132e]/60 to-[#030816]/75 mix-blend-multiply pointer-events-none" />
        )}

        {/* Light Mode Soft Atmospheric Wash (Preserves Foreground Contrast & 100% Readability) */}
        {!isDark && (
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-white/30 pointer-events-none" />
        )}
      </div>

      {/* 2. LIVE FLAG BILLOW & ASHOKA CHAKRA SHIMMER (LEFT SIDE) */}
      <div className="absolute top-0 left-0 w-full sm:w-1/2 h-full pointer-events-none overflow-hidden opacity-30">
        {/* Animated wind ripple over flag ripples */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 dark:via-cyan-400/10 to-transparent animate-flag-shimmer [will-change:transform]" />
        {/* Subtle luminous radiance over the Ashoka Chakra location */}
        <div className="absolute bottom-[32%] sm:bottom-[36%] left-[6%] sm:left-[8%] w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-blue-500/15 dark:bg-cyan-400/25 blur-md animate-pulse" />
      </div>

      {/* 3. PERMANENT OVERHEAD PATRIOTIC TRI-COLOUR AIRSPACE STRIP */}
      <div className="absolute top-0 left-0 right-0 h-2 sm:h-2.5 z-10 pointer-events-none overflow-hidden shadow-sm">
        <div className="w-full h-full flex flex-col">
          <div className="h-1/3 w-full bg-[#FF671F]" />
          <div className="h-1/3 w-full bg-[#FFFFFF]" />
          <div className="h-1/3 w-full bg-[#138808]" />
        </div>
      </div>

      {/* 4. LIVE 5-FIGHTER JET ECHELON SQUADRON FLYOVER (TRANSLUCENT SUPERSONIC SWEEP) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none [contain:strict] z-10 opacity-70 dark:opacity-55">
        <div className="absolute w-full h-full animate-jets-flyover-echelon [will-change:transform,opacity]">
          
          {/* JET 1: LEAD RIGHT / TOP VANGUARD - ORANGE/SAFFRON CONTRAIL */}
          <div className="absolute top-[28%] left-[34%] -translate-x-1/2 -translate-y-1/2 flex items-center">
            <div className="relative w-[500px] sm:w-[850px] lg:w-[1300px] h-6 sm:h-8 lg:h-10 -mr-3 flex items-center">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-[#FF671F]/40 via-[#FF7700]/50 to-[#FF8800]/50 rounded-l-full shadow-[0_0_15px_rgba(255,103,31,0.6)]" />
              <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[80%] h-3 sm:h-4 bg-[#FFA500]/60 rounded-l-full shadow-[0_0_10px_#FF671F]" />
            </div>
            <IafFighterJet size="md" tipColor="#FF671F" />
          </div>

          {/* JET 2: UPPER-LEFT WINGMAN - ORANGE/SAFFRON CONTRAIL */}
          <div className="absolute top-[34%] left-[22%] -translate-x-1/2 -translate-y-1/2 flex items-center">
            <div className="relative w-[480px] sm:w-[800px] lg:w-[1200px] h-5 sm:h-7 lg:h-9 -mr-3 flex items-center">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-[#FF671F]/40 via-[#FF7700]/50 to-[#FF8800]/50 rounded-l-full shadow-[0_0_15px_rgba(255,103,31,0.6)]" />
              <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[80%] h-2.5 sm:h-3.5 bg-[#FFA500]/60 rounded-l-full shadow-[0_0_10px_#FF671F]" />
            </div>
            <IafFighterJet size="sm" tipColor="#FF671F" />
          </div>

          {/* JET 3: CENTER SQUADRON LEADER - BRILLIANT CRISP WHITE CONTRAIL */}
          <div className="absolute top-[42%] left-[20%] -translate-x-1/2 -translate-y-1/2 flex items-center z-20">
            <div className="relative w-[550px] sm:w-[950px] lg:w-[1450px] h-7 sm:h-9 lg:h-11 -mr-3 flex items-center">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-[#E2E8F0]/40 via-[#FFFFFF]/60 to-[#FFFFFF]/60 rounded-l-full shadow-[0_0_20px_rgba(255,255,255,0.7)] border-y border-slate-400/30 dark:border-white/40" />
              <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[85%] h-3.5 sm:h-5 bg-white/70 rounded-l-full shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
            </div>
            <IafFighterJet size="lg" tipColor="#FFFFFF" />
          </div>

          {/* JET 4: MID-LOWER WINGMAN - VIBRANT INDIA GREEN CONTRAIL */}
          <div className="absolute top-[44%] left-[32%] -translate-x-1/2 -translate-y-1/2 flex items-center">
            <div className="relative w-[500px] sm:w-[850px] lg:w-[1300px] h-6 sm:h-8 lg:h-10 -mr-3 flex items-center">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-[#046A38]/40 via-[#138808]/50 to-[#00A859]/50 rounded-l-full shadow-[0_0_15px_rgba(19,136,8,0.6)]" />
              <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[80%] h-3 sm:h-4 bg-[#10B981]/60 rounded-l-full shadow-[0_0_10px_#138808]" />
            </div>
            <IafFighterJet size="md" tipColor="#138808" />
          </div>

          {/* JET 5: TRAILING LOWER-RIGHT WINGMAN - VIBRANT INDIA GREEN CONTRAIL */}
          <div className="absolute top-[49%] left-[40%] -translate-x-1/2 -translate-y-1/2 flex items-center">
            <div className="relative w-[480px] sm:w-[800px] lg:w-[1200px] h-5 sm:h-7 lg:h-9 -mr-3 flex items-center">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-[#046A38]/40 via-[#138808]/50 to-[#00A859]/50 rounded-l-full shadow-[0_0_15px_rgba(19,136,8,0.6)]" />
              <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[80%] h-2.5 sm:h-3.5 bg-[#10B981]/60 rounded-l-full shadow-[0_0_10px_#138808]" />
            </div>
            <IafFighterJet size="sm" tipColor="#138808" />
          </div>

        </div>
      </div>

      {/* 5. SOVEREIGN BHARAT GEO-RADAR BEACONS (DISASTER MONITORING CONTOUR) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[850px] lg:w-[1000px] h-[700px] sm:h-[900px] lg:h-[1050px] opacity-[0.14] dark:opacity-[0.22] flex items-center justify-center pointer-events-none transition-opacity duration-500 [transform:translate3d(-50%,-50%,0)]">
        <svg viewBox="0 0 1000 1100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="indiaHoloGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff9933" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#138808" stopOpacity="0.9" />
            </linearGradient>
            <radialGradient id="radarSweepGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#0284c7" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Rotating Radar Sweep */}
          <g className="animate-radar-sweep origin-[500px_550px] [will-change:transform]">
            <path d="M 500 550 L 880 430 A 420 420 0 0 0 500 130 Z" fill="url(#radarSweepGrad)" />
            <line x1="500" y1="550" x2="880" y2="430" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.7" />
          </g>

          {/* Precision Sovereign India Map Outline */}
          <path
            d="M 380 90 C 395 70, 430 65, 460 70 C 490 75, 520 95, 535 125 C 550 155, 570 170, 580 200 C 590 230, 560 250, 540 270 C 525 285, 510 300, 515 320 C 520 340, 550 350, 580 345 C 620 340, 680 330, 720 335 C 760 340, 810 330, 850 340 C 890 350, 930 380, 920 410 C 910 440, 860 450, 830 460 C 800 470, 760 465, 740 485 C 720 505, 730 540, 750 560 C 770 580, 750 610, 730 630 C 700 660, 680 690, 650 720 C 620 750, 590 790, 560 830 C 530 870, 500 920, 480 960 C 475 970, 465 970, 460 960 C 440 920, 410 860, 390 800 C 370 740, 350 680, 340 620 C 330 560, 300 520, 270 500 C 240 480, 200 475, 180 450 C 160 425, 170 390, 190 370 C 210 350, 240 340, 260 310 C 280 280, 290 230, 310 190 C 330 150, 365 110, 380 90 Z"
            stroke="url(#indiaHoloGrad)"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />

          {/* Active Sensor Beacons */}
          {radarStations.map((st, i) => {
            const cx = st.x * 10;
            const cy = st.y * 10;
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r="16" fill={st.color} fillOpacity="0.25" className="animate-ping" />
                <circle cx={cx} cy={cy} r="7" fill={st.color} stroke="#ffffff" strokeWidth="2" />
                <text
                  x={cx + 12}
                  y={cy + 4}
                  fill="currentColor"
                  className="text-slate-900 dark:text-cyan-200 font-mono text-[11px] font-bold tracking-wider"
                >
                  {st.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
