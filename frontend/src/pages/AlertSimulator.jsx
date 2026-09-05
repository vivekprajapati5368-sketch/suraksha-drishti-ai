import React, { useState, useEffect } from 'react';
import { Flame, CloudRain, Waves, Mountain, Zap, RefreshCw, AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { DynamicMouseText } from '../components/common/DynamicMouseText';
import { api } from '../services/api';

export function AlertSimulator({ onNavigate }) {
  const [scenario, setScenario] = useState('Heavy Rainfall');
  const [targetState, setTargetState] = useState('All');
  const [severity, setSeverity] = useState(1.5);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);

  const fetchStatus = () => {
    api.getSimulationStatus()
      .then(res => {
        if (res.success) setCurrentStatus(res.data);
      })
      .catch(err => console.error('Status error:', err));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRunSimulation = async () => {
    setSimulating(true);
    try {
      const res = await api.simulateAlert(scenario, targetState, severity);
      if (res.success) {
        setSimResult(res.data);
        fetchStatus();
      }
    } catch (err) {
      alert('Simulation error: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  const handleReset = async () => {
    try {
      await api.resetSimulation();
      setSimResult(null);
      fetchStatus();
      alert('Simulation cleared. Baseline conditions restored.');
    } catch (err) {
      alert('Reset failed: ' + err.message);
    }
  };

  const scenarios = [
    {
      id: 'Heavy Rainfall',
      label: 'Heavy Rainfall (Monsoon Surge)',
      desc: 'Simulates 150mm+ monsoonal deluge causing widespread hydrological run-off.',
      icon: CloudRain,
      color: 'blue'
    },
    {
      id: 'Flood Warning',
      label: 'Flood Warning (River Embankment Surge)',
      desc: 'Simulates 3m+ river crest breaching alluvial levees in riverine habitations.',
      icon: Waves,
      color: 'cyan'
    },
    {
      id: 'Landslide Warning',
      label: 'Landslide Warning (Slope Saturation)',
      desc: 'Simulates critical pore pressure surge triggering massive shear slippage.',
      icon: Mountain,
      color: 'amber'
    },
    {
      id: 'Cloudburst',
      label: 'Cloudburst (Flash Torrent Catastrophe)',
      desc: 'Simulates instantaneous 280mm+ cloudburst unleashing violent debris flows.',
      icon: Zap,
      color: 'red'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-cyberblue-900/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-cyberyellow-400 animate-ping"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-cyberyellow-400">
              STRESS TESTING & EMERGENCY PROTOCOL SIMULATOR
            </span>
          </div>
          <DynamicMouseText as="h1" variant="hero" className="text-2xl sm:text-3xl font-display font-black tracking-tight drop-shadow-sm">
            Real-Time Disaster Alert Simulation
          </DynamicMouseText>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
            Test institutional readiness by triggering dynamic hydro-meteorological and geotechnical crisis scenarios across vulnerable belts.
          </p>
        </div>

        {currentStatus?.is_simulating ? (
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 dark:bg-red-950/80 dark:hover:bg-red-900/90 border border-red-500 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-red-900/40 transition"
          >
            <RefreshCw className="w-4 h-4 text-white dark:text-red-400 animate-spin" />
            Reset to Baseline
          </button>
        ) : null}
      </div>

      {/* Active State Banner */}
      {currentStatus?.is_simulating ? (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-gradient-to-r dark:from-red-950/70 dark:via-command-900 dark:to-amber-950/60 border border-amber-400 dark:border-cyberyellow-500/60 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-cyberyellow-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800 dark:text-cyberyellow-400 uppercase tracking-wider font-mono">
                SIMULATION CURRENTLY RUNNING
              </p>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">{currentStatus.event_type} Scenario</h3>
              <p className="text-xs text-slate-700 dark:text-slate-200 mt-0.5">{currentStatus.simulation_message}</p>
            </div>
          </div>
          <Badge variant="yellow" pulse={true}>ELEVATED SURGE ACTIVE</Badge>
        </div>
      ) : null}

      {/* Main Simulation Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Scenario Selection */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-amber-700 dark:text-cyberyellow-400 uppercase tracking-wider font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-cyberyellow-400"></span>
            1. Select Calamity Scenario
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {scenarios.map(sc => {
              const Icon = sc.icon;
              const isSelected = scenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setScenario(sc.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-amber-50/90 border-amber-500 shadow-md ring-1 ring-amber-400 dark:bg-gradient-to-br dark:from-command-900 dark:via-blue-950/70 dark:to-command-900 dark:border-cyberyellow-400 dark:shadow-lg dark:shadow-yellow-500/10 dark:ring-cyberyellow-400/40'
                      : 'bg-white dark:bg-command-900/90 border-slate-200 dark:border-cyberblue-900/60 hover:border-blue-400 dark:hover:border-cyberblue-600/70 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-yellow-500/20' : 'bg-slate-100 dark:bg-command-950 border border-slate-200 dark:border-cyberblue-800/60 text-blue-700 dark:text-cyberblue-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm ${isSelected ? 'text-amber-800 dark:text-cyberyellow-300 font-display' : 'text-slate-900 dark:text-white'}`}>{sc.label}</h4>
                      <span className="text-[10px] text-blue-700 dark:text-cyberblue-300 font-mono font-semibold">Dynamic Trigger</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{sc.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Scenario Parameters */}
          <div className="bg-white dark:bg-command-900/90 p-5 rounded-2xl border border-slate-200 dark:border-cyberblue-800/60 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyberblue-400"></span>
              2. Simulation Parameters & Geographical Scope
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-mono">
                  TARGET JURISDICTION / REGIONAL BELT:
                </label>
                <select
                  value={targetState}
                  onChange={(e) => setTargetState(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-command-950 border border-slate-300 dark:border-cyberblue-800/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-medium"
                >
                  <option value="All">Pan-India (All Disaster Belts)</option>
                  <option value="Uttarakhand">Uttarakhand (Himalayan Landslide Belt)</option>
                  <option value="Kerala">Kerala (Wayanad Debris Corridor)</option>
                  <option value="Assam">Assam (Brahmaputra Flood Basin)</option>
                  <option value="Himachal Pradesh">Himachal Pradesh (Beas Torrent Corridor)</option>
                  <option value="Odisha">Odisha (Coastal Inundation Belt)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-mono">
                  SEVERITY MULTIPLIER: <span className="text-amber-700 dark:text-cyberyellow-400 font-bold">{severity}x</span>
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.1"
                  value={severity}
                  onChange={(e) => setSeverity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-command-950 rounded-lg appearance-none cursor-pointer accent-amber-500 dark:accent-cyberyellow-400 mt-2"
                />
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                  <span>1.0x (Moderate)</span>
                  <span className="text-amber-700 dark:text-cyberyellow-300 font-bold">1.5x (Severe)</span>
                  <span className="text-red-600 dark:text-red-400 font-bold">2.5x (Catastrophic)</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={simulating}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs font-black tracking-wider uppercase transition shadow-xl shadow-yellow-500/25 flex items-center justify-center gap-2 transform active:scale-[0.99]"
            >
              <Flame className="w-4 h-4 text-slate-950" />
              {simulating ? 'Synthesizing Dynamic Hazard Models...' : `Trigger ${scenario} Simulation`}
            </button>
          </div>
        </div>

        {/* Right: Simulation Output & Instant Impact */}
        <div className="bg-white dark:bg-command-900/90 p-5 rounded-2xl border border-slate-200 dark:border-cyberblue-800/60 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-cyberyellow-400" />
              Live Impact & Relocation Orders
            </h2>

            {simResult ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Official High Risk Alert Box */}
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-gradient-to-r dark:from-red-950/70 dark:via-command-950 dark:to-command-900 border border-red-300 dark:border-cyberyellow-400/80 text-xs text-red-900 dark:text-red-200 space-y-1 shadow-md">
                  <span className="font-bold text-red-700 dark:text-cyberyellow-300 block uppercase tracking-wider font-mono">
                    {simResult.alertHeadline}
                  </span>
                  <p className="text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed">
                    {simResult.alertMessage}
                  </p>
                </div>

                {/* Quantitative Impact Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-50 dark:bg-command-950 p-3 rounded-xl border border-slate-200 dark:border-cyberblue-900/80 shadow-sm">
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">NEW RED ZONES</span>
                    <strong className="text-xl text-amber-700 dark:text-cyberyellow-400 font-display">+{simResult.newRedZonesCount}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-command-950 p-3 rounded-xl border border-slate-200 dark:border-cyberblue-900/80 shadow-sm">
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">CRITICAL HABITATIONS</span>
                    <strong className="text-xl text-slate-900 dark:text-white font-display">{simResult.criticalHabitationsCount}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-command-950 p-3 rounded-xl border border-slate-200 dark:border-cyberblue-900/80 shadow-sm">
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">RAINFALL SURGE</span>
                    <strong className="text-xl text-slate-900 dark:text-white font-display">+{simResult.rainfallDelta} mm</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-command-950 p-3 rounded-xl border border-slate-200 dark:border-cyberblue-900/80 shadow-sm">
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">ZONES RECALCULATED</span>
                    <strong className="text-blue-700 dark:text-cyberblue-400 font-display">{simResult.updatedZonesCount}</strong>
                  </div>
                </div>

                {/* Top Affected Habitations */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase text-amber-700 dark:text-cyberyellow-400 font-mono">
                    Habitations Requiring Immediate Evacuation:
                  </p>
                  {simResult.affectedHabitations?.map((hab) => (
                    <div key={hab.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-cyberblue-800/80 text-xs flex items-center justify-between shadow-sm">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{hab.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{hab.district}, {hab.state} • Pop: {hab.population.toLocaleString()}</span>
                      </div>
                      <Badge variant="yellow" size="sm">Score: {hab.riskScore}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-xs">
                <AlertTriangle className="w-8 h-8 text-amber-500 dark:text-cyberyellow-400 mx-auto mb-2 opacity-80" />
                Select scenario and parameters, then click Trigger to simulate extreme calamity conditions and evaluate updated Red Zones in real-time.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-cyberblue-900/60 mt-4 flex items-center justify-between">
            <button
              onClick={() => onNavigate('/map')}
              className="text-blue-700 dark:text-cyberblue-400 hover:text-blue-800 dark:hover:text-cyberblue-300 text-xs font-semibold flex items-center gap-1 font-mono transition"
            >
              Verify on GIS Map <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('/relocation')}
              className="text-amber-700 dark:text-cyberyellow-400 hover:text-amber-800 dark:hover:text-cyberyellow-300 text-xs font-semibold flex items-center gap-1 font-mono transition"
            >
              Updated Haven Pairings <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
