const db = require('../database/db');

function getDashboardStats(req, res) {
  try {
    // 1. Habitation counts & populations
    const habitations = db.prepare('SELECT * FROM habitations').all();
    const totalHabitations = habitations.length;

    let criticalHabitations = 0;
    let highHabitations = 0;
    let mediumHabitations = 0;
    let lowHabitations = 0;

    let criticalPopulation = 0;
    let peopleNeedingRelocation = 0;
    let totalMonitoredPopulation = 0;

    const statePopMap = {};
    const hazardCountMap = {};

    for (const hab of habitations) {
      totalMonitoredPopulation += hab.population;

      if (hab.priority_level === 'Critical') {
        criticalHabitations++;
        criticalPopulation += hab.population;
        peopleNeedingRelocation += hab.population;
      } else if (hab.priority_level === 'High') {
        highHabitations++;
        peopleNeedingRelocation += Math.round(hab.population * 0.5);
      } else if (hab.priority_level === 'Medium') {
        mediumHabitations++;
      } else {
        lowHabitations++;
      }

      // State breakdown
      if (!statePopMap[hab.state]) {
        statePopMap[hab.state] = { state: hab.state, criticalPop: 0, totalPop: 0, count: 0 };
      }
      statePopMap[hab.state].totalPop += hab.population;
      statePopMap[hab.state].count++;
      if (hab.priority_level === 'Critical' || hab.priority_level === 'High') {
        statePopMap[hab.state].criticalPop += hab.population;
      }

      // Hazard breakdown
      hazardCountMap[hab.primary_hazard] = (hazardCountMap[hab.primary_hazard] || 0) + 1;
    }

    // 2. Hazard Zone categories
    const hazardZones = db.prepare('SELECT * FROM hazard_zones').all();
    let redZones = 0;
    let orangeZones = 0;
    let greenZones = 0;

    for (const zone of hazardZones) {
      if (zone.zone_category === 'Red') redZones++;
      else if (zone.zone_category === 'Orange') orangeZones++;
      else greenZones++;
    }

    // 3. Safe Zones Capacity
    const safeZones = db.prepare('SELECT * FROM safe_zones').all();
    let totalSafeCapacity = 0;
    let totalAvailableCapacity = 0;
    let totalCurrentOccupied = 0;

    for (const sz of safeZones) {
      totalSafeCapacity += sz.maximum_capacity;
      totalCurrentOccupied += sz.current_population;
      totalAvailableCapacity += sz.available_capacity;
    }

    // 4. Active Simulation Status
    const simulationState = db.prepare('SELECT * FROM simulation_state WHERE id = 1').get() || {
      is_simulating: 0,
      event_type: 'None',
      simulation_message: 'Baseline operational monitoring mode.'
    };

    // 5. Recent Field Reports
    const recentReports = db.prepare('SELECT * FROM field_reports ORDER BY created_at DESC LIMIT 4').all();

    // 6. Hazard Distribution Chart Data
    const hazardDistribution = Object.keys(hazardCountMap).map(hazard => ({
      name: hazard,
      value: hazardCountMap[hazard]
    }));

    // 7. Population at Risk by State Chart Data
    const stateRiskData = Object.values(statePopMap).map(item => ({
      state: item.state,
      criticalPop: item.criticalPop,
      totalPop: item.totalPop,
      habitationsCount: item.count
    }));

    // 8. 30-Day Risk Trend Curve (Realistic progression reflecting monsoon seasonal index)
    const riskTrend = [
      { day: 'Day 1', baseline: 42, monitored: 45, criticalAlerts: 2 },
      { day: 'Day 5', baseline: 43, monitored: 46, criticalAlerts: 2 },
      { day: 'Day 10', baseline: 45, monitored: 51, criticalAlerts: 3 },
      { day: 'Day 15', baseline: 48, monitored: 58, criticalAlerts: 5 },
      { day: 'Day 20', baseline: 52, monitored: 66, criticalAlerts: 7 },
      { day: 'Day 25', baseline: 55, monitored: 74, criticalAlerts: 9 },
      { day: 'Today', baseline: 54, monitored: simulationState.is_simulating ? 86 : 69, criticalAlerts: criticalHabitations }
    ];

    return res.json({
      success: true,
      data: {
        metrics: {
          totalHabitations,
          redZones,
          orangeZones,
          greenZones,
          criticalHabitations,
          highHabitations,
          criticalPopulation,
          peopleNeedingRelocation,
          totalSafeCapacity,
          totalAvailableCapacity,
          totalMonitoredPopulation,
          totalSafeZones: safeZones.length
        },
        charts: {
          hazardDistribution,
          stateRiskData,
          riskTrend,
          priorityBreakdown: [
            { name: 'Critical (Immediate)', value: criticalHabitations, color: '#EF4444' },
            { name: 'High (Action Soon)', value: highHabitations, color: '#F97316' },
            { name: 'Medium (Monitoring)', value: mediumHabitations, color: '#F59E0B' },
            { name: 'Low (Routine)', value: lowHabitations, color: '#10B981' }
          ]
        },
        simulation: simulationState,
        recentReports
      }
    });
  } catch (err) {
    console.error('[Dashboard Stats Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to load dashboard metrics' });
  }
}

module.exports = { getDashboardStats };
