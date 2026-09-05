import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Flame,
  AlertTriangle,
  Users,
  Building2,
  ShieldCheck,
  TrendingUp,
  Map,
  Compass,
  FileText,
  Radio,
  ArrowUpRight,
  Activity,
  CheckCircle,
  RefreshCw,
  Sparkles,
  MessagesSquare,
  ArrowRight,
  Satellite,
  Crosshair,
  Eye,
  Layers,
  Zap
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { SimulationBanner } from '../components/common/SimulationBanner';
import { DynamicMouseText } from '../components/common/DynamicMouseText';
import { DynamicPurpleBox } from '../components/common/DynamicPurpleBox';
import satelliteRadarImg from '../assets/images/satellite_radar.jpg';
import safeHavenImg from '../assets/images/safe_haven_camp.jpg';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const COLORS = ['#d97706', '#0284c7', '#2563eb', '#f59e0b', '#3b82f6', '#10b981'];

export function Dashboard({ onNavigate }) {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const loadData = () => {
    setLoading(true);
    api.getDashboardStats()
      .then(res => {
        if (res.success) {
          setStats(res.data);
        }
      })
      .catch(err => {
        console.error('Failed to load dashboard:', err);
        setError('Could not connect to backend server. Ensure backend is running.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // Auto refresh every 20s
    const timer = setInterval(loadData, 20000);
    return () => clearInterval(timer);
  }, []);

  const handleResetSimulation = async () => {
    try {
      await api.resetSimulation();
      loadData();
    } catch (err) {
      alert('Failed to reset simulation: ' + err.message);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-700 dark:text-blue-200">
        <Activity className="w-10 h-10 animate-spin text-amber-600 dark:text-yellow-400 mb-3" />
        <p className="text-sm font-mono tracking-wider font-semibold">INITIALIZING SITUATION ROOM TELEMETRY...</p>
      </div>
    );
  }

  const m = stats?.metrics || {};
  const charts = stats?.charts || {};
  const reports = stats?.recentReports || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Dynamic Active Simulation Warning Banner */}
      <SimulationBanner
        simulation={stats?.simulation}
        onReset={handleResetSimulation}
        onNavigateToSimulator={() => onNavigate('/simulator')}
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-blue-900/50 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-yellow-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-yellow-400 flex items-center gap-1.5">
              NATIONAL SITUATION ROOM • LIVE AI TELEMETRY
            </span>
          </div>
          <DynamicMouseText as="h1" variant="hero" className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight font-heading">
            Disaster Risk & Relocation Command Center
          </DynamicMouseText>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200/80 mt-1 font-bold">
            Autonomous Multi-Hazard Risk Identification & Carrying Capacity Allocation Platform
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-white dark:bg-command-900 border border-slate-200 dark:border-blue-900/60 hover:bg-slate-100 dark:hover:bg-blue-950/80 text-amber-600 dark:text-yellow-400 transition shadow-sm"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('/map')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/40 transition"
          >
            <Map className="w-4 h-4 text-blue-200" />
            Live GIS Map
          </button>
          <button
            onClick={() => onNavigate('/simulator')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-yellow-500/25 transition"
          >
            <Flame className="w-4 h-4 text-slate-950 fill-slate-950/30" />
            Simulate Crisis
          </button>
        </div>
      </div>

      {/* 7 Core Government Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monitored Habitations"
          value={m.totalHabitations || 24}
          subtitle={`Across ${charts.stateRiskData?.length || 5} disaster-prone states`}
          icon={Building2}
          variant="blue"
        />

        <MetricCard
          title="Red Zones (High Risk)"
          value={m.redZones || 7}
          subtitle={`${m.orangeZones || 4} Orange • ${m.greenZones || 1} Green Zones`}
          icon={Flame}
          variant="red"
          badge={<Badge variant="red" pulse={true}>{m.redZones} RED</Badge>}
        />

        <MetricCard
          title="Critical Populations"
          value={m.criticalPopulation ? m.criticalPopulation.toLocaleString() : '18,870'}
          subtitle={`${m.criticalHabitations || 6} habitations under critical threat`}
          icon={AlertTriangle}
          variant="yellow"
          badge={<Badge variant="yellow" pulse={true}>URGENT</Badge>}
        />

        <MetricCard
          title="Relocation Requisite"
          value={m.peopleNeedingRelocation ? m.peopleNeedingRelocation.toLocaleString() : '23,450'}
          subtitle="Immediate & Priority evacuation"
          icon={Compass}
          variant="orange"
        />

        <MetricCard
          title="Available Safe Capacity"
          value={m.totalAvailableCapacity ? m.totalAvailableCapacity.toLocaleString() : '50,450'}
          subtitle={`In ${m.totalSafeZones || 10} designated safe relocation zones`}
          icon={ShieldCheck}
          variant="blue"
          badge={<Badge variant="blue">SURPLUS</Badge>}
        />

        <MetricCard
          title="Capacity Buffer Ratio"
          value={
            m.totalAvailableCapacity && m.peopleNeedingRelocation
              ? `${Math.round((m.totalAvailableCapacity / m.peopleNeedingRelocation) * 100)}%`
              : '215%'
          }
          subtitle="Safe zone surplus vs relocation demand"
          icon={TrendingUp}
          variant="yellow"
        />

        <MetricCard
          title="Total Monitored Pop."
          value={m.totalMonitoredPopulation ? m.totalMonitoredPopulation.toLocaleString() : '72,400'}
          subtitle="Civilian footprint in active hazard belts"
          icon={Users}
          variant="blue"
        />

        <MetricCard
          title="AI Scoring Architecture"
          value="MCDA / XAI"
          subtitle="Explainable Multi-Factor Risk Engine"
          icon={Activity}
          variant="yellow"
          badge={<Badge variant="white">ONLINE</Badge>}
        />
      </div>

      {/* 🔮 Strategic Whiteboard & Inter-Agency Discussion Box */}
      <DynamicPurpleBox
        title="National Crisis Council & Strategic Whiteboard"
        subtitle="Real-time multi-agency coordination, operational directives, and active discussion dispatches"
        badge="LIVE WHITEBOARD"
        icon={MessagesSquare}
        actions={
          <button
            onClick={() => onNavigate('/discussion')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Enter Discussion Section</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50/90 to-indigo-50/50 dark:from-purple-950/40 dark:to-command-900/80 border border-purple-200/80 dark:border-purple-800/40 shadow-sm space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-purple-800 dark:text-purple-300">
              <span>SDRF FIELD DIRECTIVE</span>
              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 dark:bg-red-950 dark:text-red-300 text-[10px]">ACTIVE</span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              140 families successfully relocated from Helang Spur to Pipalkoti Transit Haven. Highway transport buses on standby.
            </p>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              24 Upvotes • 2 Council Responses
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/90 to-blue-50/50 dark:from-indigo-950/40 dark:to-command-900/80 border border-indigo-200/80 dark:border-indigo-800/40 shadow-sm space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-indigo-800 dark:text-indigo-300">
              <span>GEOTECHNICAL InSAR RADAR</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 text-[10px]">RADAR SYNC</span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              GSI confirmed 14mm displacement over last 72 hours in Joshimath Ward 4. Deep tension cracks mapped along ridge.
            </p>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              31 Upvotes • GSI & CBRI Team on channel
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50/90 to-purple-50/50 dark:from-violet-950/40 dark:to-command-900/80 border border-violet-200/80 dark:border-violet-800/40 shadow-sm space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-violet-800 dark:text-violet-300">
              <span>HAVEN LOGISTICS & RATIONS</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 text-[10px]">LOGISTICS</span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Gopeshwar Haven at 82% capacity. Convoy of 6 supply trucks with 2,500 hygiene kits dispatched from Haridwar.
            </p>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              18 Upvotes • NDRF Supply Corps ETA 4 hrs
            </div>
          </div>
        </div>
      </DynamicPurpleBox>

      {/* 🛰️ Orbital Satellite Reconnaissance & Terrain Visual Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Satellite Radar Reconnaissance */}
        <div className="group relative rounded-2xl overflow-hidden border border-slate-200/90 dark:border-blue-900/60 bg-white dark:bg-command-900/90 shadow-lg shadow-slate-200/50 dark:shadow-2xl transition-all duration-300 hover-lift">
          <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-950">
            <img
              src={satelliteRadarImg}
              alt="Orbital Satellite Radar Reconnaissance"
              className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
            />
            {/* Dynamic Rotating Radar Sweep Beam */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40 mix-blend-screen">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-cyan-400/30">
                <div className="w-full h-full rounded-full border border-dashed border-cyan-400/20 animate-spin-slow" />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full animate-radar-sweep">
                <div className="w-1/2 h-1/2 bg-gradient-to-br from-cyan-400/30 via-sky-500/10 to-transparent transform origin-bottom-right" />
              </div>
            </div>

            {/* Tactical Targeting Reticle on Joshimath Hazard Sector */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-2 border-red-500/80 flex items-center justify-center animate-pulse-ring">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              </div>
              <span className="mt-1 px-2 py-0.5 rounded bg-slate-950/80 text-red-400 border border-red-500/50 font-mono text-[9px] font-bold tracking-wider backdrop-blur-sm">
                TARGET: JOSHIMATH SPUR
              </span>
            </div>

            {/* Top HUD Overlay */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-cyan-500/40 backdrop-blur-md text-cyan-300 font-mono text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>ISRO NISAR / SENTINEL-1A ACTIVE PASS</span>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-mono text-[10px] font-black uppercase tracking-wider shadow-md">
                LIVE ORBIT
              </span>
            </div>

            {/* Bottom HUD Coordinates Bar */}
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex items-center justify-between text-white font-mono text-[10px]">
              <div className="flex items-center gap-3">
                <span className="text-cyan-300">LAT: 30°33'18" N</span>
                <span className="text-cyan-300">LON: 79°33'45" E</span>
                <span className="text-amber-400">ELEV: 1,840m</span>
              </div>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                SYNC 100%
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
            <div>
              <h4 className="font-display font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Satellite className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Multi-Spectral Geological Radar Surveillance</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Sub-centimeter SAR interferometry monitoring slope shear deformation along active faultlines.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/map')}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm flex-shrink-0"
            >
              <span>Explore GIS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Safe Haven Camp & Resettlement Infrastructure */}
        <div className="group relative rounded-2xl overflow-hidden border border-slate-200/90 dark:border-blue-900/60 bg-white dark:bg-command-900/90 shadow-lg shadow-slate-200/50 dark:shadow-2xl transition-all duration-300 hover-lift">
          <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-950">
            <img
              src={safeHavenImg}
              alt="Safe Haven Resettlement Camp Infrastructure"
              className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
            />
            {/* Top HUD Overlay */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-emerald-500/40 backdrop-blur-md text-emerald-300 font-mono text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>MODEL SAFE HAVEN INFRASTRUCTURE</span>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500 text-slate-950 font-mono text-[10px] font-black uppercase tracking-wider shadow-md">
                READY 24x7
              </span>
            </div>

            {/* Interactive Feature Pills */}
            <div className="absolute bottom-3 inset-x-3 flex flex-wrap items-center gap-1.5 pointer-events-none">
              <span className="px-2 py-0.5 rounded-lg bg-slate-950/85 text-amber-300 border border-amber-400/40 text-[10px] font-mono font-bold backdrop-blur-sm">
                ⚡ 120kW Solar Microgrid
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-950/85 text-red-300 border border-red-400/40 text-[10px] font-mono font-bold backdrop-blur-sm">
                🏥 Emergency Triage Tent
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-950/85 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono font-bold backdrop-blur-sm">
                💧 20,000L Potable Water
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-950/85 text-emerald-300 border border-emerald-400/40 text-[10px] font-mono font-bold backdrop-blur-sm">
                ⛺ 2,000 Max Capacity
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
            <div>
              <h4 className="font-display font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Certified Resettlement Safe Haven Facilities</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Pre-designated zero-hazard plateaus equipped with healthcare, power, clean sanitation, and road corridors.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/safe-zones')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm flex-shrink-0"
            >
              <span>View Havens</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Hazard Distribution (Pie/Donut) */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-command-900/95 dark:via-[#0b1836]/90 dark:to-[#071126]/95 rounded-2xl p-5 border border-slate-200/90 dark:border-blue-900/50 shadow-md shadow-slate-200/50 dark:shadow-xl dark:border-blue-glow flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-heading flex items-center justify-between">
              <span>Hazard Distribution</span>
              <span className="text-amber-700 dark:text-yellow-400 font-mono text-xs font-bold">AI GIS</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-blue-200/80 mt-0.5 font-medium">Categorization across monitored vulnerable habitations</p>
          </div>

          <div className="h-64 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.hazardDistribution || []}
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts.hazardDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#071228' : '#ffffff',
                    borderColor: isDark ? '#3b82f6' : '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: isDark ? '#ffffff' : '#0f172a',
                    boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.5)' : '0 10px 25px -5px rgba(15,23,42,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200 dark:border-blue-900/40 pt-3">
            {(charts.hazardDistribution || []).map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-slate-600 dark:text-blue-100 truncate">{item.name}:</span>
                <strong className="text-amber-700 dark:text-yellow-400 font-mono font-bold">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Population at Risk by State (Bar Chart) */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-command-900/95 dark:via-[#0b1836]/90 dark:to-[#071126]/95 rounded-2xl p-5 border border-slate-200/90 dark:border-blue-900/50 shadow-md shadow-slate-200/50 dark:shadow-xl lg:col-span-2 dark:border-blue-glow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-heading">
                Population at Risk by Regional Belts
              </h3>
              <p className="text-xs text-slate-600 dark:text-blue-200/80 mt-0.5 font-medium">Critical vs Total population exposed across Indian States</p>
            </div>
            <Badge variant="yellow">Multi-State Scope</Badge>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.stateRiskData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1c335e' : '#e2e8f0'} />
                <XAxis dataKey="state" stroke={isDark ? '#93c5fd' : '#64748b'} fontSize={11} />
                <YAxis stroke={isDark ? '#93c5fd' : '#64748b'} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#071228' : '#ffffff',
                    borderColor: isDark ? '#facc15' : '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: isDark ? '#ffffff' : '#0f172a',
                    boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.5)' : '0 10px 25px -5px rgba(15,23,42,0.1)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="criticalPop" name="Critical Population" fill={isDark ? '#facc15' : '#d97706'} radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalPop" name="Total Monitored Pop." fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="border-t border-slate-200 dark:border-blue-900/40 pt-3 flex items-center justify-between text-xs text-slate-600 dark:text-blue-200/80">
            <span>Highest vulnerability concentration: <strong className="text-slate-900 dark:text-white font-semibold">Uttarakhand & Kerala (Wayanad)</strong></span>
            <button onClick={() => onNavigate('/habitations')} className="text-amber-700 hover:text-amber-800 dark:text-yellow-400 dark:hover:text-yellow-300 flex items-center gap-1 font-bold transition-colors">
              Explore Habitations Table <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: 30-Day Risk Trend & Ground Field Observations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 30-Day Risk Trend Line Chart */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-command-900/95 dark:via-[#0b1836]/90 dark:to-[#071126]/95 rounded-2xl p-5 border border-slate-200/90 dark:border-blue-900/50 shadow-md shadow-slate-200/50 dark:shadow-xl lg:col-span-2 dark:border-blue-glow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-heading">
                Seasonal Hazard Index & Alert Progression
              </h3>
              <p className="text-xs text-slate-600 dark:text-blue-200/80 mt-0.5 font-medium">Monitored risk level progression vs baseline threshold</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 border border-amber-300 dark:text-yellow-300 dark:bg-yellow-400/15 dark:border-yellow-400/40 px-2.5 py-1 rounded-lg">
              Active Telemetry Sync
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.riskTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1c335e' : '#e2e8f0'} />
                <XAxis dataKey="day" stroke={isDark ? '#93c5fd' : '#64748b'} fontSize={11} />
                <YAxis stroke={isDark ? '#93c5fd' : '#64748b'} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#071228' : '#ffffff',
                    borderColor: isDark ? '#38bdf8' : '#cbd5e1',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: isDark ? '#ffffff' : '#0f172a',
                    boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.5)' : '0 10px 25px -5px rgba(15,23,42,0.1)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="monitored" name="Monitored Risk Index" stroke={isDark ? '#facc15' : '#d97706'} strokeWidth={3} dot={{ r: 4, fill: isDark ? '#facc15' : '#d97706' }} />
                <Line type="monotone" dataKey="baseline" name="Baseline Safety Threshold" stroke="#0284c7" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#0284c7' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Field Intelligence Feed */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-command-900/95 dark:via-[#0b1836]/90 dark:to-[#071126]/95 rounded-2xl p-5 border border-slate-200/90 dark:border-blue-900/50 shadow-md shadow-slate-200/50 dark:shadow-xl flex flex-col justify-between dark:border-blue-glow">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-heading flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-500 dark:text-yellow-400 animate-pulse" />
                Field Officer Ground Reports
              </h3>
              <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800/50 px-2 py-0.5 rounded-full font-mono font-bold">
                Live Feed
              </span>
            </div>

            <div className="space-y-3">
              {reports.slice(0, 3).map((rep) => (
                <div key={rep.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-command-950/80 border border-slate-200 dark:border-blue-900/50 text-xs shadow-sm dark:shadow-inner">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 dark:text-white truncate">{rep.location_name}</span>
                    <Badge variant={rep.severity_level === 'Critical' ? 'critical' : 'yellow'} size="sm">
                      {rep.severity_level}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-blue-100/80 line-clamp-2 mb-2 font-medium">{rep.ground_observation}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-blue-300/70 border-t border-slate-200 dark:border-blue-900/40 pt-1.5 font-mono">
                    <span>Officer: <strong className="text-slate-800 dark:text-white">{rep.officer_name}</strong></span>
                    <span className="text-amber-700 dark:text-yellow-400 font-bold">{rep.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('/reports')}
            className="w-full mt-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 dark:bg-blue-950/80 dark:hover:bg-blue-900/80 dark:border-blue-700/50 dark:text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <FileText className="w-4 h-4 text-amber-500 dark:text-yellow-400" />
            View All Reports & Field Submissions
          </button>
        </div>
      </div>
    </div>
  );
}
