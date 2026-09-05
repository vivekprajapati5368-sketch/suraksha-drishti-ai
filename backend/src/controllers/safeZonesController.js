const db = require('../database/db');
const { evaluateCarryingCapacity, assessAbsorptionFit } = require('../services/capacityEngine');

function getAllSafeZones(req, res) {
  try {
    const { state, minCapacity } = req.query;
    let query = 'SELECT * FROM safe_zones WHERE 1=1';
    const params = [];

    if (state && state !== 'All') {
      query += ' AND state = ?';
      params.push(state);
    }
    if (minCapacity) {
      query += ' AND available_capacity >= ?';
      params.push(Number(minCapacity));
    }

    query += ' ORDER BY available_capacity DESC';
    const rawZones = db.prepare(query).all(...params);

    const zones = rawZones.map(zone => {
      const cap = evaluateCarryingCapacity(zone);
      return {
        ...zone,
        available_capacity: cap.availableCapacity,
        occupancy_rate: cap.occupancyRate,
        sustainability_score: cap.sustainabilityScore,
        suitability_rating: cap.suitabilityRating
      };
    });

    return res.json({ success: true, count: zones.length, data: zones });
  } catch (err) {
    console.error('[Get Safe Zones Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve safe zones' });
  }
}

function getSafeZoneById(req, res) {
  try {
    const zone = db.prepare('SELECT * FROM safe_zones WHERE id = ?').get(req.params.id);
    if (!zone) {
      return res.status(404).json({ success: false, message: 'Safe zone not found' });
    }

    const cap = evaluateCarryingCapacity(zone);
    const allocatedHabitations = db.prepare(`
      SELECT id, name, district, state, population, priority_level, primary_hazard
      FROM habitations
      WHERE allocated_safe_zone_id = ?
    `).all(req.params.id);

    return res.json({
      success: true,
      data: {
        ...zone,
        available_capacity: cap.availableCapacity,
        occupancy_rate: cap.occupancyRate,
        sustainability_score: cap.sustainabilityScore,
        suitability_rating: cap.suitabilityRating,
        metrics: cap.metrics,
        allocatedHabitations
      }
    });
  } catch (err) {
    console.error('[Get Safe Zone By Id Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve safe zone' });
  }
}

function createSafeZone(req, res) {
  try {
    const {
      name, district, state, latitude, longitude, total_area_ha = 50.0,
      maximum_capacity, current_population = 0,
      water_score = 80, healthcare_score = 80, connectivity_score = 80,
      school_score = 75, employment_score = 70, housing_units = 500,
      facilities_summary = 'General emergency relief facilities available'
    } = req.body;

    if (!name || !district || !state || latitude === undefined || longitude === undefined || !maximum_capacity) {
      return res.status(400).json({ success: false, message: 'Name, district, state, coordinates and max capacity are mandatory.' });
    }

    const maxCap = Number(maximum_capacity);
    const currPop = Number(current_population);
    const cap = evaluateCarryingCapacity({
      maximum_capacity: maxCap,
      current_population: currPop,
      water_score, healthcare_score, connectivity_score, school_score, employment_score
    });

    const info = db.prepare(`
      INSERT INTO safe_zones (
        name, district, state, latitude, longitude, total_area_ha,
        maximum_capacity, current_population, available_capacity,
        water_score, healthcare_score, connectivity_score, school_score, employment_score,
        housing_units, sustainability_score, suitability_rating, facilities_summary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(), district.trim(), state.trim(), Number(latitude), Number(longitude), Number(total_area_ha),
      maxCap, currPop, cap.availableCapacity,
      Number(water_score), Number(healthcare_score), Number(connectivity_score), Number(school_score), Number(employment_score),
      Number(housing_units), cap.sustainabilityScore, cap.suitabilityRating, facilities_summary
    );

    const created = db.prepare('SELECT * FROM safe_zones WHERE id = ?').get(info.lastInsertRowid);
    return res.status(201).json({ success: true, message: 'Safe relocation zone registered', data: created });
  } catch (err) {
    console.error('[Create Safe Zone Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to create safe zone' });
  }
}

function updateSafeZone(req, res) {
  try {
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM safe_zones WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Safe zone not found' });
    }

    const {
      name = existing.name,
      district = existing.district,
      state = existing.state,
      latitude = existing.latitude,
      longitude = existing.longitude,
      total_area_ha = existing.total_area_ha,
      maximum_capacity = existing.maximum_capacity,
      current_population = existing.current_population,
      water_score = existing.water_score,
      healthcare_score = existing.healthcare_score,
      connectivity_score = existing.connectivity_score,
      school_score = existing.school_score,
      employment_score = existing.employment_score,
      housing_units = existing.housing_units,
      facilities_summary = existing.facilities_summary
    } = req.body;

    const maxCap = Number(maximum_capacity);
    const currPop = Number(current_population);
    const cap = evaluateCarryingCapacity({
      maximum_capacity: maxCap,
      current_population: currPop,
      water_score, healthcare_score, connectivity_score, school_score, employment_score
    });

    db.prepare(`
      UPDATE safe_zones
      SET name = ?, district = ?, state = ?, latitude = ?, longitude = ?, total_area_ha = ?,
          maximum_capacity = ?, current_population = ?, available_capacity = ?,
          water_score = ?, healthcare_score = ?, connectivity_score = ?, school_score = ?, employment_score = ?,
          housing_units = ?, sustainability_score = ?, suitability_rating = ?, facilities_summary = ?
      WHERE id = ?
    `).run(
      name.trim(), district.trim(), state.trim(), Number(latitude), Number(longitude), Number(total_area_ha),
      maxCap, currPop, cap.availableCapacity,
      Number(water_score), Number(healthcare_score), Number(connectivity_score), Number(school_score), Number(employment_score),
      Number(housing_units), cap.sustainabilityScore, cap.suitabilityRating, facilities_summary,
      id
    );

    const updated = db.prepare('SELECT * FROM safe_zones WHERE id = ?').get(id);
    return res.json({ success: true, message: 'Safe zone updated', data: updated });
  } catch (err) {
    console.error('[Update Safe Zone Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update safe zone' });
  }
}

function deleteSafeZone(req, res) {
  try {
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM safe_zones WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Safe zone not found' });
    }

    db.prepare('DELETE FROM safe_zones WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Safe zone removed' });
  } catch (err) {
    console.error('[Delete Safe Zone Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to remove safe zone' });
  }
}

function testCapacityInflux(req, res) {
  try {
    const { safeZoneId, incomingPopulation } = req.body;
    const zone = db.prepare('SELECT * FROM safe_zones WHERE id = ?').get(safeZoneId);
    if (!zone) {
      return res.status(404).json({ success: false, message: 'Safe zone not found' });
    }

    const assessment = assessAbsorptionFit(zone, incomingPopulation);
    return res.json({ success: true, data: assessment });
  } catch (err) {
    console.error('[Test Capacity Influx Error]', err);
    return res.status(500).json({ success: false, message: 'Capacity test calculation failed' });
  }
}

module.exports = {
  getAllSafeZones,
  getSafeZoneById,
  createSafeZone,
  updateSafeZone,
  deleteSafeZone,
  testCapacityInflux
};
