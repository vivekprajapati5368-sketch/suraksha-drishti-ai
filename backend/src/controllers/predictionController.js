const { evaluateAreaSafety } = require('../services/predictionEngine');

function predictAreaSafety(req, res) {
  try {
    const inputParams = req.body || {};
    const result = evaluateAreaSafety(inputParams);
    return res.json(result);
  } catch (err) {
    console.error('[Prediction Controller Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to compute autonomous area safety prediction' });
  }
}

module.exports = {
  predictAreaSafety
};
