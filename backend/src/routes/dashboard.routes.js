const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const aiController = require('../controllers/ai.controller');
const { protect, allowRoles } = require('../middlewares/auth.middleware');

// Apply auth middleware to all dashboard routes
router.use(protect);
router.use(allowRoles('admin', 'manager'));

// Dashboard Overview (Stats & Alerts)
router.get('/overview', dashboardController.getOverview);

// AI Predictive Maintenance Routes
router.post('/run-predictions', aiController.runPredictions);
router.post('/train-ai', allowRoles('admin'), aiController.trainModel);
router.get('/activity', dashboardController.getActivity);

module.exports = router;
