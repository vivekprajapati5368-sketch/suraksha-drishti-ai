import React, { useState, useEffect } from 'react';
import {
  Radio,
  BellRing,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Smartphone,
  Mail,
  Globe,
  Users,
  Volume2,
  VolumeX,
  Filter,
  Search,
  Flame,
  Waves,
  Mountain,
  ShieldCheck,
  Navigation,
  Compass,
  FileCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { DynamicMouseText } from '../components/common/DynamicMouseText';
import { Badge } from '../components/common/Badge';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

export function EmergencyAlertsPage({ onNavigate }) {
  const { isDark } = useTheme();

  // Alert Mode: 'test' vs 'real'
  const [alertMode, setAlertMode] = useState('test'); // 'test' or 'real'

  // Dispatch Form State
  const [disasterType, setDisasterType] = useState('Flash Flood / GLOF');
  const [severity, setSeverity] = useState('Critical'); // 'Critical', 'High', 'Moderate'
  const [locationName, setLocationName] = useState('Joshimath Urban Habitation');
  const [district, setDistrict] = useState('Chamoli');
  const [state, setState] = useState('Uttarakhand');
  const [latitude, setLatitude] = useState(30.5564);
  const [longitude, setLongitude] = useState(79.5638);
  const [radiusKm, setRadiusKm] = useState(10);
  const [safeHavenName, setSafeHavenName] = useState('Auli ITBP High Ground Shelter');
  const [evacuationRoute, setEvacuationRoute] = useState('Ascend NH-58 Upper Bypass towards Auli Helipad corridor. Avoid riverbed.');
  const [customMessage, setCustomMessage] = useState(
    'IMMEDIATE ACTION MANDATED: High hazard trigger detected in sector. Civilians are advised to move to designated high ground refuge immediately.'
  );

  // Status & Telemetry State
  const [isDispatching, setIsDispatching] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'test', 'real'
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeNotificationPopup, setActiveNotificationPopup] = useState(null);

  // Load existing alert history
  useEffect(() => {
    loadAlertHistory();
  }, []);

  const loadAlertHistory = async () => {
    try {
      const res = await api.getEmergencyAlerts();
      if (res.success && res.data) {
        setRecentAlerts(res.data);
        if (res.data.length > 0 && !selectedAlert) {
          setSelectedAlert(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load emergency alerts:', err);
    }
  };

  // Play browser sound / beeps for alert
  const playAlertSound = (isReal) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (isReal) {
        // Urgent high pitch siren sequence
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.9);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.9);
      } else {
        // Milder chime for test drill
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch (e) {
      // Audio context may be blocked by browser policy without user gesture
    }
  };

  // Trigger web notification if granted
  const triggerBrowserPush = (title, body) => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'suraksha-sos'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            new Notification(title, { body, icon: '/favicon.ico' });
          }
        });
      }
    }
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    setIsDispatching(true);

    const payload = {
      isTest: alertMode === 'test',
      disasterType,
      severity,
      locationName,
      district,
      state,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radiusKm: parseInt(radiusKm),
      safeHavenName,
      evacuationRoute,
      message: customMessage
    };

    try {
      const res = await api.sendEmergencyAlert(payload);
      if (res.success) {
        const newAlert = res.data;
        setRecentAlerts(prev => [newAlert, ...prev]);
        setSelectedAlert(newAlert);

        // Sound & Browser Notification
        playAlertSound(alertMode === 'real');
        const alertTitle = alertMode === 'real'
          ? `🚨 REAL EMERGENCY ALERT: ${disasterType} in ${locationName}`
          : `📢 [TEST DRILL] Emergency Broadcast: ${disasterType} (${locationName})`;
        triggerBrowserPush(alertTitle, customMessage);

        // In-App Popup Banner
        setActiveNotificationPopup(newAlert);
      }
    } catch (err) {
      console.error('Dispatch failed:', err);
    } finally {
      setIsDispatching(false);
    }
  };

  // Preset location select
  const handleSelectQuickLocation = (name, dist, st, lat, lng, safeHaven, route) => {
    setLocationName(name);
    setDistrict(dist);
    setState(st);
    setLatitude(lat);
    setLongitude(lng);
    setSafeHavenName(safeHaven);
    setEvacuationRoute(route);
  };

  // Filtering alerts
  const filteredAlerts = recentAlerts.filter(a => {
    if (filterMode === 'test' && !a.is_test) return false;
    if (filterMode === 'real' && a.is_test) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (a.location_name || '').toLowerCase().includes(q) ||
        (a.disaster_type || '').toLowerCase().includes(q) ||
        (a.district || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate delivery stats
  const totalAlertsCount = recentAlerts.length;
  const realAlertsCount = recentAlerts.filter(a => !a.is_test).length;
  const testAlertsCount = recentAlerts.filter(a => a.is_test).length;
  const totalRecipients = recentAlerts.reduce((acc, a) => acc + (a.recipients_count || 120), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Real Emergency Active Banner (If In-App Modal is Active) */}
      {activeNotificationPopup && (
        <div className={`p-5 rounded-3xl shadow-2xl border transition-all animate-bounce duration-500 ${
          activeNotificationPopup.is_test
            ? 'bg-blue-600/10 border-blue-500 text-blue-900 dark:text-blue-100'
            : 'bg-red-600 border-red-500 text-white'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`p-3 rounded-2xl ${activeNotificationPopup.is_test ? 'bg-blue-500 text-white' : 'bg-white text-red-600 animate-pulse'}`}>
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono tracking-wider ${
                    activeNotificationPopup.is_test ? 'bg-blue-200 text-blue-900' : 'bg-black/40 text-yellow-300'
                  }`}>
                    {activeNotificationPopup.is_test ? '📢 TEST DRILL BROADCAST' : '🚨 REAL EMERGENCY BROADCAST'}
                  </span>
                  <span className="text-xs font-mono font-bold">
                    {new Date(activeNotificationPopup.dispatched_at || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight mt-1 font-heading">
                  {activeNotificationPopup.disaster_type} • {activeNotificationPopup.location_name} ({activeNotificationPopup.district})
                </h3>
                <p className="text-xs mt-1 max-w-3xl opacity-90">
                  {activeNotificationPopup.message}
                </p>
                <div className="mt-2 text-xs font-mono font-bold flex flex-wrap items-center gap-3">
                  <span>📍 Recommended High Ground: <strong>{activeNotificationPopup.safe_haven_name || 'Designated Haven'}</strong></span>
                  <span>🛣️ Corridor: <strong>{activeNotificationPopup.evacuation_route || 'Proceed via main arterial road.'}</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveNotificationPopup(null)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeNotificationPopup.is_test
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-white hover:bg-slate-100 text-red-600 shadow-md'
              }`}
            >
              Acknowledge & Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Top Header & Telemetry Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-blue-900/50 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-700/60 shadow-sm flex items-center gap-1">
              <Radio className="w-3 h-3 text-red-600 dark:text-red-400 animate-pulse" />
              SOS MULTI-CHANNEL EMERGENCY BROADCAST SYSTEM
            </span>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-blue-300/70 hidden sm:inline">
              CAP & Common Alerting Protocol Compliant
            </span>
          </div>
          <DynamicMouseText as="h1" variant="hero" className="text-2xl sm:text-3xl font-black tracking-tight font-heading">
            Emergency SOS Alert & Evacuation Dispatcher
          </DynamicMouseText>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200/80 mt-1 max-w-3xl">
            Simulate and dispatch multi-channel warnings across In-App notification overlays, Web Push notifications, simulated SMS gateways, and local responder networks with verified Safe High Ground escape corridors.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition text-xs font-bold flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-cyan-300 dark:border-blue-900'
                : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-command-900 dark:text-slate-400 dark:border-blue-900/40'
            }`}
            title="Toggle Audio Siren / Chime"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>{soundEnabled ? 'Siren: ON' : 'Siren: Muted'}</span>
          </button>

          <button
            onClick={loadAlertHistory}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-blue-900/60 bg-white dark:bg-command-900 text-slate-700 dark:text-blue-200 hover:bg-slate-50 dark:hover:bg-blue-950 transition"
            title="Refresh Alert Log"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-blue-900/50 bg-white dark:bg-command-900/90 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-blue-300">
            <span className="font-bold uppercase">Total Broadcasts</span>
            <Radio className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-2">
            {totalAlertsCount}
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-1 flex items-center gap-2">
            <span>Real: <strong className="text-red-500">{realAlertsCount}</strong></span>
            <span>Drill: <strong className="text-blue-500">{testAlertsCount}</strong></span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-blue-900/50 bg-white dark:bg-command-900/90 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-blue-300">
            <span className="font-bold uppercase">Recipients Notified</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-2">
            {totalRecipients.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            District Magistrates, NDRF & Citizens
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-blue-900/50 bg-white dark:bg-command-900/90 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-blue-300">
            <span className="font-bold uppercase">Delivery Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            98.8%
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            Zero Latency Fallback
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-blue-900/50 bg-white dark:bg-command-900/90 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-blue-300">
            <span className="font-bold uppercase">Active Response Cells</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-2">
            18 SDRF / NDRF
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Pre-positioned at Safe Havens
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Dispatch Form (Left) & Alert Feed / Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Alert Dispatch Console (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-gradient-to-br dark:from-command-900/95 dark:to-[#0c1836] p-5 rounded-3xl border border-slate-200/90 dark:border-blue-900/60 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-blue-900/40 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white font-heading">
                  Broadcast Dispatch Console
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 font-bold">
                COMMAND TERMINAL
              </span>
            </div>

            {/* Crucial Mode Toggle: TEST ALERT vs REAL EMERGENCY */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-blue-300 uppercase">
                Broadcast Operation Mode
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-command-950 rounded-2xl border border-slate-200 dark:border-blue-900/50">
                <button
                  type="button"
                  onClick={() => setAlertMode('test')}
                  className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                    alertMode === 'test'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  📢 Test Alert (Drill)
                </button>
                <button
                  type="button"
                  onClick={() => setAlertMode('real')}
                  className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                    alertMode === 'real'
                      ? 'bg-red-600 text-white shadow-md animate-pulse'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  🚨 Real Emergency Alert
                </button>
              </div>
              <p className="text-[10px] font-mono text-slate-500 dark:text-blue-300/70">
                {alertMode === 'test'
                  ? 'Displays explicit "[TEST DRILL - NO REAL EMERGENCY]" banner across all channels.'
                  : '⚠️ CAUTION: Triggers high-priority audible siren and urgent evacuation directives.'}
              </p>
            </div>

            {/* Quick Hotspot Presets */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-blue-300 uppercase block">
                Quick-Target Locations:
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  {
                    name: 'Joshimath',
                    dist: 'Chamoli',
                    st: 'Uttarakhand',
                    lat: 30.5564,
                    lng: 79.5638,
                    safe: 'Auli ITBP High Ground Shelter',
                    route: 'Ascend NH-58 Upper Bypass towards Auli Helipad.'
                  },
                  {
                    name: 'Chooralmala',
                    dist: 'Wayanad',
                    st: 'Kerala',
                    lat: 11.5360,
                    lng: 76.1780,
                    safe: 'Meppadi High School & Poly Grounds',
                    route: 'Take Meppadi hill crest road. Avoid bridge.'
                  },
                  {
                    name: 'Jharia Coalfield',
                    dist: 'Dhanbad',
                    st: 'Jharkhand',
                    lat: 23.7441,
                    lng: 86.4132,
                    safe: 'Belgara New Resettlement Township',
                    route: 'Transit eastward away from Fire Pit #14.'
                  }
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectQuickLocation(item.name, item.dist, item.st, item.lat, item.lng, item.safe, item.route)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-command-950 dark:hover:bg-blue-950 border border-slate-200 dark:border-blue-900/50 text-slate-700 dark:text-blue-200"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleDispatch} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-blue-300 mb-1">
                    Disaster Type
                  </label>
                  <select
                    value={disasterType}
                    onChange={(e) => setDisasterType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-blue-900/60 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-red-500"
                  >
                    <option value="Flash Flood / GLOF">Flash Flood / GLOF</option>
                    <option value="Landslide & Debris Flow">Landslide & Debris Flow</option>
                    <option value="Extreme Cloudburst Deluge">Extreme Cloudburst Deluge</option>
                    <option value="Mine Caving & Subsidence">Mine Caving & Subsidence</option>
                    <option value="Dam Crest Overtopping">Dam Crest Overtopping</option>
                    <option value="Tectonic Tremor / Collapse">Tectonic Tremor / Collapse</option>
                    <option value="Industrial Chemical Gas Leak">Industrial Chemical Gas Leak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-blue-300 mb-1">
                    Severity Level
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-blue-900/60 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-red-500"
                  >
                    <option value="Critical">Critical (Immediate Evacuation)</option>
                    <option value="High">High (Urgent Standby / Seek Refuge)</option>
                    <option value="Moderate">Moderate (Advisory & Preparation)</option>
                  </select>
                </div>
              </div>

              {/* Target Habitation */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-blue-300 mb-1">
                  Target Location / Habitation
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-blue-900/60 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-blue-300 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-blue-900/60 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-blue-300 mb-1">
                    Broadcast Radius
                  </label>
                  <select
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-blue-900/60 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-red-500"
                  >
                    <option value={1}>1 KM Radius (Local Ward)</option>
                    <option value={5}>5 KM Radius (Panchayat)</option>
                    <option value={10}>10 KM Radius (Full Sector)</option>
                    <option value={25}>25 KM Radius (District Wide)</option>
                  </select>
                </div>
              </div>

              {/* Safe Haven & Escape Corridor */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-blue-300 mb-1">
                  Designated Safe High Ground Haven
                </label>
                <input
                  type="text"
                  value={safeHavenName}
                  onChange={(e) => setSafeHavenName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-blue-900/60 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-blue-300 mb-1">
                  Verified Evacuation Corridor Directions
                </label>
                <textarea
                  rows={2}
                  value={evacuationRoute}
                  onChange={(e) => setEvacuationRoute(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-blue-900/60 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              {/* Custom Message */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-blue-300 mb-1">
                  Broadcast Alert Message Body
                </label>
                <textarea
                  rows={2}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-blue-900/60 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              {/* Channels Status Strip */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-blue-900/40 text-[10px] font-mono flex items-center justify-between text-slate-500 dark:text-blue-300">
                <span className="flex items-center gap-1"><Smartphone className="w-3 h-3 text-cyan-500" /> In-App Overlay</span>
                <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-blue-500" /> Web Push</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-amber-500" /> SMS / Email</span>
              </div>

              {/* Dispatch Action Button */}
              <button
                type="submit"
                disabled={isDispatching}
                className={`w-full py-3.5 px-4 rounded-xl text-white text-xs font-black uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                  alertMode === 'real'
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-600/30 animate-pulse'
                    : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:from-blue-500 hover:to-cyan-500 shadow-blue-600/30'
                }`}
              >
                <Radio className={`w-4 h-4 ${isDispatching ? 'animate-spin' : ''}`} />
                {isDispatching
                  ? 'Transmitting Broadcast Packets across Networks...'
                  : alertMode === 'real'
                  ? '🚨 DISPATCH REAL EMERGENCY ALERT NOW'
                  : '📢 TRANSMIT OFFICIAL TEST DRILL ALERT'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Alert Feed & Detailed Inspection (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Alert Selection / Inspection Detail */}
          {selectedAlert && (
            <div className={`p-5 rounded-3xl border shadow-lg space-y-4 ${
              selectedAlert.is_test
                ? 'bg-blue-50/70 dark:bg-command-900/90 border-blue-200 dark:border-blue-900/60'
                : 'bg-red-50/70 dark:bg-command-900/90 border-red-300 dark:border-red-900/60'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-blue-900/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase ${
                    selectedAlert.is_test ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {selectedAlert.is_test ? 'TEST DRILL' : 'REAL EMERGENCY'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    ID: #{selectedAlert.id || 101} • {new Date(selectedAlert.dispatched_at || Date.now()).toLocaleString()}
                  </span>
                </div>
                <Badge variant={selectedAlert.severity === 'Critical' ? 'red' : 'yellow'}>
                  {selectedAlert.severity || 'Critical'} Priority
                </Badge>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading">
                  {selectedAlert.disaster_type} Warning • {selectedAlert.location_name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {selectedAlert.message}
                </p>
              </div>

              {/* Evacuation Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/80 dark:bg-command-950/70 p-3.5 rounded-2xl border border-slate-200/80 dark:border-blue-900/40">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Designated High Ground Refuge</span>
                  <strong className="text-slate-900 dark:text-white text-sm">
                    {selectedAlert.safe_haven_name || 'Designated District Safe Haven'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Verified Evacuation Route</span>
                  <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">
                    {selectedAlert.evacuation_route || 'Proceed along highway crest away from river basin.'}
                  </span>
                </div>
              </div>

              {/* Delivery Channels Breakdown */}
              <div>
                <h4 className="text-[11px] font-black uppercase text-slate-700 dark:text-blue-300 mb-2 font-heading">
                  Multi-Channel Transmission Status
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-command-950 border border-slate-200 dark:border-blue-900/40 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500">In-App Banner</span>
                    <span className="text-emerald-500 font-bold font-mono text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Sent
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-command-950 border border-slate-200 dark:border-blue-900/40 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500">Web Push</span>
                    <span className="text-emerald-500 font-bold font-mono text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Sent
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-command-950 border border-slate-200 dark:border-blue-900/40 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500">SMS Gateway</span>
                    <span className="text-emerald-500 font-bold font-mono text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 100%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-command-950 border border-slate-200 dark:border-blue-900/40 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500">Email Gateway</span>
                    <span className="text-emerald-500 font-bold font-mono text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Sent
                    </span>
                  </div>
                </div>
              </div>

              {/* Sample Log of Notified Responders */}
              <div>
                <h4 className="text-[11px] font-black uppercase text-slate-700 dark:text-blue-300 mb-2 font-heading">
                  Recipient Dispatch Log ({selectedAlert.recipients_count || 148} Notified)
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {[
                    { role: 'District Magistrate & DDMA Chairman', channel: 'SMS & Email', status: 'Delivered' },
                    { role: 'Commandant, 8th Battalion NDRF', channel: 'Direct Push & Radio', status: 'Delivered' },
                    { role: 'Superintendent of Police / Control Room', channel: 'In-App Telemetry', status: 'Delivered' },
                    { role: 'Gram Pradhan & Village Volunteers', channel: 'SMS Broadcast', status: 'Delivered' },
                    { role: 'Sub-Divisional Magistrate (SDM)', channel: 'Direct Push & SMS', status: 'Delivered' }
                  ].map((rec, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white/90 dark:bg-command-950/80 text-xs border border-slate-200 dark:border-blue-900/30">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{rec.role}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">{rec.channel}</span>
                        <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {rec.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Historical Broadcasts List & Filter */}
          <div className="bg-white dark:bg-command-900/90 p-5 rounded-3xl border border-slate-200/90 dark:border-blue-900/50 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 font-heading">
                  Emergency Broadcast Dispatch Log
                </h3>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="flex p-0.5 bg-slate-100 dark:bg-command-950 rounded-xl border border-slate-200 dark:border-blue-900/40 text-[11px] font-bold">
                  {['all', 'real', 'test'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setFilterMode(mode)}
                      className={`px-2.5 py-1 rounded-lg uppercase transition ${
                        filterMode === mode
                          ? 'bg-cyan-600 text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-50 dark:bg-command-950 border border-slate-200 dark:border-blue-900/50 text-xs rounded-xl pl-8 pr-2.5 py-1.5 w-36 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* List of alerts */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredAlerts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No emergency broadcasts matching the current filters.
                </div>
              ) : (
                filteredAlerts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAlert(a)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      selectedAlert?.id === a.id
                        ? 'border-cyan-500 bg-cyan-50/50 dark:bg-blue-950/40 shadow-sm'
                        : 'border-slate-200/80 dark:border-blue-900/40 bg-slate-50/40 dark:bg-command-950/40 hover:bg-slate-100 dark:hover:bg-command-950'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${
                        a.is_test ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-cyan-400' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                      }`}>
                        <Radio className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                            a.is_test ? 'bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200' : 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-200'
                          }`}>
                            {a.is_test ? 'DRILL' : 'REAL'}
                          </span>
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                            {a.disaster_type} • {a.location_name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-blue-200/70 truncate mt-0.5">
                          {a.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0 text-[10px] font-mono text-slate-400">
                      <span>{new Date(a.dispatched_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-emerald-500 font-bold">Delivered</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
