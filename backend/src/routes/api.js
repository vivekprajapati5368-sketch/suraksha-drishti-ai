const express = require('express');
const router = express.Router();

const { login, sendOtp, verifyOtp, updateProfile, getMe } = require('../controllers/authController');
const { getDashboardStats } = require('../controllers/dashboardController');
const {
  getAllHabitations,
  getHabitationById,
  createHabitation,
  updateHabitation,
  deleteHabitation,
  allocateSafeZone
} = require('../controllers/habitationsController');
const {
  getAllHazardZones,
  getHazardZoneById,
  createHazardZone,
  updateHazardZone,
  deleteHazardZone
} = require('../controllers/hazardZonesController');
const {
  getAllSafeZones,
  getSafeZoneById,
  createSafeZone,
  updateSafeZone,
  deleteSafeZone,
  testCapacityInflux
} = require('../controllers/safeZonesController');
const {
  getRecommendationsForHabitation,
  getRelocationMatrix,
  executeBatchAllocation
} = require('../controllers/relocationController');
const {
  getSimulationStatus,
  runSimulation,
  restoreBaseline
} = require('../controllers/simulationController');
const {
  getRiskWeights,
  updateRiskWeights,
  calculateAdHocRisk
} = require('../controllers/weightsController');
const {
  getOfficialReport,
  submitFieldReport,
  getFieldReports,
  updateFieldReportStatus
} = require('../controllers/reportsController');
const { getAnalyticsData } = require('../controllers/analyticsController');
const {
  getDiscussions,
  createDiscussion,
  addReply,
  likeDiscussion,
  togglePin
} = require('../controllers/discussionsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Auth routes
router.post('/auth/login', login);
router.post('/auth/send-otp', sendOtp);
router.post('/auth/verify-otp', verifyOtp);
router.get('/auth/me', authenticateToken, getMe);
router.put('/auth/profile', authenticateToken, updateProfile);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);

// Habitations routes
router.get('/habitations', getAllHabitations);
router.get('/habitations/:id', getHabitationById);
router.post('/habitations', createHabitation);
router.put('/habitations/:id', updateHabitation);
router.delete('/habitations/:id', deleteHabitation);
router.post('/habitations/:id/allocate', allocateSafeZone);

// Hazard Zones routes
router.get('/hazard-zones', getAllHazardZones);
router.get('/hazard-zones/:id', getHazardZoneById);
router.post('/hazard-zones', createHazardZone);
router.put('/hazard-zones/:id', updateHazardZone);
router.delete('/hazard-zones/:id', deleteHazardZone);

// Safe Zones routes
router.get('/safe-zones', getAllSafeZones);
router.get('/safe-zones/:id', getSafeZoneById);
router.post('/safe-zones', createSafeZone);
router.put('/safe-zones/:id', updateSafeZone);
router.delete('/safe-zones/:id', deleteSafeZone);
router.post('/safe-zones/test-intake', testCapacityInflux);

// Relocation Intelligence routes
router.get('/recommendations/:habitationId', getRecommendationsForHabitation);
router.get('/relocation/matrix', getRelocationMatrix);
router.post('/relocation/batch-allocate', executeBatchAllocation);

// Simulation routes
router.get('/simulation/status', getSimulationStatus);
router.post('/simulate-alert', runSimulation);
router.post('/simulation/reset', restoreBaseline);

// AI Weights & Risk Scoring routes
router.get('/risk-weights', getRiskWeights);
router.put('/risk-weights', updateRiskWeights);
router.post('/calculate-risk', calculateAdHocRisk);

// Reports and Field Observations routes
router.get('/reports/official', getOfficialReport);
router.get('/field-reports', getFieldReports);
router.post('/field-reports', submitFieldReport);
router.put('/field-reports/:id/status', updateFieldReportStatus);

// Analytics routes
router.get('/analytics', getAnalyticsData);

// Crisis Council & Discussion routes
router.get('/discussions', getDiscussions);
router.post('/discussions', createDiscussion);
router.post('/discussions/:id/reply', addReply);
router.post('/discussions/:id/like', likeDiscussion);
router.post('/discussions/:id/pin', togglePin);

module.exports = router;
