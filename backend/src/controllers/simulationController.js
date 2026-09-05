const db = require('../database/db');
const { triggerSimulation, resetSimulation } = require('../services/simulationEngine');

function getSimulationStatus(req, res) {
  try {
    const simState = db.prepare('SELECT * FROM simulation_state WHERE id = 1').get() || {
      is_simulating: 0,
      event_type: 'None',
      simulation_message: 'Baseline operational monitoring mode.'
    };

    return res.json({ success: true, data: simState });
  } catch (err) {
    console.error('[Simulation Status Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch simulation status' });
  }
}

function runSimulation(req, res) {
  try {
    const { scenario = 'Heavy Rainfall', targetState = 'All', severityMultiplier = 1.5 } = req.body;

    const validScenarios = ['Heavy Rainfall', 'Flood Warning', 'Landslide Warning', 'Cloudburst'];
    if (!validScenarios.includes(scenario)) {
      return res.status(400).json({
        success: false,
        message: `Invalid scenario. Allowed: ${validScenarios.join(', ')}`
      });
    }

    const result = triggerSimulation({
      scenario,
      targetState,
      severityMultiplier: Number(severityMultiplier) || 1.5
    });

    return res.json({
      success: true,
      message: `Disaster scenario '${scenario}' successfully simulated across ${targetState}.`,
      data: result
    });
  } catch (err) {
    console.error('[Run Simulation Error]', err);
    return res.status(500).json({ success: false, message: 'Simulation execution failed' });
  }
}

function restoreBaseline(req, res) {
  try {
    const result = resetSimulation();
    return res.json({ success: true, message: result.message });
  } catch (err) {
    console.error('[Reset Simulation Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to reset simulation baseline' });
  }
}

module.exports = {
  getSimulationStatus,
  runSimulation,
  restoreBaseline
};
