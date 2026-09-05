const db = require('../database/db');
const { calculateRiskScore } = require('../services/riskEngine');
const { getTopRelocationRecommendations } = require('../services/relocationEngine');
const { evaluateCarryingCapacity } = require('../services/capacityEngine');

function getAllHabitations(req, res) {
  try {
    const { search, state, district, hazard, priority, sortBy = 'risk_score', order = 'DESC' } = req.query;

    let query = 'SELECT * FROM habitations WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR district LIKE ? OR state LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (state && state !== 'All') {
      query += ' AND state = ?';
      params.push(state);
    }

    if (district && district !== 'All') {
      query += ' AND district = ?';
      params.push(district);
    }

    if (hazard && hazard !== 'All') {
      query += ' AND primary_hazard = ?';
      params.push(hazard);
    }

    if (priority && priority !== 'All') {
      query += ' AND priority_level = ?';
      params.push(priority);
    }

    // Sanitize sort column to prevent SQL injection
    const allowedSortCols = ['name', 'district', 'state', 'population', 'risk_score', 'vulnerability_score', 'priority_level', 'created_at'];
    const validSortCol = allowedSortCols.includes(sortBy) ? sortBy : 'risk_score';
    const validOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${validSortCol} ${validOrder}`;

    const habitations = db.prepare(query).all(...params);
    return res.json({ success: true, count: habitations.length, data: habitations });
  } catch (err) {
    console.error('[Get Habitations Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve habitations' });
  }
}

function getHabitationById(req, res) {
  try {
    const id = req.params.id;
    const habitation = db.prepare('SELECT * FROM habitations WHERE id = ?').get(id);

    if (!habitation) {
      return res.status(404).json({ success: false, message: 'Habitation not found' });
    }

    const safeZones = db.prepare('SELECT * FROM safe_zones').all();
    const recommendations = getTopRelocationRecommendations(habitation, safeZones);

    // Allocated zone details if any
    let allocatedZone = null;
    if (habitation.allocated_safe_zone_id) {
      allocatedZone = db.prepare('SELECT * FROM safe_zones WHERE id = ?').get(habitation.allocated_safe_zone_id);
    }

    // Radar breakdown metrics for deep vulnerability visualization
    const radarData = [
      { subject: 'Slope Instability', value: Math.min(100, Math.round((habitation.slope_deg / 45) * 100)) },
      { subject: 'Socio-Structural Vuln.', value: Math.round(habitation.vulnerability_score) },
      { subject: 'Hydrological Exposure', value: Math.max(10, Math.min(100, Math.round((1 - (habitation.river_distance_m / 1000)) * 100))) },
      { subject: 'Historical Disasters', value: Math.min(100, habitation.historical_disasters_count * 20) },
      { subject: 'Demographic Pressure', value: Math.min(100, Math.round((habitation.population / 5000) * 100)) }
    ];

    return res.json({
      success: true,
      data: {
        habitation,
        recommendations,
        allocatedZone,
        radarData
      }
    });
  } catch (err) {
    console.error('[Get Habitation By ID Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch habitation details' });
  }
}

function createHabitation(req, res) {
  try {
    const {
      name, district, state, latitude, longitude, population,
      primary_hazard, elevation_m = 500, slope_deg = 15,
      river_distance_m = 500, soil_type = 'Alluvial',
      vulnerability_score = 50, historical_disasters_count = 1,
      last_disaster = 'None recorded'
    } = req.body;

    if (!name || !district || !state || latitude === undefined || longitude === undefined || !population || !primary_hazard) {
      return res.status(400).json({
        success: false,
        message: 'Name, district, state, coordinates, population, and hazard type are mandatory.'
      });
    }

    const weights = db.prepare('SELECT * FROM risk_weights WHERE id = 1').get() || {};
    const risk = calculateRiskScore({
      rainfall_mm: primary_hazard === 'Landslide' ? 180 : 200,
      slope_deg: Number(slope_deg),
      historical_disasters: Number(historical_disasters_count),
      population_density: 1200,
      vulnerability_score: Number(vulnerability_score),
      elevation_m: Number(elevation_m),
      river_distance_m: Number(river_distance_m),
      hazard_type: primary_hazard,
      soil_type,
      population: Number(population)
    }, weights);

    const stmt = db.prepare(`
      INSERT INTO habitations (
        name, district, state, latitude, longitude, population,
        vulnerability_score, risk_score, priority_level, primary_hazard,
        elevation_m, slope_deg, river_distance_m, soil_type,
        infrastructure_vulnerability, historical_disasters_count, last_disaster,
        recommended_action
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      name.trim(), district.trim(), state.trim(), Number(latitude), Number(longitude), Number(population),
      Number(vulnerability_score), risk.riskScore, risk.priorityLevel, primary_hazard,
      Number(elevation_m), Number(slope_deg), Number(river_distance_m), soil_type,
      Number(vulnerability_score), Number(historical_disasters_count), last_disaster,
      risk.recommendedAction
    );

    const newHabitation = db.prepare('SELECT * FROM habitations WHERE id = ?').get(info.lastInsertRowid);
    return res.status(201).json({ success: true, message: 'Habitation registered successfully', data: newHabitation });
  } catch (err) {
    console.error('[Create Habitation Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to create habitation' });
  }
}

function updateHabitation(req, res) {
  try {
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM habitations WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Habitation not found' });
    }

    const {
      name = existing.name,
      district = existing.district,
      state = existing.state,
      latitude = existing.latitude,
      longitude = existing.longitude,
      population = existing.population,
      primary_hazard = existing.primary_hazard,
      elevation_m = existing.elevation_m,
      slope_deg = existing.slope_deg,
      river_distance_m = existing.river_distance_m,
      soil_type = existing.soil_type,
      vulnerability_score = existing.vulnerability_score,
      historical_disasters_count = existing.historical_disasters_count,
      last_disaster = existing.last_disaster
    } = req.body;

    const weights = db.prepare('SELECT * FROM risk_weights WHERE id = 1').get() || {};
    const risk = calculateRiskScore({
      rainfall_mm: primary_hazard === 'Landslide' ? 180 : 200,
      slope_deg: Number(slope_deg),
      historical_disasters: Number(historical_disasters_count),
      population_density: 1200,
      vulnerability_score: Number(vulnerability_score),
      elevation_m: Number(elevation_m),
      river_distance_m: Number(river_distance_m),
      hazard_type: primary_hazard,
      soil_type,
      population: Number(population)
    }, weights);

    db.prepare(`
      UPDATE habitations
      SET name = ?, district = ?, state = ?, latitude = ?, longitude = ?, population = ?,
          vulnerability_score = ?, risk_score = ?, priority_level = ?, primary_hazard = ?,
          elevation_m = ?, slope_deg = ?, river_distance_m = ?, soil_type = ?,
          infrastructure_vulnerability = ?, historical_disasters_count = ?, last_disaster = ?,
          recommended_action = ?
      WHERE id = ?
    `).run(
      name.trim(), district.trim(), state.trim(), Number(latitude), Number(longitude), Number(population),
      Number(vulnerability_score), risk.riskScore, risk.priorityLevel, primary_hazard,
      Number(elevation_m), Number(slope_deg), Number(river_distance_m), soil_type,
      Number(vulnerability_score), Number(historical_disasters_count), last_disaster,
      risk.recommendedAction,
      id
    );

    const updated = db.prepare('SELECT * FROM habitations WHERE id = ?').get(id);
    return res.json({ success: true, message: 'Habitation updated successfully', data: updated });
  } catch (err) {
    console.error('[Update Habitation Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update habitation' });
  }
}

function deleteHabitation(req, res) {
  try {
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM habitations WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Habitation not found' });
    }

    db.prepare('DELETE FROM habitations WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Habitation deleted successfully' });
  } catch (err) {
    console.error('[Delete Habitation Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to delete habitation' });
  }
}

function allocateSafeZone(req, res) {
  try {
    const id = req.params.id;
    const { safeZoneId } = req.body;

    const habitation = db.prepare('SELECT * FROM habitations WHERE id = ?').get(id);
    if (!habitation) {
      return res.status(404).json({ success: false, message: 'Habitation not found' });
    }

    const safeZone = db.prepare('SELECT * FROM safe_zones WHERE id = ?').get(safeZoneId);
    if (!safeZone) {
      return res.status(404).json({ success: false, message: 'Safe Zone not found' });
    }

    // Update habitation allocation
    db.prepare('UPDATE habitations SET allocated_safe_zone_id = ? WHERE id = ?').run(safeZoneId, id);

    // Update safe zone current population
    const newPop = safeZone.current_population + habitation.population;
    const newAvail = Math.max(0, safeZone.maximum_capacity - newPop);
    db.prepare('UPDATE safe_zones SET current_population = ?, available_capacity = ? WHERE id = ?').run(
      newPop,
      newAvail,
      safeZoneId
    );

    // Log allocation
    db.prepare(`
      INSERT INTO relocation_allocations (habitation_id, safe_zone_id, allocated_population, allocated_by)
      VALUES (?, ?, ?, ?)
    `).run(id, safeZoneId, habitation.population, req.user?.name || 'Authority Command');

    return res.json({
      success: true,
      message: `Successfully mapped ${habitation.name} (Pop: ${habitation.population.toLocaleString()}) to ${safeZone.name}`,
      data: {
        habitationId: id,
        safeZoneId,
        safeZoneName: safeZone.name,
        newAvailableCapacity: newAvail
      }
    });
  } catch (err) {
    console.error('[Allocate Safe Zone Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to assign safe relocation zone' });
  }
}

module.exports = {
  getAllHabitations,
  getHabitationById,
  createHabitation,
  updateHabitation,
  deleteHabitation,
  allocateSafeZone
};
