const rateLimit = require('express-rate-limit');
const pool = require('../config/db');

// Login Rate Limiter
const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5, // Max 5 requests per window
  message: {
    message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  
  // Custom handler to log failed attempts
  handler: async (req, res) => {
    const email = req.body.email || 'unknown';
    const ipAddress = req.ip || req.connection.remoteAddress;

    try {
      // Log the failed attempt
      await pool.execute(
        'INSERT INTO login_attempts (email, ip_address, success) VALUES (?, ?, ?)',
        [email, ipAddress, false]
      );
    } catch (error) {
      console.error('Error logging rate limit attempt:', error);
    }

    res.status(429).json({
      message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 60000) + ' minutes'
    });
  },

  // Skip successful requests
  skipSuccessfulRequests: true,
  
  // Use IP + email combination for more accurate limiting
  keyGenerator: (req) => {
    return `${req.ip}-${req.body.email || 'no-email'}`;
  }
});

// API Rate Limiter (General)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window per IP
  message: {
    message: 'Terlalu banyak permintaan dari IP ini. Silakan coba lagi nanti.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for sensitive operations
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 requests per hour
  message: {
    message: 'Terlalu banyak permintaan untuk operasi ini. Silakan coba lagi dalam 1 jam.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  apiLimiter,
  strictLimiter
};