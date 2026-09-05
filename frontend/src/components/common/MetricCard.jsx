import React from 'react';
import { DynamicMouseText } from './DynamicMouseText';

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  trend,
  badge
}) {
  const borderColors = {
    red: 'border-l-red-500 hover:border-red-500/70 shadow-red-500/5',
    orange: 'border-l-orange-500 hover:border-orange-500/70 shadow-orange-500/5',
    amber: 'border-l-amber-500 hover:border-amber-500/80 shadow-amber-500/10',
    yellow: 'border-l-amber-500 hover:border-amber-400 shadow-amber-500/10',
    green: 'border-l-emerald-500 hover:border-emerald-500/70 shadow-emerald-500/5',
    blue: 'border-l-blue-600 hover:border-blue-500/80 shadow-blue-500/10',
    purple: 'border-l-indigo-500 hover:border-indigo-500/70 shadow-indigo-500/5'
  };

  const iconBg = {
    red: 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30',
    orange: 'bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-yellow-400/20 dark:text-yellow-300 dark:border-yellow-400/40',
    yellow: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-yellow-400/20 dark:text-yellow-300 dark:border-yellow-400/50',
    green: 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    blue: 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-600/20 dark:text-blue-300 dark:border-blue-400/40',
    purple: 'bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30'
  };

  return (
    <div className={`relative overflow-hidden bg-white dark:bg-gradient-to-br dark:from-command-900/95 dark:via-[#0b1833]/90 dark:to-[#071124]/95 backdrop-blur-md rounded-2xl p-5 border border-slate-200/90 dark:border-blue-900/40 border-l-4 ${borderColors[variant] || borderColors.blue} shadow-md shadow-slate-200/50 dark:shadow-xl dark:shadow-black/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500/40 group`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold tracking-wider uppercase text-slate-600 dark:text-blue-300/80 font-mono">{title}</p>
          <div className="flex items-baseline gap-2.5">
            <DynamicMouseText variant="stat" className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono drop-shadow-sm">
              {value}
            </DynamicMouseText>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && <p className="text-xs text-slate-600 dark:text-slate-300 font-medium pt-0.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${iconBg[variant] || iconBg.blue} shadow-sm group-hover:scale-110 transition-transform duration-200`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-blue-900/30 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">{trend.label}</span>
          <span className={`font-mono font-bold ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-yellow-400'}`}>
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
}
