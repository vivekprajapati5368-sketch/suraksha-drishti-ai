import React, { useState, useEffect } from 'react';
import { Flame, MapPin, Filter, Search, Compass, AlertCircle, ArrowUpRight, Activity } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { DynamicMouseText } from '../components/common/DynamicMouseText';
import { api } from '../services/api';

export function HazardZonesPage({ onNavigate }) {
  const [hazardZones, setHazardZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedHazard, setSelectedHazard] = useState('All');

  useEffect(() => {
    setLoading(true);
    api.getHazardZones({
      category: selectedCategory,
      hazard: selectedHazard
    }).then(res => {
      if (res.success) setHazardZones(res.data);
    }).catch(err => console.error('Failed to load hazard zones:', err))
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedHazard]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-blue-900/50 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-yellow-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-yellow-400">
              GEOTECHNICAL HAZARD PERIMETERS
            </span>
          </div>
          <DynamicMouseText as="h1" variant="hero" className="text-2xl sm:text-3xl font-black tracking-tight font-heading">
            Dynamic Hazard Risk Zones
          </DynamicMouseText>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200/80 mt-0.5 font-medium">
            Autonomous multi-criteria classification into Red (High Risk), Orange (Medium), and Green (Low) perimeters with Explainable AI justifications.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/map')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/30 transition"
        >
          <Compass className="w-4 h-4 text-blue-200" />
          View on Interactive GIS Map
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gradient-to-br dark:from-command-900/95 dark:via-[#0b1836]/90 dark:to-[#071126]/95 p-4 rounded-2xl border border-slate-200/90 dark:border-blue-900/50 shadow-sm dark:shadow-xl dark:border-blue-glow">
        <div className="flex items-center gap-2">
          {['All', 'Red', 'Orange', 'Green'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                selectedCategory === cat
                  ? (cat === 'Red' ? 'bg-red-600 text-white shadow-red-900/40' : (cat === 'Orange' ? 'bg-amber-500 dark:bg-yellow-400 text-white dark:text-slate-950 font-black shadow-amber-500/30' : (cat === 'Green' ? 'bg-emerald-600 dark:bg-emerald-500 text-white' : 'bg-blue-600 text-white')))
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-command-950/80 dark:text-blue-200 dark:border-blue-900/60 dark:hover:text-white'
              }`}
            >
              {cat === 'All' ? 'All Zones' : `${cat} Zones`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 dark:text-blue-200/80 font-semibold">Hazard Type:</span>
          <select
            value={selectedHazard}
            onChange={(e) => setSelectedHazard(e.target.value)}
            className="bg-white dark:bg-command-950/90 border border-slate-200 dark:border-blue-900/60 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-yellow-400 font-semibold"
          >
            {['All', 'Landslide', 'Flood', 'Cloudburst', 'Flash Flood', 'Coastal Erosion'].map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Hazard Zones */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 dark:text-blue-300 font-mono text-xs">
          Loading hazard zone parameters and AI rationale...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hazardZones.map(zone => {
            const isRed = zone.zone_category === 'Red';
            const isOrange = zone.zone_category === 'Orange';

            const cardBorder = isRed ? 'border-red-500/50 hover:border-red-500/80' : (isOrange ? 'border-amber-400 dark:border-yellow-400/50 hover:border-amber-500 dark:hover:border-yellow-400/80' : 'border-emerald-500/40 hover:border-emerald-500/70');
            const scoreColor = isRed ? 'text-red-600 dark:text-red-400' : (isOrange ? 'text-amber-700 dark:text-yellow-400' : 'text-emerald-700 dark:text-emerald-400');

            return (
              <div
                key={zone.id}
                className={`bg-white dark:bg-gradient-to-br dark:from-command-900/95 dark:via-[#0b1836]/90 dark:to-[#071126]/95 rounded-2xl p-5 border ${cardBorder} shadow-sm dark:shadow-xl flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 group`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant={zone.zone_category.toLowerCase() === 'orange' ? 'yellow' : zone.zone_category.toLowerCase()} pulse={isRed}>
                      {zone.zone_category} Zone
                    </Badge>
                    <span className={`text-xl font-black font-mono ${scoreColor}`}>
                      {zone.risk_score}<span className="text-xs text-slate-400 font-normal">/100</span>
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-1 font-heading group-hover:text-amber-700 dark:group-hover:text-yellow-300 transition-colors">{zone.location_name}</h3>
                  <p className="text-xs text-slate-500 dark:text-blue-200/80 flex items-center gap-1 mb-3 font-medium">
                    <MapPin className="w-3 h-3 text-amber-500 dark:text-yellow-400" />
                    {zone.district}, {zone.state} ({zone.radius_km} km radius)
                  </p>

                  {/* Geotechnical Parameters Grid */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-command-950/80 p-3 rounded-xl text-xs font-mono mb-3 border border-slate-200 dark:border-blue-900/50">
                    <div>
                      <span className="text-slate-500 dark:text-blue-300/70 block text-[10px]">PRIMARY HAZARD</span>
                      <span className="text-slate-900 dark:text-white font-bold">{zone.hazard_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-blue-300/70 block text-[10px]">RAINFALL (24H)</span>
                      <span className="text-slate-900 dark:text-white font-bold">{zone.rainfall_mm} mm</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-blue-300/70 block text-[10px]">SLOPE / ELEVATION</span>
                      <span className="text-slate-900 dark:text-white font-bold">{zone.slope_deg}° • {zone.elevation_m}m</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-blue-300/70 block text-[10px]">PAST DISASTERS</span>
                      <span className="text-amber-700 dark:text-yellow-400 font-bold">{zone.historical_disasters} events</span>
                    </div>
                  </div>

                  {/* AI Explanation Box */}
                  <div className={`p-3 rounded-xl border text-xs leading-relaxed ${isRed ? 'bg-red-50 dark:bg-red-950/25 border-red-200 dark:border-red-500/40 text-red-900 dark:text-red-200' : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50 text-blue-900 dark:text-blue-100'}`}>
                    <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-800 dark:text-yellow-400 mb-1 font-mono">
                      🤖 Explainable AI Diagnosis:
                    </span>
                    {zone.ai_explanation}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-blue-900/40 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-blue-200/70 font-medium">River Proximity: <strong className="text-slate-900 dark:text-white font-mono">{zone.river_distance_m}m</strong></span>
                  <button
                    onClick={() => onNavigate('/map')}
                    className="text-amber-700 hover:text-amber-800 dark:text-yellow-400 dark:hover:text-yellow-300 font-bold flex items-center gap-1 text-[11px] transition-colors"
                  >
                    View Radar <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
