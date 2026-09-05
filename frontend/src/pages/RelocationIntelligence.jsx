import React, { useState, useEffect } from 'react';
import { Compass, Users, ShieldCheck, AlertTriangle, CheckCircle2, ChevronRight, Sparkles, ArrowRight, RefreshCw, Layers } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { DynamicMouseText } from '../components/common/DynamicMouseText';
import { HabitationDetailDrawer } from '../components/habitations/HabitationDetailDrawer';
import { api } from '../services/api';

export function RelocationIntelligence({ onNavigate }) {
  const [matrixData, setMatrixData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchMessage, setBatchMessage] = useState('');
  const [drawerHabitationId, setDrawerHabitationId] = useState(null);

  const loadMatrix = () => {
    setLoading(true);
    api.getRelocationMatrix()
      .then(res => {
        if (res.success) {
          setMatrixData(res.data);
        }
      })
      .catch(err => console.error('Failed to load relocation matrix:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMatrix();
  }, []);

  const handleBatchAllocation = async () => {
    if (!window.confirm('Execute autonomous AI batch allocation for all unassigned Critical habitations?')) return;
    setBatchLoading(true);
    setBatchMessage('');
    try {
      const res = await api.batchAllocate();
      if (res.success) {
        setBatchMessage(res.message);
        loadMatrix();
      }
    } catch (err) {
      alert('Batch allocation error: ' + err.message);
    } finally {
      setBatchLoading(false);
    }
  };

  const matrix = matrixData?.matrix || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-blue-900/50 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-yellow-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-yellow-400">
              AUTONOMOUS SPATIAL OPTIMIZATION
            </span>
          </div>
          <DynamicMouseText as="h1" variant="hero" className="text-2xl sm:text-3xl font-black tracking-tight font-heading">
            AI Relocation Recommendation Engine
          </DynamicMouseText>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200/80 mt-0.5 font-medium">
            Algorithmic pairing of vulnerable habitations with capacity-resilient safe relocation zones based on geodesic transit, infrastructure elasticity, and carrying headroom.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBatchAllocation}
            disabled={batchLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-yellow-500/25 transition"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            {batchLoading ? 'Optimizing Allocations...' : 'Execute AI Batch Allocation'}
          </button>
        </div>
      </div>

      {batchMessage && (
        <div className="p-4 bg-amber-50 dark:bg-yellow-400/15 border border-amber-300 dark:border-yellow-400/50 rounded-2xl text-xs text-amber-900 dark:text-yellow-200 flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-yellow-400 flex-shrink-0" />
          <span className="font-bold">{batchMessage}</span>
        </div>
      )}

      {/* 4 Feature Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gradient-to-br dark:from-command-900/95 dark:via-[#0b1836]/90 dark:to-[#071126]/95 rounded-2xl p-5 border border-red-200 dark:border-red-500/40 shadow-md shadow-slate-200/50 dark:shadow-xl border-l-4 border-l-red-500">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-blue-300 font-mono">Critical Habitations</p>
          <h3 className="text-2xl lg:text-3xl font-black text-red-600 dark:text-white font-mono mt-1.5">
            {matrixData?.totalVulnerableHabitations || 0}
          </h3>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-semibold">🔴 Immediate relocation required</p>
        </div>

        <div className="bg-white dark:bg-gradient-to-br dark:from-command-900/95 dark:via-[#0b1836]/90 dark:to-[#071126]/95 rounded-2xl p-5 border border-amber-200 dark:border-yellow-400/40 shadow-md shadow-slate-200/50 dark:shadow-xl border-l-4 border-l-amber-500 dark:border-l-yellow-400">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-blue-300 font-mono">Population at Acute Risk</p>
          <h3 className="text-2xl lg:text-3xl font-black text-amber-700 dark:text-yellow-300 font-mono mt-1.5">
            {matrixData?.totalVulnerablePopulation ? matrixData.totalVulnerablePopulation.toLocaleString() : '0'}
          </h3>
          <p className="text-xs text-amber-700 dark:text-yellow-400 mt-1 font-medium">Civilian headcount exposed</p>
        </div>

        <div className="bg-white dark:bg-gradient-to-br dark:from-command-900/95 dark:via-[#0b1836]/90 dark:to-[#071126]/95 rounded-2xl p-5 border border-blue-200 dark:border-blue-500/40 shadow-md shadow-slate-200/50 dark:shadow-xl border-l-4 border-l-blue-500">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-blue-300 font-mono">Available Haven Capacity</p>
          <h3 className="text-2xl lg:text-3xl font-black text-blue-700 dark:text-blue-300 font-mono mt-1.5">
            {matrixData?.totalSafeCapacityAvailable ? matrixData.totalSafeCapacityAvailable.toLocaleString() : '0'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-blue-200 mt-1 font-medium">Designated shelter surplus</p>
        </div>

        <div className="bg-white dark:bg-gradient-to-br dark:from-command-900/95 dark:via-[#0b1836]/90 dark:to-[#071126]/95 rounded-2xl p-5 border border-blue-200 dark:border-blue-400/40 shadow-md shadow-slate-200/50 dark:shadow-xl border-l-4 border-l-amber-500 dark:border-l-yellow-400">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-blue-300 font-mono">Capacity Balance</p>
          <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white font-mono mt-1.5">
            {matrixData?.capacitySurplusDeficit ? `+${matrixData.capacitySurplusDeficit.toLocaleString()}` : '+0'}
          </h3>
          <p className="text-xs text-amber-700 dark:text-yellow-400 mt-1 font-bold">Net absorption headroom</p>
        </div>
      </div>

      {/* Relocation Matrix Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider font-heading flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-600 dark:text-yellow-400" />
            Critical Habitations & Multi-Criteria Recommendations
          </h2>
          <span className="text-xs text-slate-500 dark:text-blue-200/80 font-mono font-medium">Click any card to inspect alternative havens</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500 dark:text-blue-300 font-mono text-xs">
            Computing geodesic distance matrix and infrastructure suitability scores...
          </div>
        ) : (
          <div className="space-y-4">
            {matrix.map(({ habitation: hab, topRecommendation: top, allocatedZone: allocated, allRecommendations: recs }) => {
              const isAssigned = !!allocated;

              return (
                <div
                  key={hab.id}
                  onClick={() => setDrawerHabitationId(hab.id)}
                  className={`bg-white dark:bg-gradient-to-br dark:from-command-900/95 dark:via-[#0b1836]/90 dark:to-[#071126]/95 rounded-2xl p-5 border transition-all cursor-pointer hover:shadow-xl dark:border-blue-glow ${
                    isAssigned ? 'border-amber-400 dark:border-yellow-400/50 hover:border-amber-500 dark:hover:border-yellow-400' : 'border-slate-200/90 hover:border-blue-300 dark:border-blue-900/50 dark:hover:border-blue-500/60'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Habitation Metadata */}
                    <div className="space-y-1.5 lg:w-1/3">
                      <div className="flex items-center gap-2">
                        <Badge variant={hab.priority_level.toLowerCase() === 'medium' ? 'yellow' : hab.priority_level.toLowerCase()} pulse={hab.priority_level === 'Critical'}>
                          {hab.priority_level}
                        </Badge>
                        <span className="text-xs text-blue-700 dark:text-blue-300 font-mono font-bold">Score: {hab.risk_score}</span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-yellow-300 transition-colors font-heading">
                        {hab.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-blue-200/80">
                        {hab.district}, {hab.state} • <strong className="text-slate-900 dark:text-white font-mono font-bold">{hab.population.toLocaleString()} persons</strong>
                      </p>
                      <p className="text-[11px] text-amber-800 dark:text-yellow-300 mt-1 font-medium">
                        Primary Hazard: <strong className="text-slate-900 dark:text-white">{hab.primary_hazard}</strong>
                      </p>
                    </div>

                    {/* Middle: Recommended or Assigned Safe Haven */}
                    <div className="lg:w-1/2 bg-slate-50 dark:bg-command-950/80 p-4 rounded-2xl border border-slate-200 dark:border-blue-900/50 shadow-sm dark:shadow-inner">
                      {isAssigned ? (
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-yellow-400 font-mono flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-yellow-400" />
                              CONFIRMED ALLOCATION
                            </span>
                            <Badge variant="yellow" size="sm">Active Order</Badge>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white font-heading">{allocated.name}</h4>
                          <p className="text-xs text-slate-600 dark:text-blue-200/80 mt-0.5 font-medium">
                            {allocated.district}, {allocated.state} • Available headroom: {allocated.available_capacity.toLocaleString()}
                          </p>
                        </div>
                      ) : top ? (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 font-mono flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-300" />
                              TOP RECOMMENDED HAVEN
                            </span>
                            <Badge variant={top.suitabilityScore >= 80 ? 'green' : 'info'} size="sm">
                              {top.suitabilityScore}% Suitability
                            </Badge>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{top.safeZoneName}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {top.district}, {top.state} • <strong className="text-amber-700 dark:text-amber-400 font-mono">{top.distanceKm} km transit</strong> • Available: <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{top.availableCapacity.toLocaleString()}</strong>
                          </p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-1 border-l-2 border-blue-500 pl-2">
                            {top.recommendationReason}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No safe zones identified within range.</p>
                      )}
                    </div>

                    {/* Right: Inspection CTA */}
                    <div className="flex items-center justify-end lg:w-44 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDrawerHabitationId(hab.id);
                        }}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          isAssigned
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-900/20'
                        }`}
                      >
                        {isAssigned ? 'Manage Plan' : 'Review Top 3'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Habitation Inspection Drawer */}
      {drawerHabitationId && (
        <HabitationDetailDrawer
          habitationId={drawerHabitationId}
          onClose={() => setDrawerHabitationId(null)}
          onAllocationUpdated={loadMatrix}
        />
      )}
    </div>
  );
}
