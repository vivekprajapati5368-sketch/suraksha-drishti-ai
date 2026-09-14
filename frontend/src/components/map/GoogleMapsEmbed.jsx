import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ExternalLink,
  Layers,
  Key,
  Info,
  Navigation,
  CheckCircle2,
  Compass,
  Sparkles,
  Maximize2,
  Settings,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function GoogleMapsEmbed({
  latitude = 30.5564,
  longitude = 79.5638,
  locationName = 'Selected Location',
  destination = null, // { latitude, longitude, name } for directions mode
  height = '560px',
  defaultMapType = 'satellite', // 'satellite' | 'roadmap'
  zoom = 14
}) {
  const { isDark } = useTheme();

  // Storage key for user's Google Maps API Key
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('google_maps_api_key') || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  });

  const [tempKeyInput, setTempKeyInput] = useState(apiKey);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [mapType, setMapType] = useState(defaultMapType); // 'satellite' | 'roadmap'
  const [currentMode, setCurrentMode] = useState(destination ? 'directions' : 'view'); // 'view', 'place', 'directions'
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [savedToast, setSavedToast] = useState(false);

  // Sync temp key input when apiKey changes
  useEffect(() => {
    setTempKeyInput(apiKey);
  }, [apiKey]);

  const handleSaveKey = (e) => {
    e.preventDefault();
    const cleanKey = tempKeyInput.trim();
    setApiKey(cleanKey);
    if (cleanKey) {
      localStorage.setItem('google_maps_api_key', cleanKey);
    } else {
      localStorage.removeItem('google_maps_api_key');
    }
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      setShowKeyModal(false);
    }, 1200);
  };

  // Build the embed URL based on whether API Key is present or fallback
  const getEmbedUrl = () => {
    const lat = parseFloat(latitude) || 30.5564;
    const lng = parseFloat(longitude) || 79.5638;

    if (apiKey) {
      // Official Google Maps Embed API v1 (Complies with user prompt SKU & quota specs)
      if (currentMode === 'directions' && destination) {
        const destLat = parseFloat(destination.latitude);
        const destLng = parseFloat(destination.longitude);
        return `https://www.google.com/maps/embed/v1/directions?key=${encodeURIComponent(apiKey)}&origin=${lat},${lng}&destination=${destLat},${destLng}&mode=driving&maptype=${mapType}`;
      } else if (currentMode === 'place') {
        const q = encodeURIComponent(locationName ? `${locationName}, India` : `${lat},${lng}`);
        return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${q}&zoom=${currentZoom}&maptype=${mapType}`;
      } else {
        // 'view' mode
        return `https://www.google.com/maps/embed/v1/view?key=${encodeURIComponent(apiKey)}&center=${lat},${lng}&zoom=${currentZoom}&maptype=${mapType}`;
      }
    } else {
      // Immediate Zero-Config Fallback (Works with no API key)
      const tParam = mapType === 'satellite' ? 'k' : 'm'; // 'k' for satellite, 'm' for roadmap
      const query = locationName ? `${locationName} ${lat},${lng}` : `${lat},${lng}`;
      return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=${tParam}&z=${currentZoom}&output=embed&hl=en`;
    }
  };

  // Direct link to open in Google Maps in new tab
  const getGoogleMapsWebUrl = () => {
    const lat = parseFloat(latitude) || 30.5564;
    const lng = parseFloat(longitude) || 79.5638;
    if (destination) {
      return `https://www.google.com/maps/dir/${lat},${lng}/${destination.latitude},${destination.longitude}/@${lat},${lng},12z/data=!3m1!1e3`;
    }
    return `https://www.google.com/maps/@${lat},${lng},${currentZoom}z/data=!3m1!1e3`;
  };

  return (
    <div className="flex flex-col w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-blue-900/60 bg-white dark:bg-command-950 shadow-xl transition-all relative">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-100/90 dark:bg-command-900/95 border-b border-slate-200 dark:border-blue-900/50 text-xs backdrop-blur-md z-10">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-red-600 text-white flex-shrink-0 shadow-sm">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 dark:text-white truncate font-heading">
                Google Maps Embed API
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                apiKey
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                  : 'bg-amber-100 text-amber-800 dark:bg-yellow-950 dark:text-yellow-300 border border-amber-300 dark:border-yellow-700'
              }`}>
                {apiKey ? 'API KEY ACTIVE' : 'FREE EMBED MODE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-blue-300/80 truncate font-mono">
              {locationName} • [{parseFloat(latitude).toFixed(4)}°N, {parseFloat(longitude).toFixed(4)}°E]
            </p>
          </div>
        </div>

        {/* Map Type & Control Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Map Type Toggle: Satellite vs Roadmap */}
          <div className="flex items-center p-0.5 bg-white dark:bg-command-950 rounded-xl border border-slate-200 dark:border-blue-900/50 shadow-sm text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setMapType('satellite')}
              className={`px-2.5 py-1 rounded-lg transition ${
                mapType === 'satellite'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🛰️ Satellite 3D
            </button>
            <button
              type="button"
              onClick={() => setMapType('roadmap')}
              className={`px-2.5 py-1 rounded-lg transition ${
                mapType === 'roadmap'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🗺️ Roadmap
            </button>
          </div>

          {/* Mode switch if destination provided */}
          {destination && (
            <button
              type="button"
              onClick={() => setCurrentMode(currentMode === 'directions' ? 'view' : 'directions')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition flex items-center gap-1 ${
                currentMode === 'directions'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-white dark:bg-command-950 text-slate-700 dark:text-blue-200 border-slate-200 dark:border-blue-900/50 hover:bg-slate-50'
              }`}
              title="Show Evacuation Route on Google Maps"
            >
              <Navigation className="w-3 h-3" />
              <span>Evac Route</span>
            </button>
          )}

          {/* External Google Maps Button */}
          <a
            href={getGoogleMapsWebUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-xl bg-white dark:bg-command-950 hover:bg-slate-50 dark:hover:bg-blue-950 text-slate-700 dark:text-blue-200 border border-slate-200 dark:border-blue-900/50 text-[11px] font-bold transition flex items-center gap-1"
            title="Open in Google Maps in New Tab"
          >
            <span>Open Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* API Key Settings Button */}
          <button
            type="button"
            onClick={() => setShowKeyModal(true)}
            className="p-1.5 rounded-xl bg-white dark:bg-command-950 hover:bg-slate-50 dark:hover:bg-blue-950 text-slate-700 dark:text-blue-200 border border-slate-200 dark:border-blue-900/50 text-xs font-bold transition"
            title="Configure Google Maps API Key & Quotas"
          >
            <Key className="w-3.5 h-3.5 text-amber-500" />
          </button>

          {/* Quota & SKU Info */}
          <button
            type="button"
            onClick={() => setShowQuotaModal(true)}
            className="p-1.5 rounded-xl bg-white dark:bg-command-950 hover:bg-slate-50 dark:hover:bg-blue-950 text-slate-700 dark:text-blue-200 border border-slate-200 dark:border-blue-900/50 text-xs font-bold transition"
            title="Maps Embed SKU & Pricing Details"
          >
            <Info className="w-3.5 h-3.5 text-cyan-500" />
          </button>
        </div>
      </div>

      {/* Embed Iframe Frame */}
      <div className="w-full relative" style={{ height }}>
        <iframe
          key={`${latitude}-${longitude}-${mapType}-${currentMode}-${apiKey}`}
          title="Google Maps Embed API Viewer"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={getEmbedUrl()}
          className="w-full h-full bg-slate-900"
        />

        {/* Floating Watermark & Coordinates HUD */}
        <div className="absolute bottom-3 left-3 pointer-events-none z-10 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black bg-slate-900/90 text-yellow-400 border border-yellow-400/40 shadow-lg backdrop-blur-md">
            📍 {parseFloat(latitude).toFixed(4)}°N, {parseFloat(longitude).toFixed(4)}°E
          </span>
          {destination && currentMode === 'directions' && (
            <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 shadow-lg backdrop-blur-md">
              🏁 Destination: {destination.name}
            </span>
          )}
        </div>
      </div>

      {/* API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-command-900 border border-slate-200 dark:border-blue-900/80 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-blue-900/40 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white font-heading">
                  Google Maps Platform API Key
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              To use the official Google Maps Embed API in production, enter your Google Cloud Platform Maps API key below.
              <strong> Usage for the Maps Embed API is available at no charge (SKU: Maps Embed).</strong>
            </p>

            <form onSubmit={handleSaveKey} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-blue-200 mb-1">
                  Google Maps API Key:
                </label>
                <input
                  type="text"
                  value={tempKeyInput}
                  onChange={(e) => setTempKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-50 dark:bg-command-950 border border-slate-300 dark:border-blue-900/70 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 rounded-xl text-[11px] text-blue-900 dark:text-blue-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-500" />
                  Free Tier & Quota Guidelines:
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-[10.5px]">
                  <li><strong>SKU: Maps Embed</strong> is free of charge with unlimited map loads.</li>
                  <li>Enable <strong>Maps Embed API</strong> in your Google Cloud Console project.</li>
                  <li>If no key is provided, Suraksha Drishti AI automatically uses our zero-config embed engine.</li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href="https://developers.google.com/maps/documentation/embed/get-api-key"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                >
                  Get a Key from Google Console <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-950"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md hover:from-amber-400 hover:to-yellow-400 transition flex items-center gap-1"
                  >
                    {savedToast ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-950" /> : null}
                    {savedToast ? 'Saved!' : 'Save Key'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SKU & Quota Information Modal */}
      {showQuotaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-command-900 border border-slate-200 dark:border-blue-900/80 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-blue-900/40 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white font-heading">
                  Maps Embed API SKU & Quota Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQuotaModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
                <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Free of Charge (Zero Cost)
                </div>
                <p className="text-[11px]">
                  Under Google Maps Platform pricing for India and globally, <strong>Maps Embed usage is available at no charge</strong> with no short-term (QPS) or long-term (QPD) limits.
                </p>
              </div>

              <div className="border border-slate-200 dark:border-blue-900/50 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 dark:bg-command-950 font-bold border-b border-slate-200 dark:border-blue-900/40">
                    <tr>
                      <th className="p-2">Category</th>
                      <th className="p-2">SKU Details</th>
                      <th className="p-2">Pricing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-blue-900/30 font-mono">
                    <tr>
                      <td className="p-2 font-sans font-bold">Essentials</td>
                      <td className="p-2 text-cyan-600 dark:text-cyan-400">SKU: Maps Embed</td>
                      <td className="p-2 text-emerald-600 dark:text-emerald-400 font-bold">₹0.00 (Free)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-1">How to Adjust Quota:</h4>
                <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                  <li>In Google Cloud Console, navigate to <strong>Google Maps Platform &gt; Quotas</strong>.</li>
                  <li>Select <strong>Maps Embed API</strong>.</li>
                  <li>Select the quota value, click <strong>Edit</strong>, and submit your desired request ceiling.</li>
                </ol>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuotaModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-950 text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
