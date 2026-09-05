import React from 'react';

/**
 * Dynamic Indian Flag Logo (Suraksha Drishti Emblem)
 * Features:
 * - Authentic Indian National Tricolor (Saffron #FF9933, White #FFFFFF, Green #138808)
 * - Dynamic rotating 24-spoke Ashoka Chakra in Navy Blue (#000080)
 * - Cyber-shield / hex-cut bezel with gold & cobalt border glow
 * - Dynamic light-sweep shimmer effect
 * - Works seamlessly across both Dark and White modes
 */
export function IndianFlagLogo({ size = 'md', animated = true, showGlow = true, className = '' }) {
  // Dimension mappings
  const dimensions = {
    sm: { box: 'w-9 h-9', pixel: 36, chakraSize: 14 },
    md: { box: 'w-11 h-11', pixel: 44, chakraSize: 18 },
    lg: { box: 'w-16 h-16', pixel: 64, chakraSize: 26 },
    xl: { box: 'w-20 h-20', pixel: 80, chakraSize: 32 }
  };

  const config = dimensions[size] || dimensions.md;

  // Generate 24 spokes for Ashoka Chakra (every 15 degrees)
  const spokes = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 15 * Math.PI) / 180;
    const r = 42; // radius percentage in viewBox 100x100
    const x = 50 + r * Math.cos(angle);
    const y = 50 + r * Math.sin(angle);
    return { x, y };
  });

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 indian-flag-logo-container rounded-full ${config.box} ${className} select-none group`}
      style={{
        width: `${config.pixel}px`,
        height: `${config.pixel}px`,
        minWidth: `${config.pixel}px`,
        minHeight: `${config.pixel}px`,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxSizing: 'border-box'
      }}
      title="Republic of India • National Disaster Decision Support Emblem"
    >
      {/* Outer Ambient Glow (Golden Yellow & Saffron / Cyan) */}
      {showGlow && (
        <div
          className={`absolute -inset-1 rounded-full opacity-75 blur-md transition-all duration-700 pointer-events-none no-print ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 103, 31, 0.6) 0%, rgba(250, 204, 21, 0.4) 50%, rgba(19, 136, 8, 0.6) 100%)'
          }}
        />
      )}

      {/* Circular Emblem Enclosure with Metallic Gold & Cobalt Bezel */}
      <div
        className="relative w-full h-full rounded-full p-[2px] bg-gradient-to-br from-amber-400 via-yellow-200 to-blue-600 shadow-xl shadow-amber-500/20 overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-amber-500/35"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '1.5px solid #d97706',
          boxSizing: 'border-box',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Flag Canvas (Tricolor) */}
        <div
          className="relative w-full h-full rounded-full overflow-hidden flex flex-col shadow-inner"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Top: Saffron (Kesari) Band */}
          <div
            className="flex-1 w-full relative"
            style={{
              flex: '1 1 0%',
              width: '100%',
              height: '33.33%',
              backgroundColor: '#FF671F',
              background: 'linear-gradient(90deg, #FF671F, #FF9933)',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          </div>

          {/* Middle: Pure White (Shweta) Band */}
          <div
            className="flex-1 w-full relative flex items-center justify-center"
            style={{
              flex: '1 1 0%',
              width: '100%',
              height: '33.34%',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
            }}
          >
            
            {/* Dynamic Ashoka Chakra (Rotating 24-Spoke Wheel) */}
            <div
              className={`relative flex items-center justify-center z-10 ${
                animated ? 'animate-spin-slow' : ''
              }`}
              style={{
                width: `${config.chakraSize}px`,
                height: `${config.chakraSize}px`,
                minWidth: `${config.chakraSize}px`,
                minHeight: `${config.chakraSize}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: animated ? 'chakra-spin 18s linear infinite' : 'none'
              }}
            >
              <svg
                viewBox="0 0 100 100"
                style={{
                  width: `${config.chakraSize}px`,
                  height: `${config.chakraSize}px`,
                  display: 'block'
                }}
                className="w-full h-full drop-shadow-[0_0_2px_rgba(0,0,128,0.4)]"
              >
                {/* Outer Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#000080"
                  strokeWidth="6"
                />
                
                {/* Inner Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="12"
                  fill="#000080"
                />
                
                {/* Center Golden/Cyan Pivot Dot */}
                <circle
                  cx="50"
                  cy="50"
                  r="5"
                  fill="#FFFFFF"
                />

                {/* 24 Radial Spokes */}
                {spokes.map((spoke, idx) => (
                  <line
                    key={idx}
                    x1="50"
                    y1="50"
                    x2={spoke.x}
                    y2={spoke.y}
                    stroke="#000080"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Bottom: India Green (Hara) Band */}
          <div
            className="flex-1 w-full relative"
            style={{
              flex: '1 1 0%',
              width: '100%',
              height: '33.33%',
              backgroundColor: '#138808',
              background: 'linear-gradient(90deg, #046A38, #138808)',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>

          {/* Dynamic Light-Sweep Diagonal Shimmer */}
          {animated && (
            <div
              className="absolute inset-0 pointer-events-none no-print animate-shimmer"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.45) 50%, transparent 100%)',
                animation: 'flag-shimmer 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                width: '100%',
                height: '100%',
                borderRadius: '50%'
              }}
            />
          )}

          {/* Inner Concentric Hairline Rim */}
          <div
            className="absolute inset-0 rounded-full border border-white/30 pointer-events-none"
            style={{ borderRadius: '50%' }}
          />

          {/* Glass Luster Sheen Overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/15 pointer-events-none"
            style={{ borderRadius: '50%' }}
          />
        </div>
      </div>
    </div>
  );
}
