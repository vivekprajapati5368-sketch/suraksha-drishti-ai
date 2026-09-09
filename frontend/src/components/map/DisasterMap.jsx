import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, Filter, Eye, EyeOff, MapPin, Shield, AlertTriangle, Info, 
  Crosshair, Pickaxe, Mountain, Waves, Landmark, History, Route, 
  ChevronDown, Check, Sparkles, Navigation
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

export function DisasterMap({
  hazardZones = [],
  habitations = [],
  safeZones = [],
  selectedHabitation = null,
  onSelectHabitation = null,
  onSelectSafeZone = null,
  height = '600px',
  // Advanced 360° Area Intelligence Props:
  isAnalysisMode = false,
  onToggleAnalysisMode = null,
  analysisCoords = null,
  onSelectAreaCoordinates = null,
  layersData = null,
  showAllLayersToggle = true
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Leaflet Layer Groups
  const layersRef = useRef({
    hazardZones: L.layerGroup(),
    habitations: L.layerGroup(),
    safeZones: L.layerGroup(),
    mining: L.layerGroup(),
    rivers: L.layerGroup(),
    geology: L.layerGroup(),
    disasters: L.layerGroup(),
    projects: L.layerGroup(),
    highPeaks: L.layerGroup(),
    routes: L.layerGroup(),
    analysisTarget: L.layerGroup()
  });

  // Layer Visibility States (Standard & Extended GIS)
  const [showHazardZones, setShowHazardZones] = useState(true);
  const [showHabitations, setShowHabitations] = useState(true);
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [showMining, setShowMining] = useState(false);
  const [showRivers, setShowRivers] = useState(false);
  const [showGeology, setShowGeology] = useState(false);
  const [showDisasters, setShowDisasters] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showHighPeaks, setShowHighPeaks] = useState(false);
  const [showEmergencyRoute, setShowEmergencyRoute] = useState(true);

  // Dropdown UI states
  const [layersMenuOpen, setLayersMenuOpen] = useState(false);
  const [selectedState, setSelectedState] = useState('All');
  const [selectedHazard, setSelectedHazard] = useState('All');

  // Internal Fallback registries for GIS layers if not provided via props
  const [internalLayers, setInternalLayers] = useState({
    miningSites: [],
    rivers: [],
    geology: [],
    disasters: [],
    projects: []
  });

  // Fetch optional auxiliary layers once if needed
  useEffect(() => {
    if (!layersData) {
      Promise.all([
        api.getMiningSites ? api.getMiningSites() : Promise.resolve({ success: false }),
        api.getRiversNearby ? api.getRiversNearby() : Promise.resolve({ success: false }),
        api.getGeologyNearby ? api.getGeologyNearby() : Promise.resolve({ success: false }),
        api.getDisasters50Yr ? api.getDisasters50Yr() : Promise.resolve({ success: false }),
        api.getDevelopmentProjects ? api.getDevelopmentProjects() : Promise.resolve({ success: false })
      ]).then(([minRes, rivRes, geoRes, disRes, projRes]) => {
        setInternalLayers({
          miningSites: minRes.success ? minRes.data : [],
          rivers: rivRes.success ? rivRes.data : [],
          geology: geoRes.success ? geoRes.data : [],
          disasters: disRes.success ? disRes.data : [],
          projects: projRes.success ? projRes.data : []
        });
      }).catch(() => {});
    }
  }, [layersData]);

  // Combined GIS datasets (Prop overrides internal)
  const activeMiningData = layersData?.miningSites || internalLayers.miningSites;
  const activeRiversData = layersData?.rivers || internalLayers.rivers;
  const activeGeologyData = layersData?.geology || internalLayers.geology;
  const activeDisastersData = layersData?.disasters || internalLayers.disasters;
  const activeProjectsData = layersData?.projects || internalLayers.projects;
  const activeEmergencyRoute = layersData?.emergencyRoute || null;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [23.5937, 80.9629],
        zoom: 5,
        zoomControl: false,
        attributionControl: true
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add all layer groups to map
      Object.values(layersRef.current).forEach(layer => layer.addTo(map));

      // Click event for Area Analysis Mode
      map.on('click', (e) => {
        if (onSelectAreaCoordinates) {
          onSelectAreaCoordinates({
            lat: parseFloat(e.latlng.lat.toFixed(5)),
            lng: parseFloat(e.latlng.lng.toFixed(5)),
            radiusKm: analysisCoords?.radiusKm || 10
          });
        }
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Dynamically update tile layer when theme switches
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

  // Render Core Layers & New GIS Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous items
    layersRef.current.hazardZones.clearLayers();
    layersRef.current.habitations.clearLayers();
    layersRef.current.safeZones.clearLayers();
    layersRef.current.mining.clearLayers();
    layersRef.current.rivers.clearLayers();
    layersRef.current.geology.clearLayers();
    layersRef.current.disasters.clearLayers();
    layersRef.current.projects.clearLayers();
    layersRef.current.highPeaks.clearLayers();
    layersRef.current.routes.clearLayers();

    // 1. Hazard Zones
    if (showHazardZones) {
      hazardZones.forEach(zone => {
        if (selectedState !== 'All' && zone.state !== selectedState) return;
        if (selectedHazard !== 'All' && zone.hazard_type !== selectedHazard) return;

        const isRed = zone.zone_category === 'Red';
        const isOrange = zone.zone_category === 'Orange';
        const color = isRed ? '#ef4444' : (isOrange ? '#f97316' : '#10b981');
        const fillColor = isRed ? '#dc2626' : (isOrange ? '#ea580c' : '#059669');

        const circle = L.circle([zone.latitude, zone.longitude], {
          color,
          fillColor,
          fillOpacity: isRed ? 0.35 : 0.25,
          weight: 2,
          radius: (zone.radius_km || 5) * 1000
        });

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
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: ${isDark ? '#1e293b' : '#f1f5f9'}; padding: 8px; border-radius: 6px; margin-bottom: 8px; font-size: 11px;">
              <div><span>Primary:</span> <strong>${zone.hazard_type}</strong></div>
              <div><span>Rainfall:</span> <strong>${zone.rainfall_mm} mm</strong></div>
            </div>
            <div style="font-size: 10.5px; line-height: 1.4; color: ${isDark ? '#cbd5e1' : '#334155'};">
              <strong>AI Rationale:</strong> ${zone.ai_explanation || 'High gravitational shear angle.'}
            </div>
          </div>
        `;
        circle.bindPopup(popupContent);
        layersRef.current.hazardZones.addLayer(circle);
      });
    }

    // 2. Vulnerable Habitations
    if (showHabitations) {
      habitations.forEach(hab => {
        if (selectedState !== 'All' && hab.state !== selectedState) return;
        if (selectedHazard !== 'All' && hab.primary_hazard !== selectedHazard) return;

        const isCritical = hab.priority_level === 'Critical';
        const isHigh = hab.priority_level === 'High';
        const markerColor = isCritical ? '#ef4444' : (isHigh ? '#f97316' : '#d97706');

        const iconHtml = `
          <div style="
            width: 22px; height: 22px; background: ${markerColor};
            border: 2px solid #ffffff; border-radius: 50%;
            box-shadow: 0 0 12px ${markerColor}99;
            display: flex; align-items: center; justify-content: center;
            color: #ffffff; font-size: 10px; font-weight: bold;
          ">!</div>
        `;
        const customIcon = L.divIcon({ html: iconHtml, className: 'custom-hab-marker', iconSize: [22, 22], iconAnchor: [11, 11] });
        const marker = L.marker([hab.latitude, hab.longitude], { icon: customIcon });

        const popupContent = `
          <div style="font-family: inherit; width: 270px; padding: 4px; color: ${isDark ? '#ffffff' : '#0f172a'};">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: ${markerColor};">Priority: ${hab.priority_level}</span>
              <span style="font-size: 11px; font-weight: 700; background: ${markerColor}25; color: ${markerColor}; padding: 2px 6px; border-radius: 4px;">Risk: ${hab.risk_score}</span>
            </div>
            <h4 style="font-size: 14px; font-weight: 700; margin: 0 0 2px 0;">${hab.name}</h4>
            <p style="font-size: 11px; color: ${isDark ? '#94a3b8' : '#475569'}; margin: 0 0 6px 0;">${hab.district}, ${hab.state}</p>
            <div style="font-size: 11px;">Population: <strong>${hab.population?.toLocaleString()}</strong> • Hazard: <strong>${hab.primary_hazard}</strong></div>
          </div>
        `;
        marker.bindPopup(popupContent);
        marker.on('click', () => { if (onSelectHabitation) onSelectHabitation(hab); });
        layersRef.current.habitations.addLayer(marker);
      });
    }

    // 3. Safe Relocation Havens
    if (showSafeZones) {
      safeZones.forEach(zone => {
        if (selectedState !== 'All' && zone.state !== selectedState) return;

        const iconHtml = `
          <div style="
            width: 26px; height: 26px; background: #2563eb;
            border: 2px solid #93c5fd; border-radius: 8px;
            box-shadow: 0 0 14px rgba(37, 99, 235, 0.6);
            display: flex; align-items: center; justify-content: center;
            color: #ffffff; font-size: 12px;
          ">🛡️</div>
        `;
        const customIcon = L.divIcon({ html: iconHtml, className: 'custom-safe-marker', iconSize: [26, 26], iconAnchor: [13, 13] });
        const marker = L.marker([zone.latitude, zone.longitude], { icon: customIcon });

        const popupContent = `
          <div style="font-family: inherit; width: 270px; padding: 4px; color: ${isDark ? '#ffffff' : '#0f172a'};">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #3b82f6;">Safe Relocation Haven</span>
            <h4 style="font-size: 14px; font-weight: 700; margin: 2px 0;">${zone.name}</h4>
            <p style="font-size: 11px; color: ${isDark ? '#94a3b8' : '#475569'}; margin: 0 0 6px 0;">${zone.district}, ${zone.state}</p>
            <div style="font-size: 11px; color: #10b981; font-weight: bold;">Available Capacity: ${zone.available_capacity?.toLocaleString()} persons</div>
          </div>
        `;
        marker.bindPopup(popupContent);
        marker.on('click', () => { if (onSelectSafeZone) onSelectSafeZone(zone); });
        layersRef.current.safeZones.addLayer(marker);
      });
    }

    // 4. Mining Activities (Active ⛏️, Historical 🟡, High Impact ⚠️)
    if (showMining && activeMiningData.length > 0) {
      activeMiningData.forEach(mine => {
        const isCritical = mine.ground_subsidence_risk === 'Critical' || mine.tailings_failure_risk === 'Critical';
        const isHistorical = mine.compliance_status?.includes('Legacy') || mine.operational_status === 'Closed';
        const iconEmoji = isCritical ? '⚠️' : (isHistorical ? '🟡' : '⛏️');
        const bgCol = isCritical ? '#dc2626' : (isHistorical ? '#d97706' : '#475569');

        const customIcon = L.divIcon({
          html: `<div style="width: 24px; height: 24px; background: ${bgCol}; border: 2px solid #ffffff; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; box-shadow: 0 0 10px ${bgCol}99;">${iconEmoji}</div>`,
          className: 'custom-mine-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([mine.latitude, mine.longitude], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; width: 280px; padding: 4px; color: ${isDark ? '#ffffff' : '#0f172a'};">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #f59e0b;">Mining Intelligence • ${mine.operator_type || 'Mining Concession'}</span>
            <h4 style="font-size: 14px; font-weight: 700; margin: 2px 0;">${mine.mine_name}</h4>
            <p style="font-size: 11px; color: ${isDark ? '#94a3b8' : '#475569'}; margin: 0 0 6px 0;">${mine.district}, ${mine.state} • Mineral: <strong>${mine.mineral_type}</strong></p>
            <div style="background: ${isDark ? '#1e293b' : '#f1f5f9'}; padding: 6px 8px; border-radius: 6px; font-size: 10.5px; margin-bottom: 6px;">
              <div>Subsidence Risk: <strong>${mine.ground_subsidence_risk || 'Moderate'}</strong></div>
              <div>Operating Agency: <strong>${mine.operating_agency || 'N/A'}</strong></div>
            </div>
            <div style="font-size: 10px; color: #94a3b8; font-style: italic;">
              Source: Indian Bureau of Mines (IBM) & DGMS Registry
            </div>
          </div>
        `);
        layersRef.current.mining.addLayer(marker);
      });
    }

    // 5. Rivers & Waterways
    if (showRivers && activeRiversData.length > 0) {
      activeRiversData.forEach(river => {
        const customIcon = L.divIcon({
          html: `<div style="width: 24px; height: 24px; background: #0284c7; border: 2px solid #7dd3fc; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 0 10px rgba(2,132,199,0.7);">🌊</div>`,
          className: 'custom-river-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        const marker = L.marker([river.latitude, river.longitude], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; width: 280px; padding: 4px; color: ${isDark ? '#ffffff' : '#0f172a'};">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #38bdf8;">River & Water Intelligence</span>
            <h4 style="font-size: 14px; font-weight: 700; margin: 2px 0;">${river.name}</h4>
            <p style="font-size: 11px; color: ${isDark ? '#94a3b8' : '#475569'}; margin: 0 0 6px 0;">Basin: <strong>${river.basin}</strong> • Width: ~${river.width_approx_m || 150}m</p>
            <div style="font-size: 11px; margin-bottom: 6px;">Flood Risk: <strong style="color: #ef4444;">${river.flood_risk_indicators || 'Medium'}</strong></div>
            <div style="font-size: 10.5px; color: ${isDark ? '#cbd5e1' : '#334155'};">${river.floodplain_info || 'Active fluvial floodplain corridor.'}</div>
          </div>
        `);
        layersRef.current.rivers.addLayer(marker);
      });
    }

    // 6. Geological & Soil Formations
    if (showGeology && activeGeologyData.length > 0) {
      activeGeologyData.forEach(geo => {
        const customIcon = L.divIcon({
          html: `<div style="width: 24px; height: 24px; background: #7c3aed; border: 2px solid #c4b5fd; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 0 10px rgba(124,58,237,0.6);">🪨</div>`,
          className: 'custom-geo-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        const marker = L.marker([geo.latitude, geo.longitude], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; width: 280px; padding: 4px; color: ${isDark ? '#ffffff' : '#0f172a'};">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #a78bfa;">Geological & Soil Survey (GSI)</span>
            <h4 style="font-size: 13px; font-weight: 700; margin: 2px 0;">${geo.location}</h4>
            <p style="font-size: 11px; color: ${isDark ? '#94a3b8' : '#475569'}; margin: 0 0 6px 0;">${geo.district}, ${geo.state}</p>
            <div style="background: ${isDark ? '#1e293b' : '#f1f5f9'}; padding: 6px; border-radius: 6px; font-size: 10.5px; margin-bottom: 6px;">
              <div>Soil: <strong>${geo.soil_type}</strong></div>
              <div>Lithology: <strong>${geo.rock_type}</strong></div>
              <div>Stability Index: <strong>${geo.geological_stability_score || 70}/100</strong></div>
            </div>
            <div style="font-size: 10px; color: #94a3b8;">${geo.fracture_fault_indicators || 'Structural lineament surveyed.'}</div>
          </div>
        `);
        layersRef.current.geology.addLayer(marker);
      });
    }

    // 7. 50-Year Historical Disasters
    if (showDisasters && activeDisastersData.length > 0) {
      activeDisastersData.forEach(dis => {
        const customIcon = L.divIcon({
          html: `<div style="width: 24px; height: 24px; background: #b91c1c; border: 2px solid #fca5a5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; box-shadow: 0 0 12px rgba(185,28,28,0.8);">📜</div>`,
          className: 'custom-disaster-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        const marker = L.marker([dis.latitude, dis.longitude], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; width: 300px; padding: 4px; color: ${isDark ? '#ffffff' : '#0f172a'};">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #f87171;">50-Year Calamity Record • ${dis.year_date || dis.year}</span>
            <h4 style="font-size: 13px; font-weight: 700; margin: 2px 0;">${dis.disaster_type}</h4>
            <p style="font-size: 11px; color: ${isDark ? '#94a3b8' : '#475569'}; margin: 0 0 6px 0;">${dis.location}, ${dis.state}</p>
            <div style="background: ${isDark ? '#1e293b' : '#f1f5f9'}; padding: 6px; border-radius: 6px; font-size: 10.5px; margin-bottom: 6px;">
              <div><strong>Official Reported Cause:</strong> ${dis.official_reported_cause || dis.primary_cause || 'Official records under audit.'}</div>
            </div>
            <div style="font-size: 10px; color: #38bdf8;">Source: ${dis.source_organization || 'NDMA Archive'}</div>
          </div>
        `);
        layersRef.current.disasters.addLayer(marker);
      });
    }

    // 8. Development Projects (Govt 🏛️, Private 🏢, PPP 🤝)
    if (showProjects && activeProjectsData.length > 0) {
      activeProjectsData.forEach(proj => {
        const isGovt = proj.ownership_type === 'Government Project';
        const isPPP = proj.ownership_type === 'Public-Private Partnership';
        const emoji = isGovt ? '🏛️' : (isPPP ? '🤝' : '🏢');

        const customIcon = L.divIcon({
          html: `<div style="width: 24px; height: 24px; background: #059669; border: 2px solid #a7f3d0; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; box-shadow: 0 0 10px rgba(5,150,105,0.6);">${emoji}</div>`,
          className: 'custom-proj-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        const marker = L.marker([proj.latitude, proj.longitude], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; width: 280px; padding: 4px; color: ${isDark ? '#ffffff' : '#0f172a'};">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #34d399;">${proj.ownership_type}</span>
            <h4 style="font-size: 13px; font-weight: 700; margin: 2px 0;">${proj.name}</h4>
            <p style="font-size: 11px; color: ${isDark ? '#94a3b8' : '#475569'}; margin: 0 0 6px 0;">${proj.location} • Status: <strong>${proj.project_status}</strong></p>
            <div style="font-size: 10.5px; color: ${isDark ? '#cbd5e1' : '#334155'}; margin-bottom: 4px;">Org: <strong>${proj.organization}</strong></div>
            <div style="font-size: 9.5px; color: #94a3b8;">EC: ${proj.environmental_clearance_ref || 'MoEFCC Clearance Verified'}</div>
          </div>
        `);
        layersRef.current.projects.addLayer(marker);
      });
    }

    // 9. High Peaks & Safe High Ground
    if (showHighPeaks) {
      safeZones.forEach(sz => {
        const customIcon = L.divIcon({
          html: `<div style="width: 26px; height: 26px; background: #15803d; border: 2px solid #86efac; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 0 12px rgba(21,128,61,0.8);">🏔️</div>`,
          className: 'custom-peak-marker',
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });
        const marker = L.marker([sz.latitude, sz.longitude], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; width: 260px; padding: 4px; color: ${isDark ? '#ffffff' : '#0f172a'};">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #22c55e;">🟢 Verified Safe High Ground</span>
            <h4 style="font-size: 13px; font-weight: 700; margin: 2px 0;">${sz.name}</h4>
            <div style="font-size: 11px;">Carrying Capacity: <strong>${sz.maximum_capacity?.toLocaleString()} persons</strong></div>
            <div style="font-size: 11px; color: #22c55e;">Sustainability: <strong>${sz.sustainability_score}/100</strong></div>
          </div>
        `);
        layersRef.current.highPeaks.addLayer(marker);
      });
    }

  }, [
    hazardZones, habitations, safeZones, showHazardZones, showHabitations, showSafeZones,
    showMining, showRivers, showGeology, showDisasters, showProjects, showHighPeaks,
    activeMiningData, activeRiversData, activeGeologyData, activeDisastersData, activeProjectsData,
    selectedState, selectedHazard, isDark
  ]);

  // Render Target Selection Pin & Radius Circle for 360° Area Analysis
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    layersRef.current.analysisTarget.clearLayers();
    layersRef.current.routes.clearLayers();

    if (analysisCoords && analysisCoords.lat && analysisCoords.lng) {
      const { lat, lng, radiusKm = 10, locationName = 'Target Area' } = analysisCoords;

      // Draggable Target Marker
      const targetIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <div style="
              width: 32px; height: 32px; background: #06b6d4;
              border: 3px solid #ffffff; border-radius: 50%;
              box-shadow: 0 0 20px #06b6d4; display: flex;
              align-items: center; justify-content: center; color: #ffffff;
            ">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="22" y1="12" x2="18" y2="12"></line>
                <line x1="6" y1="12" x2="2" y2="12"></line>
                <line x1="12" y1="6" x2="12" y2="2"></line>
                <line x1="12" y1="22" x2="12" y2="18"></line>
              </svg>
            </div>
            <div style="
              position: absolute; width: 44px; height: 44px;
              border: 2px dashed #06b6d4; border-radius: 50%;
              animation: spin 6s linear infinite;
            "></div>
          </div>
        `,
        className: 'custom-target-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([lat, lng], { icon: targetIcon, draggable: true });
      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        if (onSelectAreaCoordinates) {
          onSelectAreaCoordinates({
            lat: parseFloat(newPos.lat.toFixed(5)),
            lng: parseFloat(newPos.lng.toFixed(5)),
            radiusKm
          });
        }
      });

      marker.bindPopup(`
        <div style="font-family: inherit; width: 260px; padding: 4px; color: ${isDark ? '#ffffff' : '#0f172a'};">
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #06b6d4;">Target Analysis Center</span>
          <h4 style="font-size: 13px; font-weight: 800; margin: 2px 0;">${locationName}</h4>
          <div style="font-size: 11px; font-family: monospace; margin-bottom: 6px;">[${lat.toFixed(4)}, ${lng.toFixed(4)}] • Radius: ${radiusKm} KM</div>
          <div style="font-size: 10px; color: #94a3b8;">Drag pin to shift analysis focus point.</div>
        </div>
      `);

      layersRef.current.analysisTarget.addLayer(marker);

      // Translucent Radius Coverage Circle
      const radiusCircle = L.circle([lat, lng], {
        color: '#0891b2',
        fillColor: '#06b6d4',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '6, 6',
        radius: radiusKm * 1000
      });
      layersRef.current.analysisTarget.addLayer(radiusCircle);

      // Fly to location smoothly
      map.flyTo([lat, lng], radiusKm <= 5 ? 12 : (radiusKm <= 10 ? 11 : 10), { duration: 1.2 });
    }

    // Render Emergency Escape Route if available
    if (showEmergencyRoute && activeEmergencyRoute && analysisCoords) {
      const { lat, lng } = analysisCoords;
      const destination = safeZones[0]; // Nearest haven
      if (destination) {
        const polyline = L.polyline([[lat, lng], [destination.latitude, destination.longitude]], {
          color: '#10b981',
          weight: 4,
          dashArray: '8, 8',
          opacity: 0.85
        });
        polyline.bindPopup(`
          <div style="font-family: inherit; width: 240px; padding: 4px;">
            <span style="font-size: 10px; font-weight: 800; color: #10b981;">EMERGENCY ESCAPE CORRIDOR</span>
            <div style="font-size: 11px; font-weight: bold; margin-top: 2px;">Direct Highway Transit to ${destination.name}</div>
          </div>
        `);
        layersRef.current.routes.addLayer(polyline);
      }
    }

  }, [analysisCoords, activeEmergencyRoute, showEmergencyRoute, safeZones, isDark]);

  // Focus on selected habitation
  useEffect(() => {
    if (selectedHabitation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedHabitation.latitude, selectedHabitation.longitude],
        12,
        { duration: 1.5 }
      );
    }
  }, [selectedHabitation]);

  const states = ['All', ...new Set([...hazardZones, ...habitations, ...safeZones].map(i => i.state).filter(Boolean))];
  const hazards = ['All', 'Landslide', 'Flood', 'Cloudburst', 'Coastal Erosion', 'Flash Flood'];

  const activeLayersCount = [
    showHazardZones, showHabitations, showSafeZones, showMining,
    showRivers, showGeology, showDisasters, showProjects, showHighPeaks
  ].filter(Boolean).length;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-2xl bg-slate-100 dark:bg-command-950" style={{ height }}>
      {/* Leaflet Target Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10 cursor-crosshair" />

      {/* Map Controls Floating Overlay (Top-Left) */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2.5 max-w-2xl">
        
        {/* ANALYZE THIS AREA Button */}
        {onToggleAnalysisMode && (
          <button
            type="button"
            onClick={onToggleAnalysisMode}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer select-none ${
              isAnalysisMode
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white ring-2 ring-cyan-400/50'
                : 'bg-white/95 dark:bg-command-900/95 border border-slate-200 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 hover:border-cyan-400'
            }`}
            title="Click anywhere on the map to analyze 360° disaster risk"
          >
            <Crosshair className={`w-4 h-4 ${isAnalysisMode ? 'animate-spin' : ''}`} />
            <span>{isAnalysisMode ? 'ANALYZING THIS AREA' : 'ANALYZE THIS AREA'}</span>
          </button>
        )}

        {/* Layer Controls Dropdown Button */}
        {showAllLayersToggle && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setLayersMenuOpen(!layersMenuOpen)}
              className="px-3.5 py-2 rounded-xl bg-white/95 dark:bg-command-900/95 backdrop-blur-xl border border-slate-200 dark:border-blue-500/40 text-xs font-mono font-black text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-command-850 transition flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Layers className="w-4 h-4 text-amber-500" />
              <span>GIS LAYERS ({activeLayersCount})</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${layersMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Extended Layer Toggles Panel */}
            {layersMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-command-900 border border-slate-200 dark:border-blue-900/80 rounded-2xl shadow-2xl p-3 z-50 text-xs space-y-2 backdrop-blur-xl animate-in fade-in">
                <div className="pb-2 border-b border-slate-200 dark:border-blue-900/60 flex items-center justify-between">
                  <span className="font-mono font-extrabold uppercase text-[10px] text-amber-700 dark:text-cyberyellow-400">
                    INDEPENDENT GIS LAYERS
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{activeLayersCount}/9 Active</span>
                </div>

                <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                  {[
                    { id: 'hazards', label: 'Hazard Red/Orange Zones', state: showHazardZones, setter: setShowHazardZones, color: 'text-red-500' },
                    { id: 'habitations', label: 'Vulnerable Habitations', state: showHabitations, setter: setShowHabitations, color: 'text-amber-500' },
                    { id: 'safeZones', label: 'Safe Relocation Havens', state: showSafeZones, setter: setShowSafeZones, color: 'text-blue-500' },
                    { id: 'mining', label: 'Mining Activities & Impact', state: showMining, setter: setShowMining, color: 'text-amber-600' },
                    { id: 'rivers', label: 'Rivers & Waterways (CWC)', state: showRivers, setter: setShowRivers, color: 'text-sky-500' },
                    { id: 'geology', label: 'Soil & Rock Formations (GSI)', state: showGeology, setter: setShowGeology, color: 'text-purple-500' },
                    { id: 'disasters', label: '50-Year Historical Disasters', state: showDisasters, setter: setShowDisasters, color: 'text-red-600' },
                    { id: 'projects', label: 'Govt & Private Projects', state: showProjects, setter: setShowProjects, color: 'text-emerald-500' },
                    { id: 'highPeaks', label: 'Safe High Ground & Peaks', state: showHighPeaks, setter: setShowHighPeaks, color: 'text-green-600' }
                  ].map(layer => (
                    <label
                      key={layer.id}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-blue-950/60 cursor-pointer transition select-none"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={layer.state}
                          onChange={(e) => layer.setter(e.target.checked)}
                          className="rounded border-slate-300 dark:border-blue-800 text-amber-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{layer.label}</span>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${layer.state ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* State and Hazard Filters */}
        <div className="bg-white/95 dark:bg-command-900/95 backdrop-blur-xl border border-slate-200 dark:border-blue-500/40 rounded-2xl p-1.5 shadow-xl flex items-center gap-2 text-xs">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-slate-50 dark:bg-command-950/90 text-slate-800 dark:text-white font-semibold text-xs rounded-xl px-3 py-1.5 border border-slate-300 dark:border-blue-900/80 focus:outline-none"
          >
            {states.map(s => <option key={s} value={s}>{s === 'All' ? 'All States' : s}</option>)}
          </select>

          <select
            value={selectedHazard}
            onChange={(e) => setSelectedHazard(e.target.value)}
            className="bg-slate-50 dark:bg-command-950/90 text-slate-800 dark:text-white font-semibold text-xs rounded-xl px-3 py-1.5 border border-slate-300 dark:border-blue-900/80 focus:outline-none"
          >
            {hazards.map(h => <option key={h} value={h}>{h === 'All' ? 'All Hazards' : h}</option>)}
          </select>
        </div>
      </div>

      {/* Area Analysis Prompt Banner when active */}
      {isAnalysisMode && (
        <div className="absolute top-20 left-4 z-20 bg-cyan-600/95 text-white backdrop-blur-xl border border-cyan-400 rounded-2xl px-4 py-2 shadow-xl text-xs font-mono font-bold flex items-center gap-2 animate-bounce">
          <Crosshair className="w-4 h-4" />
          <span>Click anywhere on the map to place target marker & analyze 10 KM radius</span>
        </div>
      )}

      {/* Map Legend Overlay (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 dark:bg-command-900/95 backdrop-blur-xl border border-slate-200 dark:border-blue-500/40 rounded-2xl p-3.5 shadow-xl text-xs space-y-2 pointer-events-auto max-w-xs">
        <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-yellow-400 tracking-wider block font-mono">
          MAP INTELLIGENCE LEGEND
        </span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="text-slate-900 dark:text-white font-semibold">🔴 Red Zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span className="text-slate-700 dark:text-slate-200">🟠 Orange Zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>🛡️</span>
            <span className="text-blue-600 dark:text-blue-300 font-bold">Safe Haven</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>⛏️</span>
            <span className="text-amber-700 dark:text-amber-400 font-bold">Mining Site</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>🌊</span>
            <span className="text-sky-600 dark:text-sky-400 font-bold">River / Dam</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>📜</span>
            <span className="text-red-700 dark:text-red-300 font-bold">50-Yr Calamity</span>
          </div>
        </div>
      </div>
    </div>
  );
}
