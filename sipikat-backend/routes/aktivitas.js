// routes/aktivitas.js
const express = require('express');
const router = express.Router();
const { getRecentActivities } = require('../controllers/aktivitasController');
// 1. Impor middleware otentikasi Anda
const authenticateToken = require('../middleware/auth'); 

// 2. Terapkan middleware ke route
// Hanya pengguna dengan token yang valid yang bisa mengakses endpoint ini
router.get('/terbaru', authenticateToken, getRecentActivities);

module.exports = router;