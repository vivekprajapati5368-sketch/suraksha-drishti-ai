/**
 * SURAKSHA DRISHTI AI - Carrying Capacity Assessment Engine
 * Evaluates whether a safe relocation zone can sustainably absorb incoming displaced habitations.
 */

/**
 * Calculates carrying capacity and multi-dimensional sustainability score
 * @param {Object} zone
 */
function evaluateCarryingCapacity(zone) {
  const maxCap = Number(zone.maximum_capacity) || 0;
  const currPop = Number(zone.current_population) || 0;
  const availableCapacity = Math.max(0, maxCap - currPop);
  const occupancyRate = maxCap > 0 ? Math.min(100, (currPop / maxCap) * 100) : 100;

  // Multi-factor infrastructure scores (0 - 100)
  const water = Number(zone.water_score) || 75;
  const health = Number(zone.healthcare_score) || 70;
  const road = Number(zone.connectivity_score) || 80;
  const school = Number(zone.school_score) || 70;
  const employment = Number(zone.employment_score) || 65;

  // Weighted sustainability index
  // Water & Health have highest weights for disaster resilience
  const rawSustainability = (
    (water * 0.25) +
    (health * 0.25) +
    (road * 0.20) +
    (school * 0.15) +
    (employment * 0.15)
  );

  // Penalty if current occupancy exceeds 80% of max capacity
  let penalty = 0;
  if (occupancyRate > 80) {
    penalty = (occupancyRate - 80) * 0.8;
  }
  const sustainabilityScore = Math.max(0, Math.min(100, Math.round(rawSustainability - penalty)));

  // Classification:
  // 80-100: Excellent
  // 60-79: Suitable
  // 40-59: Limited Capacity
  // 0-39: Unsuitable
  let suitabilityRating = 'Unsuitable';
  if (sustainabilityScore >= 80 && availableCapacity > 500) {
    suitabilityRating = 'Excellent';
  } else if (sustainabilityScore >= 60 && availableCapacity > 200) {
    suitabilityRating = 'Suitable';
  } else if (sustainabilityScore >= 40 && availableCapacity > 50) {
    suitabilityRating = 'Limited Capacity';
  } else {
    suitabilityRating = 'Unsuitable';
  }

  return {
    maximumCapacity: maxCap,
    currentPopulation: currPop,
    availableCapacity,
    occupancyRate: Math.round(occupancyRate * 10) / 10,
    sustainabilityScore,
    suitabilityRating,
    metrics: {
      water,
      health,
      road,
      school,
      employment
    }
  };
}

/**
 * Checks if a safe zone can absorb a specific target habitation
 */
function assessAbsorptionFit(safeZone, targetPopulation) {
  const cap = evaluateCarryingCapacity(safeZone);
  const pop = Number(targetPopulation) || 0;
  const canAccommodate = cap.availableCapacity >= pop;
  const deficit = canAccommodate ? 0 : pop - cap.availableCapacity;
  const postAllocationPop = cap.currentPopulation + (canAccommodate ? pop : cap.availableCapacity);
  const postAllocationOccupancy = (postAllocationPop / cap.maximumCapacity) * 100;

  return {
    canAccommodate,
    availableCapacity: cap.availableCapacity,
    targetPopulation: pop,
    deficit,
    postAllocationOccupancy: Math.round(postAllocationOccupancy * 10) / 10,
    fitRating: canAccommodate ? cap.suitabilityRating : 'Capacity Deficit Exceeded'
  };
}

module.exports = {
  evaluateCarryingCapacity,
  assessAbsorptionFit
};
