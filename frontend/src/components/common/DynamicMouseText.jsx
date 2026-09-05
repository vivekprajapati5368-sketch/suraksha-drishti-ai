import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * DynamicMouseText (Zero-Re-Render 120 FPS Edition)
 * High-performance interactive text component whose gradients and 3D sheen
 * react to mouse movement via direct GPU compositing without React re-renders.
 */
export function DynamicMouseText({
  children,
  as: Component = 'span',
  className = '',
  variant = 'brand', // 'brand' | 'hero' | 'amber' | 'blue' | 'stat'
  interactive3D = true,
  glowIntensity = 'md'
}) {
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const { isDark } = useTheme();

  // Initial base styling based on theme
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (variant === 'brand') {
      if (isDark) {
        el.style.backgroundImage = 'radial-gradient(circle at 50% 50%, #ffffff 0%, #facc15 35%, #38bdf8 70%, #fbbf24 100%)';
        el.style.backgroundSize = '200% 200%';
        el.style.WebkitBackgroundClip = 'text';
        el.style.WebkitTextFillColor = 'transparent';
        el.style.textShadow = '0 0 15px rgba(56, 189, 248, 0.25)';
      } else {
        el.style.backgroundImage = 'radial-gradient(circle at 50% 50%, #b45309 0%, #1d4ed8 40%, #4338ca 75%, #0f172a 100%)';
        el.style.backgroundSize = '200% 200%';
        el.style.WebkitBackgroundClip = 'text';
        el.style.WebkitTextFillColor = 'transparent';
        el.style.textShadow = 'none';
      }
    } else if (variant === 'hero') {
      if (isDark) {
        el.style.backgroundImage = 'radial-gradient(circle at 50% 50%, #ffffff 0%, #e2e8f0 30%, #94a3b8 70%, #ffffff 100%)';
        el.style.backgroundSize = '200% 200%';
        el.style.WebkitBackgroundClip = 'text';
        el.style.WebkitTextFillColor = 'transparent';
      } else {
        el.style.backgroundImage = 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 35%, #1d4ed8 70%, #0f172a 100%)';
        el.style.backgroundSize = '200% 200%';
        el.style.WebkitBackgroundClip = 'text';
        el.style.WebkitTextFillColor = 'transparent';
      }
    } else if (variant === 'amber') {
      const c1 = isDark ? '#facc15' : '#b45309';
      const c2 = isDark ? '#ffffff' : '#d97706';
      el.style.backgroundImage = `radial-gradient(circle at 50% 50%, ${c2} 0%, ${c1} 60%)`;
      el.style.backgroundSize = '200% 200%';
      el.style.WebkitBackgroundClip = 'text';
      el.style.WebkitTextFillColor = 'transparent';
    }

    el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg)';
    el.style.transition = 'transform 0.2s ease-out, text-shadow 0.2s ease-out';
  }, [isDark, variant]);

  const handleMouseMove = (e) => {
    const el = containerRef.current;
    if (!el) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const localX = Math.round(((e.clientX - rect.left) / (rect.width || 1)) * 100);
      const localY = Math.round(((e.clientY - rect.top) / (rect.height || 1)) * 100);
      const deltaX = (localX - 50) / 10;
      const deltaY = (localY - 50) / 10;
      const tiltX = interactive3D ? Math.max(-4, Math.min(4, -deltaY)) : 0;
      const tiltY = interactive3D ? Math.max(-4, Math.min(4, deltaX)) : 0;

      el.style.backgroundPosition = `${localX}% ${localY}%`;
      el.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      if (variant === 'brand') {
        el.style.textShadow = isDark
          ? '0 0 25px rgba(250, 204, 21, 0.45)'
          : '0 2px 14px rgba(29, 78, 216, 0.25)';
      }
    });
  };

  const handleMouseLeave = () => {
    const el = containerRef.current;
    if (!el) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    el.style.backgroundPosition = '50% 50%';
    el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg)';
    if (variant === 'brand') {
      el.style.textShadow = isDark ? '0 0 15px rgba(56, 189, 248, 0.25)' : 'none';
    }
  };

  return (
    <Component
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block cursor-default select-none will-change-transform ${className}`}
    >
      {children}
    </Component>
  );
}
