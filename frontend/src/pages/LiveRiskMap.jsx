import React, { useState, useEffect } from 'react';
import { DisasterMap } from '../components/map/DisasterMap';
import { HabitationDetailDrawer } from '../components/habitations/HabitationDetailDrawer';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';
import { DynamicMouseText } from '../components/common/DynamicMouseText';
import { MapPin, Shield, Flame, Search, Navigation, Layers, Compass, AlertTriangle, Activity } from 'lucide-react';

export function LiveRiskMap({ onNavigate }) {
  const [hazardZones, setHazardZones] = useState([]);
  const [habitations, setHabitations] = useState([]);
  const [safeZones, setSafeZones] = useState([]);
  const [selectedHabitation, setSelectedHabitation] = useState(null);
  const [drawerHabitationId, setDrawerHabitationId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      api.getHazardZones(),
      api.getHabitations(),
      api.getSafeZones()
    ]).then(([hzRes, habRes, szRes]) => {
      if (hzRes.success) setHazardZones(hzRes.data);
      if (habRes.success) setHabitations(habRes.data);
      if (szRes.success) setSafeZones(szRes.data);
    }).catch(err => console.error('Failed to load map data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const match = habitations.find(h =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.state.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (match) {
      setSelectedHabitation(match);
    } else {
      alert('Location not found in active monitored zones.');
    }
  };

  const redZonesCount = hazardZones.filter(z => z.zone_category === 'Red').length;
  const criticalHabsCount = habitations.filter(h => h.priority_level === 'Critical').length;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Banner and Quick Telemetry */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-blue-900/50 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="yellow" pulse={true}>LIVE GIS RADAR</Badge>
            <span className="text-xs font-mono text-amber-700 dark:text-yellow-400 font-bold">OpenStreetMap + Geotechnical Layer Overlay</span>
          </div>
          <DynamicMouseText as="h1" variant="hero" className="text-2xl sm:text-3xl font-black tracking-tight font-heading">
            Interactive Multi-Hazard Risk & Relocation Map
          </DynamicMouseText>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200/80 font-medium">
            Real-time geospatial visualization of Red, Orange, and Green hazard zones with vulnerable habitations and capacity shelters.
          </p>
        </div>

        {/* Actions & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/area-intelligence')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-cyan-500/25 transition flex items-center gap-1.5 cursor-pointer"
            title="Launch 360° Deep Area Intelligence Scan"
          >
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            # ANALYZE THIS AREA
          </button>

          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-blue-500 dark:text-blue-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search Joshimath, Wayanad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white dark:bg-command-950/90 border border-slate-200 dark:border-blue-900/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-blue-300/40 text-xs rounded-xl pl-10 pr-4 py-2.5 w-52 sm:w-60 focus:outline-none focus:border-amber-500 dark:focus:border-yellow-400 font-semibold transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 hover:from-amber-300 hover:to-yellow-400 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              Locate
            </button>
          </form>
        </div>
      </div>

      {/* Quick Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white dark:bg-gradient-to-br dark:from-command-900/90 dark:to-[#0c1836] p-3.5 rounded-2xl border border-slate-200/90 dark:border-blue-900/50 flex items-center justify-between shadow-sm dark:shadow-md">
          <span className="text-slate-600 dark:text-blue-200/80 font-medium">Red Zones (High Risk):</span>
          <strong className="text-red-600 dark:text-red-400 font-mono font-black text-base">{redZonesCount}</strong>
        </div>
        <div className="bg-white dark:bg-gradient-to-br dark:from-command-900/90 dark:to-[#0c1836] p-3.5 rounded-2xl border border-slate-200/90 dark:border-blue-900/50 flex items-center justify-between shadow-sm dark:shadow-md">
          <span className="text-slate-600 dark:text-blue-200/80 font-medium">Critical Habitations:</span>
          <strong className="text-amber-700 dark:text-yellow-400 font-mono font-black text-base">{criticalHabsCount}</strong>
        </div>
        <div className="bg-white dark:bg-gradient-to-br dark:from-command-900/90 dark:to-[#0c1836] p-3.5 rounded-2xl border border-slate-200/90 dark:border-blue-900/50 flex items-center justify-between shadow-sm dark:shadow-md">
          <span className="text-slate-600 dark:text-blue-200/80 font-medium">Designated Safe Havens:</span>
          <strong className="text-blue-700 dark:text-blue-400 font-mono font-black text-base">{safeZones.length}</strong>
        </div>
        <div className="bg-white dark:bg-gradient-to-br dark:from-command-900/90 dark:to-[#0c1836] p-3.5 rounded-2xl border border-slate-200/90 dark:border-blue-900/50 flex items-center justify-between shadow-sm dark:shadow-md">
          <span className="text-slate-600 dark:text-blue-200/80 font-medium">Total Vulnerable Habitants:</span>
          <strong className="text-slate-900 dark:text-white font-mono font-black text-base">
            {habitations.reduce((a, b) => a + b.population, 0).toLocaleString()}
          </strong>
        </div>
      </div>

      {/* Main Interactive Map */}
      <div className="w-full">
        <DisasterMap
          hazardZones={hazardZones}
          habitations={habitations}
          safeZones={safeZones}
          selectedHabitation={selectedHabitation}
          onSelectHabitation={(hab) => {
            setSelectedHabitation(hab);
            setDrawerHabitationId(hab.id);
          }}
          onSelectSafeZone={(sz) => {
            if (onNavigate) onNavigate('/safe-zones');
          }}
          height="660px"
        />
      </div>

      {/* Bottom Quick-Jump Pills to Hotspots */}
      <div className="p-3 bg-white dark:bg-gradient-to-r dark:from-command-900/90 dark:via-[#0c1938]/90 dark:to-command-900/90 border border-slate-200/90 dark:border-blue-900/50 rounded-2xl flex items-center gap-2 overflow-x-auto text-xs shadow-sm dark:shadow-inner">
        <span className="text-amber-800 dark:text-yellow-400 font-mono text-[11px] font-bold uppercase flex-shrink-0 flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-yellow-400" />
          Hotspots:
        </span>
        {[
          { name: 'Joshimath (Chamoli)', habId: 1 },
          { name: 'Chooralmala (Wayanad)', habId: 7 },
          { name: 'Raini Gaon (Rishi Ganga)', habId: 3 },
          { name: 'Kamalabari (Majuli Island)', habId: 11 },
          { name: 'Old Manali (Beas Basin)', habId: 17 },
          { name: 'Satabhaya (Odisha Coast)', habId: 21 }
        ].map(hotspot => (
          <button
            key={hotspot.name}
            onClick={() => {
              const h = habitations.find(item => item.id === hotspot.habId);
              if (h) {
                setSelectedHabitation(h);
                setDrawerHabitationId(h.id);
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-command-950/80 dark:hover:bg-blue-950 dark:text-blue-200 dark:hover:text-yellow-300 dark:border-blue-900/60 text-xs font-semibold whitespace-nowrap transition shadow-sm"
          >
            {hotspot.name}
          </button>
        ))}
      </div>

      {/* Habitation Detailed Inspection Drawer */}
      {drawerHabitationId && (
        <HabitationDetailDrawer
          habitationId={drawerHabitationId}
          onClose={() => setDrawerHabitationId(null)}
          onAllocationUpdated={loadAll}
        />
      )}
    </div>
  );
}
