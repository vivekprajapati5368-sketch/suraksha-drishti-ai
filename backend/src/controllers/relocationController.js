const db = require('../database/db');
const { getTopRelocationRecommendations } = require('../services/relocationEngine');
const { evaluateCarryingCapacity } = require('../services/capacityEngine');

function getRecommendationsForHabitation(req, res) {
  try {
    const habitationId = req.params.habitationId;
    const habitation = db.prepare('SELECT * FROM habitations WHERE id = ?').get(habitationId);

    if (!habitation) {
      return res.status(404).json({ success: false, message: 'Habitation not found' });
    }

    const safeZones = db.prepare('SELECT * FROM safe_zones').all();
    const recommendations = getTopRelocationRecommendations(habitation, safeZones);

    return res.json({
      success: true,
      data: {
        habitationId: habitation.id,
        habitationName: habitation.name,
        district: habitation.district,
        state: habitation.state,
        population: habitation.population,
        riskScore: habitation.risk_score,
        priorityLevel: habitation.priority_level,
        primaryHazard: habitation.primary_hazard,
        recommendations
      }
    });
  } catch (err) {
    console.error('[Recommendations Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to compute relocation recommendations' });
  }
}

function getRelocationMatrix(req, res) {
  try {
    // Fetch all critical & high priority habitations needing immediate or priority relocation
    const vulnerableHabitations = db.prepare(`
      SELECT * FROM habitations
      WHERE priority_level IN ('Critical', 'High')
      ORDER BY risk_score DESC
    `).all();

    const safeZones = db.prepare('SELECT * FROM safe_zones').all();

    const matrix = vulnerableHabitations.map(hab => {
      const recs = getTopRelocationRecommendations(hab, safeZones);
      const topMatch = recs[0] || null;

      let allocatedZone = null;
      if (hab.allocated_safe_zone_id) {
        allocatedZone = safeZones.find(z => z.id === hab.allocated_safe_zone_id) || null;
      }

      return {
        habitation: hab,
        topRecommendation: topMatch,
        allocatedZone,
        allRecommendations: recs
      };
    });

    const totalVulnerablePop = vulnerableHabitations.reduce((acc, h) => acc + h.population, 0);
    const totalSafeCapacityAvailable = safeZones.reduce((acc, z) => acc + z.available_capacity, 0);

    return res.json({
      success: true,
      data: {
        totalVulnerableHabitations: vulnerableHabitations.length,
        totalVulnerablePopulation: totalVulnerablePop,
        totalSafeCapacityAvailable,
        capacitySurplusDeficit: totalSafeCapacityAvailable - totalVulnerablePop,
        matrix
      }
    });
  } catch (err) {
    console.error('[Relocation Matrix Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to generate relocation matrix' });
  }
}

function executeBatchAllocation(req, res) {
  try {
    const criticalHabitations = db.prepare(`
      SELECT * FROM habitations
      WHERE priority_level = 'Critical' AND allocated_safe_zone_id IS NULL
      ORDER BY risk_score DESC
    `).all();

    const safeZones = db.prepare('SELECT * FROM safe_zones').all();
    const allocations = [];

    for (const hab of criticalHabitations) {
      const recs = getTopRelocationRecommendations(hab, safeZones);
      const viable = recs.find(r => r.canAccommodate);

      if (viable) {
        // Update habitation
        db.prepare('UPDATE habitations SET allocated_safe_zone_id = ? WHERE id = ?').run(viable.safeZoneId, hab.id);

        // Update safe zone current population
        const targetZone = safeZones.find(z => z.id === viable.safeZoneId);
        if (targetZone) {
          targetZone.current_population += hab.population;
          targetZone.available_capacity = Math.max(0, targetZone.maximum_capacity - targetZone.current_population);

          db.prepare('UPDATE safe_zones SET current_population = ?, available_capacity = ? WHERE id = ?').run(
            targetZone.current_population,
            targetZone.available_capacity,
            targetZone.id
          );
        }

        allocations.push({
          habitationId: hab.id,
          habitationName: hab.name,
          safeZoneId: viable.safeZoneId,
          safeZoneName: viable.safeZoneName,
          allocatedPopulation: hab.population
        });
      }
    }

    return res.json({
      success: true,
      message: `AI Batch allocation completed: ${allocations.length} critical habitations assigned to safe zones.`,
      allocations
    });
  } catch (err) {
    console.error('[Batch Allocation Error]', err);
    return res.status(500).json({ success: false, message: 'Batch allocation failed' });
  }
}

module.exports = {
  getRecommendationsForHabitation,
  getRelocationMatrix,
  executeBatchAllocation
};
