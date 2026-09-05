import React, { useState, useEffect } from 'react';
import { X, Shield, MapPin, AlertCircle, Compass, Users, CheckCircle2, ChevronRight, Activity, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { api } from '../../services/api';

export function HabitationDetailDrawer({ habitationId, onClose, onAllocationUpdated }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [allocatingId, setAllocatingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!habitationId) return;
    setLoading(true);
    setSuccessMsg('');
    api.getHabitationById(habitationId)
      .then(res => {
        if (res.success) {
          setData(res.data);
        }
      })
      .catch(err => console.error('Failed to load habitation details:', err))
      .finally(() => setLoading(false));
  }, [habitationId]);

  if (!habitationId) return null;

  const handleAllocate = async (safeZoneId) => {
    setAllocatingId(safeZoneId);
    try {
      const res = await api.allocateSafeZone(habitationId, safeZoneId);
      if (res.success) {
        setSuccessMsg(res.message);
        // Refresh details
        const updated = await api.getHabitationById(habitationId);
        if (updated.success) setData(updated.data);
        if (onAllocationUpdated) onAllocationUpdated();
      }
    } catch (err) {
      alert(err.message || 'Allocation failed');
    } finally {
      setAllocatingId(null);
    }
  };

  const hab = data?.habitation;
  const recs = data?.recommendations || [];
  const allocated = data?.allocatedZone;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-command-900 border-l border-slate-200 dark:border-cyberblue-800 shadow-2xl h-full flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-cyberblue-800/80 flex items-start justify-between bg-slate-50 dark:bg-command-950">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant={hab?.priority_level === 'Critical' ? 'yellow' : 'blue'} pulse={hab?.priority_level === 'Critical'}>
                {hab?.priority_level} Priority
              </Badge>
              <span className="text-xs text-blue-700 dark:text-cyberblue-300 font-mono font-bold">ID: #{hab?.id}</span>
            </div>
            <h2 className="text-xl font-display font-black text-slate-900 dark:text-white tracking-tight">{hab?.name || 'Loading details...'}</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-0.5 font-mono">
              <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-cyberyellow-400" />
              {hab?.district}, {hab?.state} ({hab?.latitude?.toFixed(4)}°N, {hab?.longitude?.toFixed(4)}°E)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-command-900 dark:hover:bg-command-800 border border-slate-300 dark:border-cyberblue-800 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Activity className="w-8 h-8 animate-spin text-amber-500 dark:text-cyberyellow-400 mb-2" />
              <p className="text-xs font-mono">Analyzing geotechnical parameters & safe zone capacity...</p>
            </div>
          ) : (
            <>
              {/* Notification Banner if Allocated */}
              {allocated ? (
                <div className="bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-command-950 dark:to-command-900 border border-emerald-400 dark:border-emerald-500/60 rounded-xl p-4 flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-mono">RELOCATION ASSIGNED</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-display">{allocated.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                        {allocated.district}, {allocated.state} • Available capacity: {allocated.available_capacity.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="green">Confirmed</Badge>
                </div>
              ) : null}

              {successMsg && (
                <div className="p-3 bg-blue-50 dark:bg-cyberblue-950/60 border border-blue-200 dark:border-cyberblue-500/50 rounded-lg text-xs text-blue-800 dark:text-cyberblue-200 font-mono">
                  {successMsg}
                </div>
              )}

              {/* Risk Score & Primary Metrics Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-cyberblue-900/80 shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">Risk Score</p>
                  <p className="text-2xl font-display font-bold font-mono mt-1 text-amber-600 dark:text-cyberyellow-400">
                    {hab?.risk_score}<span className="text-xs text-slate-500 dark:text-slate-400">/100</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-cyberblue-900/80 shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">Population</p>
                  <p className="text-2xl font-display font-bold font-mono text-slate-900 dark:text-white mt-1">
                    {hab?.population?.toLocaleString()}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-cyberblue-900/80 shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">Primary Hazard</p>
                  <p className="text-sm font-bold text-amber-700 dark:text-cyberyellow-300 mt-2 truncate">
                    {hab?.primary_hazard}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-cyberblue-900/80 shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">Slope & Elevation</p>
                  <p className="text-sm font-bold text-blue-700 dark:text-cyberblue-300 mt-2 font-mono">
                    {hab?.slope_deg}° • {hab?.elevation_m}m
                  </p>
                </div>
              </div>

              {/* Geotechnical Details Table */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-cyberblue-900/80 text-xs space-y-2 shadow-sm">
                <h4 className="font-bold text-amber-700 dark:text-cyberyellow-400 text-xs uppercase tracking-wider mb-2 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-cyberyellow-400"></span>
                  Geotechnical & Environmental Factors
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-slate-700 dark:text-slate-300 font-sans">
                  <div><span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Soil Composition:</span> <strong className="text-slate-900 dark:text-white ml-1">{hab?.soil_type}</strong></div>
                  <div><span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">River Distance:</span> <strong className="text-slate-900 dark:text-white ml-1">{hab?.river_distance_m} meters</strong></div>
                  <div><span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Historical Disasters:</span> <strong className="text-amber-700 dark:text-cyberyellow-300 ml-1 font-mono font-bold">{hab?.historical_disasters_count} logged events</strong></div>
                  <div><span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Socio Vulnerability:</span> <strong className="text-blue-700 dark:text-cyberblue-300 ml-1 font-mono font-bold">{hab?.vulnerability_score}/100</strong></div>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-cyberblue-900/60 text-slate-700 dark:text-slate-300 font-sans">
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Last Major Calamity:</span> <strong className="text-amber-700 dark:text-cyberyellow-300 ml-1">{hab?.last_disaster}</strong>
                </div>
                <div className="text-slate-700 dark:text-slate-300 font-sans">
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Mandated Action:</span> <strong className="text-slate-900 dark:text-white ml-1">{hab?.recommended_action}</strong>
                </div>
              </div>

              {/* AI Relocation Recommendations Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                    <Compass className="w-4 h-4 text-amber-600 dark:text-cyberyellow-400" />
                    AI-Ranked Safe Relocation Zones (Top 3 Matches)
                  </h3>
                  <span className="text-[10px] text-blue-700 dark:text-cyberblue-300 font-mono font-bold">MCDA Optimization</span>
                </div>

                {recs.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic font-mono">No matching safe zones evaluated yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recs.map((rec, index) => {
                      const isAssigned = allocated?.id === rec.safeZoneId;
                      return (
                        <div
                          key={rec.safeZoneId}
                          className={`p-4 rounded-xl border transition-all ${
                            isAssigned
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 shadow-md'
                              : 'bg-white dark:bg-command-950 border-slate-200 dark:border-cyberblue-900/80 hover:border-amber-400 dark:hover:border-cyberyellow-400/60 shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-cyberblue-900/60 text-blue-700 dark:text-cyberblue-300 border border-blue-200 dark:border-cyberblue-700 text-xs font-bold flex items-center justify-center font-mono">
                                  #{index + 1}
                                </span>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm font-display">{rec.safeZoneName}</h4>
                                <Badge variant={rec.suitabilityScore > 80 ? 'yellow' : 'blue'} size="sm">
                                  {rec.suitabilityScore}% Match
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-mono">
                                {rec.district}, {rec.state} • <strong className="text-amber-700 dark:text-cyberyellow-300 font-bold">{rec.distanceKm} km transit radius</strong>
                              </p>
                            </div>

                            <button
                              disabled={isAssigned || allocatingId === rec.safeZoneId}
                              onClick={() => handleAllocate(rec.safeZoneId)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                                isAssigned
                                  ? 'bg-emerald-100 dark:bg-emerald-600/30 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 cursor-default'
                                  : 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black shadow-md shadow-yellow-500/20'
                              }`}
                            >
                              {isAssigned ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Allocated
                                </>
                              ) : allocatingId === rec.safeZoneId ? (
                                'Allocating...'
                              ) : (
                                <>
                                  Assign Zone <ArrowRight className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>
                          </div>

                          {/* Capacity & Infrastructure Quick Stats */}
                          <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-command-900/80 border border-slate-200 dark:border-cyberblue-900/60 p-2.5 rounded-lg text-[11px] mb-2 font-mono">
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">AVAILABLE CAP</span>
                              <span className="font-bold text-blue-700 dark:text-cyberblue-300 font-display">{rec.availableCapacity.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">SUSTAINABILITY</span>
                              <span className="font-bold text-amber-700 dark:text-cyberyellow-400 font-display">{rec.sustainabilityScore}/100</span>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">TRANSIT DIST</span>
                              <span className="font-bold text-slate-900 dark:text-white font-display">{rec.distanceKm} km</span>
                            </div>
                          </div>

                          {/* AI Justification */}
                          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-command-900 p-2.5 rounded-lg border-l-2 border-l-amber-500 dark:border-l-cyberyellow-400 font-sans border border-slate-200 dark:border-transparent">
                            <strong className="text-amber-700 dark:text-cyberyellow-400 font-mono">AI Rationale:</strong> {rec.recommendationReason}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-cyberblue-900/80 bg-slate-50 dark:bg-command-950 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
          <span>Suraksha Drishti Relocation Advisory Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white dark:bg-command-900 hover:bg-slate-100 dark:hover:bg-command-800 border border-slate-200 dark:border-cyberblue-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition font-bold shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
