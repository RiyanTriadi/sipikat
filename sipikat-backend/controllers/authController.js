const pool = require('../config/db'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
require('dotenv').config();

/**
 * Generate Access Token
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { 
      sub: userId,
      type: 'access',
      iat: Math.floor(Date.now() / 1000)
    },
    jwtConfig.accessToken.secret,
    { expiresIn: jwtConfig.accessToken.expiresIn }
  );
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { 
      sub: userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000)
    },
    jwtConfig.refreshToken.secret,
    { expiresIn: jwtConfig.refreshToken.expiresIn }
  );
};

/**
 * Calculate refresh token expiry date
 */
const getRefreshTokenExpiry = () => {
  const expiryMs = parseInt(process.env.SESSION_COOKIE_MAX_AGE) || 7 * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + expiryMs);
};

/**
 * Admin Login
 */
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email dan password harus diisi.' 
      });
    }

    // Find user by email
    const [rows] = await pool.execute(
      'SELECT * FROM tb_user WHERE email = ? LIMIT 1', 
      [email]
    );
    const user = rows[0];

    if (!user) {
      // Log failed attempt
      await pool.execute(
        'INSERT INTO login_attempts (email, ip_address, success) VALUES (?, ?, ?)',
        [email, ipAddress, false]
      );
      
      return res.status(400).json({ 
        message: 'Email atau password salah.' 
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Log failed attempt
      await pool.execute(
        'INSERT INTO login_attempts (email, ip_address, success) VALUES (?, ?, ?)',
        [email, ipAddress, false]
      );
      
      return res.status(400).json({ 
        message: 'Email atau password salah.' 
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const refreshTokenExpiry = getRefreshTokenExpiry();

    // Store refresh token in database
    await pool.execute(
      'UPDATE tb_user SET refresh_token = ?, refresh_token_expires_at = ?, last_login = NOW() WHERE id = ?',
      [refreshToken, refreshTokenExpiry, user.id]
    );

    // Log successful attempt
    await pool.execute(
      'INSERT INTO login_attempts (email, ip_address, success) VALUES (?, ?, ?)',
      [email, ipAddress, true]
    );

    // Set access token cookie
    res.cookie('accessToken', accessToken, jwtConfig.accessToken.cookieOptions);

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, jwtConfig.refreshToken.cookieOptions);

    // Return success response (without tokens in body)
    res.json({ 
      message: 'Login berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server.' }); 
  }
};

/**
 * Refresh Access Token
 */
exports.refreshToken = async (req, res) => {
  try {
    // req.user is set by authenticateRefreshToken middleware
    const userId = req.user.id;

    // Generate new access token
    const newAccessToken = generateAccessToken(userId);

    // Set new access token cookie
    res.cookie('accessToken', newAccessToken, jwtConfig.accessToken.cookieOptions);

    res.json({ 
      message: 'Token berhasil diperbarui',
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      }
    });

  } catch (err) {
    console.error('Refresh token error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

/**
 * Admin Logout
 */
exports.adminLogout = async (req, res) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  try {
    // Decode access token to get expiry (without verifying, as it might be expired)
    let tokenExpiry = new Date();
    try {
      const decoded = jwt.decode(accessToken);
      if (decoded && decoded.exp) {
        tokenExpiry = new Date(decoded.exp * 1000);
      }
    } catch (decodeError) {
      console.log('Could not decode token for blacklist, using current time');
    }

    // Add access token to blacklist
    if (accessToken) {
      await pool.execute(
        'INSERT INTO token_blacklist (token, expires_at, user_id, reason) VALUES (?, ?, ?, ?)',
        [accessToken, tokenExpiry, req.user?.id || null, 'logout']
      );
    }

    // Remove refresh token from database
    if (req.user?.id) {
      await pool.execute(
        'UPDATE tb_user SET refresh_token = NULL, refresh_token_expires_at = NULL WHERE id = ?',
        [req.user.id]
      );
    }

    // Clear cookies
    res.clearCookie('accessToken', jwtConfig.accessToken.cookieOptions);
    res.clearCookie('refreshToken', jwtConfig.refreshToken.cookieOptions);

    res.json({ message: 'Logout berhasil' });
  } catch (err) {
    console.error('Logout error:', err.message);
    
    // Even if there's an error, clear cookies
    res.clearCookie('accessToken', jwtConfig.accessToken.cookieOptions);
    res.clearCookie('refreshToken', jwtConfig.refreshToken.cookieOptions);
    
    res.status(500).json({ message: 'Terjadi kesalahan saat logout.' });
  }
};

/**
 * Check Authentication Status
 */
exports.checkAuth = async (req, res) => {
  try {
    // req.user is set by authenticateToken middleware
    res.json({ 
      authenticated: true,
      user: req.user
    });
  } catch (err) {
    console.error('Check auth error:', err.message);
    res.status(500).json({ 
      message: 'Terjadi kesalahan server.',
      authenticated: false 
    });
  }
};

/**
 * Revoke all tokens for a user (Force logout all sessions)
 * This is useful for security incidents or password changes
 */
exports.revokeAllTokens = async (req, res) => {
  try {
    const userId = req.user.id;

    // Clear refresh token from database
    await pool.execute(
      'UPDATE tb_user SET refresh_token = NULL, refresh_token_expires_at = NULL WHERE id = ?',
      [userId]
    );

    // Note: We can't blacklist all access tokens easily without storing them
    // This is acceptable because access tokens are short-lived (15 minutes)

    res.json({ 
      message: 'Semua sesi telah dicabut. Silakan login kembali dari semua perangkat.' 
    });

  } catch (err) {
    console.error('Revoke tokens error:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};