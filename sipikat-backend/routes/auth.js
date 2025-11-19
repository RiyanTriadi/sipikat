const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authenticateRefreshToken } = require('../middleware/auth');
const { loginLimiter, strictLimiter } = require('../middleware/rateLimiter');

/**
 * @route   POST /api/auth/admin/login
 * @desc    Admin login with email and password
 * @access  Public (with rate limiting)
 */
router.post('/admin/login', loginLimiter, authController.adminLogin);

/**
 * @route   POST /api/auth/admin/refresh
 * @desc    Refresh access token using refresh token
 * @access  Private (requires valid refresh token)
 */
router.post('/admin/refresh', authenticateRefreshToken, authController.refreshToken);

/**
 * @route   POST /api/auth/admin/logout
 * @desc    Logout admin and blacklist token
 * @access  Private (requires authentication)
 */
router.post('/admin/logout', authenticateToken, authController.adminLogout);

/**
 * @route   GET /api/auth/admin/check
 * @desc    Check if user is authenticated
 * @access  Private (requires authentication)
 */
router.get('/admin/check', authenticateToken, authController.checkAuth);

/**
 * @route   POST /api/auth/admin/revoke-all
 * @desc    Revoke all tokens for current user (logout all devices)
 * @access  Private (requires authentication + strict rate limiting)
 */
router.post('/admin/revoke-all', authenticateToken, strictLimiter, authController.revokeAllTokens);

module.exports = router;