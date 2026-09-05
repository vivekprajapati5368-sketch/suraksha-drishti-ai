import React from 'react';

export function Badge({ children, variant = 'default', size = 'md', pulse = false }) {
  const variantStyles = {
    critical: 'bg-red-50 text-red-700 border border-red-200 shadow-sm dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/50',
    high: 'bg-orange-50 text-orange-800 border border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/50',
    medium: 'bg-amber-50 text-amber-900 border border-amber-300 font-bold dark:bg-yellow-400/20 dark:text-yellow-300 dark:border-yellow-400/50',
    low: 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/50',
    red: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/50',
    orange: 'bg-orange-50 text-orange-800 border border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/50',
    yellow: 'bg-amber-50 text-amber-900 border border-amber-300 font-bold dark:bg-yellow-400/20 dark:text-yellow-300 dark:border-yellow-400/50',
    amber: 'bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/50',
    green: 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/50',
    info: 'bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-400/50',
    blue: 'bg-blue-50 text-blue-800 border border-blue-200 font-semibold dark:bg-blue-600/25 dark:text-blue-200 dark:border-blue-400/60',
    white: 'bg-slate-100 text-slate-800 border border-slate-200 font-semibold dark:bg-white/15 dark:text-white dark:border-white/40',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700/60',
    default: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
  };

  const sizeStyles = {
    sm: 'text-[10px] font-mono px-2 py-0.5 rounded-md',
    md: 'text-xs font-medium px-2.5 py-1 rounded-lg',
    lg: 'text-sm font-semibold px-3 py-1.5 rounded-xl'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.default}`}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            variant === 'critical' || variant === 'red' 
              ? 'bg-red-400' 
              : variant === 'yellow' || variant === 'medium'
              ? 'bg-yellow-400'
              : 'bg-blue-400'
          }`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            variant === 'critical' || variant === 'red' 
              ? 'bg-red-500' 
              : variant === 'yellow' || variant === 'medium'
              ? 'bg-yellow-400'
              : 'bg-blue-500'
          }`}></span>
        </span>
      )}
      {children}
    </span>
  );
}
