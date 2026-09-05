import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Filter, Eye, EyeOff, MapPin, Shield, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '../common/Badge';
import { useTheme } from '../../context/ThemeContext';

export function DisasterMap({
  hazardZones = [],
  habitations = [],
  safeZones = [],
  selectedHabitation = null,
  onSelectHabitation = null,
  onSelectSafeZone = null,
  height = '600px'
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layersRef = useRef({
    hazardZones: L.layerGroup(),
    habitations: L.layerGroup(),
    safeZones: L.layerGroup()
  });

  // Layer Visibility States
  const [showHazardZones, setShowHazardZones] = useState(true);
  const [showHabitations, setShowHabitations] = useState(true);
  const [showSafeZones, setShowSafeZones] = useState(true);

  // Filters
  const [selectedState, setSelectedState] = useState('All');
  const [selectedHazard, setSelectedHazard] = useState('All');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Standard India coordinates
      const map = L.map(mapContainerRef.current, {
        center: [23.5937, 80.9629],
        zoom: 5,
        zoomControl: false,
        attributionControl: true
      });

      // Add Zoom Control to top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add layer groups to map
      layersRef.current.hazardZones.addTo(map);
      layersRef.current.habitations.addTo(map);
      layersRef.current.safeZones.addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Dynamically update tile layer when theme switches (Dark Matter vs Voyager)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);
  }, [isDark]);

  // Update Layers whenever data or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    layersRef.current.hazardZones.clearLayers();
    layersRef.current.habitations.clearLayers();
    layersRef.current.safeZones.clearLayers();

    // 1. Render Hazard Zones (Circles with gradient fill and risk popups)
    if (showHazardZones) {
      hazardZones.forEach(zone => {
        if (selectedState !== 'All' && zone.state !== selectedState) return;
        if (selectedHazard !== 'All' && zone.hazard_type !== selectedHazard) return;

        const isRed = zone.zone_category === 'Red';
        const isOrange = zone.zone_category === 'Orange';

        const color = isRed ? '#ef4444' : (isOrange ? '#f97316' : '#10b981');
        const fillColor = isRed ? '#dc2626' : (isOrange ? '#ea580c' : '#059669');

        // Draw spatial coverage circle
        const circle = L.circle([zone.latitude, zone.longitude], {
          color: color,
          fillColor: fillColor,
          fillOpacity: isRed ? 0.35 : 0.25,
          weight: 2,
          radius: (zone.radius_km || 5) * 1000
        });

        // Interactive popup content
        const popupContent = `
          <div style="font-family: inherit; width: 280px; padding: 4px; color: ${isDark ? '#ffffff' : '#0f172a'};">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: ${color}; letter-spacing: 0.05em;">
                ${zone.zone_category} Hazard Zone
              </span>
              <span style="font-size: 11px; font-weight: 700; background: ${color}20; color: ${color}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${color}40;">
                Score: ${zone.risk_score}/100
              </span>
            </div>

            <h4 style="font-size: 14px; font-weight: 700; color: ${isDark ? '#ffffff' : '#0f172a'}; margin: 0 0 4px 0;">${zone.location_name}</h4>
            <p style="font-size: 11px; color: ${isDark ? '#94a3b8' : '#475569'}; margin: 0 0 8px 0;">${zone.district}, ${zone.state}</p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: ${isDark ? '#1e293b' : '#f1f5f9'}; padding: 8px; border-radius: 6px; margin-bottom: 8px; font-size: 11px; border: 1px solid ${isDark ? 'transparent' : '#e2e8f0'};">
              <div><span style="color: ${isDark ? '#64748b' : '#64748b'};">Primary:</span> <strong style="color: ${isDark ? '#f1f5f9' : '#0f172a'};">${zone.hazard_type}</strong></div>
              <div><span style="color: ${isDark ? '#64748b' : '#64748b'};">Rainfall:</span> <strong style="color: ${isDark ? '#f1f5f9' : '#0f172a'};">${zone.rainfall_mm} mm</strong></div>
              <div><span style="color: ${isDark ? '#64748b' : '#64748b'};">Slope:</span> <strong style="color: ${isDark ? '#f1f5f9' : '#0f172a'};">${zone.slope_deg}°</strong></div>
              <div><span style="color: ${isDark ? '#64748b' : '#64748b'};">Incidents:</span> <strong style="color: ${isDark ? '#f1f5f9' : '#0f172a'};">${zone.historical_disasters}</strong></div>
            </div>

            <div style="background: ${isDark ? '#0f172a' : '#ffffff'}; border-left: 3px solid ${color}; padding: 6px 8px; border-radius: 4px; font-size: 10.5px; line-height: 1.4; color: ${isDark ? '#cbd5e1' : '#334155'}; margin-bottom: 8px; border-top: 1px solid ${isDark ? 'transparent' : '#e2e8f0'}; border-right: 1px solid ${isDark ? 'transparent' : '#e2e8f0'}; border-bottom: 1px solid ${isDark ? 'transparent' : '#e2e8f0'};">
              <strong style="color: ${isDark ? '#f1f5f9' : '#0f172a'};">AI Rationale:</strong> ${zone.ai_explanation || 'High gravitational shear angle and monsoonal saturation.'}
            </div>
          </div>
        `;

        circle.bindPopup(popupContent);
        layersRef.current.hazardZones.addLayer(circle);
      });
    }

    // 2. Render Vulnerable Habitations
    if (showHabitations) {
      habitations.forEach(hab => {
        if (selectedState !== 'All' && hab.state !== selectedState) return;
        if (selectedHazard !== 'All' && hab.primary_hazard !== selectedHazard) return;

        const isCritical = hab.priority_level === 'Critical';
        const isHigh = hab.priority_level === 'High';

        const markerColor = isCritical ? '#ef4444' : (isHigh ? '#f97316' : '#d97706');

        // Custom HTML marker
        const iconHtml = `
          <div style="
            width: 22px;
            height: 22px;
            background: ${markerColor};
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 12px ${markerColor}99;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 10px;
            font-weight: bold;
          ">
            !
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-hab-marker',
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const marker = L.marker([hab.latitude, hab.longitude], { icon: customIcon });

        const popupContent = `
          <div style="font-family: inherit; width: 280px; padding: 4px; color: ${isDark ? '#ffffff' : '#0f172a'};">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: ${markerColor};">
                Priority: ${hab.priority_level}
              </span>
              <span style="font-size: 11px; font-weight: 700; background: ${markerColor}25; color: ${markerColor}; padding: 2px 6px; border-radius: 4px;">
                Risk: ${hab.risk_score}
              </span>
            </div>

            <h4 style="font-size: 14px; font-weight: 700; color: ${isDark ? '#ffffff' : '#0f172a'}; margin: 0 0 2px 0;">${hab.name}</h4>
            <p style="font-size: 11px; color: ${isDark ? '#94a3b8' : '#475569'}; margin: 0 0 8px 0;">${hab.district}, ${hab.state}</p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: ${isDark ? '#1e293b' : '#f1f5f9'}; padding: 8px; border-radius: 6px; margin-bottom: 8px; font-size: 11px; border: 1px solid ${isDark ? 'transparent' : '#e2e8f0'};">
              <div><span style="color: ${isDark ? '#64748b' : '#64748b'};">Population:</span> <strong style="color: ${isDark ? '#f1f5f9' : '#0f172a'};">${hab.population.toLocaleString()}</strong></div>
              <div><span style="color: ${isDark ? '#64748b' : '#64748b'};">Hazard:</span> <strong style="color: ${isDark ? '#f1f5f9' : '#0f172a'};">${hab.primary_hazard}</strong></div>
              <div><span style="color: ${isDark ? '#64748b' : '#64748b'};">Slope:</span> <strong style="color: ${isDark ? '#f1f5f9' : '#0f172a'};">${hab.slope_deg}°</strong></div>
              <div><span style="color: ${isDark ? '#64748b' : '#64748b'};">River Dist:</span> <strong style="color: ${isDark ? '#f1f5f9' : '#0f172a'};">${hab.river_distance_m}m</strong></div>
            </div>

            <div style="font-size: 11px; color: ${isDark ? '#cbd5e1' : '#334155'}; margin-bottom: 8px;">
              <span style="color: ${isDark ? '#94a3b8' : '#64748b'};">Action:</span> <strong>${hab.recommended_action}</strong>
            </div>

            <div style="border-top: 1px solid ${isDark ? '#334155' : '#e2e8f0'}; padding-top: 8px; text-align: right;">
              <span style="font-size: 10px; color: ${isDark ? '#38bdf8' : '#1d4ed8'}; cursor: pointer; font-weight: 700;">
                Click in Table to View Relocation Plan →
              </span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          if (onSelectHabitation) onSelectHabitation(hab);
        });

        layersRef.current.habitations.addLayer(marker);
      });
    }

    // 3. Render Safe Relocation Zones
    if (showSafeZones) {
      safeZones.forEach(zone => {
        if (selectedState !== 'All' && zone.state !== selectedState) return;

        const iconHtml = `
          <div style="
            width: 26px;
            height: 26px;
            background: #2563eb;
            border: 2px solid #93c5fd;
            border-radius: 8px;
            box-shadow: 0 0 14px rgba(37, 99, 235, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 12px;
          ">
            🛡️
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-safe-marker',
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const marker = L.marker([zone.latitude, zone.longitude], { icon: customIcon });

        const popupContent = `
          <div style="font-family: inherit; width: 280px; padding: 4px; color: ${isDark ? '#ffffff' : '#0f172a'};">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: ${isDark ? '#60a5fa' : '#1d4ed8'};">
                Safe Relocation Zone
              </span>
              <span style="font-size: 11px; font-weight: 700; background: ${isDark ? '#2563eb25' : '#dbeafe'}; color: ${isDark ? '#60a5fa' : '#1e40af'}; padding: 2px 6px; border-radius: 4px;">
                Sustainability: ${zone.sustainability_score}/100
              </span>
            </div>

            <h4 style="font-size: 14px; font-weight: 700; color: ${isDark ? '#ffffff' : '#0f172a'}; margin: 0 0 2px 0;">${zone.name}</h4>
            <p style="font-size: 11px; color: ${isDark ? '#94a3b8' : '#475569'}; margin: 0 0 8px 0;">${zone.district}, ${zone.state}</p>

            <div style="background: ${isDark ? '#1e293b' : '#f1f5f9'}; padding: 8px; border-radius: 6px; margin-bottom: 8px; font-size: 11px; border: 1px solid ${isDark ? 'transparent' : '#e2e8f0'};">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: ${isDark ? '#94a3b8' : '#64748b'};">Max Capacity:</span>
                <strong style="color: ${isDark ? '#f1f5f9' : '#0f172a'};">${zone.maximum_capacity.toLocaleString()}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: ${isDark ? '#94a3b8' : '#64748b'};">Current Occupancy:</span>
                <strong style="color: ${isDark ? '#f1f5f9' : '#0f172a'};">${zone.current_population.toLocaleString()}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: ${isDark ? '#94a3b8' : '#64748b'};">Available Capacity:</span>
                <strong style="color: ${isDark ? '#34d399' : '#059669'};">${zone.available_capacity.toLocaleString()} persons</strong>
              </div>
            </div>

            <p style="font-size: 10.5px; color: ${isDark ? '#cbd5e1' : '#334155'}; margin: 0;">
              ${zone.facilities_summary || 'Equipped with medical facilities, shelter units, and water access.'}
            </p>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          if (onSelectSafeZone) onSelectSafeZone(zone);
        });

        layersRef.current.safeZones.addLayer(marker);
      });
    }

  }, [hazardZones, habitations, safeZones, showHazardZones, showHabitations, showSafeZones, selectedState, selectedHazard, isDark]);

  // Focus on selected habitation if changed
  useEffect(() => {
    if (selectedHabitation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedHabitation.latitude, selectedHabitation.longitude],
        12,
        { duration: 1.5 }
      );
    }
  }, [selectedHabitation]);

  // Collect unique states for filter
  const states = ['All', ...new Set([...hazardZones, ...habitations, ...safeZones].map(i => i.state).filter(Boolean))];
  const hazards = ['All', 'Landslide', 'Flood', 'Cloudburst', 'Coastal Erosion', 'Flash Flood'];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-2xl bg-slate-100 dark:bg-command-950" style={{ height }}>
      {/* Map Target */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Controls Floating Overlay (Top-Left) */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2.5 max-w-xl">
        {/* Layer Toggles Pill */}
        <div className="bg-white/95 dark:bg-command-900/95 backdrop-blur-xl border border-slate-200 dark:border-blue-500/40 rounded-2xl p-1.5 shadow-xl flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setShowHazardZones(!showHazardZones)}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold transition ${
              showHazardZones ? 'bg-red-500/15 text-red-700 dark:text-red-200 border border-red-500/40 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Toggle Hazard Red/Orange/Green Zones"
          >
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Hazard Zones
          </button>

          <button
            onClick={() => setShowHabitations(!showHabitations)}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold transition ${
              showHabitations ? 'bg-amber-500/15 text-amber-800 dark:text-yellow-300 border border-amber-500/40 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Toggle Vulnerable Habitations"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-yellow-400" />
            Habitations
          </button>

          <button
            onClick={() => setShowSafeZones(!showSafeZones)}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold transition ${
              showSafeZones ? 'bg-blue-600/15 text-blue-700 dark:text-blue-200 border border-blue-400/50 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Toggle Safe Relocation Zones"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-300" />
            Safe Zones
          </button>
        </div>

        {/* State and Hazard Filters Pill */}
        <div className="bg-white/95 dark:bg-command-900/95 backdrop-blur-xl border border-slate-200 dark:border-blue-500/40 rounded-2xl p-1.5 shadow-xl flex items-center gap-2 text-xs">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-slate-50 dark:bg-command-950/90 text-slate-800 dark:text-white font-semibold text-xs rounded-xl px-3 py-1.5 border border-slate-300 dark:border-blue-900/80 focus:outline-none focus:border-amber-500 dark:focus:border-yellow-400"
          >
            {states.map(s => <option key={s} value={s}>{s === 'All' ? 'All States' : s}</option>)}
          </select>

          <select
            value={selectedHazard}
            onChange={(e) => setSelectedHazard(e.target.value)}
            className="bg-slate-50 dark:bg-command-950/90 text-slate-800 dark:text-white font-semibold text-xs rounded-xl px-3 py-1.5 border border-slate-300 dark:border-blue-900/80 focus:outline-none focus:border-amber-500 dark:focus:border-yellow-400"
          >
            {hazards.map(h => <option key={h} value={h}>{h === 'All' ? 'All Hazards' : h}</option>)}
          </select>
        </div>
      </div>

      {/* Map Legend Overlay (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 dark:bg-command-900/95 backdrop-blur-xl border border-slate-200 dark:border-blue-500/40 rounded-2xl p-3.5 shadow-xl text-xs space-y-2 pointer-events-auto">
        <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-yellow-400 tracking-wider block font-mono">
          RISK CLASSIFICATION
        </span>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span>
          <span className="text-slate-900 dark:text-white font-semibold">🔴 Red Zone (61–100 High Risk)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500"></span>
          <span className="text-slate-700 dark:text-slate-200">🟠 Orange Zone (31–60 Medium Risk)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span className="text-slate-700 dark:text-slate-200">🟢 Green Zone (0–30 Low Risk)</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-blue-900/40">
          <span className="w-3.5 h-3.5 rounded-lg bg-blue-600 border border-blue-400 shadow-sm"></span>
          <span className="text-blue-700 dark:text-blue-300 font-bold">🛡️ Safe Relocation Zone</span>
        </div>
      </div>
    </div>
  );
}
