const express = require('express');
const router = express.Router();
const { getRecentActivities } = require('../controllers/aktivitasController');
const { authenticateToken } = require('../middleware/auth'); // Fixed: destructure

// Require authentication for viewing recent activities
router.get('/terbaru', authenticateToken, getRecentActivities);

module.exports = router;