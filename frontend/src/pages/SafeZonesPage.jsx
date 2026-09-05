import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Droplets, HeartPulse, Bus, GraduationCap, Briefcase, Calculator, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Sun, Home, Zap, MapPin } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { DynamicMouseText } from '../components/common/DynamicMouseText';
import safeHavenImg from '../assets/images/safe_haven_camp.jpg';
import { api } from '../services/api';

export function SafeZonesPage({ onNavigate }) {
  const [safeZones, setSafeZones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Interactive Stress Tester State
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [influxCount, setInfluxCount] = useState(2500);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const fetchSafeZones = () => {
    setLoading(true);
    api.getSafeZones()
      .then(res => {
        if (res.success) {
          setSafeZones(res.data);
          if (res.data.length > 0 && !selectedZoneId) {
            setSelectedZoneId(res.data[0].id.toString());
          }
        }
      })
      .catch(err => console.error('Failed to load safe zones:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSafeZones();
  }, []);

  const handleTestCapacity = async (e) => {
    e.preventDefault();
    if (!selectedZoneId || !influxCount) return;
    setTesting(true);
    try {
      const res = await api.testCapacityInflux(Number(selectedZoneId), Number(influxCount));
      if (res.success) {
        setTestResult(res.data);
      }
    } catch (err) {
      alert('Simulation calculation failed: ' + err.message);
    } finally {
      setTesting(false);
    }
  };

  const totalMaxCap = safeZones.reduce((a, b) => a + b.maximum_capacity, 0);
  const totalCurrPop = safeZones.reduce((a, b) => a + b.current_population, 0);
  const totalAvailCap = safeZones.reduce((a, b) => a + b.available_capacity, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-blue-900/50 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-yellow-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-yellow-400">
              CIVIC ABSORPTION & INFRASTRUCTURE SUSTAINABILITY
            </span>
          </div>
          <DynamicMouseText as="h1" variant="hero" className="text-2xl sm:text-3xl font-black tracking-tight font-heading">
            Safe Zones & Carrying Capacity Calculator
          </DynamicMouseText>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200/80 mt-0.5 font-medium">
            Evaluate demographic carrying capacity, municipal infrastructure elasticity, and civic sustainability for resilient resettlement.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/relocation')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/30 transition"
        >
          <Users className="w-4 h-4 text-blue-200" />
          Assign Relocations
        </button>
      </div>

      {/* 🏕️ Model Safe Haven Infrastructure Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 dark:border-blue-900/60 bg-white dark:bg-command-900 shadow-xl group hover-lift">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950">
          <img
            src={safeHavenImg}
            alt="Model Safe Haven Resettlement Camp"
            className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105 opacity-95"
          />
          {/* Top HUD Badges */}
          <div className="absolute top-4 inset-x-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-emerald-500/40 backdrop-blur-md text-emerald-300 font-mono text-xs font-bold shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>GOPESHWAR DISTRICT BENCHMARK HAVEN</span>
            </div>
            <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-mono text-xs font-black uppercase tracking-wider shadow-md">
              CAPACITY CERTIFIED • GRADE A+
            </span>
          </div>

          {/* Infrastructure Feature Badges */}
          <div className="absolute bottom-4 inset-x-4 flex flex-wrap items-center gap-2 pointer-events-none">
            <span className="px-3 py-1 rounded-xl bg-slate-950/85 text-amber-300 border border-amber-400/40 text-xs font-mono font-bold backdrop-blur-md shadow-md flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>120kW Solar Microgrid</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-950/85 text-red-300 border border-red-400/40 text-xs font-mono font-bold backdrop-blur-md shadow-md flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-red-400" />
              <span>24x7 Triage Medical Wing</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-950/85 text-cyan-300 border border-cyan-400/40 text-xs font-mono font-bold backdrop-blur-md shadow-md flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>20,000L Potable Water Cisterns</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-950/85 text-emerald-300 border border-emerald-400/40 text-xs font-mono font-bold backdrop-blur-md shadow-md flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-emerald-400" />
              <span>500 Modular Weatherproof Units</span>
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 dark:border-blue-900/40">
          <div>
            <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Standardized Disaster Relocation Safe Haven Blueprint</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-2xl">
              Equipped with independent off-grid solar power generation, emergency medicine triage, high-capacity water filtration, and direct all-weather highway logistics connectivity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              Zone Elevation: 1,520m • Zero Flood Contour
            </span>
          </div>
        </div>
      </div>

      {/* Aggregate Capacity Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gradient-to-br dark:from-command-900/95 dark:via-[#0b1836]/90 dark:to-[#071126]/95 rounded-2xl p-5 border border-slate-200/90 dark:border-blue-900/50 shadow-md shadow-slate-200/50 dark:shadow-xl dark:border-blue-glow">
          <p className="text-xs font-bold text-slate-600 dark:text-blue-300 uppercase tracking-wider font-mono">Maximum Carrying Capacity</p>
          <p className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-1.5">{totalMaxCap.toLocaleString()} <span className="text-xs text-slate-600 dark:text-blue-300 font-sans font-normal">persons</span></p>
          <p className="text-xs text-slate-600 dark:text-blue-200/70 mt-1 font-medium">Across {safeZones.length} designated safe resettlement sites</p>
        </div>

        <div className="bg-white dark:bg-gradient-to-br dark:from-command-900/95 dark:via-[#0b1836]/90 dark:to-[#071126]/95 rounded-2xl p-5 border border-slate-200/90 dark:border-blue-900/50 shadow-md shadow-slate-200/50 dark:shadow-xl dark:border-blue-glow">
          <p className="text-xs font-bold text-slate-600 dark:text-blue-300 uppercase tracking-wider font-mono">Current Base Population</p>
          <p className="text-3xl font-black font-mono text-slate-800 dark:text-slate-200 mt-1.5">{totalCurrPop.toLocaleString()} <span className="text-xs text-slate-600 dark:text-blue-300 font-sans font-normal">residents</span></p>
          <p className="text-xs text-slate-600 dark:text-blue-200/70 mt-1 font-medium">Baseline municipal occupancy: {Math.round((totalCurrPop / (totalMaxCap || 1)) * 100)}%</p>
        </div>

        <div className="bg-white dark:bg-gradient-to-br dark:from-command-900/95 dark:via-[#122347]/90 dark:to-[#071126]/95 rounded-2xl p-5 border border-amber-300 dark:border-yellow-400/40 shadow-md shadow-amber-500/10 dark:shadow-xl dark:glow-yellow">
          <p className="text-xs font-bold text-amber-800 dark:text-yellow-400 uppercase tracking-wider font-mono">Total Available Capacity</p>
          <p className="text-3xl font-black font-mono text-amber-600 dark:text-yellow-300 mt-1.5">{totalAvailCap.toLocaleString()} <span className="text-xs text-amber-700 dark:text-yellow-400 font-sans font-normal">intake capacity</span></p>
          <p className="text-xs text-amber-800/80 dark:text-yellow-200/80 mt-1 font-medium">Surplus ready for displaced habitations</p>
        </div>
      </div>

      {/* Interactive Carrying Capacity Stress-Test Console */}
      <div className="bg-white dark:bg-gradient-to-br dark:from-command-900/95 dark:via-[#0c1838]/90 dark:to-[#071126]/95 rounded-2xl p-6 border border-slate-200/90 dark:border-blue-500/40 shadow-md shadow-slate-200/50 dark:shadow-2xl dark:border-blue-glow">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-5 h-5 text-amber-600 dark:text-yellow-400" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight font-heading">
            Interactive Carrying Capacity Stress-Test Calculator
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-blue-200/80 mb-5 font-medium">
          Test whether a candidate safe haven can sustainably absorb a planned intake without exceeding civic infrastructure thresholds.
        </p>

        <form onSubmit={handleTestCapacity} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-yellow-300 mb-1.5 font-mono">
              SELECT SAFE RELOCATION HAVEN:
            </label>
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="w-full bg-white dark:bg-command-950/90 border border-slate-200 dark:border-blue-900/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-yellow-400 font-semibold"
            >
              {safeZones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.name} (Available: {z.available_capacity.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-yellow-300 mb-1.5 font-mono">
              PROJECTED INCOMING POPULATION:
            </label>
            <input
              type="number"
              min="100"
              max="25000"
              step="50"
              value={influxCount}
              onChange={(e) => setInfluxCount(e.target.value)}
              className="w-full bg-white dark:bg-command-950/90 border border-slate-200 dark:border-blue-900/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-yellow-400 font-mono font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={testing}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            {testing ? 'Computing Stress Matrix...' : 'Simulate Absorption Stress'}
          </button>
        </form>

        {/* Calculation Result */}
        {testResult && (
          <div className={`mt-5 p-4 rounded-2xl border animate-in fade-in duration-200 ${
            testResult.canAccommodate ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-blue-950/50 dark:border-blue-500/50 dark:text-blue-100' : 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-yellow-950/40 dark:border-yellow-500/50 dark:text-yellow-200'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {testResult.canAccommodate ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-yellow-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0" />
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {testResult.canAccommodate
                      ? 'SUITABLE FOR RELOCATION: Safe Capacity Adequate'
                      : 'CAPACITY DEFICIT: Influx Exceeds Safe Haven Threshold'}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-blue-200/90 mt-0.5">
                    Target Population: <strong className="text-slate-900 dark:text-white font-mono">{testResult.targetPopulation.toLocaleString()}</strong> • 
                    Available Capacity: <strong className="text-slate-900 dark:text-white font-mono">{testResult.availableCapacity.toLocaleString()}</strong> • 
                    Post-Allocation Occupancy: <strong className="text-amber-700 dark:text-yellow-400 font-mono font-bold">{testResult.postAllocationOccupancy}%</strong>
                  </p>
                </div>
              </div>

              <Badge variant={testResult.canAccommodate ? 'yellow' : 'critical'}>
                {testResult.fitRating}
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* List of Designated Safe Relocation Zones */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight font-heading uppercase flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-yellow-400" />
          Designated Relocation Havens & Sustainability Ratings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeZones.map(zone => {
            const occupancyPct = Math.min(100, Math.round((zone.current_population / (zone.maximum_capacity || 1)) * 100));

            return (
              <div
                key={zone.id}
                className="bg-white dark:bg-gradient-to-br dark:from-command-900/95 dark:via-[#0b1836]/90 dark:to-[#071126]/95 rounded-2xl p-5 border border-slate-200/90 dark:border-blue-900/50 shadow-md shadow-slate-200/50 dark:shadow-xl flex flex-col justify-between hover:border-amber-400 dark:hover:border-yellow-400/50 transition duration-200 dark:border-blue-glow group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-amber-800 dark:text-yellow-400 uppercase tracking-wider">
                      {zone.district}, {zone.state}
                    </span>
                    <Badge variant={zone.sustainability_score >= 80 ? 'yellow' : 'blue'}>
                      {zone.suitability_rating} ({zone.sustainability_score}/100)
                    </Badge>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 font-heading group-hover:text-amber-700 dark:group-hover:text-yellow-300 transition-colors">{zone.name}</h3>

                  {/* Capacity Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-600 dark:text-blue-200/80 font-medium">Occupancy: {occupancyPct}%</span>
                      <span className="text-amber-700 dark:text-yellow-400 font-bold">
                        {zone.available_capacity.toLocaleString()} available
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-command-950 rounded-full h-2.5 overflow-hidden border border-slate-300 dark:border-blue-900/40">
                      <div
                        className={`h-full rounded-full ${occupancyPct > 80 ? 'bg-red-500' : (occupancyPct > 50 ? 'bg-amber-500 dark:bg-yellow-400' : 'bg-blue-600 dark:bg-blue-500')}`}
                        style={{ width: `${occupancyPct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-600 dark:text-blue-300/70 font-mono">
                      <span>Base: {zone.current_population.toLocaleString()}</span>
                      <span>Max Cap: {zone.maximum_capacity.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Infrastructure Pillar Scores */}
                  <div className="grid grid-cols-5 gap-1 text-center bg-slate-50 dark:bg-command-950/80 p-2.5 rounded-xl border border-slate-200 dark:border-blue-900/50 text-[10px] font-mono mb-3">
                    <div>
                      <Droplets className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mx-auto mb-0.5" />
                      <span className="text-slate-600 dark:text-blue-300/80 block font-bold">WATER</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{zone.water_score}</strong>
                    </div>
                    <div>
                      <HeartPulse className="w-3.5 h-3.5 text-red-500 dark:text-red-400 mx-auto mb-0.5" />
                      <span className="text-slate-600 dark:text-blue-300/80 block font-bold">HEALTH</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{zone.healthcare_score}</strong>
                    </div>
                    <div>
                      <Bus className="w-3.5 h-3.5 text-amber-600 dark:text-yellow-400 mx-auto mb-0.5" />
                      <span className="text-slate-600 dark:text-blue-300/80 block font-bold">ROAD</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{zone.connectivity_score}</strong>
                    </div>
                    <div>
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-300 mx-auto mb-0.5" />
                      <span className="text-slate-600 dark:text-blue-300/80 block font-bold">SCHOOL</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{zone.school_score}</strong>
                    </div>
                    <div>
                      <Briefcase className="w-3.5 h-3.5 text-amber-600 dark:text-yellow-400 mx-auto mb-0.5" />
                      <span className="text-slate-600 dark:text-blue-300/80 block font-bold">WORK</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{zone.employment_score}</strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-blue-100/80 leading-relaxed line-clamp-2 font-medium">
                    {zone.facilities_summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-blue-900/40 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-blue-300/70 font-mono font-medium">Area: {zone.total_area_ha} hectares</span>
                  <button
                    onClick={() => {
                      setSelectedZoneId(zone.id.toString());
                      window.scrollTo({ top: 180, behavior: 'smooth' });
                    }}
                    className="text-amber-700 hover:text-amber-800 dark:text-yellow-400 dark:hover:text-yellow-300 font-bold flex items-center gap-1 transition-colors"
                  >
                    Stress Test This Haven <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
