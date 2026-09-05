import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, ChevronRight, MapPin, AlertTriangle, ShieldCheck, Compass, Download, Plus } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { DynamicMouseText } from '../components/common/DynamicMouseText';
import { HabitationDetailDrawer } from '../components/habitations/HabitationDetailDrawer';
import { api } from '../services/api';

export function VulnerableHabitations({ onNavigate }) {
  const [habitations, setHabitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedHazard, setSelectedHazard] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortBy, setSortBy] = useState('risk_score');
  const [order, setOrder] = useState('DESC');
  const [drawerHabitationId, setDrawerHabitationId] = useState(null);

  const fetchHabitations = () => {
    setLoading(true);
    api.getHabitations({
      search,
      state: selectedState,
      hazard: selectedHazard,
      priority: selectedPriority,
      sortBy,
      order
    }).then(res => {
      if (res.success) {
        setHabitations(res.data);
      }
    }).catch(err => console.error('Failed to load habitations:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHabitations();
  }, [search, selectedState, selectedHazard, selectedPriority, sortBy, order]);

  const toggleSort = (col) => {
    if (sortBy === col) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(col);
      setOrder('DESC');
    }
  };

  const states = ['All', 'Uttarakhand', 'Kerala', 'Assam', 'Himachal Pradesh', 'Odisha', 'West Bengal', 'Sikkim'];
  const hazards = ['All', 'Landslide', 'Flood', 'Cloudburst', 'Coastal Erosion', 'Flash Flood', 'Glacial Flood', 'Riverbank Erosion'];
  const priorities = ['All', 'Critical', 'High', 'Medium', 'Low'];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-blue-900/50 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-yellow-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-yellow-400">
              NATIONAL HABITATION AUDIT REGISTRY
            </span>
          </div>
          <DynamicMouseText as="h1" variant="hero" className="text-2xl sm:text-3xl font-black tracking-tight font-heading">
            Vulnerable Habitations Analysis
          </DynamicMouseText>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200/80 mt-0.5 font-medium">
            Real-time multi-hazard exposure registry, geotechnical scoring, and immediate relocation imperatives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/relocation')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/30 transition"
          >
            <Compass className="w-4 h-4 text-blue-200" />
            Relocation Intelligence
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gradient-to-br dark:from-command-900/95 dark:via-[#0b1836]/90 dark:to-[#071126]/95 p-4 rounded-2xl border border-slate-200/90 dark:border-blue-900/50 shadow-md shadow-slate-200/50 dark:shadow-xl flex flex-wrap items-center justify-between gap-3 dark:border-blue-glow">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-blue-500 dark:text-blue-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search habitation name, district, state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-command-950/90 border border-slate-200 dark:border-blue-900/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-blue-300/40 focus:outline-none focus:border-amber-500 dark:focus:border-yellow-400 font-semibold transition-colors"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-white dark:bg-command-950/90 border border-slate-200 dark:border-blue-900/60 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-yellow-400 font-semibold"
          >
            {states.map(s => <option key={s} value={s}>{s === 'All' ? 'All States' : s}</option>)}
          </select>

          <select
            value={selectedHazard}
            onChange={(e) => setSelectedHazard(e.target.value)}
            className="bg-white dark:bg-command-950/90 border border-slate-200 dark:border-blue-900/60 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-yellow-400 font-semibold"
          >
            {hazards.map(h => <option key={h} value={h}>{h === 'All' ? 'All Hazards' : h}</option>)}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-white dark:bg-command-950/90 border border-slate-200 dark:border-blue-900/60 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-yellow-400 font-semibold"
          >
            {priorities.map(p => <option key={p} value={p}>{p === 'All' ? 'All Priorities' : `${p} Priority`}</option>)}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gradient-to-br dark:from-command-900/95 dark:via-[#0b1836]/90 dark:to-[#071126]/95 rounded-2xl border border-slate-200/90 dark:border-blue-900/50 shadow-md shadow-slate-200/50 dark:shadow-2xl overflow-hidden dark:border-blue-glow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-blue-900/60 bg-slate-50/90 dark:bg-command-950/90 text-[11px] font-bold text-amber-800 dark:text-yellow-400 uppercase tracking-wider font-mono select-none">
                <th onClick={() => toggleSort('name')} className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                  <div className="flex items-center gap-1.5">
                    Habitation Name <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => toggleSort('state')} className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                  <div className="flex items-center gap-1.5">
                    District / State <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => toggleSort('population')} className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    Population <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Primary Hazard</th>
                <th onClick={() => toggleSort('risk_score')} className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    Risk Score <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Priority</th>
                <th className="py-3.5 px-4">Recommended Action</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-blue-900/30">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-500 dark:text-blue-300 font-mono">
                    Querying geo-database and recalculating priority rankings...
                  </td>
                </tr>
              ) : habitations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-600 dark:text-blue-300/70 font-mono font-medium">
                    No habitations found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                habitations.map((hab) => {
                  const isCritical = hab.priority_level === 'Critical';
                  const isHigh = hab.priority_level === 'High';

                  const riskColor = hab.risk_score > 60 ? 'text-red-600 dark:text-red-400' : (hab.risk_score > 30 ? 'text-amber-700 dark:text-orange-400' : 'text-emerald-700 dark:text-emerald-400');
                  const barBg = hab.risk_score > 60 ? 'bg-red-500' : (hab.risk_score > 30 ? 'bg-amber-500 dark:bg-orange-500' : 'bg-emerald-500');

                  return (
                    <tr
                      key={hab.id}
                      onClick={() => setDrawerHabitationId(hab.id)}
                      className="hover:bg-slate-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-yellow-300 transition-colors">
                        {hab.name}
                        {hab.allocated_safe_zone_id && (
                          <span className="block text-[10px] text-amber-700 dark:text-yellow-400 font-mono font-bold mt-0.5">
                            ✓ Shelter Allocated
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-200">
                        {hab.district}, <span className="text-blue-700 dark:text-blue-300/80 font-semibold">{hab.state}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {hab.population.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/80 dark:text-blue-200 font-semibold dark:border-blue-800/60 text-[11px] font-mono">
                          {hab.primary_hazard}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`font-mono font-black text-sm ${riskColor}`}>
                            {hab.risk_score}
                          </span>
                          <div className="w-16 bg-slate-200 dark:bg-command-950 rounded-full h-1.5 mt-1 overflow-hidden border border-slate-300 dark:border-blue-900/40">
                            <div className={`h-full ${barBg}`} style={{ width: `${hab.risk_score}%` }}></div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={hab.priority_level.toLowerCase() === 'medium' ? 'yellow' : hab.priority_level.toLowerCase()} pulse={isCritical}>
                          {hab.priority_level}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-200 max-w-xs truncate font-medium">
                        {hab.recommended_action}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrawerHabitationId(hab.id);
                          }}
                          className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 dark:bg-blue-950/80 dark:hover:bg-yellow-400/20 dark:text-blue-200 dark:hover:text-yellow-300 dark:border-blue-800/60 dark:hover:border-yellow-400/40 font-bold inline-flex items-center gap-1 text-[11px] transition shadow-sm"
                        >
                          Plan <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>Showing <strong>{habitations.length}</strong> monitored habitations</span>
          <span className="font-mono">Click any row to inspect geotechnical profile & safe haven matching</span>
        </div>
      </div>

      {/* Drawer */}
      {drawerHabitationId && (
        <HabitationDetailDrawer
          habitationId={drawerHabitationId}
          onClose={() => setDrawerHabitationId(null)}
          onAllocationUpdated={fetchHabitations}
        />
      )}
    </div>
  );
}
