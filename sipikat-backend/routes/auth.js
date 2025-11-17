const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

// Login route
router.post('/admin/login', authController.adminLogin);

// Logout route
router.post('/admin/logout', authController.adminLogout);

// Check authentication status
router.get('/admin/check', authenticateToken, authController.checkAuth);

module.exports = router;