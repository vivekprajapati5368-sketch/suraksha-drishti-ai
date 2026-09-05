import React, { useRef, useState, useEffect } from 'react';

/**
 * DynamicPurpleBox
 * A high-performance interactive purple dynamic container that responds to mouse movement
 * with rotating gradient borders, cursor-following purple spotlight, 3D perspective tilt,
 * and high-contrast styling for both White Board / Light Mode and Dark Mode.
 */
export function DynamicPurpleBox({
  children,
  className = '',
  title = null,
  subtitle = null,
  badge = null,
  icon: Icon = null,
  actions = null,
  glowIntensity = 'normal', // 'soft', 'normal', 'vibrant'
  enableTilt = true,
  onClick = null
}) {
  const boxRef = useRef(null);
  const spotlightRef = useRef(null);
  const borderRef = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;

    const handlePointerMove = (e) => {
      if (rafId.current) cancelAnimationFrame(rafId.current);

      rafId.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
        const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);

        if (clientX === undefined || clientY === undefined) return;

        const relX = clientX - rect.left;
        const relY = clientY - rect.top;

        const xPct = Math.max(0, Math.min(100, (relX / rect.width) * 100));
        const yPct = Math.max(0, Math.min(100, (relY / rect.height) * 100));

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const deltaX = relX - centerX;
        const deltaY = relY - centerY;

        const angle = Math.round((Math.atan2(deltaY, deltaX) * 180) / Math.PI + 180);

        if (enableTilt) {
          const tiltY = ((xPct - 50) * 0.05).toFixed(2);
          const tiltX = ((yPct - 50) * -0.05).toFixed(2);
          el.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        }

        if (spotlightRef.current) {
          spotlightRef.current.style.opacity = '0.95';
          spotlightRef.current.style.background = `radial-gradient(450px circle at ${Math.round(xPct)}% ${Math.round(yPct)}%, rgba(168, 85, 247, 0.16), rgba(99, 102, 241, 0.08) 40%, transparent 80%)`;
        }

        if (borderRef.current) {
          borderRef.current.style.opacity = '0.8';
          borderRef.current.style.background = `linear-gradient(${angle}deg, rgba(192, 132, 252, 0.6) 0%, rgba(147, 51, 234, 0.4) 30%, rgba(99, 102, 241, 0.3) 60%, transparent 90%)`;
        }
      });
    };

    const handleMouseEnter = () => {
      if (spotlightRef.current) spotlightRef.current.style.opacity = '0.95';
      if (borderRef.current) borderRef.current.style.opacity = '0.8';
    };

    const handleMouseLeave = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (enableTilt) {
        el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
      }
      if (spotlightRef.current) {
        spotlightRef.current.style.opacity = '0.4';
        spotlightRef.current.style.background = 'radial-gradient(450px circle at 50% 50%, rgba(168, 85, 247, 0.16), rgba(99, 102, 241, 0.08) 40%, transparent 80%)';
      }
      if (borderRef.current) {
        borderRef.current.style.opacity = '0.2';
        borderRef.current.style.background = 'linear-gradient(135deg, rgba(192, 132, 252, 0.6) 0%, rgba(147, 51, 234, 0.4) 30%, rgba(99, 102, 241, 0.3) 60%, transparent 90%)';
      }
    };

    el.addEventListener('mousemove', handlePointerMove, { passive: true });
    el.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    el.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      el.removeEventListener('mousemove', handlePointerMove);
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [enableTilt]);

  return (
    <div
      ref={boxRef}
      onClick={onClick}
      style={{
        transform: 'perspective(800px) rotateX(0deg) rotateY(0deg)',
        transition: 'transform 0.25s ease-out, box-shadow 0.25s ease-out'
      }}
      className={`group relative rounded-2xl overflow-hidden transition-all duration-300 border ${
        'bg-white/95 border-purple-200/90 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-600/20 hover:border-purple-400 ' +
        'dark:bg-[#0c0d1e]/90 dark:border-purple-500/40 dark:shadow-2xl dark:shadow-purple-950/50 dark:hover:border-purple-400/80 ' +
        className
      }`}
    >
      {/* Dynamic Purple Spotlight Mesh */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-0 opacity-40"
        style={{
          background: 'radial-gradient(450px circle at 50% 50%, rgba(168, 85, 247, 0.16), rgba(99, 102, 241, 0.08) 40%, transparent 80%)'
        }}
      />

      {/* Dynamic Rotating Border Accent Sheen */}
      <div
        ref={borderRef}
        className="pointer-events-none absolute -inset-[1px] rounded-2xl transition-opacity duration-300 z-0 opacity-20"
        style={{
          background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.6) 0%, rgba(147, 51, 234, 0.4) 30%, rgba(99, 102, 241, 0.3) 60%, transparent 90%)',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px'
        }}
      />

      {/* Top Decorative Purple Flare Line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-violet-400 to-indigo-500 z-10" />

      {/* Content Area */}
      <div className="relative z-10 p-5 sm:p-6">
        {(title || badge || Icon || actions) && (
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-purple-100 dark:border-purple-900/40">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="p-2.5 rounded-xl bg-purple-100/90 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50 shadow-sm flex items-center justify-center">
                  <Icon className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  {title && (
                    <h3 className="font-display font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                      {title}
                    </h3>
                  )}
                  {badge && (
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-500/40">
                      {badge}
                    </span>
                  )}
                </div>
                {subtitle && (
                  <p className="text-xs text-slate-600 dark:text-purple-200/70 mt-0.5 font-medium">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
