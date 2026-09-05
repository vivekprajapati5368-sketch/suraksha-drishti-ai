import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Plus, Trash2, Edit2, CheckCircle2, AlertTriangle, ShieldCheck, Home, Flame, Save, RefreshCw } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { DynamicMouseText } from '../components/common/DynamicMouseText';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export function AdminPage({ onNavigate }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('weights'); // 'weights', 'habitations', 'hazardZones', 'safeZones'

  // Weights State
  const [weights, setWeights] = useState({
    rainfall_weight: 0.25,
    slope_weight: 0.20,
    historical_disaster_weight: 0.20,
    population_weight: 0.15,
    vulnerability_weight: 0.20
  });
  const [savingWeights, setSavingWeights] = useState(false);
  const [weightSuccess, setWeightSuccess] = useState('');

  // Habitations State
  const [habitations, setHabitations] = useState([]);
  const [showHabModal, setShowHabModal] = useState(false);
  const [habForm, setHabForm] = useState({
    name: '',
    district: '',
    state: 'Uttarakhand',
    latitude: 30.5,
    longitude: 79.5,
    population: 2000,
    primary_hazard: 'Landslide',
    slope_deg: 30,
    vulnerability_score: 75,
    elevation_m: 1500,
    river_distance_m: 200,
    soil_type: 'Loose Scree'
  });

  // Load Data
  const loadWeights = () => {
    api.getRiskWeights().then(res => {
      if (res.success) setWeights(res.data);
    });
  };

  const loadHabitations = () => {
    api.getHabitations().then(res => {
      if (res.success) setHabitations(res.data);
    });
  };

  useEffect(() => {
    loadWeights();
    loadHabitations();
  }, []);

  const handleSaveWeights = async (e) => {
    e.preventDefault();
    setSavingWeights(true);
    setWeightSuccess('');
    try {
      const res = await api.updateRiskWeights(weights);
      if (res.success) {
        setWeightSuccess(res.message);
        loadWeights();
        loadHabitations();
      }
    } catch (err) {
      alert('Failed to update risk weights: ' + err.message);
    } finally {
      setSavingWeights(false);
    }
  };

  const handleCreateHabitation = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createHabitation(habForm);
      if (res.success) {
        alert('Habitation registered successfully!');
        setShowHabModal(false);
        loadHabitations();
        setHabForm({
          name: '',
          district: '',
          state: 'Uttarakhand',
          latitude: 30.5,
          longitude: 79.5,
          population: 2000,
          primary_hazard: 'Landslide',
          slope_deg: 30,
          vulnerability_score: 75,
          elevation_m: 1500,
          river_distance_m: 200,
          soil_type: 'Loose Scree'
        });
      }
    } catch (err) {
      alert('Error creating habitation: ' + err.message);
    }
  };

  const handleDeleteHabitation = async (id, name) => {
    if (!window.confirm(`Delete habitation "${name}" from the national registry?`)) return;
    try {
      const res = await api.deleteHabitation(id);
      if (res.success) {
        loadHabitations();
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-cyberblue-900/60 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-cyberyellow-400 animate-ping"></span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-cyberyellow-400">
            SYSTEM ADMINISTRATION & MODEL PARAMETER TUNING
          </span>
        </div>
        <DynamicMouseText
          as="h1"
          variant="hero"
          className="text-2xl sm:text-3xl font-display font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm"
        >
          Data Management & AI Weights Configuration
        </DynamicMouseText>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
          Configure risk scoring factor weights, manage habitations database, and fine-tune national vulnerability models.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-command-900/90 p-2 rounded-2xl border border-slate-200 dark:border-cyberblue-900/80 max-w-lg shadow-sm">
        <button
          onClick={() => setActiveTab('weights')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 font-mono ${
            activeTab === 'weights'
              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black shadow-md shadow-yellow-500/25'
              : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          AI Risk Weights
        </button>

        <button
          onClick={() => setActiveTab('habitations')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 font-mono ${
            activeTab === 'habitations'
              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black shadow-md shadow-yellow-500/25'
              : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          Manage Habitations
        </button>
      </div>

      {/* TAB 1: AI Risk Weights Configuration */}
      {activeTab === 'weights' && (
        <div className="bg-white dark:bg-command-900/90 rounded-2xl p-6 border border-slate-200 dark:border-cyberblue-800/60 shadow-xl space-y-6 max-w-3xl">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 font-display">
              <SlidersHorizontal className="w-4 h-4 text-amber-600 dark:text-cyberyellow-400" />
              Configure AI Hazard Risk Weights (MCDA Engine)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Adjust the multi-factor influence sliders. When updated, the AI engine instantly recalculates risk scores, zone classifications (Red/Orange/Green), and relocation priorities for all habitations and hazard zones in the database!
            </p>
          </div>

          {weightSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400 dark:border-emerald-500/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{weightSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveWeights} className="space-y-5">
            {/* Weight Slider 1: Rainfall */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-cyberblue-900/80 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-white font-mono">1. Rainfall Intensity Weight:</span>
                <span className="font-mono text-blue-700 dark:text-cyberblue-400 font-bold">{Math.round((weights.rainfall_weight || 0.25) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={weights.rainfall_weight || 0.25}
                onChange={e => setWeights({ ...weights, rainfall_weight: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-command-900 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-cyberblue-400"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Impact of 24h forecasted and real-time precipitation mm.</p>
            </div>

            {/* Weight Slider 2: Slope */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-cyberblue-900/80 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-white font-mono">2. Terrain Slope Inclination Weight:</span>
                <span className="font-mono text-amber-700 dark:text-cyberyellow-400 font-bold">{Math.round((weights.slope_weight || 0.20) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={weights.slope_weight || 0.20}
                onChange={e => setWeights({ ...weights, slope_weight: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-command-900 rounded-lg appearance-none cursor-pointer accent-amber-500 dark:accent-cyberyellow-400"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Gravitational shear failure propensity (degrees 0–45°).</p>
            </div>

            {/* Weight Slider 3: Historical Disasters */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-cyberblue-900/80 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-white font-mono">3. Historical Disaster Frequency Weight:</span>
                <span className="font-mono text-amber-700 dark:text-yellow-300 font-bold">{Math.round((weights.historical_disaster_weight || 0.20) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={weights.historical_disaster_weight || 0.20}
                onChange={e => setWeights({ ...weights, historical_disaster_weight: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-command-900 rounded-lg appearance-none cursor-pointer accent-amber-500 dark:accent-cyberyellow-400"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Past recurrences of cloudbursts, breaches, or slope collapse.</p>
            </div>

            {/* Weight Slider 4: Population Density */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-cyberblue-900/80 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-white font-mono">4. Population & Exposure Weight:</span>
                <span className="font-mono text-blue-700 dark:text-blue-300 font-bold">{Math.round((weights.population_weight || 0.15) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={weights.population_weight || 0.15}
                onChange={e => setWeights({ ...weights, population_weight: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-command-900 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-cyberblue-400"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Demographic density requiring evacuation priority.</p>
            </div>

            {/* Weight Slider 5: Vulnerability */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-cyberblue-900/80 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-white font-mono">5. Socio-Infrastructural Vulnerability:</span>
                <span className="font-mono text-amber-700 dark:text-cyberyellow-300 font-bold">{Math.round((weights.vulnerability_weight || 0.20) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={weights.vulnerability_weight || 0.20}
                onChange={e => setWeights({ ...weights, vulnerability_weight: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-command-900 rounded-lg appearance-none cursor-pointer accent-amber-500 dark:accent-cyberyellow-400"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Kutcha housing, weak road egress, and elderly density index.</p>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={loadWeights}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-command-950 dark:hover:bg-command-800 border border-slate-300 dark:border-cyberblue-800 text-slate-700 dark:text-slate-300 text-xs font-semibold font-mono"
              >
                Reset Default
              </button>
              <button
                type="submit"
                disabled={savingWeights}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-lg shadow-yellow-500/25 tracking-wide"
              >
                <Save className="w-4 h-4 text-slate-950" />
                {savingWeights ? 'Recalculating National Database...' : 'Save & Recalculate Risk Engine'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Habitations Registry & Registration */}
      {activeTab === 'habitations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-cyberyellow-400"></span>
              Monitored Habitations ({habitations.length} registered)
            </h2>
            <button
              onClick={() => setShowHabModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-yellow-500/20 transition"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              Register New Habitation
            </button>
          </div>

          <div className="bg-white dark:bg-command-900/90 rounded-2xl border border-slate-200 dark:border-cyberblue-800/80 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-command-950 text-amber-800 dark:text-cyberyellow-300 uppercase font-mono text-[11px] border-b border-slate-200 dark:border-cyberblue-800/80">
                <tr>
                  <th className="py-3.5 px-4">Habitation</th>
                  <th className="py-3.5 px-4">District / State</th>
                  <th className="py-3.5 px-4 text-right">Population</th>
                  <th className="py-3.5 px-4">Primary Hazard</th>
                  <th className="py-3.5 px-4 text-center">Risk Score</th>
                  <th className="py-3.5 px-4 text-center">Priority</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-cyberblue-900/50">
                {habitations.map(h => (
                  <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-command-800/40 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white font-display">{h.name}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{h.district}, {h.state}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-700 dark:text-cyberyellow-300">{h.population.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{h.primary_hazard}</td>
                    <td className="py-3 px-4 text-center font-bold font-mono text-amber-700 dark:text-cyberyellow-400">{h.risk_score}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={h.priority_level.toLowerCase()} size="sm">{h.priority_level}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteHabitation(h.id, h.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition"
                        title="Delete Habitation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Habitation Registration Modal */}
      {showHabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-command-900 border border-amber-400 dark:border-cyberyellow-400/80 rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase font-mono flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-600 dark:text-cyberyellow-400" />
              Register Vulnerable Habitation
            </h3>

            <form onSubmit={handleCreateHabitation} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-mono">HABITATION NAME:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Upper Slope Settlement"
                    value={habForm.name}
                    onChange={e => setHabForm({ ...habForm, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-command-950 border border-slate-300 dark:border-cyberblue-800 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-mono">DISTRICT:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chamoli"
                    value={habForm.district}
                    onChange={e => setHabForm({ ...habForm, district: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-command-950 border border-slate-300 dark:border-cyberblue-800 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-mono">STATE:</label>
                  <select
                    value={habForm.state}
                    onChange={e => setHabForm({ ...habForm, state: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-command-950 border border-slate-300 dark:border-cyberblue-800 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-sans"
                  >
                    {['Uttarakhand', 'Kerala', 'Assam', 'Himachal Pradesh', 'Odisha', 'West Bengal', 'Sikkim'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-mono">POPULATION:</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={habForm.population}
                    onChange={e => setHabForm({ ...habForm, population: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-command-950 border border-slate-300 dark:border-cyberblue-800 rounded-lg p-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-mono">LATITUDE:</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={habForm.latitude}
                    onChange={e => setHabForm({ ...habForm, latitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-command-950 border border-slate-300 dark:border-cyberblue-800 rounded-lg p-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-mono">LONGITUDE:</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={habForm.longitude}
                    onChange={e => setHabForm({ ...habForm, longitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-command-950 border border-slate-300 dark:border-cyberblue-800 rounded-lg p-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-mono">SLOPE (°):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={habForm.slope_deg}
                    onChange={e => setHabForm({ ...habForm, slope_deg: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-command-950 border border-slate-300 dark:border-cyberblue-800 rounded-lg p-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-mono">PRIMARY HAZARD:</label>
                  <select
                    value={habForm.primary_hazard}
                    onChange={e => setHabForm({ ...habForm, primary_hazard: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-command-950 border border-slate-300 dark:border-cyberblue-800 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-sans"
                  >
                    {['Landslide', 'Flood', 'Cloudburst', 'Coastal Erosion', 'Flash Flood'].map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-mono">SOIL TYPE:</label>
                  <input
                    type="text"
                    value={habForm.soil_type}
                    onChange={e => setHabForm({ ...habForm, soil_type: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-command-950 border border-slate-300 dark:border-cyberblue-800 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-sans"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-cyberblue-900/80">
                <button
                  type="button"
                  onClick={() => setShowHabModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-command-950 dark:hover:bg-command-800 border border-slate-300 dark:border-cyberblue-800 text-slate-700 dark:text-slate-300 font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black tracking-wider uppercase transition shadow-lg shadow-yellow-500/25"
                >
                  Confirm & Calculate Risk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
