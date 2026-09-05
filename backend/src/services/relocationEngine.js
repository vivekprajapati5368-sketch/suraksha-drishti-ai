/**
 * SURAKSHA DRISHTI AI - Relocation Recommendation Engine
 * Generates ranked, multi-criteria relocation recommendations for vulnerable habitations.
 */

const { evaluateCarryingCapacity } = require('./capacityEngine');

/**
 * Calculates geodesic distance between two points using the Haversine formula (in km)
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Generates Top 3 ranked safe relocation zones for a given habitation
 * @param {Object} habitation
 * @param {Array<Object>} safeZones
 */
function getTopRelocationRecommendations(habitation, safeZones) {
  if (!habitation || !safeZones || safeZones.length === 0) return [];

  const pop = Number(habitation.population) || 1000;

  const scoredZones = safeZones.map(zone => {
    const distanceKm = haversineDistance(
      habitation.latitude,
      habitation.longitude,
      zone.latitude,
      zone.longitude
    );

    const cap = evaluateCarryingCapacity(zone);

    // Distance Score (0 - 100): Closest is highest score. Within 15km = 100, drops down to 0 at 120km
    let distanceScore = 0;
    if (distanceKm <= 15) {
      distanceScore = 100;
    } else if (distanceKm <= 120) {
      distanceScore = Math.max(0, 100 - ((distanceKm - 15) / 105) * 100);
    }

    // Capacity Score (0 - 100)
    let capacityScore = 0;
    if (cap.availableCapacity >= pop * 1.5) {
      capacityScore = 100; // Abundant surplus
    } else if (cap.availableCapacity >= pop) {
      capacityScore = 85 + (15 * ((cap.availableCapacity - pop) / (pop * 0.5)));
    } else if (cap.availableCapacity > 0) {
      capacityScore = (cap.availableCapacity / pop) * 60; // Partial capacity
    } else {
      capacityScore = 0; // Fully exhausted
    }

    // Road connectivity score (0 - 100)
    const connectivityScore = Number(zone.connectivity_score) || 75;

    // Infrastructure Sustainability Score (0 - 100)
    const sustainabilityScore = cap.sustainabilityScore;

    // Composite Relocation Suitability Score (0 - 100)
    // Formula weights:
    // Capacity Adequacy: 35%
    // Proximity (Distance): 25%
    // Infrastructure Sustainability: 25%
    // Road Connectivity: 15%
    const compositeScore = Math.round(
      (capacityScore * 0.35) +
      (distanceScore * 0.25) +
      (sustainabilityScore * 0.25) +
      (connectivityScore * 0.15)
    );

    // Generate comprehensive AI justification
    const reasons = [];
    if (cap.availableCapacity >= pop) {
      reasons.push(`Ample available capacity (${cap.availableCapacity.toLocaleString()} > ${pop.toLocaleString()} required)`);
    } else {
      reasons.push(`Capacity constrained (${cap.availableCapacity.toLocaleString()} available vs ${pop.toLocaleString()} needed)`);
    }

    if (distanceKm <= 25) {
      reasons.push(`Direct tactical proximity (${distanceKm} km transit radius) minimizes evacuation latency`);
    } else {
      reasons.push(`Regional relocation corridor (${distanceKm} km)`);
    }

    if (sustainabilityScore >= 80) {
      reasons.push(`High civic infrastructure rating (${sustainabilityScore}/100: robust water supply & medical facilities)`);
    } else if (sustainabilityScore >= 60) {
      reasons.push(`Moderate civic infrastructure (${sustainabilityScore}/100)`);
    }

    if (connectivityScore >= 80) {
      reasons.push(`All-weather arterial highway connectivity (${connectivityScore}/100)`);
    }

    const recommendationReason = reasons.join('. ') + '.';

    return {
      safeZoneId: zone.id,
      safeZoneName: zone.name,
      district: zone.district,
      state: zone.state,
      latitude: zone.latitude,
      longitude: zone.longitude,
      suitabilityScore: Math.min(100, Math.max(0, compositeScore)),
      distanceKm,
      availableCapacity: cap.availableCapacity,
      maximumCapacity: cap.maximumCapacity,
      currentPopulation: cap.currentPopulation,
      sustainabilityScore,
      suitabilityRating: cap.suitabilityRating,
      canAccommodate: cap.availableCapacity >= pop,
      recommendationReason,
      infrastructure: {
        waterScore: Number(zone.water_score) || 80,
        healthcareScore: Number(zone.healthcare_score) || 75,
        connectivityScore: Number(zone.connectivity_score) || 80,
        schoolScore: Number(zone.school_score) || 70,
        housingUnits: Number(zone.housing_units) || 400
      }
    };
  });

  // Sort descending by suitabilityScore
  scoredZones.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  // Return Top 3 recommendations
  return scoredZones.slice(0, 3);
}

module.exports = {
  haversineDistance,
  getTopRelocationRecommendations
};
