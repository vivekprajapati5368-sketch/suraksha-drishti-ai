import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Flame,
  Home,
  ShieldCheck,
  Compass,
  AlertTriangle,
  BarChart3,
  FileText,
  SlidersHorizontal,
  MessagesSquare,
  Database,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { IndianFlagLogo } from '../common/IndianFlagLogo';
import { DynamicIndia3DMap } from '../common/DynamicIndia3DMap';

export function Sidebar({ currentPath, onNavigate, mobileOpen, onCloseMobile }) {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Executive Situation Room', icon: LayoutDashboard, path: '/' },
    { id: 'govt-data', label: 'Govt Data & Safety Predictor', icon: Database, path: '/govt-data', badge: 'NEW' },
    { id: 'discussion', label: 'Crisis Council & Discussion', icon: MessagesSquare, path: '/discussion', badge: 'LIVE' },
    { id: 'map', label: 'Live Risk Map & GIS Layers', icon: MapPin, path: '/map' },
    { id: 'habitations', label: 'Vulnerable Habitations', icon: Home, path: '/habitations' },
    { id: 'hazard-zones', label: 'Hazard-Based Red Zones', icon: Flame, path: '/hazard-zones' },
    { id: 'safe-zones', label: 'Safe Havens & Carrying Cap.', icon: ShieldCheck, path: '/safe-zones' },
    { id: 'relocation', label: 'Relocation Intelligence', icon: Compass, path: '/relocation' },
    { id: 'simulator', label: 'Calamity Alert Simulator', icon: AlertTriangle, path: '/simulator' },
    { id: 'analytics', label: 'Disaster Trends & Analysis', icon: BarChart3, path: '/analytics' },
    { id: 'reports', label: 'MHA Decision Dossiers', icon: FileText, path: '/reports' },
    { id: 'admin', label: 'Administration & Weights', icon: SlidersHorizontal, path: '/admin', roles: ['admin', 'authority'] }
  ];

  const filteredNav = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  });

  const content = (
    <div className="flex flex-col h-full bg-white/95 dark:bg-command-900/95 border-r border-slate-200/90 dark:border-cyberblue-900/50 w-64 select-none backdrop-blur-md">
      {/* Sidebar Header for Mobile */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200/90 dark:border-cyberblue-900/50">
        <div className="flex items-center gap-2">
          <IndianFlagLogo size="sm" />
          <div className="flex flex-col">
            <span className="font-extrabold text-sm text-slate-900 dark:text-white font-heading">SURAKSHA DRISHTI . AI</span>
            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-yellow-400">surakshadrishti.ai</span>
          </div>
        </div>
        <button onClick={onCloseMobile} className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:bg-blue-950/60">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-amber-800 dark:text-yellow-400 mb-2 font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-yellow-400"></span>
          DECISION MODULES
        </p>

        {filteredNav.map(item => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.path);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`sidebar-item-btn w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                isActive
                  ? 'is-active bg-blue-100/90 text-blue-950 font-extrabold border-l-4 border-l-amber-500 border-y border-r border-blue-300 shadow-sm dark:bg-gradient-to-r dark:from-blue-900/90 dark:via-blue-900/50 dark:to-yellow-400/10 dark:text-white dark:border-l-yellow-400 dark:border-blue-500/40 dark:shadow-lg dark:shadow-blue-950/50'
                  : 'text-slate-800 hover:bg-slate-100 hover:text-blue-950 font-bold dark:text-slate-200 dark:hover:bg-blue-950/50 dark:hover:text-yellow-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-700 dark:text-yellow-400' : 'text-slate-600 dark:text-blue-400/80'}`} />
                <span className={`truncate ${isActive ? 'text-blue-950 font-black dark:text-white' : 'text-slate-800 font-bold dark:text-slate-200'}`}>
                  {item.label}
                </span>
              </div>
              {item.badge && (
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${
                  item.badge === 'LIVE'
                    ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-900/70 dark:text-purple-300 dark:border-purple-500/60 shadow-sm shadow-purple-500/20'
                    : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-yellow-400/20 dark:text-yellow-300 dark:border-yellow-400/40'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* System Status Footer & Dynamic 3D Tactical India Map */}
      <div className="border-t border-slate-200/90 dark:border-blue-900/50 bg-slate-50/90 dark:bg-command-950/90 flex flex-col flex-shrink-0">
        <div className="p-3 pb-1.5">
          <div className="p-3 rounded-xl bg-white dark:bg-gradient-to-br dark:from-[#0c1a38] dark:to-command-950 border border-slate-200 dark:border-blue-800/50 text-[11px] space-y-1.5 shadow-sm dark:shadow-inner">
            <div className="flex items-center justify-between text-slate-600 dark:text-blue-200/80">
              <span className="font-mono text-[10px] uppercase font-bold">GIS Decision Engine</span>
              <span className="text-amber-700 dark:text-yellow-400 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-yellow-400 animate-pulse"></span>
                ONLINE
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-300 mt-1">
              <span className="text-[10px]">Active Belt:</span>
              <span className="text-slate-900 dark:text-white font-bold font-mono">Pan-India (Demo)</span>
            </div>
          </div>
        </div>

        {/* Dynamic 3D Relief Political Map of India with auto-minimize */}
        <div className="px-1.5 pb-2.5">
          <DynamicIndia3DMap currentPath={currentPath} />
        </div>

        {/* Developer Attribution in Sidebar */}
        <div className="px-3 py-2 text-center text-[10.5px] font-mono text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-cyberblue-900/50 flex items-center justify-center gap-1.5">
          <span>Developed by</span>
          <span className="font-extrabold text-slate-900 dark:text-cyberyellow-300">VIVEK KUMAR</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 h-[calc(100vh-4rem)] sticky top-16 z-20">
        {content}
      </aside>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10 w-64 h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
