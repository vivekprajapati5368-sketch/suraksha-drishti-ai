const bcrypt = require('bcryptjs');
const db = require('./db');
const { initSchema } = require('./schema');
const { calculateRiskScore } = require('../services/riskEngine');
const { evaluateCarryingCapacity } = require('../services/capacityEngine');
const { seedGovtData } = require('./seedGovtData');

function seedData(forceReset = false) {
  initSchema();

  if (forceReset) {
    db.exec(`
      DELETE FROM relocation_allocations;
      DELETE FROM field_reports;
      DELETE FROM disaster_events;
      DELETE FROM safe_zones;
      DELETE FROM hazard_zones;
      DELETE FROM habitations;
      DELETE FROM users;
      DELETE FROM sqlite_sequence WHERE name IN ('relocation_allocations', 'field_reports', 'disaster_events', 'safe_zones', 'hazard_zones', 'habitations', 'users');
    `);
  }

  // Always ensure government registries are seeded
  seedGovtData();

  // Check if already seeded
  const userCount = db.prepare('SELECT count(*) as count FROM users').get().count;
  if (userCount > 0 && !forceReset) {
    console.log('[Seed] Database already seeded. Skipping initial seed.');
    return;
  }

  console.log('[Seed] Seeding realistic demonstration data for Suraksha Drishti AI...');

  // 1. Seed Demo Users (Guest, Admin, Developer, New User)
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('Admin123', salt);
  const devHash = bcrypt.hashSync('Dev123', salt);
  const guestHash = bcrypt.hashSync('Guest', salt);
  const newUserHash = bcrypt.hashSync('NewUser123', salt);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, phone, password_hash, role, department)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('Dr. Rajesh Verma, IAS', 'admin@surakshadrishti.in', '+919811020261', adminHash, 'admin', 'National Disaster Management Authority (NDMA)');
  insertUser.run('Vivek Kumar', 'developer@surakshadrishti.in', '+919855020265', devHash, 'developer', 'Chief AI Architect & Core System Engineering');
  insertUser.run('Guest Explorer', 'guest@surakshadrishti.in', '+919999000000', guestHash, 'guest', 'Public Citizen & Disaster Awareness Visitor');
  insertUser.run('Pooja Joshi', 'newuser@surakshadrishti.in', '+919866020266', newUserHash, 'new_user', 'Newly Enrolled Citizen (Verified on Login)');

  // 2. Seed Safe Relocation Zones (Need IDs for foreign keys and matching)
  const safeZonesData = [
    {
      name: 'Gauchar Resettlement Plateau',
      district: 'Chamoli',
      state: 'Uttarakhand',
      latitude: 30.2856,
      longitude: 79.1554,
      total_area_ha: 85.0,
      maximum_capacity: 6500,
      current_population: 1800,
      water_score: 90,
      healthcare_score: 85,
      connectivity_score: 92,
      school_score: 88,
      employment_score: 80,
      housing_units: 1200,
      facilities_summary: 'Airfield access, 100-bed sub-divisional hospital, multi-lane NH-07 connectivity, piped spring water supply.'
    },
    {
      name: 'Pipalkoti Upper Terrace Safe Zone',
      district: 'Chamoli',
      state: 'Uttarakhand',
      latitude: 30.4320,
      longitude: 79.4310,
      total_area_ha: 60.0,
      maximum_capacity: 4800,
      current_population: 1400,
      water_score: 84,
      healthcare_score: 78,
      connectivity_score: 86,
      school_score: 80,
      employment_score: 72,
      housing_units: 850,
      facilities_summary: 'Broad geological bedrock terrace, community health centre, bus depot, solar microgrid backup.'
    },
    {
      name: 'Sultan Bathery Relocation Mesa',
      district: 'Wayanad',
      state: 'Kerala',
      latitude: 11.6627,
      longitude: 76.2570,
      total_area_ha: 110.0,
      maximum_capacity: 8500,
      current_population: 2200,
      water_score: 94,
      healthcare_score: 92,
      connectivity_score: 95,
      school_score: 90,
      employment_score: 86,
      housing_units: 1600,
      facilities_summary: 'Flat plateau terrain, Wayanad taluk medical college hospital, NH-766 interstate corridor, ample agro-commerce.'
    },
    {
      name: 'Kalpetta North Civic Habitat',
      district: 'Wayanad',
      state: 'Kerala',
      latitude: 11.6250,
      longitude: 76.0820,
      total_area_ha: 75.0,
      maximum_capacity: 6200,
      current_population: 1950,
      water_score: 88,
      healthcare_score: 88,
      connectivity_score: 90,
      school_score: 85,
      employment_score: 82,
      housing_units: 1100,
      facilities_summary: 'District headquarters proximity, civil hospital, technical high school, integrated municipal water grid.'
    },
    {
      name: 'Titabar High Ground Resettlement Area',
      district: 'Jorhat',
      state: 'Assam',
      latitude: 26.5878,
      longitude: 94.1983,
      total_area_ha: 140.0,
      maximum_capacity: 11000,
      current_population: 3200,
      water_score: 92,
      healthcare_score: 86,
      connectivity_score: 94,
      school_score: 89,
      employment_score: 88,
      housing_units: 2200,
      facilities_summary: 'Elevated ancient alluvial terrace flood-immune, broad gauge railway connection, sericulture and tea livelihood center.'
    },
    {
      name: 'Silapathar Flood-Immune Township',
      district: 'Dhemaji',
      state: 'Assam',
      latitude: 27.5925,
      longitude: 94.7214,
      total_area_ha: 95.0,
      maximum_capacity: 7800,
      current_population: 2100,
      water_score: 86,
      healthcare_score: 80,
      connectivity_score: 88,
      school_score: 82,
      employment_score: 79,
      housing_units: 1400,
      facilities_summary: 'NH-15 elevated alignment, regional hospital, secondary schools, grain warehouse storage.'
    },
    {
      name: 'Sundernagar Safe Plateau',
      district: 'Mandi',
      state: 'Himachal Pradesh',
      latitude: 31.5332,
      longitude: 76.8926,
      total_area_ha: 80.0,
      maximum_capacity: 6400,
      current_population: 1700,
      water_score: 91,
      healthcare_score: 87,
      connectivity_score: 93,
      school_score: 89,
      employment_score: 84,
      housing_units: 1250,
      facilities_summary: 'Broad valley floor elevated 80m above Beas high-flood level, BBMB infrastructure, polytechnic institute.'
    },
    {
      name: 'Bajreshwari Uplands Safe Zone',
      district: 'Kangra',
      state: 'Himachal Pradesh',
      latitude: 32.0998,
      longitude: 76.2691,
      total_area_ha: 70.0,
      maximum_capacity: 5200,
      current_population: 1300,
      water_score: 89,
      healthcare_score: 84,
      connectivity_score: 89,
      school_score: 86,
      employment_score: 81,
      housing_units: 950,
      facilities_summary: 'Stable sandstone ridge, sub-divisional hospital, Kangra airport proximity (14km), reliable power grid.'
    },
    {
      name: 'Mahakalapada Elevated Resettlement Colony',
      district: 'Kendrapara',
      state: 'Odisha',
      latitude: 20.4285,
      longitude: 86.5872,
      total_area_ha: 100.0,
      maximum_capacity: 7500,
      current_population: 2300,
      water_score: 87,
      healthcare_score: 82,
      connectivity_score: 88,
      school_score: 84,
      employment_score: 83,
      housing_units: 1500,
      facilities_summary: 'Constructed on engineered 4m elevated embankments, cyclone shelter network, RO desalination plants.'
    },
    {
      name: 'Kakdwip Safe Civic Buffer',
      district: 'South 24 Parganas',
      state: 'West Bengal',
      latitude: 21.8742,
      longitude: 88.1873,
      total_area_ha: 90.0,
      maximum_capacity: 7000,
      current_population: 2050,
      water_score: 85,
      healthcare_score: 81,
      connectivity_score: 91,
      school_score: 83,
      employment_score: 85,
      housing_units: 1300,
      facilities_summary: 'Elevated concrete storm shelter complex, sub-district hospital, railway terminal connection to Kolkata.'
    }
  ];

  const insertSafeZone = db.prepare(`
    INSERT INTO safe_zones (
      name, district, state, latitude, longitude, total_area_ha,
      maximum_capacity, current_population, available_capacity,
      water_score, healthcare_score, connectivity_score, school_score, employment_score,
      housing_units, sustainability_score, suitability_rating, facilities_summary
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const zone of safeZonesData) {
    const cap = evaluateCarryingCapacity(zone);
    insertSafeZone.run(
      zone.name, zone.district, zone.state, zone.latitude, zone.longitude, zone.total_area_ha,
      zone.maximum_capacity, zone.current_population, cap.availableCapacity,
      zone.water_score, zone.healthcare_score, zone.connectivity_score, zone.school_score, zone.employment_score,
      zone.housing_units, cap.sustainabilityScore, cap.suitabilityRating, zone.facilities_summary
    );
  }

  // 3. Seed Hazard Zones (12 realistic zones with polygon/radius)
  const hazardZonesData = [
    {
      location_name: 'Joshimath Subsidence & Fissure Zone',
      district: 'Chamoli',
      state: 'Uttarakhand',
      latitude: 30.5564,
      longitude: 79.5668,
      radius_km: 4.5,
      hazard_type: 'Landslide',
      rainfall_mm: 195,
      slope_deg: 36.5,
      elevation_m: 1890,
      soil_type: 'Loose Scree',
      river_distance_m: 240,
      population_density: 2100,
      historical_disasters: 4
    },
    {
      location_name: 'Chooralmala-Mundakkai Debris Flow Corridor',
      district: 'Wayanad',
      state: 'Kerala',
      latitude: 11.5360,
      longitude: 76.1550,
      radius_km: 6.0,
      hazard_type: 'Landslide',
      rainfall_mm: 372,
      slope_deg: 38.0,
      elevation_m: 950,
      soil_type: 'Lateritic Red Soil',
      river_distance_m: 120,
      population_density: 1850,
      historical_disasters: 5
    },
    {
      location_name: 'Rishi Ganga Flash Flood & Outburst Path',
      district: 'Chamoli',
      state: 'Uttarakhand',
      latitude: 30.4850,
      longitude: 79.6920,
      radius_km: 7.2,
      hazard_type: 'Cloudburst',
      rainfall_mm: 220,
      slope_deg: 42.0,
      elevation_m: 2400,
      soil_type: 'Morainic Debris',
      river_distance_m: 90,
      population_density: 950,
      historical_disasters: 4
    },
    {
      location_name: 'Majuli Island North Embankment Breach Zone',
      district: 'Majuli',
      state: 'Assam',
      latitude: 26.9600,
      longitude: 94.1800,
      radius_km: 8.5,
      hazard_type: 'Flood',
      rainfall_mm: 245,
      slope_deg: 2.0,
      elevation_m: 85,
      soil_type: 'Sandy Alluvial',
      river_distance_m: 80,
      population_density: 1600,
      historical_disasters: 6
    },
    {
      location_name: 'Teesta River Chungthang GLOF Belt',
      district: 'Mangan',
      state: 'Sikkim',
      latitude: 27.6040,
      longitude: 88.6470,
      radius_km: 5.5,
      hazard_type: 'Cloudburst',
      rainfall_mm: 280,
      slope_deg: 34.0,
      elevation_m: 1790,
      soil_type: 'Gravel Scree',
      river_distance_m: 110,
      population_density: 1250,
      historical_disasters: 4
    },
    {
      location_name: 'Beas Upper Catchment Torrent Corridor',
      district: 'Kullu',
      state: 'Himachal Pradesh',
      latitude: 32.2432,
      longitude: 77.1892,
      radius_km: 6.8,
      hazard_type: 'Flash Flood',
      rainfall_mm: 210,
      slope_deg: 31.0,
      elevation_m: 2050,
      soil_type: 'Fluvial Boulders',
      river_distance_m: 140,
      population_density: 2200,
      historical_disasters: 5
    },
    {
      location_name: 'Satabhaya Coastal Inundation Sector',
      district: 'Kendrapara',
      state: 'Odisha',
      latitude: 20.6120,
      longitude: 86.9240,
      radius_km: 5.0,
      hazard_type: 'Coastal Erosion',
      rainfall_mm: 190,
      slope_deg: 1.5,
      elevation_m: 4,
      soil_type: 'Marine Sand',
      river_distance_m: 150,
      population_density: 1400,
      historical_disasters: 5
    },
    {
      location_name: 'Mousuni Island Storm Surge Plain',
      district: 'South 24 Parganas',
      state: 'West Bengal',
      latitude: 21.6520,
      longitude: 88.2430,
      radius_km: 6.0,
      hazard_type: 'Coastal Erosion',
      rainfall_mm: 230,
      slope_deg: 1.0,
      elevation_m: 3,
      soil_type: 'Tidal Silt',
      river_distance_m: 100,
      population_density: 2800,
      historical_disasters: 5
    },
    {
      location_name: 'Mandakini Lower Basin Floodplain',
      district: 'Rudraprayag',
      state: 'Uttarakhand',
      latitude: 30.2880,
      longitude: 78.9800,
      radius_km: 4.2,
      hazard_type: 'Flood',
      rainfall_mm: 140,
      slope_deg: 24.0,
      elevation_m: 890,
      soil_type: 'Alluvial Loam',
      river_distance_m: 210,
      population_density: 1750,
      historical_disasters: 3
    },
    {
      location_name: 'Dhemaji Jiadhal River Surge Belt',
      district: 'Dhemaji',
      state: 'Assam',
      latitude: 27.4800,
      longitude: 94.5500,
      radius_km: 7.0,
      hazard_type: 'Flood',
      rainfall_mm: 165,
      slope_deg: 3.5,
      elevation_m: 104,
      soil_type: 'Silty Alluvium',
      river_distance_m: 190,
      population_density: 1500,
      historical_disasters: 4
    },
    {
      location_name: 'Kinnaur Satluj Gorge Landslide Sector',
      district: 'Kinnaur',
      state: 'Himachal Pradesh',
      latitude: 31.5200,
      longitude: 78.2700,
      radius_km: 5.5,
      hazard_type: 'Landslide',
      rainfall_mm: 135,
      slope_deg: 39.0,
      elevation_m: 2200,
      soil_type: 'Quartzite Scree',
      river_distance_m: 320,
      population_density: 800,
      historical_disasters: 3
    },
    {
      location_name: 'Dehradun Foothills Buffer Zone',
      district: 'Dehradun',
      state: 'Uttarakhand',
      latitude: 30.3165,
      longitude: 78.0322,
      radius_km: 5.0,
      hazard_type: 'Flash Flood',
      rainfall_mm: 65,
      slope_deg: 8.0,
      elevation_m: 640,
      soil_type: 'Gravel Loam',
      river_distance_m: 950,
      population_density: 1400,
      historical_disasters: 1
    }
  ];

  const insertHazardZone = db.prepare(`
    INSERT INTO hazard_zones (
      location_name, district, state, latitude, longitude, radius_km,
      hazard_type, rainfall_mm, slope_deg, elevation_m, soil_type,
      river_distance_m, population_density, historical_disasters,
      risk_score, zone_category, ai_explanation
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const zone of hazardZonesData) {
    const risk = calculateRiskScore(zone);
    insertHazardZone.run(
      zone.location_name, zone.district, zone.state, zone.latitude, zone.longitude, zone.radius_km,
      zone.hazard_type, zone.rainfall_mm, zone.slope_deg, zone.elevation_m, zone.soil_type,
      zone.river_distance_m, zone.population_density, zone.historical_disasters,
      risk.riskScore, risk.zoneCategory, risk.aiExplanation
    );
  }

  // 4. Seed Vulnerable Habitations (24+ habitations with real geo-locations across India)
  const habitationsData = [
    // Uttarakhand
    {
      name: 'Sunil Ward (Joshimath Upper)',
      district: 'Chamoli',
      state: 'Uttarakhand',
      latitude: 30.5580,
      longitude: 79.5695,
      population: 2450,
      primary_hazard: 'Landslide',
      elevation_m: 1950,
      slope_deg: 37,
      river_distance_m: 280,
      soil_type: 'Loose Scree',
      vulnerability_score: 88,
      historical_disasters_count: 4,
      last_disaster: '2023 Ground Fissure & Structural Subsidence'
    },
    {
      name: 'Manohar Bagh (Joshimath Center)',
      district: 'Chamoli',
      state: 'Uttarakhand',
      latitude: 30.5520,
      longitude: 79.5620,
      population: 1820,
      primary_hazard: 'Landslide',
      elevation_m: 1880,
      slope_deg: 35,
      river_distance_m: 310,
      soil_type: 'Loose Scree',
      vulnerability_score: 84,
      historical_disasters_count: 4,
      last_disaster: '2023 Hotel Malari Inn Demolition & Evacuation'
    },
    {
      name: 'Raini Gaon (Rishi Ganga Valley)',
      district: 'Chamoli',
      state: 'Uttarakhand',
      latitude: 30.4850,
      longitude: 79.6920,
      population: 1120,
      primary_hazard: 'Glacial Flood',
      elevation_m: 2350,
      slope_deg: 41,
      river_distance_m: 90,
      soil_type: 'Morainic Debris',
      vulnerability_score: 92,
      historical_disasters_count: 5,
      last_disaster: '2021 Chamoli Glacial Disaster & Flash Surge'
    },
    {
      name: 'Tilwara Riverbank Settlement',
      district: 'Rudraprayag',
      state: 'Uttarakhand',
      latitude: 30.3450,
      longitude: 78.9750,
      population: 3200,
      primary_hazard: 'Flood',
      elevation_m: 850,
      slope_deg: 18,
      river_distance_m: 110,
      soil_type: 'Alluvial Loam',
      vulnerability_score: 74,
      historical_disasters_count: 3,
      last_disaster: '2013 Kedarnath Downstream Inundation'
    },
    {
      name: 'Dharasu Bend Colony',
      district: 'Uttarkashi',
      state: 'Uttarakhand',
      latitude: 30.6300,
      longitude: 78.3100,
      population: 2890,
      primary_hazard: 'Landslide',
      elevation_m: 920,
      slope_deg: 33,
      river_distance_m: 160,
      soil_type: 'Fractured Slate',
      vulnerability_score: 68,
      historical_disasters_count: 3,
      last_disaster: '2022 Highway Landslip Blockade'
    },
    {
      name: 'Guptkashi Debris Plain',
      district: 'Rudraprayag',
      state: 'Uttarakhand',
      latitude: 30.5230,
      longitude: 79.0800,
      population: 2150,
      primary_hazard: 'Cloudburst',
      elevation_m: 1319,
      slope_deg: 32,
      river_distance_m: 230,
      soil_type: 'Colluvial Soil',
      vulnerability_score: 72,
      historical_disasters_count: 3,
      last_disaster: '2019 Flash Mudflow Surge'
    },

    // Kerala - Wayanad
    {
      name: 'Chooralmala Town Habitation',
      district: 'Wayanad',
      state: 'Kerala',
      latitude: 11.5360,
      longitude: 76.1550,
      population: 3400,
      primary_hazard: 'Landslide',
      elevation_m: 910,
      slope_deg: 39,
      river_distance_m: 95,
      soil_type: 'Lateritic Red Clay',
      vulnerability_score: 95,
      historical_disasters_count: 5,
      last_disaster: '2024 Catastrophic Meppadi-Chooralmala Debris Avalanche'
    },
    {
      name: 'Mundakkai Estate Quarters',
      district: 'Wayanad',
      state: 'Kerala',
      latitude: 11.5420,
      longitude: 76.1720,
      population: 2950,
      primary_hazard: 'Landslide',
      elevation_m: 1050,
      slope_deg: 42,
      river_distance_m: 80,
      soil_type: 'Loose Weathered Granite',
      vulnerability_score: 96,
      historical_disasters_count: 5,
      last_disaster: '2024 Mass Soil Liquefaction & Bridge Washout'
    },
    {
      name: 'Meppadi Lower Slopes',
      district: 'Wayanad',
      state: 'Kerala',
      latitude: 11.5510,
      longitude: 76.1260,
      population: 4100,
      primary_hazard: 'Landslide',
      elevation_m: 880,
      slope_deg: 31,
      river_distance_m: 190,
      soil_type: 'Clay Loam',
      vulnerability_score: 78,
      historical_disasters_count: 3,
      last_disaster: '2024 Secondary Slide Hazard'
    },
    {
      name: 'Attamala Tea Worker Habitation',
      district: 'Wayanad',
      state: 'Kerala',
      latitude: 11.5210,
      longitude: 76.1680,
      population: 1600,
      primary_hazard: 'Landslide',
      elevation_m: 1150,
      slope_deg: 40,
      river_distance_m: 150,
      soil_type: 'Weathered Regolith',
      vulnerability_score: 89,
      historical_disasters_count: 4,
      last_disaster: '2024 Roadway Collapse & Isolation'
    },

    // Assam & North-East
    {
      name: 'Kamalabari Ghat Habitation',
      district: 'Majuli',
      state: 'Assam',
      latitude: 26.9380,
      longitude: 94.1620,
      population: 4500,
      primary_hazard: 'Flood',
      elevation_m: 84,
      slope_deg: 1.5,
      river_distance_m: 70,
      soil_type: 'Sandy Alluvial',
      vulnerability_score: 87,
      historical_disasters_count: 6,
      last_disaster: '2022 Brahmaputra Bank Washout'
    },
    {
      name: 'Garamur Low-Lying Char',
      district: 'Majuli',
      state: 'Assam',
      latitude: 26.9740,
      longitude: 94.2250,
      population: 3100,
      primary_hazard: 'Flood',
      elevation_m: 82,
      slope_deg: 1.0,
      river_distance_m: 110,
      soil_type: 'Silt Deposit',
      vulnerability_score: 82,
      historical_disasters_count: 5,
      last_disaster: '2023 Seasonal Submersion'
    },
    {
      name: 'Jonai Riverine Basti',
      district: 'Dhemaji',
      state: 'Assam',
      latitude: 27.7950,
      longitude: 95.2210,
      population: 3800,
      primary_hazard: 'Flood',
      elevation_m: 110,
      slope_deg: 3.0,
      river_distance_m: 120,
      soil_type: 'Alluvial Loam',
      vulnerability_score: 79,
      historical_disasters_count: 5,
      last_disaster: '2023 Siang River Flash Surge'
    },
    {
      name: 'Lahorighat Riverbank Basti',
      district: 'Morigaon',
      state: 'Assam',
      latitude: 26.4300,
      longitude: 92.3500,
      population: 2750,
      primary_hazard: 'Riverbank Erosion',
      elevation_m: 68,
      slope_deg: 2.0,
      river_distance_m: 60,
      soil_type: 'Sandy Silt',
      vulnerability_score: 85,
      historical_disasters_count: 6,
      last_disaster: '2021 Embankment Collapse'
    },
    {
      name: 'Silchar Rangpur Lowland',
      district: 'Cachar',
      state: 'Assam',
      latitude: 24.8333,
      longitude: 92.7789,
      population: 5200,
      primary_hazard: 'Flood',
      elevation_m: 25,
      slope_deg: 1.0,
      river_distance_m: 130,
      soil_type: 'Clayey Alluvium',
      vulnerability_score: 80,
      historical_disasters_count: 4,
      last_disaster: '2022 Barak Urban Flood Deluge'
    },
    {
      name: 'Chungthang Old Town',
      district: 'Mangan',
      state: 'Sikkim',
      latitude: 27.6040,
      longitude: 88.6470,
      population: 1850,
      primary_hazard: 'Cloudburst',
      elevation_m: 1790,
      slope_deg: 36,
      river_distance_m: 85,
      soil_type: 'River Boulder Scree',
      vulnerability_score: 91,
      historical_disasters_count: 4,
      last_disaster: '2023 South Lhonak GLOF Dam Breach'
    },

    // Himachal Pradesh
    {
      name: 'Old Manali Beas Waterfront',
      district: 'Kullu',
      state: 'Himachal Pradesh',
      latitude: 32.2530,
      longitude: 77.1820,
      population: 3100,
      primary_hazard: 'Flash Flood',
      elevation_m: 2050,
      slope_deg: 32,
      river_distance_m: 80,
      soil_type: 'Fluvial Gravel',
      vulnerability_score: 83,
      historical_disasters_count: 4,
      last_disaster: '2023 Beas River Severe Flood Surge'
    },
    {
      name: 'Pandoh Bridge Settlement',
      district: 'Mandi',
      state: 'Himachal Pradesh',
      latitude: 31.6680,
      longitude: 76.9950,
      population: 2650,
      primary_hazard: 'Landslide',
      elevation_m: 885,
      slope_deg: 35,
      river_distance_m: 140,
      soil_type: 'Fractured Phyllite',
      vulnerability_score: 77,
      historical_disasters_count: 3,
      last_disaster: '2023 Highway Collapse & Flood'
    },
    {
      name: 'Sangla Batseri Hamlet',
      district: 'Kinnaur',
      state: 'Himachal Pradesh',
      latitude: 31.4280,
      longitude: 78.2610,
      population: 1750,
      primary_hazard: 'Landslide',
      elevation_m: 2680,
      slope_deg: 44,
      river_distance_m: 250,
      soil_type: 'Gneiss Scree',
      vulnerability_score: 81,
      historical_disasters_count: 3,
      last_disaster: '2021 Batseri Bridge Boulder Strike'
    },
    {
      name: 'Bhagsunag Stream Habitation',
      district: 'Kangra',
      state: 'Himachal Pradesh',
      latitude: 32.2470,
      longitude: 76.3350,
      population: 2300,
      primary_hazard: 'Cloudburst',
      elevation_m: 1810,
      slope_deg: 33,
      river_distance_m: 110,
      soil_type: 'Clayey Sandstone',
      vulnerability_score: 75,
      historical_disasters_count: 3,
      last_disaster: '2021 Flash Mudflow Vehicle Destruction'
    },

    // Coastal Odisha & West Bengal
    {
      name: 'Satabhaya Coastal Hamlet',
      district: 'Kendrapara',
      state: 'Odisha',
      latitude: 20.6120,
      longitude: 86.9240,
      population: 3600,
      primary_hazard: 'Coastal Erosion',
      elevation_m: 3,
      slope_deg: 1.0,
      river_distance_m: 150,
      soil_type: 'Marine Sand',
      vulnerability_score: 93,
      historical_disasters_count: 5,
      last_disaster: '2021 Cyclone Yaas Storm Surge'
    },
    {
      name: 'Pentha Seafront Settlement',
      district: 'Kendrapara',
      state: 'Odisha',
      latitude: 20.5310,
      longitude: 86.7890,
      population: 2800,
      primary_hazard: 'Coastal Erosion',
      elevation_m: 4,
      slope_deg: 1.0,
      river_distance_m: 200,
      soil_type: 'Saline Sand',
      vulnerability_score: 82,
      historical_disasters_count: 4,
      last_disaster: '2020 Cyclone Amphan Tidal Ingress'
    },
    {
      name: 'Baliara Mousuni Coastal Ward',
      district: 'South 24 Parganas',
      state: 'West Bengal',
      latitude: 21.6520,
      longitude: 88.2430,
      population: 4800,
      primary_hazard: 'Coastal Erosion',
      elevation_m: 2.5,
      slope_deg: 0.8,
      river_distance_m: 110,
      soil_type: 'Tidal Alluvium',
      vulnerability_score: 94,
      historical_disasters_count: 6,
      last_disaster: '2021 Cyclone Yaas Embankment Breach'
    },
    {
      name: 'Kusumtala Sundarban Habitation',
      district: 'South 24 Parganas',
      state: 'West Bengal',
      latitude: 21.7820,
      longitude: 88.3510,
      population: 3350,
      primary_hazard: 'Flood',
      elevation_m: 3.2,
      slope_deg: 1.0,
      river_distance_m: 140,
      soil_type: 'Estuarine Silt',
      vulnerability_score: 76,
      historical_disasters_count: 4,
      last_disaster: '2020 High Saline Inundation'
    }
  ];

  const insertHabitation = db.prepare(`
    INSERT INTO habitations (
      name, district, state, latitude, longitude, population,
      vulnerability_score, risk_score, priority_level, primary_hazard,
      elevation_m, slope_deg, river_distance_m, soil_type,
      infrastructure_vulnerability, historical_disasters_count, last_disaster,
      recommended_action
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const hab of habitationsData) {
    const risk = calculateRiskScore({
      rainfall_mm: hab.primary_hazard === 'Landslide' ? 180 : 210,
      slope_deg: hab.slope_deg,
      historical_disasters: hab.historical_disasters_count,
      population_density: 1500,
      vulnerability_score: hab.vulnerability_score,
      elevation_m: hab.elevation_m,
      river_distance_m: hab.river_distance_m,
      hazard_type: hab.primary_hazard,
      soil_type: hab.soil_type,
      population: hab.population
    });

    insertHabitation.run(
      hab.name, hab.district, hab.state, hab.latitude, hab.longitude, hab.population,
      hab.vulnerability_score, risk.riskScore, risk.priorityLevel, hab.primary_hazard,
      hab.elevation_m, hab.slope_deg, hab.river_distance_m, hab.soil_type,
      hab.vulnerability_score, hab.historical_disasters_count, hab.last_disaster,
      risk.recommendedAction
    );
  }

  // 5. Seed Historical Disaster Events
  const disasterEventsData = [
    {
      disaster_type: 'Debris Flow & Landslide',
      location: 'Chooralmala-Mundakkai, Wayanad',
      state: 'Kerala',
      year_date: 'July 2024',
      severity: 'Catastrophic (Grade-IV)',
      affected_population: 12500,
      casualties: 420,
      economic_loss_cr: 1200.0,
      summary: 'Triggered by 572mm rainfall in 48 hours. Mass soil liquefaction on 38° tea plantation slopes wiped out Chooralmala and Mundakkai townships.'
    },
    {
      disaster_type: 'Glacial Outburst & Flash Flood',
      location: 'Chamoli & Tapovan, Rishi Ganga',
      state: 'Uttarakhand',
      year_date: 'February 2021',
      severity: 'Catastrophic (Grade-IV)',
      affected_population: 8200,
      casualties: 204,
      economic_loss_cr: 1650.0,
      summary: 'Massive rock-ice avalanche from Ronti peak dammed Rishi Ganga, causing sudden glacial outburst destroying Tapovan hydel project and downstream bridges.'
    },
    {
      disaster_type: 'Glacial Lake Outburst Flood (GLOF)',
      location: 'Chungthang & Teesta Valley',
      state: 'Sikkim',
      year_date: 'October 2023',
      severity: 'Severe (Grade-III)',
      affected_population: 14000,
      casualties: 92,
      economic_loss_cr: 2200.0,
      summary: 'South Lhonak glacial lake breach unleashed colossal flash surge down Teesta river basin, destroying Chungthang Dam and sweeping away military camps.'
    },
    {
      disaster_type: 'Himalayan Flash Flood & Deluge',
      location: 'Kedarnath & Mandakini Basin',
      state: 'Uttarakhand',
      year_date: 'June 2013',
      severity: 'National Calamity (Grade-V)',
      affected_population: 110000,
      casualties: 5700,
      economic_loss_cr: 4500.0,
      summary: 'Multi-day cloudburst collapsed Chorabari glacial lake moraine. Debris torrent submerged Kedarnath temple town and wiped out downstream settlements.'
    },
    {
      disaster_type: 'Riverine Flood & Severe Erosion',
      location: 'Majuli Island & Brahmaputra Basin',
      state: 'Assam',
      year_date: 'June 2022',
      severity: 'Severe (Grade-III)',
      affected_population: 250000,
      casualties: 198,
      economic_loss_cr: 3100.0,
      summary: 'Brahmaputra flowed 2.5m above danger mark for 18 days, washing away 14km of earthen embankments and displacing entire agrarian island habitations.'
    },
    {
      disaster_type: 'Extreme Landslide & Highway Collapse',
      location: 'Beas Catchment & Kullu-Mandi Corridor',
      state: 'Himachal Pradesh',
      year_date: 'July-August 2023',
      severity: 'Severe (Grade-III)',
      affected_population: 45000,
      casualties: 135,
      economic_loss_cr: 1800.0,
      summary: 'Continuous monsoon deluge provoked over 300 active landslides along Chandigarh-Manali NH, completely shearing away highway segments and tourist clusters.'
    }
  ];

  const insertDisaster = db.prepare(`
    INSERT INTO disaster_events (
      disaster_type, location, state, year_date, severity,
      affected_population, casualties, economic_loss_cr, summary
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const event of disasterEventsData) {
    insertDisaster.run(
      event.disaster_type, event.location, event.state, event.year_date,
      event.severity, event.affected_population, event.casualties,
      event.economic_loss_cr, event.summary
    );
  }

  // 6. Seed Field Reports
  const fieldReportsData = [
    {
      officer_name: 'Inspector Vikram Negi',
      location_name: 'Sunil Ward, Joshimath',
      district: 'Chamoli',
      state: 'Uttarakhand',
      habitation_id: 1,
      incident_type: 'Ground Fissure Widening',
      severity_level: 'Critical',
      ground_observation: 'Transverse fissures in civil hospital quadrant expanded from 4cm to 11cm following overnight continuous showers. Tension cracks detected in foundation slabs of 14 residential units.',
      immediate_needs: 'Immediate tactical evacuation of 32 families to Pipalkoti or Gauchar transit shelters. Geo-acoustic monitoring sensors requested.',
      evidence_notes: 'Photographic records logged with District Magistrate Office. Visual borehole seepage confirmed.'
    },
    {
      officer_name: 'Sub-Inspector Ananya Nair',
      location_name: 'Chooralmala Sector 2',
      district: 'Wayanad',
      state: 'Kerala',
      habitation_id: 7,
      incident_type: 'Pore Water Saturation Surge',
      severity_level: 'Critical',
      ground_observation: 'Soil saturation meter indicates 92% pore pressure threshold. Upstream rivulet has turned muddy brown, indicative of active topsoil slippage 2km uphill.',
      immediate_needs: 'Sirens activated. Requesting NDRF bus deployment to move 450 vulnerable tea plantation families to Sultan Bathery Mesa.',
      evidence_notes: 'Drone reconnaissance aerial footage captured minor slide in Upper Cardamom division.'
    },
    {
      officer_name: 'Officer Pradip Baruah',
      location_name: 'Kamalabari Embankment',
      district: 'Majuli',
      state: 'Assam',
      habitation_id: 11,
      incident_type: 'River Embankment Toe Erosion',
      severity_level: 'High',
      ground_observation: 'Brahmaputra high current scouring riverbed embankment at 3.2 m/s. Geo-bag protective spur breached at pillar 14.',
      immediate_needs: '10,000 sandbags urgently required; alert sounded across lower wards for phased night evacuation.',
      evidence_notes: 'GPS tagged coordinates forwarded to Central Water Commission (CWC).'
    }
  ];

  const insertReport = db.prepare(`
    INSERT INTO field_reports (
      officer_name, location_name, district, state, habitation_id,
      incident_type, severity_level, ground_observation, immediate_needs,
      evidence_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const report of fieldReportsData) {
    insertReport.run(
      report.officer_name, report.location_name, report.district, report.state,
      report.habitation_id, report.incident_type, report.severity_level,
      report.ground_observation, report.immediate_needs, report.evidence_notes
    );
  }

  console.log(`[Seed] Seeded successfully! Users, habitations (${habitationsData.length}), hazard zones (${hazardZonesData.length}), safe zones (${safeZonesData.length}), disaster records (${disasterEventsData.length}), and field reports.`);
}

if (require.main === module) {
  seedData(true);
}

module.exports = { seedData };
