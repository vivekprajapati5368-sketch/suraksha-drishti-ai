/**
 * SURAKSHA DRISHTI AI - Disaster Alert Simulation Engine
 * Simulates severe dynamic weather and geotechnical events to test emergency preparedness.
 */

const db = require('../database/db');
const { calculateRiskScore } = require('./riskEngine');

/**
 * Runs a simulated catastrophe scenario
 * @param {Object} options
 * @param {'Heavy Rainfall' | 'Flood Warning' | 'Landslide Warning' | 'Cloudburst'} options.scenario
 * @param {string} [options.targetState] - Specific state or 'All'
 * @param {number} [options.severityMultiplier] - 1.0 to 2.5
 */
function triggerSimulation({ scenario, targetState = 'All', severityMultiplier = 1.5 }) {
  // Fetch current risk weights
  const weights = db.prepare('SELECT * FROM risk_weights WHERE id = 1').get() || {};

  let rainfallDelta = 0;
  let riverSurgeDelta = 0;
  let slopeInstabilityPct = 0;
  let alertHeadline = '';
  let alertMessage = '';

  switch (scenario) {
    case 'Heavy Rainfall':
      rainfallDelta = Math.round(160 * severityMultiplier);
      riverSurgeDelta = 1.8 * severityMultiplier;
      alertHeadline = `⚠️ HIGH RISK WEATHER ALERT: MONSOON SURGE SIMULATED`;
      alertMessage = `Heavy precipitation event (+${rainfallDelta}mm) triggered across ${targetState}. River discharge rates surging. Red Zone perimeter expanded.`;
      break;

    case 'Flood Warning':
      rainfallDelta = Math.round(110 * severityMultiplier);
      riverSurgeDelta = 3.2 * severityMultiplier;
      alertHeadline = `🚨 CRITICAL FLOOD INUNDATION WARNING ISSUED`;
      alertMessage = `River embankments breached under extreme hydrological pressure (+${riverSurgeDelta.toFixed(1)}m surge). Low-lying habitations require immediate evacuation.`;
      break;

    case 'Landslide Warning':
      rainfallDelta = Math.round(140 * severityMultiplier);
      slopeInstabilityPct = 35 * severityMultiplier;
      alertHeadline = `🚨 CATASTROPHIC SLOPE FAILURE & LANDSLIDE WARNING`;
      alertMessage = `Pore water pressure threshold exceeded in mountain belts. Debris flow and rockfall hazards elevated to Critical in steep slope sectors.`;
      break;

    case 'Cloudburst':
      rainfallDelta = Math.round(280 * severityMultiplier);
      riverSurgeDelta = 4.5 * severityMultiplier;
      slopeInstabilityPct = 45 * severityMultiplier;
      alertHeadline = `⚡ EXTREME EMERGENCY: CLOUDBURST DISASTER SIMULATION`;
      alertMessage = `Flash cloudburst deluge (+${rainfallDelta}mm in short window) unleashed. Massive debris torrent and catastrophic flash flooding detected. Immediate relocation protocols enacted.`;
      break;

    default:
      rainfallDelta = 50;
      alertHeadline = `⚠️ CAUTIONARY ADVISORY`;
      alertMessage = `Elevated weather anomaly detected. Enhanced surveillance instituted.`;
  }

  // Update simulation state in DB
  db.prepare(`
    UPDATE simulation_state
    SET is_simulating = 1,
        event_type = ?,
        intensity_factor = ?,
        affected_region = ?,
        rainfall_delta_mm = ?,
        river_surge_m = ?,
        slope_instability_pct = ?,
        simulation_message = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `).run(
    scenario,
    severityMultiplier,
    targetState,
    rainfallDelta,
    riverSurgeDelta,
    slopeInstabilityPct,
    alertMessage
  );

  // Apply delta to Hazard Zones
  const hazardZones = db.prepare('SELECT * FROM hazard_zones').all();
  let updatedZonesCount = 0;
  let newRedZonesCount = 0;

  for (const zone of hazardZones) {
    if (targetState !== 'All' && zone.state !== targetState) continue;

    const simulatedRainfall = (zone.rainfall_mm || 50) + rainfallDelta;
    const simulatedSlope = Math.min(55, (zone.slope_deg || 15) + (slopeInstabilityPct * 0.15));
    const simulatedRiverDist = Math.max(50, (zone.river_distance_m || 500) - (riverSurgeDelta * 60));

    const result = calculateRiskScore({
      rainfall_mm: simulatedRainfall,
      slope_deg: simulatedSlope,
      historical_disasters: zone.historical_disasters,
      population_density: zone.population_density,
      vulnerability_score: Math.min(100, (zone.risk_score || 50) + (10 * severityMultiplier)),
      elevation_m: zone.elevation_m,
      river_distance_m: simulatedRiverDist,
      hazard_type: zone.hazard_type
    }, weights);

    if (result.zoneCategory === 'Red' && zone.zone_category !== 'Red') {
      newRedZonesCount++;
    }

    db.prepare(`
      UPDATE hazard_zones
      SET risk_score = ?,
          zone_category = ?,
          rainfall_mm = ?,
          slope_deg = ?,
          river_distance_m = ?,
          ai_explanation = ?
      WHERE id = ?
    `).run(
      result.riskScore,
      result.zoneCategory,
      simulatedRainfall,
      Math.round(simulatedSlope * 10) / 10,
      Math.round(simulatedRiverDist),
      `[SIMULATED: ${scenario}] ${result.aiExplanation}`,
      zone.id
    );

    updatedZonesCount++;
  }

  // Apply delta to Habitations
  const habitations = db.prepare('SELECT * FROM habitations').all();
  let criticalHabitationsCount = 0;
  const affectedHabitations = [];

  for (const hab of habitations) {
    if (targetState !== 'All' && hab.state !== targetState) continue;

    const simulatedRain = 90 + rainfallDelta;
    const simulatedSlope = hab.slope_deg ? Math.min(50, hab.slope_deg + (slopeInstabilityPct * 0.1)) : 20;
    const simulatedRiver = Math.max(40, (hab.river_distance_m || 600) - (riverSurgeDelta * 80));

    const result = calculateRiskScore({
      rainfall_mm: simulatedRain,
      slope_deg: simulatedSlope,
      historical_disasters: hab.historical_disasters_count,
      population_density: 1200,
      vulnerability_score: Math.min(100, hab.vulnerability_score + 15),
      elevation_m: hab.elevation_m,
      river_distance_m: simulatedRiver,
      hazard_type: hab.primary_hazard,
      population: hab.population
    }, weights);

    if (result.priorityLevel === 'Critical') {
      criticalHabitationsCount++;
      affectedHabitations.push({
        id: hab.id,
        name: hab.name,
        district: hab.district,
        state: hab.state,
        population: hab.population,
        riskScore: result.riskScore,
        priorityLevel: result.priorityLevel,
        action: result.recommendedAction
      });
    }

    db.prepare(`
      UPDATE habitations
      SET risk_score = ?,
          priority_level = ?,
          recommended_action = ?
      WHERE id = ?
    `).run(
      result.riskScore,
      result.priorityLevel,
      result.recommendedAction,
      hab.id
    );
  }

  return {
    scenario,
    targetState,
    alertHeadline,
    alertMessage,
    rainfallDelta,
    riverSurgeDelta,
    updatedZonesCount,
    newRedZonesCount,
    criticalHabitationsCount,
    affectedHabitations: affectedHabitations.slice(0, 5)
  };
}

/**
 * Resets simulation back to baseline realistic conditions
 */
function resetSimulation() {
  // Re-run seed to restore true baseline values
  const { seedData } = require('../database/seed');
  seedData(true); // reset mode

  return {
    success: true,
    message: 'Simulation reset complete. Baseline real-world demo dataset restored.'
  };
}

module.exports = {
  triggerSimulation,
  resetSimulation
};
