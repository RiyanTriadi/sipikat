const express = require('express');
const router = express.Router();
const { getRecentActivities } = require('../controllers/aktivitasController');
const { authenticateToken } = require('../middleware/auth'); 
const { noStore } = require('../utils/http');

// Require authentication for viewing recent activities
router.get('/terbaru', noStore, authenticateToken, getRecentActivities);

module.exports = router;
