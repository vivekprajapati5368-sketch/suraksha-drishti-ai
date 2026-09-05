const db = require('../database/db');
const { calculateRiskScore } = require('../services/riskEngine');

function getAllHazardZones(req, res) {
  try {
    const { category, hazard, state } = req.query;
    let query = 'SELECT * FROM hazard_zones WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      query += ' AND zone_category = ?';
      params.push(category);
    }
    if (hazard && hazard !== 'All') {
      query += ' AND hazard_type = ?';
      params.push(hazard);
    }
    if (state && state !== 'All') {
      query += ' AND state = ?';
      params.push(state);
    }

    query += ' ORDER BY risk_score DESC';

    const zones = db.prepare(query).all(...params);
    return res.json({ success: true, count: zones.length, data: zones });
  } catch (err) {
    console.error('[Get Hazard Zones Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve hazard zones' });
  }
}

function getHazardZoneById(req, res) {
  try {
    const zone = db.prepare('SELECT * FROM hazard_zones WHERE id = ?').get(req.params.id);
    if (!zone) {
      return res.status(404).json({ success: false, message: 'Hazard zone not found' });
    }
    return res.json({ success: true, data: zone });
  } catch (err) {
    console.error('[Get Hazard Zone By Id Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to load hazard zone' });
  }
}

function createHazardZone(req, res) {
  try {
    const {
      location_name, district, state, latitude, longitude, radius_km = 5.0,
      hazard_type, rainfall_mm = 100, slope_deg = 15, elevation_m = 500,
      soil_type = 'Loamy', river_distance_m = 500, population_density = 1000,
      historical_disasters = 1
    } = req.body;

    if (!location_name || !district || !state || latitude === undefined || longitude === undefined || !hazard_type) {
      return res.status(400).json({ success: false, message: 'Missing mandatory hazard zone parameters' });
    }

    const weights = db.prepare('SELECT * FROM risk_weights WHERE id = 1').get() || {};
    const risk = calculateRiskScore({
      rainfall_mm: Number(rainfall_mm),
      slope_deg: Number(slope_deg),
      historical_disasters: Number(historical_disasters),
      population_density: Number(population_density),
      vulnerability_score: 60,
      elevation_m: Number(elevation_m),
      river_distance_m: Number(river_distance_m),
      hazard_type,
      soil_type
    }, weights);

    const info = db.prepare(`
      INSERT INTO hazard_zones (
        location_name, district, state, latitude, longitude, radius_km,
        hazard_type, rainfall_mm, slope_deg, elevation_m, soil_type,
        river_distance_m, population_density, historical_disasters,
        risk_score, zone_category, ai_explanation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      location_name.trim(), district.trim(), state.trim(), Number(latitude), Number(longitude), Number(radius_km),
      hazard_type, Number(rainfall_mm), Number(slope_deg), Number(elevation_m), soil_type,
      Number(river_distance_m), Number(population_density), Number(historical_disasters),
      risk.riskScore, risk.zoneCategory, risk.aiExplanation
    );

    const created = db.prepare('SELECT * FROM hazard_zones WHERE id = ?').get(info.lastInsertRowid);
    return res.status(201).json({ success: true, message: 'Hazard zone established', data: created });
  } catch (err) {
    console.error('[Create Hazard Zone Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to create hazard zone' });
  }
}

function updateHazardZone(req, res) {
  try {
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM hazard_zones WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Hazard zone not found' });
    }

    const {
      location_name = existing.location_name,
      district = existing.district,
      state = existing.state,
      latitude = existing.latitude,
      longitude = existing.longitude,
      radius_km = existing.radius_km,
      hazard_type = existing.hazard_type,
      rainfall_mm = existing.rainfall_mm,
      slope_deg = existing.slope_deg,
      elevation_m = existing.elevation_m,
      soil_type = existing.soil_type,
      river_distance_m = existing.river_distance_m,
      population_density = existing.population_density,
      historical_disasters = existing.historical_disasters
    } = req.body;

    const weights = db.prepare('SELECT * FROM risk_weights WHERE id = 1').get() || {};
    const risk = calculateRiskScore({
      rainfall_mm: Number(rainfall_mm),
      slope_deg: Number(slope_deg),
      historical_disasters: Number(historical_disasters),
      population_density: Number(population_density),
      vulnerability_score: 60,
      elevation_m: Number(elevation_m),
      river_distance_m: Number(river_distance_m),
      hazard_type,
      soil_type
    }, weights);

    db.prepare(`
      UPDATE hazard_zones
      SET location_name = ?, district = ?, state = ?, latitude = ?, longitude = ?, radius_km = ?,
          hazard_type = ?, rainfall_mm = ?, slope_deg = ?, elevation_m = ?, soil_type = ?,
          river_distance_m = ?, population_density = ?, historical_disasters = ?,
          risk_score = ?, zone_category = ?, ai_explanation = ?
      WHERE id = ?
    `).run(
      location_name.trim(), district.trim(), state.trim(), Number(latitude), Number(longitude), Number(radius_km),
      hazard_type, Number(rainfall_mm), Number(slope_deg), Number(elevation_m), soil_type,
      Number(river_distance_m), Number(population_density), Number(historical_disasters),
      risk.riskScore, risk.zoneCategory, risk.aiExplanation,
      id
    );

    const updated = db.prepare('SELECT * FROM hazard_zones WHERE id = ?').get(id);
    return res.json({ success: true, message: 'Hazard zone updated', data: updated });
  } catch (err) {
    console.error('[Update Hazard Zone Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update hazard zone' });
  }
}

function deleteHazardZone(req, res) {
  try {
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM hazard_zones WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Hazard zone not found' });
    }

    db.prepare('DELETE FROM hazard_zones WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Hazard zone removed' });
  } catch (err) {
    console.error('[Delete Hazard Zone Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to remove hazard zone' });
  }
}

module.exports = {
  getAllHazardZones,
  getHazardZoneById,
  createHazardZone,
  updateHazardZone,
  deleteHazardZone
};
