const db = require('./db');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'authority', 'field_officer')),
      department TEXT DEFAULT 'Disaster Management Division',
      otp_code TEXT,
      otp_expires_at DATETIME,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS habitations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      district TEXT NOT NULL,
      state TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      population INTEGER NOT NULL,
      vulnerability_score REAL NOT NULL,
      risk_score REAL NOT NULL,
      priority_level TEXT NOT NULL CHECK(priority_level IN ('Critical', 'High', 'Medium', 'Low')),
      primary_hazard TEXT NOT NULL,
      elevation_m REAL DEFAULT 0,
      slope_deg REAL DEFAULT 0,
      river_distance_m REAL DEFAULT 500,
      soil_type TEXT DEFAULT 'Alluvial',
      infrastructure_vulnerability REAL DEFAULT 50,
      historical_disasters_count INTEGER DEFAULT 1,
      last_disaster TEXT,
      recommended_action TEXT,
      allocated_safe_zone_id INTEGER,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hazard_zones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location_name TEXT NOT NULL,
      district TEXT NOT NULL,
      state TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      radius_km REAL DEFAULT 5.0,
      hazard_type TEXT NOT NULL,
      rainfall_mm REAL DEFAULT 0,
      slope_deg REAL DEFAULT 0,
      elevation_m REAL DEFAULT 0,
      soil_type TEXT DEFAULT 'Loamy',
      river_distance_m REAL DEFAULT 500,
      population_density INTEGER DEFAULT 0,
      historical_disasters INTEGER DEFAULT 0,
      risk_score REAL NOT NULL,
      zone_category TEXT NOT NULL CHECK(zone_category IN ('Red', 'Orange', 'Green')),
      ai_explanation TEXT,
      polygon_geojson TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS safe_zones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      district TEXT NOT NULL,
      state TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      total_area_ha REAL DEFAULT 50.0,
      maximum_capacity INTEGER NOT NULL,
      current_population INTEGER NOT NULL DEFAULT 0,
      available_capacity INTEGER NOT NULL,
      water_score REAL DEFAULT 80,
      healthcare_score REAL DEFAULT 80,
      connectivity_score REAL DEFAULT 80,
      school_score REAL DEFAULT 80,
      employment_score REAL DEFAULT 80,
      housing_units INTEGER DEFAULT 500,
      sustainability_score REAL NOT NULL,
      suitability_rating TEXT NOT NULL CHECK(suitability_rating IN ('Excellent', 'Suitable', 'Limited Capacity', 'Unsuitable')),
      facilities_summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS disaster_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      disaster_type TEXT NOT NULL,
      location TEXT NOT NULL,
      state TEXT NOT NULL,
      year_date TEXT NOT NULL,
      severity TEXT NOT NULL,
      affected_population INTEGER DEFAULT 0,
      casualties INTEGER DEFAULT 0,
      economic_loss_cr REAL DEFAULT 0,
      summary TEXT
    );

    CREATE TABLE IF NOT EXISTS field_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      officer_name TEXT NOT NULL,
      location_name TEXT NOT NULL,
      district TEXT NOT NULL,
      state TEXT NOT NULL,
      habitation_id INTEGER,
      incident_type TEXT NOT NULL,
      severity_level TEXT NOT NULL,
      ground_observation TEXT NOT NULL,
      immediate_needs TEXT,
      evidence_notes TEXT,
      status TEXT DEFAULT 'Pending Review',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS risk_weights (
      id INTEGER PRIMARY KEY,
      rainfall_weight REAL DEFAULT 0.25,
      slope_weight REAL DEFAULT 0.20,
      historical_disaster_weight REAL DEFAULT 0.20,
      population_weight REAL DEFAULT 0.15,
      vulnerability_weight REAL DEFAULT 0.20,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS simulation_state (
      id INTEGER PRIMARY KEY,
      is_simulating INTEGER DEFAULT 0,
      event_type TEXT DEFAULT 'None',
      intensity_factor REAL DEFAULT 1.0,
      affected_region TEXT DEFAULT 'All',
      rainfall_delta_mm REAL DEFAULT 0,
      river_surge_m REAL DEFAULT 0,
      slope_instability_pct REAL DEFAULT 0,
      simulation_message TEXT DEFAULT 'Baseline operational state.',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS relocation_allocations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habitation_id INTEGER NOT NULL,
      safe_zone_id INTEGER NOT NULL,
      allocated_population INTEGER NOT NULL,
      status TEXT DEFAULT 'Planned',
      allocated_by TEXT,
      allocated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS discussions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel TEXT NOT NULL DEFAULT 'general',
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_role TEXT NOT NULL DEFAULT 'Disaster Coordinator',
      agency TEXT NOT NULL DEFAULT 'NDMA',
      priority TEXT NOT NULL DEFAULT 'Medium',
      tags TEXT,
      likes_count INTEGER DEFAULT 0,
      replies_json TEXT DEFAULT '[]',
      pinned INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rivers_and_dams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('River', 'Dam', 'Barrage')),
      river_basin TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      length_km REAL DEFAULT 0,
      avg_depth_m REAL DEFAULT 0,
      max_monsoon_depth_m REAL DEFAULT 0,
      catchment_area_sqkm REAL DEFAULT 0,
      danger_water_level_m REAL DEFAULT 0,
      current_water_level_m REAL DEFAULT 0,
      full_reservoir_level_m REAL DEFAULT 0,
      maximum_water_level_m REAL DEFAULT 0,
      live_storage_capacity_mcm REAL DEFAULT 0,
      current_storage_pct REAL DEFAULT 0,
      spillway_capacity_cusecs REAL DEFAULT 0,
      cwc_monitoring_status TEXT DEFAULT 'Normal',
      historical_breach_disasters TEXT,
      downstream_hazard_level TEXT DEFAULT 'Medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS mining_sites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mine_name TEXT NOT NULL,
      mineral_type TEXT NOT NULL,
      operator_type TEXT NOT NULL CHECK(operator_type IN ('Government PSU', 'Private Lease', 'Joint Venture')),
      operating_agency TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      mining_method TEXT NOT NULL,
      production_capacity_mtpa REAL DEFAULT 0,
      lease_area_ha REAL DEFAULT 0,
      tailings_pond_count INTEGER DEFAULT 1,
      tailings_failure_risk TEXT DEFAULT 'Moderate',
      ground_subsidence_risk TEXT DEFAULT 'Moderate',
      blast_vibration_impact_radius_km REAL DEFAULT 2.5,
      disaster_faced_by_locals TEXT,
      underground_fire_status TEXT DEFAULT 'None',
      nearby_habitations_at_risk INTEGER DEFAULT 0,
      compliance_status TEXT DEFAULT 'DGMS Monitored',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS historical_disasters_20yr (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_title TEXT NOT NULL,
      disaster_category TEXT NOT NULL,
      primary_cause TEXT NOT NULL,
      year INTEGER NOT NULL,
      date_occurred TEXT,
      state_country TEXT NOT NULL,
      district_region TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      casualties_count INTEGER DEFAULT 0,
      displaced_population INTEGER DEFAULT 0,
      economic_damage_inr_cr REAL DEFAULT 0,
      area_impacted_sqkm REAL DEFAULT 0,
      transboundary_linkage TEXT,
      geotechnical_trigger TEXT,
      official_ndma_report_ref TEXT,
      summary_description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS geological_soil_rock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      region_name TEXT NOT NULL,
      district TEXT NOT NULL,
      state TEXT NOT NULL,
      soil_major_type TEXT NOT NULL,
      soil_sub_type TEXT,
      soil_depth_class TEXT DEFAULT 'Deep',
      permeability_rate TEXT DEFAULT 'Moderate',
      internal_friction_angle_deg REAL DEFAULT 28,
      cohesion_kpa REAL DEFAULT 15,
      liquefaction_susceptibility TEXT DEFAULT 'Low',
      rock_system TEXT NOT NULL,
      lithology_description TEXT NOT NULL,
      dominant_rock_types TEXT NOT NULL,
      structural_faultlines TEXT,
      seismic_zone TEXT DEFAULT 'Zone IV',
      slope_stability_index REAL DEFAULT 65,
      weathering_degree TEXT DEFAULT 'Moderate',
      recommended_foundation_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS area_analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      radius_km REAL NOT NULL DEFAULT 10.0,
      location_name TEXT,
      district TEXT,
      state TEXT,
      overall_risk_score REAL,
      safety_classification TEXT,
      detailed_report_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS geological_surveys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location TEXT NOT NULL,
      district TEXT,
      state TEXT,
      latitude REAL,
      longitude REAL,
      soil_type TEXT NOT NULL,
      soil_texture TEXT,
      soil_moisture TEXT,
      erosion_susceptibility TEXT,
      water_retention TEXT,
      rock_type TEXT NOT NULL,
      geological_formation TEXT,
      rock_stability TEXT,
      weathering_characteristics TEXT,
      fracture_fault_indicators TEXT,
      geological_stability_score REAL DEFAULT 70,
      source TEXT DEFAULT 'Geological Survey of India (GSI)',
      source_url TEXT,
      report_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS historical_disasters_50yr (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      disaster_type TEXT NOT NULL,
      year_date TEXT NOT NULL,
      location TEXT NOT NULL,
      district TEXT,
      state TEXT,
      latitude REAL,
      longitude REAL,
      severity TEXT NOT NULL,
      affected_population INTEGER DEFAULT 0,
      casualties INTEGER DEFAULT 0,
      official_reported_cause TEXT NOT NULL,
      government_response TEXT,
      source_organization TEXT NOT NULL,
      source_document_url TEXT,
      publication_date TEXT,
      verification_level INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rivers_detailed (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      river_type TEXT NOT NULL DEFAULT 'Major River',
      basin TEXT NOT NULL,
      width_approx_m REAL DEFAULT 150,
      length_km REAL DEFAULT 0,
      floodplain_info TEXT,
      flood_risk_indicators TEXT DEFAULT 'Medium',
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      source TEXT DEFAULT 'Central Water Commission (CWC)',
      source_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS water_quality_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      river_name TEXT NOT NULL,
      monitoring_station TEXT NOT NULL,
      station_code TEXT,
      latitude REAL,
      longitude REAL,
      measurement_date TEXT,
      water_quality_index REAL DEFAULT 72,
      water_quality_score REAL DEFAULT 72,
      ph REAL DEFAULT 7.4,
      dissolved_oxygen_mg_l REAL DEFAULT 6.8,
      bod_mg_l REAL DEFAULT 2.2,
      cod_mg_l REAL DEFAULT 12.0,
      pollution_status TEXT DEFAULT 'Acceptable',
      source TEXT DEFAULT 'Central Pollution Control Board (CPCB)',
      source_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS development_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      project_type TEXT NOT NULL,
      ownership_type TEXT NOT NULL CHECK(ownership_type IN ('Government Project', 'Private Project', 'Public-Private Partnership')),
      organization TEXT NOT NULL,
      location TEXT NOT NULL,
      district TEXT,
      state TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      project_status TEXT DEFAULT 'Under Construction',
      start_date TEXT,
      expected_completion TEXT,
      environmental_clearance_ref TEXT,
      disaster_considerations TEXT,
      source TEXT DEFAULT 'Ministry of Environment, Forest & Climate Change (MoEFCC)',
      source_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS emergency_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alert_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      location_name TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      affected_radius_km REAL DEFAULT 10.0,
      nearest_safe_zone_name TEXT,
      recommended_actions TEXT,
      status TEXT DEFAULT 'Active',
      is_test INTEGER DEFAULT 1,
      created_by TEXT DEFAULT 'Emergency Operations Command',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS alert_recipients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alert_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      contact TEXT NOT NULL,
      notification_type TEXT NOT NULL,
      delivery_status TEXT NOT NULL DEFAULT 'Delivered',
      delivered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      error_message TEXT
    );
  `);

  // Safe column migrations for users table
  const columnsToAdd = ['phone TEXT', 'otp_code TEXT', 'otp_expires_at DATETIME', 'last_login DATETIME'];
  for (const col of columnsToAdd) {
    try {
      db.exec(`ALTER TABLE users ADD COLUMN ${col};`);
    } catch {
      // Column already exists
    }
  }

  // Insert default risk weights if not exists
  const weightRow = db.prepare('SELECT id FROM risk_weights WHERE id = 1').get();
  if (!weightRow) {
    db.prepare(`
      INSERT INTO risk_weights (id, rainfall_weight, slope_weight, historical_disaster_weight, population_weight, vulnerability_weight)
      VALUES (1, 0.25, 0.20, 0.20, 0.15, 0.20)
    `).run();
  }

  // Insert initial simulation state if not exists
  const simRow = db.prepare('SELECT id FROM simulation_state WHERE id = 1').get();
  if (!simRow) {
    db.prepare(`
      INSERT INTO simulation_state (id, is_simulating, event_type, intensity_factor, affected_region, simulation_message)
      VALUES (1, 0, 'None', 1.0, 'All', 'Baseline operational monitoring mode.')
    `).run();
  }

  // Seed initial discussions if empty
  const discussionsCount = db.prepare('SELECT COUNT(*) as count FROM discussions').get();
  if (!discussionsCount || discussionsCount.count === 0) {
    const defaultDiscussions = [
      {
        channel: 'evacuation',
        title: 'SDRF Quick Response: 140 families successfully relocated from Helang Spur to Pipalkoti Haven',
        content: 'Heavy localized slope shearing detected near Helang-Joshimath highway bypass. SDRF Battalions 3 & 7 deployed with 12 tactical transport buses. Total 140 families (560 residents) relocated safely to Pipalkoti Transit Haven. Medical screening and ration distribution currently underway.',
        author_name: 'Inspector Rajesh Bhatt',
        author_role: 'Operations Commander',
        agency: 'SDRF Uttarakhand',
        priority: 'Critical',
        tags: 'Evacuation, Helang, Pipalkoti, Transport',
        likes_count: 24,
        pinned: 1,
        replies_json: JSON.stringify([
          {
            id: 'r1',
            author_name: 'Himanshu Khurana, IAS',
            author_role: 'District Magistrate',
            agency: 'Chamoli Administration',
            content: 'Acknowledged. 4 additional water tanker bowsers and 2 mobile diesel generator sets redirected to Pipalkoti Camp B.',
            created_at: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'r2',
            author_name: 'Dr. Anandita Sen',
            author_role: 'Chief Medical Officer',
            agency: 'State Health Department',
            content: 'Emergency triage tent operational at haven perimeter. 42 elder residents screened for hypothermia and supplied with medication.',
            created_at: new Date(Date.now() - 1800000).toISOString()
          }
        ])
      },
      {
        channel: 'geological',
        title: 'Geological Survey Alert: InSAR Radar detects 14mm accelerating slope deformation in Joshimath Ward 4',
        content: 'Interferometric Synthetic Aperture Radar (InSAR) time-series analysis confirms 14mm displacement over the last 72 hours following antecedent rainfall of 185mm. Deep tension cracks observed extending toward Sunil village ridgeline. Immediate structural stabilization and perimeter restriction recommended.',
        author_name: 'Dr. Vikramaditya Rawat',
        author_role: 'Senior Geoscientist',
        agency: 'Geological Survey of India (GSI)',
        priority: 'Critical',
        tags: 'InSAR, Subsidence, Tension Cracks, Joshimath',
        likes_count: 31,
        pinned: 1,
        replies_json: JSON.stringify([
          {
            id: 'r3',
            author_name: 'Prof. K. S. Murthy',
            author_role: 'Geotechnical Lead',
            agency: 'CBRI Roorkee',
            content: 'Pore pressure sensors at station JP-09 confirm subsurface hydraulic saturation at 84%. Infiltration drains need clearing immediately.',
            created_at: new Date(Date.now() - 5400000).toISOString()
          }
        ])
      },
      {
        channel: 'logistics',
        title: 'Safe Haven Carrying Capacity Update: Gopeshwar Model Haven at 82% threshold; initiating relief convoy',
        content: 'Gopeshwar Community Haven currently hosts 1,640 individuals against rated carrying capacity of 2,000. Kitchen facilities operational 24x7. Supply audit shows 4 days of dry rations and potable water remaining. Requesting supplementary supply dispatch from Rishikesh central warehouse.',
        author_name: 'Sunita Chauhan',
        author_role: 'Logistics Commissioner',
        agency: 'NDMA Relief Wing',
        priority: 'High',
        tags: 'Carrying Capacity, Rations, Water, Gopeshwar',
        likes_count: 18,
        pinned: 0,
        replies_json: JSON.stringify([
          {
            id: 'r4',
            author_name: 'Col. Sanjeev Nair',
            author_role: 'Supply Corps Liaison',
            agency: 'NDRF Central Command',
            content: 'Convoy of 6 medium supply trucks departed Haridwar base carrying 2,500 hygiene kits and 10 water purification filtration carts. ETA 4 hours.',
            created_at: new Date(Date.now() - 2400000).toISOString()
          }
        ])
      },
      {
        channel: 'community',
        title: 'Village Council Alert: Mana & Raini Village request emergency livestock shelter & fodder supply',
        content: 'Local Gram Panchayat representatives report that while residents can relocate to higher school shelters, 180 cattle and mountain goats require safe animal holding pens protected from gully debris. Requesting allocation of low-hazard terrace pasture near Birahi.',
        author_name: 'Devendra Singh Negi',
        author_role: 'Gram Pradhan',
        agency: 'Panchayati Raj Council',
        priority: 'Medium',
        tags: 'Livestock, Community, Mana, Animal Welfare',
        likes_count: 15,
        pinned: 0,
        replies_json: JSON.stringify([
          {
            id: 'r5',
            author_name: 'Amit Joshi',
            author_role: 'Veterinary Officer',
            agency: 'Animal Husbandry Dept',
            content: 'Terrace site at Birahi designated for cattle holding. 4 metric tons of packaged cattle feed and vaccine supplies dispatched.',
            created_at: new Date(Date.now() - 900000).toISOString()
          }
        ])
      },
      {
        channel: 'policy',
        title: 'Executive Council: NDMA sanctions ₹12.8 Crore under National Disaster Mitigation Fund for Resettlement',
        content: 'The High-Level Committee of the Ministry of Home Affairs approved financial sanctions of ₹12.8 Crore for permanent structural rehabilitation and land acquisition of 320 high-vulnerability families from chronic landslide slide paths to certified earthquake-resistant housing clusters.',
        author_name: 'Secretary R. K. Verma',
        author_role: 'Joint Secretary (DM)',
        agency: 'Ministry of Home Affairs',
        priority: 'High',
        tags: 'MHA, NDMF, Compensation, Resettlement',
        likes_count: 42,
        pinned: 0,
        replies_json: JSON.stringify([])
      }
    ];

    const insertStmt = db.prepare(`
      INSERT INTO discussions (channel, title, content, author_name, author_role, agency, priority, tags, likes_count, pinned, replies_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const d of defaultDiscussions) {
      insertStmt.run(d.channel, d.title, d.content, d.author_name, d.author_role, d.agency, d.priority, d.tags, d.likes_count, d.pinned, d.replies_json);
    }
  }
}

module.exports = { initSchema };
