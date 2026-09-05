/**
 * SURAKSHA DRISHTI AI - Hazard Risk Engine
 * Implements explainable Multi-Criteria Decision Analysis (MCDA) for disaster risk scoring.
 */

function normalizeValue(val, min, max) {
  if (val <= min) return 0;
  if (val >= max) return 100;
  return ((val - min) / (max - min)) * 100;
}

/**
 * Calculate risk score and classification based on environmental & demographic parameters
 * @param {Object} params
 * @param {number} params.rainfall_mm - Current/forecasted 24h rainfall in mm
 * @param {number} params.slope_deg - Terrain slope in degrees (0 - 60)
 * @param {number} params.historical_disasters - Number of past recorded disaster events
 * @param {number} params.population_density - Persons per sq. km
 * @param {number} params.vulnerability_score - Existing socio-economic/structural vulnerability (0 - 100)
 * @param {number} [params.elevation_m] - Elevation above sea level
 * @param {number} [params.river_distance_m] - Distance to closest river or major drainage basin
 * @param {string} [params.hazard_type] - Primary hazard type (Landslide, Flood, Cloudburst, Coastal Erosion)
 * @param {Object} weights - User-configurable weights from database
 */
function calculateRiskScore(params, weights = {}) {
  const wRain = weights.rainfall_weight ?? 0.25;
  const wSlope = weights.slope_weight ?? 0.20;
  const wDisaster = weights.historical_disaster_weight ?? 0.20;
  const wPop = weights.population_weight ?? 0.15;
  const wVuln = weights.vulnerability_weight ?? 0.20;

  // Normalized factor sub-scores (0 - 100)
  // 300mm+ 24h rainfall is extreme monsoonal flood/cloudburst threshold in India (IMD criteria)
  const rainfallScore = normalizeValue(params.rainfall_mm ?? 50, 20, 300);
  
  // 35°+ slope is critical landslide threshold in Himalayas/Western Ghats (GSI criteria)
  const slopeScore = normalizeValue(params.slope_deg ?? 10, 0, 45);
  
  // 5+ historical disasters indicate chronic recurrent hazard zone
  const disasterScore = normalizeValue(params.historical_disasters ?? 1, 0, 6);
  
  // Population density (0 to 4,000 persons/km2)
  const populationScore = normalizeValue(params.population_density ?? 500, 50, 3500);
  
  // Vulnerability score
  const vulnerabilityScore = Math.min(100, Math.max(0, params.vulnerability_score ?? 50));

  // Base weighted score
  const totalWeight = wRain + wSlope + wDisaster + wPop + wVuln;
  let rawScore = (
    (wRain * rainfallScore) +
    (wSlope * slopeScore) +
    (wDisaster * disasterScore) +
    (wPop * populationScore) +
    (wVuln * vulnerabilityScore)
  ) / (totalWeight || 1.0);

  // Proximity to river amplification: if within 250m and flood hazard
  const riverDist = params.river_distance_m ?? 1000;
  if (riverDist < 250 && (params.hazard_type === 'Flood' || rainfallScore > 50)) {
    const proximityMultiplier = Math.max(1.0, 1.25 - (riverDist / 1000));
    rawScore = Math.min(100, rawScore * proximityMultiplier);
  }

  // Soil type amplification
  if (params.soil_type === 'Loose Scree' || params.soil_type === 'Sandy Alluvial') {
    rawScore = Math.min(100, rawScore * 1.08);
  }

  const riskScore = Math.round(Math.min(100, Math.max(0, rawScore)) * 10) / 10;

  // Zone classification
  let zoneCategory = 'Green';
  if (riskScore > 60) {
    zoneCategory = 'Red';
  } else if (riskScore > 30) {
    zoneCategory = 'Orange';
  }

  // Relocation priority level
  let priorityLevel = 'Low';
  let recommendedAction = 'Continuous Monitoring / Low Urgency';

  if (riskScore >= 70 || (riskScore >= 60 && (params.population ?? 0) > 2000)) {
    priorityLevel = 'Critical';
    recommendedAction = 'Immediate Relocation Mandated';
  } else if (riskScore >= 50) {
    priorityLevel = 'High';
    recommendedAction = 'Priority Evacuation & Sheltering';
  } else if (riskScore >= 30) {
    priorityLevel = 'Medium';
    recommendedAction = 'Preventive Action Required';
  } else {
    priorityLevel = 'Low';
    recommendedAction = 'Safe / Routine Vigilance';
  }

  // Generate Explainable AI (XAI) rationale
  const aiExplanation = generateExplanation({
    riskScore,
    zoneCategory,
    params,
    rainfallScore,
    slopeScore,
    disasterScore,
    populationScore,
    vulnerabilityScore,
    riverDist
  });

  return {
    riskScore,
    zoneCategory,
    priorityLevel,
    recommendedAction,
    aiExplanation,
    breakdown: {
      rainfallScore: Math.round(rainfallScore),
      slopeScore: Math.round(slopeScore),
      disasterScore: Math.round(disasterScore),
      populationScore: Math.round(populationScore),
      vulnerabilityScore: Math.round(vulnerabilityScore)
    }
  };
}

function generateExplanation({ riskScore, zoneCategory, params, rainfallScore, slopeScore, disasterScore, populationScore, vulnerabilityScore, riverDist }) {
  const drivers = [];

  if (params.rainfall_mm > 180) {
    drivers.push(`severe monsoonal precipitation (${params.rainfall_mm} mm/24h) exceeding critical drainage capacity`);
  } else if (params.rainfall_mm > 90) {
    drivers.push(`moderate-to-heavy rainfall (${params.rainfall_mm} mm)`);
  }

  if (params.slope_deg >= 28) {
    drivers.push(`steep gravitational shear angle (${params.slope_deg}°) with elevated slip risk`);
  }

  if (riverDist <= 300) {
    drivers.push(`acute proximity to active water body (${riverDist}m)`);
  }

  if (params.historical_disasters >= 3) {
    drivers.push(`${params.historical_disasters} recurrent catastrophic events in past decade`);
  }

  if (vulnerabilityScore > 65) {
    drivers.push(`high infrastructural vulnerability index (${Math.round(vulnerabilityScore)}/100)`);
  }

  if (drivers.length === 0) {
    return `Location exhibits stable slope parameters, adequate water drainage distance (${riverDist}m), and baseline precipitation levels. Nominal hazard exposure detected.`;
  }

  const rationale = drivers.join(', ');
  return `${zoneCategory.toUpperCase()} Zone alert (Score: ${riskScore}/100) primarily triggered by ${rationale}.`;
}

module.exports = {
  calculateRiskScore,
  normalizeValue
};
