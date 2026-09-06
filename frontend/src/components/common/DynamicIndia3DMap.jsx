import React, { useState, useEffect } from 'react';
import { Maximize2, ChevronDown, ChevronUp, Compass, MapPin, X } from 'lucide-react';
import indiaMapAsset from '../../assets/india_3d_relief_map.png';

/**
 * Dynamic 3D Political Relief Map of India (Sidebar Tactical GIS)
 * Completely stabilized:
 * - Zero layout thrashing or vertical jumping (fixed-height HUD status bar)
 * - Zero transform jitter/vibration on mousemove, hover, or click
 * - Interactive hotspot pins with instant telemetry feedback
 * - Smooth Full-Screen Modal Inspector on click
 */
export function DynamicIndia3DMap({ currentPath, className = '' }) {
  // Check if current page is data-heavy
  const isDataPage = ['/habitations', '/hazard-zones', '/safe-zones', '/relocation', '/analytics', '/reports'].includes(currentPath);
  
  // State for minimized mode
  const [isMinimized, setIsMinimized] = useState(() => isDataPage);

  // Auto-minimize when navigating to data pages, expand on overview pages
  useEffect(() => {
    if (isDataPage) {
      setIsMinimized(true);
    }
  }, [currentPath, isDataPage]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePin, setActivePin] = useState(null);

  // Lock body scroll and handle Escape key when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setIsModalOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isModalOpen]);

  // Strategic Hotspots mapped to India Map coordinates
  const hotspots = [
    { id: 'delhi', name: 'National Situation Room (NCR)', state: 'New Delhi', lat: '28.61° N', lon: '77.20° E', top: '32%', left: '35%', color: 'blue', status: 'COMMAND HQ' },
    { id: 'uk', name: 'Joshimath / Chamoli Belt', state: 'Uttarakhand', lat: '30.55° N', lon: '79.56° E', top: '26%', left: '42%', color: 'red', status: 'CRITICAL HAZARD' },
    { id: 'hp', name: 'Kinnaur & Kullu Slopes', state: 'Himachal Pradesh', lat: '31.65° N', lon: '77.10° E', top: '21%', left: '36%', color: 'amber', status: 'MONITORED' },
    { id: 'assam', name: 'Brahmaputra Valley Sector', state: 'Assam', lat: '26.20° N', lon: '92.93° E', top: '38%', left: '80%', color: 'purple', status: 'INUNDATION WATCH' },
    { id: 'kerala', name: 'Wayanad / Idukki Ridge', state: 'Kerala', lat: '10.85° N', lon: '76.27° E', top: '86%', left: '28%', color: 'emerald', status: 'SATURATED SOIL' },
    { id: 'odisha', name: 'Coastal Surge Corridors', state: 'Odisha', lat: '20.95° N', lon: '85.09° E', top: '56%', left: '59%', color: 'amber', status: 'CYCLONE READY' }
  ];

  return (
    <>
      <div className={`p-2 select-none ${className}`}>
        {/* Minimized View: Compact High-Tech HUD Pill */}
        {isMinimized ? (
          <div
            onClick={() => setIsMinimized(false)}
            className="group cursor-pointer p-2.5 rounded-xl bg-white dark:bg-gradient-to-br dark:from-[#09142b] dark:to-command-950 border-2 border-slate-200 dark:border-blue-900/60 shadow-sm hover:border-amber-500 dark:hover:border-cyberyellow-400 transition-all flex items-center justify-between gap-2"
            title="Click to Expand 3D Relief Political Map of India"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 border border-amber-400/80 shadow-sm">
                <img src={indiaMapAsset} alt="India 3D Map Thumbnail" className="w-full h-full object-cover" />
                <span className="absolute inset-0 bg-blue-500/10 animate-pulse" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-mono font-black text-slate-950 dark:text-white uppercase truncate">
                    India 3D Tactical GIS
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-600 dark:text-cyberyellow-400 truncate font-bold">
                  28 States • 8 UTs Active (Click to Expand)
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-blue-950/80 transition flex-shrink-0"
              title="Expand 3D Map"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Expanded View: Full Dynamic 3D Relief Map */
          <div
            className="relative rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#0b1736] dark:to-command-950 border-2 border-slate-300 dark:border-cyberblue-800 shadow-xl overflow-hidden group"
          >
            {/* Top Tactical Header Bar */}
            <div className="p-2.5 bg-slate-50 dark:bg-command-950/90 border-b border-slate-200 dark:border-cyberblue-900/80 flex items-center justify-between gap-1 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
                <span className="text-[10px] font-mono font-black text-slate-950 dark:text-cyberyellow-400 uppercase tracking-wide">
                  INDIA 3D RELIEF GIS
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="p-1 rounded-md text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-blue-900/60 transition"
                  title="Inspect Fullscreen 3D Map"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 rounded-md text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-blue-900/60 transition"
                  title="Minimize Map to Save Space"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Map Canvas with Dynamic Overlays */}
            <div
              className="relative w-full aspect-[4/5] bg-sky-950/20 overflow-hidden cursor-pointer"
              onClick={() => setIsModalOpen(true)}
              title="Click to Open Fullscreen Tactical Inspector"
            >
              {/* The 3D Relief Political Map Image */}
              <img
                src={indiaMapAsset}
                alt="3D Relief Political Map of India"
                className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                loading="lazy"
              />

              {/* Dynamic Rotating Conical Radar Sweep */}
              <div
                className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen"
                style={{
                  background: 'conic-gradient(from 0deg at 45% 45%, rgba(56, 189, 248, 0.4) 0deg, rgba(250, 204, 21, 0.15) 60deg, transparent 90deg, transparent 360deg)',
                  borderRadius: '50%',
                  animation: 'radar-sweep 8s linear infinite',
                  transformOrigin: '45% 45%'
                }}
              />

              {/* Ambient High-Tech Glare Sheen on Hover */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Central Radar Pulse Rings */}
              <div
                className="absolute top-[45%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-cyan-400/30 pointer-events-none animate-ping"
                style={{ animationDuration: '4s' }}
              />

              {/* Live Hazard Hotspot Pins */}
              {hotspots.map((pin) => {
                const isSelected = activePin?.id === pin.id;
                const colorClasses = {
                  red: 'bg-red-500 border-red-200 text-red-100 shadow-red-500/50',
                  amber: 'bg-amber-500 border-amber-200 text-amber-100 shadow-amber-500/50',
                  purple: 'bg-purple-500 border-purple-200 text-purple-100 shadow-purple-500/50',
                  blue: 'bg-blue-500 border-blue-200 text-blue-100 shadow-blue-500/50',
                  emerald: 'bg-emerald-500 border-emerald-200 text-emerald-100 shadow-emerald-500/50'
                }[pin.color] || 'bg-amber-500 border-amber-200 text-amber-100';

                return (
                  <div
                    key={pin.id}
                    style={{ top: pin.top, left: pin.left }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/pin cursor-pointer"
                    onMouseEnter={() => setActivePin(pin)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePin(activePin?.id === pin.id ? null : pin);
                    }}
                  >
                    <div className="relative flex items-center justify-center p-1.5">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border-2 shadow-lg transition-transform duration-150 ${colorClasses} ${
                          isSelected ? 'scale-125 ring-2 ring-yellow-400' : 'group-hover/pin:scale-125'
                        }`}
                      />
                      <span
                        className="absolute w-5 h-5 rounded-full border border-white/50 animate-ping pointer-events-none"
                        style={{ animationDuration: '3s' }}
                      />
                    </div>

                    {/* Micro Tooltip */}
                    <div className="hidden group-hover/pin:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg bg-slate-950 text-white text-[9px] font-mono whitespace-nowrap shadow-2xl border border-cyberyellow-400/80 z-30 pointer-events-none">
                      <div className="font-black text-cyberyellow-400">{pin.name}</div>
                      <div className="text-[8px] text-slate-300 font-bold">{pin.state} • {pin.status}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Static Fixed-Height Tactical Status Bar (Zero Layout Shift) */}
            <div
              className="h-9 px-2.5 bg-slate-900 dark:bg-command-950 border-t border-slate-200 dark:border-blue-900/60 text-[10px] font-mono text-white flex items-center justify-between flex-shrink-0 cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              {activePin ? (
                <>
                  <div className="flex items-center gap-1.5 min-w-0 pr-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="font-black text-amber-400 truncate">{activePin.name}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[8px] font-mono font-black uppercase tracking-wider flex-shrink-0 whitespace-nowrap">
                    {activePin.status}
                  </span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-slate-300 dark:text-blue-300/80 font-bold truncate">
                    <Compass className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="truncate">PAN-INDIA 3D RELIEF</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-200 text-[8px] font-mono uppercase tracking-wider flex-shrink-0 whitespace-nowrap">
                    CLICK TO INSPECT
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* High-Resolution Full-Screen Modal Inspector */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border-2 border-amber-400 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
                <h3 className="font-display font-black text-base sm:text-lg text-white uppercase tracking-tight">
                  INDIA: 3D POLITICAL & TOPOGRAPHIC RELIEF MAP
                </h3>
                <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-[10px] font-mono font-bold">
                  28 STATES • 8 UNION TERRITORIES
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex-shrink-0"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Viewport */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#07132a]">
              <div className="relative max-w-full max-h-[70vh]">
                <img
                  src={indiaMapAsset}
                  alt="High Resolution 3D Relief Political Map of India"
                  className="max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
                />
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between flex-shrink-0">
              <span className="truncate pr-2">National Disaster Intelligence & Autonomous Relocation Geospatial Model</span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black tracking-wide transition flex-shrink-0"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
