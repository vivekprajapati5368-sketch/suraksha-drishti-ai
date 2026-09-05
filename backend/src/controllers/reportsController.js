const db = require('../database/db');
const { evaluateCarryingCapacity } = require('../services/capacityEngine');
const { getTopRelocationRecommendations } = require('../services/relocationEngine');

function getOfficialReport(req, res) {
  try {
    const { reportType = 'Hazard Risk Report', state = 'All' } = req.query;

    let habitationsQuery = 'SELECT * FROM habitations WHERE 1=1';
    let hazardZonesQuery = 'SELECT * FROM hazard_zones WHERE 1=1';
    let safeZonesQuery = 'SELECT * FROM safe_zones WHERE 1=1';
    const params = [];

    if (state && state !== 'All') {
      habitationsQuery += ' AND state = ?';
      hazardZonesQuery += ' AND state = ?';
      safeZonesQuery += ' AND state = ?';
      params.push(state);
    }

    const habitations = db.prepare(habitationsQuery).all(...params);
    const hazardZones = db.prepare(hazardZonesQuery).all(...params);
    const safeZones = db.prepare(safeZonesQuery).all(...params);
    const disasterEvents = db.prepare('SELECT * FROM disaster_events ORDER BY id DESC LIMIT 5').all();

    // Aggregations
    const totalPopulation = habitations.reduce((a, b) => a + b.population, 0);
    const criticalHabitations = habitations.filter(h => h.priority_level === 'Critical');
    const highHabitations = habitations.filter(h => h.priority_level === 'High');
    const redHazardZones = hazardZones.filter(z => z.zone_category === 'Red');

    const totalAvailableSafeCapacity = safeZones.reduce((a, b) => a + (b.available_capacity || 0), 0);

    // Relocation pairings for critical habitations
    const relocationMatrix = criticalHabitations.map(hab => {
      const recs = getTopRelocationRecommendations(hab, safeZones);
      return {
        habitationName: hab.name,
        district: hab.district,
        state: hab.state,
        population: hab.population,
        primaryHazard: hab.primary_hazard,
        riskScore: hab.risk_score,
        topSafeZone: recs[0] ? recs[0].safeZoneName : 'None Assigned',
        distanceKm: recs[0] ? recs[0].distanceKm : 0,
        suitabilityScore: recs[0] ? recs[0].suitabilityScore : 0,
        action: hab.recommended_action
      };
    });

    const reportData = {
      meta: {
        reportType,
        documentRef: `SD-AI-NDMA/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
        generatedAt: new Date().toISOString(),
        authorizingAgency: 'National Disaster Risk Management Division',
        systemName: 'SURAKSHA DRISHTI . AI DECISION-SUPPORT ENGINE',
        regionScope: state === 'All' ? 'National Overview (All Disaster-Prone Belts)' : state,
        classification: 'OFFICIAL / RESTRICTED - EMERGENCY PLANNING MEMORANDUM'
      },
      summary: {
        totalHabitationsMonitored: habitations.length,
        totalMonitoredPopulation: totalPopulation,
        criticalHabitationsCount: criticalHabitations.length,
        criticalPopulation: criticalHabitations.reduce((a, b) => a + b.population, 0),
        highRiskHabitationsCount: highHabitations.length,
        activeRedZonesCount: redHazardZones.length,
        totalAvailableSafeCapacity,
        capacitySurplusDeficit: totalAvailableSafeCapacity - criticalHabitations.reduce((a, b) => a + b.population, 0),
        operationalReadinessStatus: totalAvailableSafeCapacity >= criticalHabitations.reduce((a, b) => a + b.population, 0)
          ? 'ADEQUATE RELOCATION CUSHION'
          : 'CRITICAL CAPACITY DEFICIT WARNING'
      },
      habitations,
      hazardZones,
      safeZones: safeZones.map(z => ({ ...z, evaluated: evaluateCarryingCapacity(z) })),
      relocationMatrix,
      recentDisasters: disasterEvents
    };

    return res.json({ success: true, data: reportData });
  } catch (err) {
    console.error('[Generate Report Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to compile official report' });
  }
}

function submitFieldReport(req, res) {
  try {
    const {
      officer_name,
      location_name,
      district,
      state,
      habitation_id,
      incident_type,
      severity_level = 'High',
      ground_observation,
      immediate_needs = 'Monitoring required',
      evidence_notes = ''
    } = req.body;

    if (!officer_name || !location_name || !district || !state || !incident_type || !ground_observation) {
      return res.status(400).json({ success: false, message: 'Officer name, location, district, state, incident type, and observation are mandatory.' });
    }

    const info = db.prepare(`
      INSERT INTO field_reports (
        officer_name, location_name, district, state, habitation_id,
        incident_type, severity_level, ground_observation, immediate_needs,
        evidence_notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Review')
    `).run(
      officer_name.trim(), location_name.trim(), district.trim(), state.trim(),
      habitation_id ? Number(habitation_id) : null, incident_type, severity_level,
      ground_observation.trim(), immediate_needs.trim(), evidence_notes.trim()
    );

    const report = db.prepare('SELECT * FROM field_reports WHERE id = ?').get(info.lastInsertRowid);
    return res.status(201).json({ success: true, message: 'Field report submitted to Disaster Management Command', data: report });
  } catch (err) {
    console.error('[Submit Field Report Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to record field observation' });
  }
}

function getFieldReports(req, res) {
  try {
    const reports = db.prepare('SELECT * FROM field_reports ORDER BY created_at DESC').all();
    return res.json({ success: true, count: reports.length, data: reports });
  } catch (err) {
    console.error('[Get Field Reports Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch field reports' });
  }
}

function updateFieldReportStatus(req, res) {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending Review', 'Under Review', 'Action Taken', 'Escalated'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    db.prepare('UPDATE field_reports SET status = ? WHERE id = ?').run(status, req.params.id);
    return res.json({ success: true, message: `Report marked as '${status}'` });
  } catch (err) {
    console.error('[Update Report Status Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update report status' });
  }
}

module.exports = {
  getOfficialReport,
  submitFieldReport,
  getFieldReports,
  updateFieldReportStatus
};
