import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, History, ShieldAlert, DollarSign, Users, Layers } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Badge } from '../components/common/Badge';
import { DynamicMouseText } from '../components/common/DynamicMouseText';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#10b981', '#a855f7', '#06b6d4'];

export function AnalyticsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then(res => {
        if (res.success) setAnalytics(res.data);
      })
      .catch(err => console.error('Failed to load analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading && !analytics) {
    return (
      <div className="py-20 text-center text-slate-500 text-xs">
        Compiling historical disaster telemetry and correlation algorithms...
      </div>
    );
  }

  const s = analytics?.summary || {};
  const disasters = analytics?.disasterEvents || [];
  const stateCapacity = analytics?.stateCapacityComparison || [];
  const slopeVsRisk = analytics?.slopeVsRisk || [];
  const soilDistribution = analytics?.soilDistribution || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-cyberblue-900/60 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-cyberyellow-400 animate-ping"></span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-cyberyellow-400">
            MACRO-DISASTER ANALYTICS & PATTERN DISCOVERY
          </span>
        </div>
        <DynamicMouseText as="h1" variant="hero" className="text-2xl sm:text-3xl font-display font-black tracking-tight drop-shadow-sm">
          Disaster Trends & Geotechnical Intelligence
        </DynamicMouseText>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
          Decadal casualty statistics, economic losses, terrain vulnerability correlations, and safe haven absorption dynamics.
        </p>
      </div>

      {/* Aggregate Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-command-900/90 rounded-2xl p-5 border border-slate-200 dark:border-cyberblue-900/60 border-l-4 border-l-amber-500 dark:border-l-cyberyellow-400 shadow-md">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Recorded Casualties</p>
          <h3 className="text-2xl font-display font-bold font-mono text-amber-700 dark:text-cyberyellow-400 mt-1">
            {s.totalCasualtiesRecorded ? s.totalCasualtiesRecorded.toLocaleString() : '6,749'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across benchmark catastrophic events</p>
        </div>

        <div className="bg-white dark:bg-command-900/90 rounded-2xl p-5 border border-slate-200 dark:border-cyberblue-900/60 border-l-4 border-l-blue-600 dark:border-l-cyberblue-400 shadow-md">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Cumulative Economic Loss</p>
          <h3 className="text-2xl font-display font-bold font-mono text-slate-900 dark:text-white mt-1">
            ₹{s.totalEconomicLossCr ? s.totalEconomicLossCr.toLocaleString() : '14,450'} Cr
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Infrastructural & agricultural damages</p>
        </div>

        <div className="bg-white dark:bg-command-900/90 rounded-2xl p-5 border border-slate-200 dark:border-cyberblue-900/60 border-l-4 border-l-amber-500 dark:border-l-yellow-300 shadow-md">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Logged Disasters</p>
          <h3 className="text-2xl font-display font-bold font-mono text-amber-700 dark:text-cyberyellow-300 mt-1">
            {s.historicalEventsLogged || 6} Major Events
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Kedarnath, Chamoli, Wayanad, Teesta, etc.</p>
        </div>

        <div className="bg-white dark:bg-command-900/90 rounded-2xl p-5 border border-slate-200 dark:border-cyberblue-900/60 border-l-4 border-l-blue-600 dark:border-l-blue-400 shadow-md">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Audited Geo-Zones</p>
          <h3 className="text-2xl font-display font-bold font-mono text-blue-700 dark:text-cyberblue-300 mt-1">
            {s.totalZonesAudited || 22} Sites
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hazard perimeters & relocation havens</p>
        </div>
      </div>

      {/* Chart 1: State Capacity vs Population At Risk */}
      <div className="bg-white dark:bg-command-900/90 rounded-2xl p-6 border border-slate-200 dark:border-cyberblue-800/60 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-cyberyellow-400"></span>
              State Relocation Capacity vs Vulnerable Population
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">Demographic displacement load against designated haven headroom</p>
          </div>
          <Badge variant="yellow">Surplus Validated</Badge>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stateCapacity} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#14274e' : '#e2e8f0'} />
              <XAxis dataKey="state" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
              <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#071228' : '#ffffff',
                  borderColor: isDark ? '#38bdf8' : '#cbd5e1',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: isDark ? '#fff' : '#0f172a',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="populationAtRisk" name="Vulnerable Population (Demand)" fill={isDark ? '#facc15' : '#d97706'} radius={[4, 4, 0, 0]} />
              <Bar dataKey="safeCapacity" name="Haven Capacity (Supply)" fill={isDark ? '#38bdf8' : '#2563eb'} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Terrain Correlation & Historical Disasters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Terrain Correlation: Slope vs Risk Score */}
        <div className="bg-white dark:bg-command-900/90 rounded-2xl p-6 border border-slate-200 dark:border-cyberblue-800/60 shadow-xl">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyberblue-400"></span>
            Terrain Gravitational Angle vs Risk Score
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-sans">Slope inclination in degrees plotted against composite AI risk rating</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slopeVsRisk.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#14274e' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} angle={-25} textAnchor="end" height={60} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#071228' : '#ffffff',
                    borderColor: isDark ? '#facc15' : '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: isDark ? '#fff' : '#0f172a',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="slope" name="Slope (Deg)" fill={isDark ? '#facc15' : '#d97706'} radius={[4, 4, 0, 0]} />
                <Bar dataKey="riskScore" name="Risk Score (0-100)" fill={isDark ? '#38bdf8' : '#2563eb'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historical Disaster Events Log */}
        <div className="bg-white dark:bg-command-900/90 rounded-2xl p-6 border border-slate-200 dark:border-cyberblue-800/60 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <History className="w-4 h-4 text-amber-600 dark:text-cyberyellow-400" />
                Historical Calamity Benchmark Repository
              </h3>
              <span className="text-xs text-blue-700 dark:text-cyberblue-400 font-mono font-bold">GSI / NDMA Archive</span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-72 pr-1">
              {disasters.map(d => (
                <div key={d.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-cyberblue-900/80 text-xs hover:border-amber-400 dark:hover:border-cyberyellow-400/50 transition shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-900 dark:text-white font-display">{d.location}</h4>
                    <span className="font-mono text-amber-700 dark:text-cyberyellow-400 text-[11px] font-bold">{d.year_date}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-blue-700 dark:text-cyberblue-300 font-medium">{d.disaster_type}</span>
                    <span className="text-slate-400 dark:text-slate-600">•</span>
                    <span className="text-amber-700 dark:text-cyberyellow-300 font-mono font-semibold">Casualties: {d.casualties.toLocaleString()}</span>
                    <span className="text-slate-400 dark:text-slate-600">•</span>
                    <span className="text-slate-600 dark:text-slate-300 font-mono">₹{d.economic_loss_cr} Cr loss</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 font-sans">
                    {d.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
