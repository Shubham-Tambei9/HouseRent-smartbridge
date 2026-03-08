const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// @route   GET /api/dashboard
// @desc    Get dashboard metrics, charts, and performance data
// @access  Private (Owner/Admin)
router.get('/', auth, dashboardController.getDashboardData);

module.exports = router;
