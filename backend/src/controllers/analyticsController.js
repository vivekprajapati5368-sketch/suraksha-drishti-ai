const db = require('../database/db');

function getAnalyticsData(req, res) {
  try {
    const disasterEvents = db.prepare('SELECT * FROM disaster_events ORDER BY year_date DESC').all();
    const habitations = db.prepare('SELECT * FROM habitations').all();
    const hazardZones = db.prepare('SELECT * FROM hazard_zones').all();
    const safeZones = db.prepare('SELECT * FROM safe_zones').all();

    // 1. Historical Disasters metrics
    const totalCasualties = disasterEvents.reduce((a, b) => a + (b.casualties || 0), 0);
    const totalEconomicLossCr = disasterEvents.reduce((a, b) => a + (b.economic_loss_cr || 0), 0);

    // 2. Correlation Points: Slope vs Risk Score
    const slopeVsRisk = habitations.map(h => ({
      name: h.name,
      slope: h.slope_deg,
      riskScore: h.risk_score,
      hazard: h.primary_hazard,
      state: h.state
    }));

    // 3. State-wise capacity vs demand
    const stateDemandMap = {};
    for (const h of habitations) {
      if (!stateDemandMap[h.state]) {
        stateDemandMap[h.state] = { state: h.state, populationAtRisk: 0, safeCapacity: 0 };
      }
      if (h.priority_level === 'Critical' || h.priority_level === 'High') {
        stateDemandMap[h.state].populationAtRisk += h.population;
      }
    }

    for (const sz of safeZones) {
      if (!stateDemandMap[sz.state]) {
        stateDemandMap[sz.state] = { state: sz.state, populationAtRisk: 0, safeCapacity: 0 };
      }
      stateDemandMap[sz.state].safeCapacity += (sz.available_capacity || 0);
    }

    const stateCapacityComparison = Object.values(stateDemandMap);

    // 4. Hazard Type Breakdown
    const hazardTypeMap = {};
    for (const z of hazardZones) {
      hazardTypeMap[z.hazard_type] = (hazardTypeMap[z.hazard_type] || 0) + 1;
    }
    const hazardTypes = Object.keys(hazardTypeMap).map(type => ({
      type,
      count: hazardTypeMap[type]
    }));

    // 5. Soil Instability Distribution
    const soilTypeMap = {};
    for (const h of habitations) {
      soilTypeMap[h.soil_type] = (soilTypeMap[h.soil_type] || 0) + 1;
    }
    const soilDistribution = Object.keys(soilTypeMap).map(soil => ({
      soil,
      count: soilTypeMap[soil]
    }));

    return res.json({
      success: true,
      data: {
        summary: {
          totalCasualtiesRecorded: totalCasualties,
          totalEconomicLossCr,
          historicalEventsLogged: disasterEvents.length,
          totalZonesAudited: hazardZones.length + safeZones.length
        },
        disasterEvents,
        slopeVsRisk,
        stateCapacityComparison,
        hazardTypes,
        soilDistribution
      }
    });
  } catch (err) {
    console.error('[Analytics Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to compile analytics' });
  }
}

module.exports = { getAnalyticsData };
