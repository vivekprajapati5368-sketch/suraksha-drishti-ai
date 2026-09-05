const db = require('../database/db');
const { calculateRiskScore } = require('../services/riskEngine');

function getRiskWeights(req, res) {
  try {
    const weights = db.prepare('SELECT * FROM risk_weights WHERE id = 1').get() || {
      rainfall_weight: 0.25,
      slope_weight: 0.20,
      historical_disaster_weight: 0.20,
      population_weight: 0.15,
      vulnerability_weight: 0.20
    };
    return res.json({ success: true, data: weights });
  } catch (err) {
    console.error('[Get Weights Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch risk weights' });
  }
}

function updateRiskWeights(req, res) {
  try {
    const {
      rainfall_weight,
      slope_weight,
      historical_disaster_weight,
      population_weight,
      vulnerability_weight
    } = req.body;

    const wRain = Number(rainfall_weight) || 0.25;
    const wSlope = Number(slope_weight) || 0.20;
    const wDisaster = Number(historical_disaster_weight) || 0.20;
    const wPop = Number(population_weight) || 0.15;
    const wVuln = Number(vulnerability_weight) || 0.20;

    // Normalize weights to sum up to 1.0
    const sum = wRain + wSlope + wDisaster + wPop + wVuln;
    const normRain = Math.round((wRain / sum) * 100) / 100;
    const normSlope = Math.round((wSlope / sum) * 100) / 100;
    const normDisaster = Math.round((wDisaster / sum) * 100) / 100;
    const normPop = Math.round((wPop / sum) * 100) / 100;
    const normVuln = Math.round((wVuln / sum) * 100) / 100;

    db.prepare(`
      UPDATE risk_weights
      SET rainfall_weight = ?,
          slope_weight = ?,
          historical_disaster_weight = ?,
          population_weight = ?,
          vulnerability_weight = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(normRain, normSlope, normDisaster, normPop, normVuln);

    const updatedWeights = {
      rainfall_weight: normRain,
      slope_weight: normSlope,
      historical_disaster_weight: normDisaster,
      population_weight: normPop,
      vulnerability_weight: normVuln
    };

    // Recalculate all Hazard Zones
    const hazardZones = db.prepare('SELECT * FROM hazard_zones').all();
    for (const zone of hazardZones) {
      const risk = calculateRiskScore({
        rainfall_mm: zone.rainfall_mm,
        slope_deg: zone.slope_deg,
        historical_disasters: zone.historical_disasters,
        population_density: zone.population_density,
        vulnerability_score: 60,
        elevation_m: zone.elevation_m,
        river_distance_m: zone.river_distance_m,
        hazard_type: zone.hazard_type,
        soil_type: zone.soil_type
      }, updatedWeights);

      db.prepare(`
        UPDATE hazard_zones
        SET risk_score = ?, zone_category = ?, ai_explanation = ?
        WHERE id = ?
      `).run(risk.riskScore, risk.zoneCategory, risk.aiExplanation, zone.id);
    }

    // Recalculate all Habitations
    const habitations = db.prepare('SELECT * FROM habitations').all();
    for (const hab of habitations) {
      const risk = calculateRiskScore({
        rainfall_mm: hab.primary_hazard === 'Landslide' ? 180 : 200,
        slope_deg: hab.slope_deg,
        historical_disasters: hab.historical_disasters_count,
        population_density: 1200,
        vulnerability_score: hab.vulnerability_score,
        elevation_m: hab.elevation_m,
        river_distance_m: hab.river_distance_m,
        hazard_type: hab.primary_hazard,
        soil_type: hab.soil_type,
        population: hab.population
      }, updatedWeights);

      db.prepare(`
        UPDATE habitations
        SET risk_score = ?, priority_level = ?, recommended_action = ?
        WHERE id = ?
      `).run(risk.riskScore, risk.priorityLevel, risk.recommendedAction, hab.id);
    }

    return res.json({
      success: true,
      message: 'Risk weights updated successfully. All hazard zones and habitations recalculated.',
      data: updatedWeights
    });
  } catch (err) {
    console.error('[Update Weights Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update risk weights' });
  }
}

function calculateAdHocRisk(req, res) {
  try {
    const params = req.body;
    const weights = db.prepare('SELECT * FROM risk_weights WHERE id = 1').get() || {};
    const result = calculateRiskScore(params, weights);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('[Calculate Risk Error]', err);
    return res.status(500).json({ success: false, message: 'Ad-hoc risk calculation failed' });
  }
}

module.exports = {
  getRiskWeights,
  updateRiskWeights,
  calculateAdHocRisk
};
