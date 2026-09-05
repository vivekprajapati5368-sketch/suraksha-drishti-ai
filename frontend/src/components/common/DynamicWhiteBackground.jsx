import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * DynamicWhiteBackground
 * A high-performance living background system featuring:
 * 1. Multi-spectral floating aurora light orbs (Azure Blue, Saffron Gold, Electric Purple, Emerald Teal, Royal Lavender).
 * 2. Real-time cursor-following luminous spotlight with smooth spring physics.
 * 3. Animated subtle tactical dot-grid mesh with depth parallax.
 * 4. Micro-wave refraction lines giving a living, breathing, ultra-premium canvas in White Mode.
 */
export function DynamicWhiteBackground() {
  const { isDark } = useTheme();
  const spotlightRef = useRef(null);
  const mouseTargetRef = useRef({ x: -500, y: -500, active: false });
  const currentPosRef = useRef({ x: -500, y: -500 });
  const rafId = useRef(null);
  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;

  useEffect(() => {
    let isRunning = false;

    const updateSpotlight = () => {
      const target = mouseTargetRef.current;
      const current = currentPosRef.current;

      const ease = 0.12;
      const dx = target.x - current.x;
      const dy = target.y - current.y;

      current.x += dx * ease;
      current.y += dy * ease;

      if (spotlightRef.current) {
        if (target.active) {
          spotlightRef.current.style.opacity = '1';
          const dark = isDarkRef.current;
          spotlightRef.current.style.background = dark
            ? `radial-gradient(600px circle at ${Math.round(current.x)}px ${Math.round(current.y)}px, rgba(59, 130, 246, 0.09), rgba(168, 85, 247, 0.05) 45%, transparent 75%)`
            : `radial-gradient(650px circle at ${Math.round(current.x)}px ${Math.round(current.y)}px, rgba(168, 85, 247, 0.14), rgba(59, 130, 246, 0.12) 30%, rgba(245, 158, 11, 0.08) 60%, transparent 80%)`;
        } else {
          spotlightRef.current.style.opacity = '0';
        }
      }

      // Auto-pause RAF when cursor stops moving to free CPU completely
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        rafId.current = requestAnimationFrame(updateSpotlight);
      } else {
        isRunning = false;
      }
    };

    const scheduleUpdate = () => {
      if (!isRunning) {
        isRunning = true;
        rafId.current = requestAnimationFrame(updateSpotlight);
      }
    };

    const handleMouseMove = (e) => {
      mouseTargetRef.current = { x: e.clientX, y: e.clientY, active: true };
      scheduleUpdate();
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        mouseTargetRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, active: true };
        scheduleUpdate();
      }
    };

    const handleMouseLeave = () => {
      mouseTargetRef.current.active = false;
      scheduleUpdate();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Animated Tactical Dot Grid with Slow Breathing Parallax */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isDark ? 'opacity-[0.03]' : 'opacity-[0.45]'
        }`}
        style={{
          backgroundImage: `radial-gradient(${isDark ? '#60a5fa' : '#64748b'} 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          animation: 'tactical-grid-drift 40s linear infinite'
        }}
      />

      {/* 2. Dynamic Interactive Cursor Spotlight (Direct DOM - 0 React Re-renders) */}
      <div
        ref={spotlightRef}
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none opacity-0"
        style={{ willChange: 'background, opacity' }}
      />

      {/* 3. Floating Living Aurora Orbs (White / Light Mode Spectrum) */}
      {!isDark && (
        <>
          {/* Orb 1: Vibrant Sky Blue / Azure Aura (Top-Left Drift) */}
          <div
            className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full blur-[140px] will-change-transform opacity-75"
            style={{
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 75%)',
              animation: 'aurora-float-1 22s ease-in-out infinite'
            }}
          />

          {/* Orb 2: Radiant Saffron Gold / Warm Amber (Top-Right Drift) */}
          <div
            className="absolute top-10 right-0 w-[600px] h-[600px] rounded-full blur-[140px] will-change-transform opacity-70"
            style={{
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.32) 0%, rgba(245, 158, 11, 0.18) 50%, transparent 75%)',
              animation: 'aurora-float-2 26s ease-in-out infinite'
            }}
          />

          {/* Orb 3: Electric Amethyst / Dynamic Purple (Center-Right Living Pulse) */}
          <div
            className="absolute top-1/3 right-1/4 w-[680px] h-[680px] rounded-full blur-[150px] will-change-transform opacity-75"
            style={{
              background: 'radial-gradient(circle, rgba(192, 132, 252, 0.35) 0%, rgba(168, 85, 247, 0.22) 50%, transparent 80%)',
              animation: 'aurora-float-3 24s ease-in-out infinite'
            }}
          />

          {/* Orb 4: Fresh Emerald Teal / Spring Mint (Center-Left Drift) */}
          <div
            className="absolute top-1/2 -left-28 w-[550px] h-[550px] rounded-full blur-[130px] will-change-transform opacity-65"
            style={{
              background: 'radial-gradient(circle, rgba(52, 211, 153, 0.28) 0%, rgba(16, 185, 129, 0.15) 50%, transparent 75%)',
              animation: 'aurora-float-4 28s ease-in-out infinite'
            }}
          />

          {/* Orb 5: Royal Indigo / Deep Lavender (Bottom-Right Swell) */}
          <div
            className="absolute -bottom-24 right-1/6 w-[620px] h-[620px] rounded-full blur-[150px] will-change-transform opacity-70"
            style={{
              background: 'radial-gradient(circle, rgba(129, 140, 248, 0.32) 0%, rgba(99, 102, 241, 0.18) 50%, transparent 80%)',
              animation: 'aurora-float-1 30s ease-in-out infinite reverse'
            }}
          />

          {/* Orb 6: Soft Oceanic Cyan (Bottom-Center Glide) */}
          <div
            className="absolute -bottom-20 left-1/3 w-[550px] h-[550px] rounded-full blur-[140px] will-change-transform opacity-60"
            style={{
              background: 'radial-gradient(circle, rgba(34, 211, 238, 0.25) 0%, rgba(14, 165, 233, 0.14) 50%, transparent 75%)',
              animation: 'aurora-float-2 25s ease-in-out infinite reverse'
            }}
          />
        </>
      )}

      {/* 4. Subtle Topographic Contour Waves Overlay (Light Mode Only) */}
      {!isDark && (
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="tactical-topo-pattern" width="160" height="160" patternUnits="userSpaceOnUse">
              <path
                d="M0 80 Q 40 40 80 80 T 160 80 M0 120 Q 40 80 80 120 T 160 120 M0 40 Q 40 0 80 40 T 160 40"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tactical-topo-pattern)" />
        </svg>
      )}
    </div>
  );
}
