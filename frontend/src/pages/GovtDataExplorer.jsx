import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Compass,
  AlertTriangle,
  Waves,
  Pickaxe,
  History,
  Mountain,
  Search,
  CheckCircle2,
  Navigation,
  ArrowRight,
  ExternalLink,
  Flame,
  Droplets,
  Building,
  RefreshCw,
  Activity,
  FileSpreadsheet,
  Layers,
  MapPin,
  TrendingDown,
  Info
} from 'lucide-react';
import { DynamicMouseText } from '../components/common/DynamicMouseText';
import { Badge } from '../components/common/Badge';
import { MetricCard } from '../components/common/MetricCard';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

export function GovtDataExplorer({ onNavigate }) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('predictor'); // 'predictor', 'rivers', 'mining', 'disasters', 'soils'

  // Datasets State
  const [loading, setLoading] = useState(false);
  const [habitations, setHabitations] = useState([]);
  const [riversData, setRiversData] = useState([]);
  const [miningData, setMiningData] = useState([]);
  const [disastersData, setDisastersData] = useState([]);
  const [soilsData, setSoilsData] = useState([]);

  // Filters State
  const [riverTypeFilter, setRiverTypeFilter] = useState('All');
  const [miningOperatorFilter, setMiningOperatorFilter] = useState('All');
  const [disasterYearFilter, setDisasterYearFilter] = useState('All');
  const [disasterCategoryFilter, setDisasterCategoryFilter] = useState('All');
  const [soilStateFilter, setSoilStateFilter] = useState('All');

  // Predictor Form & Result State
  const [selectedHabitationId, setSelectedHabitationId] = useState('1');
  const [customLocationName, setCustomLocationName] = useState('');
  const [customState, setCustomState] = useState('Uttarakhand');
  const [customDistrict, setCustomDistrict] = useState('Chamoli');
  const [customSlope, setCustomSlope] = useState(37);
  const [customRiverDist, setCustomRiverDist] = useState(280);
  const [customSoilType, setCustomSoilType] = useState('Mountain Scree & Moraine Lithosol');
  const [customRainfall, setCustomRainfall] = useState(320);
  const [customNearMining, setCustomNearMining] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [predicting, setPredicting] = useState(false);

  // Load initial data
  useEffect(() => {
    api.getHabitations().then(res => {
      if (res.success) setHabitations(res.data || []);
    });
    loadRivers();
    loadMining();
    loadDisasters();
    loadSoils();
    runPrediction({ habitationId: 1 });
  }, []);

  const loadRivers = () => {
    api.getRiversAndDams({ type: riverTypeFilter }).then(res => {
      if (res.success) setRiversData(res.data || []);
    });
  };

  const loadMining = () => {
    api.getMiningSites({ operator_type: miningOperatorFilter }).then(res => {
      if (res.success) setMiningData(res.data || []);
    });
  };

  const loadDisasters = () => {
    api.getDisasters20Yr({ year: disasterYearFilter, category: disasterCategoryFilter }).then(res => {
      if (res.success) setDisastersData(res.data || []);
    });
  };

  const loadSoils = () => {
    api.getGeologySoils({ state: soilStateFilter }).then(res => {
      if (res.success) setSoilsData(res.data || []);
    });
  };

  useEffect(() => { loadRivers(); }, [riverTypeFilter]);
  useEffect(() => { loadMining(); }, [miningOperatorFilter]);
  useEffect(() => { loadDisasters(); }, [disasterYearFilter, disasterCategoryFilter]);
  useEffect(() => { loadSoils(); }, [soilStateFilter]);

  const runPrediction = async (params) => {
    setPredicting(true);
    try {
      const res = await api.predictAreaSafety(params);
      if (res.success) {
        setPredictionResult(res);
      }
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setPredicting(false);
    }
  };

  const handleHabitationSelect = (e) => {
    const id = e.target.value;
    setSelectedHabitationId(id);
    if (id !== 'custom') {
      runPrediction({ habitationId: Number(id) });
    }
  };

  const handleCustomPredict = (e) => {
    e.preventDefault();
    runPrediction({
      locationName: customLocationName || 'Custom Geographic Coordinate',
      state: customState,
      district: customDistrict,
      slopeDeg: Number(customSlope),
      riverDistanceM: Number(customRiverDist),
      soilType: customSoilType,
      rainfallMm: Number(customRainfall),
      nearMining: customNearMining
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-blue-900/50 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              GOVERNMENT OF INDIA STATUTORY REGISTRIES • CWC • GSI • IBM • NDMA
            </span>
          </div>
          <DynamicMouseText as="h1" variant="hero" className="text-2xl sm:text-3xl font-black tracking-tight font-heading">
            Government Disaster Telemetry & Area Safety Predictor
          </DynamicMouseText>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200/80 mt-1 font-medium">
            Cross-analyzed official datasets: Rivers & Dams, Mining Sites, 20-Year Calamities, and Geotechnical Soils with Autonomous Nearest Safe Haven Routing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/reports')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Official MHA Dossier</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-blue-900/40 text-xs font-bold select-none">
        <button
          onClick={() => setActiveTab('predictor')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'predictor'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-command-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-blue-900/40 hover:bg-slate-50 dark:hover:bg-blue-950/50'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>🎯 Area Safety Predictor & Nearest Haven</span>
        </button>

        <button
          onClick={() => setActiveTab('rivers')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'rivers'
              ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-600/20'
              : 'bg-white dark:bg-command-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-blue-900/40 hover:bg-slate-50 dark:hover:bg-blue-950/50'
          }`}
        >
          <Waves className="w-4 h-4" />
          <span>🌊 Rivers & Dams Telemetry ({riversData.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mining')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'mining'
              ? 'bg-amber-600 text-white font-black shadow-md shadow-amber-600/20'
              : 'bg-white dark:bg-command-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-blue-900/40 hover:bg-slate-50 dark:hover:bg-blue-950/50'
          }`}
        >
          <Pickaxe className="w-4 h-4" />
          <span>⛏️ Mining Sites & Subsidence ({miningData.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('disasters')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'disasters'
              ? 'bg-red-600 text-white font-black shadow-md shadow-red-600/20'
              : 'bg-white dark:bg-command-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-blue-900/40 hover:bg-slate-50 dark:hover:bg-blue-950/50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>📜 20-Year Calamities ({disastersData.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('soils')}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'soils'
              ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-command-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-blue-900/40 hover:bg-slate-50 dark:hover:bg-blue-950/50'
          }`}
        >
          <Mountain className="w-4 h-4" />
          <span>🪨 Geotechnical Soils & Rocks ({soilsData.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AREA SAFETY PREDICTOR & NEAREST SAFE HAVEN LOCATOR */}
      {/* ========================================================================= */}
      {activeTab === 'predictor' && (
        <div className="space-y-6">
          {/* Top Control Form */}
          <div className="p-5 rounded-2xl bg-white dark:bg-command-900/90 border border-slate-200 dark:border-blue-900/60 shadow-md">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-500" />
              <span>Select Location or Enter Custom Coordinates for Autonomous AI Safety Prediction</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Choose Monitored Habitation
                </label>
                <select
                  value={selectedHabitationId}
                  onChange={handleHabitationSelect}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-blue-950/60 border border-slate-300 dark:border-blue-900/60 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {habitations.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.district}, {h.state}) - {h.primary_hazard}
                    </option>
                  ))}
                  <option value="custom">-- Custom Area Parameters --</option>
                </select>
              </div>

              {selectedHabitationId === 'custom' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Location / Village Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Mana Village, Chamoli"
                      value={customLocationName}
                      onChange={e => setCustomLocationName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-blue-950/60 border border-slate-300 dark:border-blue-900/60 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">State</label>
                    <input
                      type="text"
                      value={customState}
                      onChange={e => setCustomState(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-blue-950/60 border border-slate-300 dark:border-blue-900/60 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}
            </div>

            {selectedHabitationId === 'custom' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-blue-900/40 mb-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400">Slope Angle: {customSlope}°</label>
                  <input
                    type="range"
                    min="0"
                    max="65"
                    value={customSlope}
                    onChange={e => setCustomSlope(e.target.value)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-blue-900 rounded-lg accent-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400">River Distance: {customRiverDist}m</label>
                  <input
                    type="range"
                    min="50"
                    max="3000"
                    step="50"
                    value={customRiverDist}
                    onChange={e => setCustomRiverDist(e.target.value)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-blue-900 rounded-lg accent-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400">24h Rainfall: {customRainfall}mm</label>
                  <input
                    type="range"
                    min="20"
                    max="600"
                    step="20"
                    value={customRainfall}
                    onChange={e => setCustomRainfall(e.target.value)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-blue-900 rounded-lg accent-cyan-500"
                  />
                </div>
                <div className="flex items-center gap-2 pt-3">
                  <input
                    type="checkbox"
                    id="nearMining"
                    checked={customNearMining}
                    onChange={e => setCustomNearMining(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600"
                  />
                  <label htmlFor="nearMining" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Near Active Mining Site
                  </label>
                </div>
              </div>
            )}

            {selectedHabitationId === 'custom' && (
              <button
                onClick={handleCustomPredict}
                disabled={predicting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md hover:scale-[1.01] transition flex items-center gap-2"
              >
                {predicting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                <span>Calculate Autonomous Safety Prediction</span>
              </button>
            )}
          </div>

          {/* Prediction Result Display */}
          {predictionResult && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Verdict Banner - Golden Yellow Command Theme */}
              <div className="p-6 rounded-2xl border-2 border-yellow-400/90 dark:border-yellow-400 bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-600/20 dark:from-[#2e2106]/95 dark:via-[#221804]/90 dark:to-[#0f172a] text-slate-950 dark:text-white shadow-xl shadow-yellow-500/15 dark:shadow-yellow-950/50 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-44 h-44 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="space-y-1.5 text-center md:text-left relative z-10">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500 dark:bg-yellow-400 animate-ping"></span>
                    <span className="text-xs font-mono font-black uppercase tracking-widest text-amber-800 dark:text-yellow-300">
                      AUTONOMOUS PREDICTIVE SAFETY VERDICT
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-yellow-300 font-heading">
                    {predictionResult.riskAnalysis.safetyVerdict}
                  </h2>
                  <p className="text-xs text-slate-700 dark:text-yellow-100/90 max-w-2xl font-medium">
                    Location: <strong className="text-slate-950 dark:text-white">{predictionResult.location.locationName}</strong> ({predictionResult.location.district}, {predictionResult.location.state}) • Coordinates: <span className="font-mono text-amber-800 dark:text-yellow-400 font-bold">{predictionResult.location.latitude}°N, {predictionResult.location.longitude}°E</span>
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center px-6 py-3.5 rounded-2xl bg-white/95 dark:bg-command-950/95 border-2 border-yellow-500/70 dark:border-yellow-400/80 shadow-lg shadow-yellow-500/10 backdrop-blur-md relative z-10">
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-800 dark:text-yellow-300">COMPOSITE RISK SCORE</span>
                  <span className="text-4xl font-black font-mono text-amber-600 dark:text-yellow-400">
                    {predictionResult.riskAnalysis.compositeRiskScore}<span className="text-lg text-slate-500 dark:text-slate-400">/100</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">MCDA MULTI-CRITERIA</span>
                </div>
              </div>

              {/* Nearest Safe Haven Card */}
              {predictionResult.nearestSafeHaven && (
                <div className="p-6 rounded-2xl bg-white dark:bg-command-900 border-2 border-emerald-500/80 shadow-xl dark:shadow-emerald-950/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-blue-900/40 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        <span className="text-xs font-mono font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          NEAREST CERTIFIED SAFE RELOCATION HAVEN
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {predictionResult.nearestSafeHaven.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        {predictionResult.nearestSafeHaven.district}, {predictionResult.nearestSafeHaven.state}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Geodesic Transit Distance</span>
                        <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                          {predictionResult.nearestSafeHaven.distanceKm} km
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate('/map')}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-900/30 transition"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>View on GIS</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-blue-950/50 border border-slate-200 dark:border-blue-900/40">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Available Capacity</span>
                      <div className="text-base font-bold font-mono text-slate-900 dark:text-white">
                        {predictionResult.nearestSafeHaven.availableCapacity?.toLocaleString()} <span className="text-xs text-slate-500">beds</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-blue-950/50 border border-slate-200 dark:border-blue-900/40">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Water Security</span>
                      <div className="text-base font-bold font-mono text-cyan-600 dark:text-cyan-400">
                        {predictionResult.nearestSafeHaven.waterScore}/100
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-blue-950/50 border border-slate-200 dark:border-blue-900/40">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Medical Triage</span>
                      <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {predictionResult.nearestSafeHaven.healthcareScore}/100
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-blue-950/50 border border-slate-200 dark:border-blue-900/40">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Road Connectivity</span>
                      <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">
                        {predictionResult.nearestSafeHaven.connectivityScore}/100
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300">Recommended Evacuation Corridor: </span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {predictionResult.nearestSafeHaven.recommendedEvacuationCorridor}
                    </span>
                  </div>
                </div>
              )}

              {/* Multi-Factor Threat Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-command-900 border border-slate-200 dark:border-blue-900/50 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Waves className="w-4 h-4 text-blue-500" />
                      River & Dam Threat
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                      {predictionResult.riskAnalysis.factorBreakdown.riverAndDamThreat.score}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-blue-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${predictionResult.riskAnalysis.factorBreakdown.riverAndDamThreat.score}%` }}></div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Nearest: <strong>{predictionResult.riskAnalysis.factorBreakdown.riverAndDamThreat.nearestRiverOrDam}</strong> ({predictionResult.riskAnalysis.factorBreakdown.riverAndDamThreat.distanceKm} km)
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-command-900 border border-slate-200 dark:border-blue-900/50 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Pickaxe className="w-4 h-4 text-amber-500" />
                      Mining Subsidence Risk
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                      {predictionResult.riskAnalysis.factorBreakdown.miningAndSubsidenceThreat.score}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-blue-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${predictionResult.riskAnalysis.factorBreakdown.miningAndSubsidenceThreat.score}%` }}></div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Nearest: <strong>{predictionResult.riskAnalysis.factorBreakdown.miningAndSubsidenceThreat.nearestMine}</strong> ({predictionResult.riskAnalysis.factorBreakdown.miningAndSubsidenceThreat.distanceKm} km)
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-command-900 border border-slate-200 dark:border-blue-900/50 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-red-500" />
                      20-Yr Historical Calamities
                    </span>
                    <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
                      {predictionResult.riskAnalysis.factorBreakdown.historicalCalamityRecord.score}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-blue-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${predictionResult.riskAnalysis.factorBreakdown.historicalCalamityRecord.score}%` }}></div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {predictionResult.riskAnalysis.factorBreakdown.historicalCalamityRecord.disastersCountInState} Major Disasters Logged
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-command-900 border border-slate-200 dark:border-blue-900/50 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Mountain className="w-4 h-4 text-emerald-500" />
                      Geotechnical Soil Stability
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {100 - predictionResult.riskAnalysis.factorBreakdown.geotechnicalSoilInstability.score}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-blue-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${100 - predictionResult.riskAnalysis.factorBreakdown.geotechnicalSoilInstability.score}%` }}></div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {predictionResult.riskAnalysis.factorBreakdown.geotechnicalSoilInstability.shearResistanceRating}
                  </p>
                </div>
              </div>

              {/* Statutory Government Citations */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-command-900/80 border border-slate-200 dark:border-blue-900/40 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider block mb-1">
                  OFFICIAL GOVERNMENT STATUTORY DATA BASES AUDITED:
                </span>
                <ul className="list-disc pl-4 space-y-0.5">
                  {predictionResult.governmentCitations.map((cit, idx) => (
                    <li key={idx}>{cit}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RIVERS & DAMS TELEMETRY */}
      {/* ========================================================================= */}
      {activeTab === 'rivers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-command-900 border border-slate-200 dark:border-blue-900/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter Classification:</span>
              <select
                value={riverTypeFilter}
                onChange={e => setRiverTypeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-blue-950 border border-slate-300 dark:border-blue-900/60 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="All">All Types (Rivers & Dams)</option>
                <option value="River">Major River Corridors</option>
                <option value="Dam">Dams & Hydro Reservoirs</option>
                <option value="Barrage">Barrages & Flood Regulators</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Central Water Commission (CWC) • India-WRIS Official Telemetry
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riversData.map(item => (
              <div key={item.id} className="p-5 rounded-2xl bg-white dark:bg-command-900 border border-slate-200 dark:border-blue-900/50 shadow-sm hover:shadow-md transition space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        item.type === 'Dam' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                      }`}>
                        {item.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        item.downstream_hazard_level === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-500/40' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {item.downstream_hazard_level} Hazard
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Basin: <strong>{item.river_basin}</strong> • {item.state}
                    </p>
                  </div>

                  {item.live_storage_capacity_mcm > 0 && (
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Live Capacity</span>
                      <div className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400">
                        {item.live_storage_capacity_mcm.toLocaleString()} MCM
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-blue-900/40 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Max Depth</span>
                    <strong className="text-slate-800 dark:text-slate-200">{item.max_monsoon_depth_m}m</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Danger Mark</span>
                    <strong className="text-slate-800 dark:text-slate-200">{item.danger_water_level_m}m</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Catchment</span>
                    <strong className="text-slate-800 dark:text-slate-200">{item.catchment_area_sqkm?.toLocaleString()} km²</strong>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                    <Activity className="w-3.5 h-3.5" />
                    <span>CWC Status: {item.cwc_monitoring_status}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    {item.historical_breach_disasters}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MINING SITES & SUBSIDENCE AUDIT */}
      {/* ========================================================================= */}
      {activeTab === 'mining' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-command-900 border border-slate-200 dark:border-blue-900/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Operator Classification:</span>
              <select
                value={miningOperatorFilter}
                onChange={e => setMiningOperatorFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-blue-950 border border-slate-300 dark:border-blue-900/60 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="All">All Operations (Govt PSU & Private)</option>
                <option value="Government PSU">Government PSU (Coal India, NMDC, SAIL)</option>
                <option value="Private Lease">Private Leases & Concessions</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Indian Bureau of Mines (IBM) • DGMS Safety Audits
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {miningData.map(mine => (
              <div key={mine.id} className="p-5 rounded-2xl bg-white dark:bg-command-900 border border-slate-200 dark:border-blue-900/50 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        mine.operator_type === 'Government PSU' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      }`}>
                        {mine.operator_type}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {mine.mineral_type}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {mine.mine_name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Agency: <strong>{mine.operating_agency}</strong> • {mine.district}, {mine.state}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Subsidence Risk</span>
                    <div className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                      mine.ground_subsidence_risk === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {mine.ground_subsidence_risk}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-blue-900/40 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Method</span>
                    <strong className="text-slate-800 dark:text-slate-200">{mine.mining_method}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Output MTPA</span>
                    <strong className="text-slate-800 dark:text-slate-200">{mine.production_capacity_mtpa} MTPA</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Blast Radius</span>
                    <strong className="text-slate-800 dark:text-slate-200">{mine.blast_vibration_impact_radius_km} km</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs">
                  <span className="font-bold text-red-900 dark:text-red-300 block mb-0.5">
                    🚨 Disasters Faced by Local Populations:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px]">
                    {mine.disaster_faced_by_locals}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: 20-YEAR HISTORICAL CALAMITIES ARCHIVES */}
      {/* ========================================================================= */}
      {activeTab === 'disasters' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-command-900 border border-slate-200 dark:border-blue-900/50">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter Year:</span>
              <select
                value={disasterYearFilter}
                onChange={e => setDisasterYearFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-blue-950 border border-slate-300 dark:border-blue-900/60 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="All">All Years (2004 - 2024)</option>
                {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2016, 2015, 2014, 2013, 2011, 2010, 2008, 2005, 2004].map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              National Disaster Management Authority (NDMA) • Decadal Disaster Archive
            </div>
          </div>

          <div className="space-y-3">
            {disastersData.map(d => (
              <div key={d.id} className="p-5 rounded-2xl bg-white dark:bg-command-900 border border-slate-200 dark:border-blue-900/50 shadow-sm space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-mono font-black text-xs">
                      {d.year}
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {d.event_title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {d.district_region} • <strong>{d.state_country}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Casualties</span>
                      <strong className="text-red-600 dark:text-red-400 font-bold">{d.casualties_count?.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Displaced</span>
                      <strong className="text-amber-600 dark:text-amber-400 font-bold">{d.displaced_population?.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Loss ₹ Cr</span>
                      <strong className="text-slate-900 dark:text-white font-bold">₹{d.economic_damage_inr_cr?.toLocaleString()} Cr</strong>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {d.summary_description}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-blue-900/40 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>Cause: <strong>{d.primary_cause}</strong></span>
                  <span>Trigger: <strong>{d.geotechnical_trigger}</strong></span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">Ref: {d.official_ndma_report_ref}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: GEOTECHNICAL SOIL & ROCK TAXONOMY */}
      {/* ========================================================================= */}
      {activeTab === 'soils' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-command-900 border border-slate-200 dark:border-blue-900/50">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Geological Survey of India (GSI) • Soil & Land Use Survey of India (SLUSI)
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              National Lithology & Geotechnical Engineering Properties
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {soilsData.map(s => (
              <div key={s.id} className="p-5 rounded-2xl bg-white dark:bg-command-900 border border-slate-200 dark:border-blue-900/50 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {s.seismic_zone}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {s.region_name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {s.district}, {s.state}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Slope Stability</span>
                    <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {s.slope_stability_index}/100
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-blue-950/50 border border-slate-200 dark:border-blue-900/40 text-xs space-y-1">
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Soil Type: </strong>
                    <span className="text-slate-600 dark:text-slate-300">{s.soil_major_type} ({s.soil_sub_type})</span>
                  </div>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Rock System: </strong>
                    <span className="text-slate-600 dark:text-slate-300">{s.rock_system}</span>
                  </div>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Dominant Lithology: </strong>
                    <span className="text-slate-600 dark:text-slate-300">{s.dominant_rock_types}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono border-t border-slate-100 dark:border-blue-900/40 pt-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Friction Angle</span>
                    <strong className="text-slate-800 dark:text-slate-200">{s.internal_friction_angle_deg}°</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Cohesion</span>
                    <strong className="text-slate-800 dark:text-slate-200">{s.cohesion_kpa} kPa</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Liquefaction</span>
                    <strong className="text-slate-800 dark:text-slate-200">{s.liquefaction_susceptibility}</strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  <strong className="text-emerald-700 dark:text-emerald-400">Recommended Foundation: </strong>
                  {s.recommended_foundation_type}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
