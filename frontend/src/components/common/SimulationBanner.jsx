import React from 'react';
import { AlertTriangle, RefreshCw, Zap, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';

export function SimulationBanner({ simulation, onReset, onNavigateToSimulator }) {
  if (!simulation || !simulation.is_simulating) return null;

  return (
    <div className="bg-amber-50 dark:bg-gradient-to-r dark:from-command-900/95 dark:via-yellow-950/70 dark:to-command-900/95 border-b border-amber-300 dark:border-yellow-400/50 text-slate-900 dark:text-white px-4 py-2.5 shadow-md dark:shadow-xl backdrop-blur-md relative z-30">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 text-slate-800 dark:text-blue-100">
          <span className="relative flex h-3 w-3 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 dark:bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 dark:bg-yellow-400"></span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-black text-amber-700 dark:text-yellow-400 uppercase tracking-wider flex items-center gap-1 font-mono text-xs">
              <Zap className="w-4 h-4 text-amber-600 dark:text-yellow-400 fill-amber-500 dark:fill-yellow-400" />
              SIMULATION ACTIVE:
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white">{simulation.event_type}</span>
            <span className="hidden md:inline text-slate-400 dark:text-blue-300">•</span>
            <span className="text-slate-700 dark:text-blue-200/90 line-clamp-1 font-medium">{simulation.simulation_message}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {onNavigateToSimulator && (
            <button
              onClick={onNavigateToSimulator}
              className="px-3 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-yellow-400/20 dark:hover:bg-yellow-400/30 text-amber-800 dark:text-yellow-300 border border-amber-300 dark:border-yellow-400/40 transition flex items-center gap-1.5 font-bold text-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Simulator Console
            </button>
          )}
          <button
            onClick={onReset}
            className="px-3 py-1 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-yellow-500/25 hover:from-yellow-300 hover:to-amber-300"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Baseline
          </button>
        </div>
      </div>
    </div>
  );
}
