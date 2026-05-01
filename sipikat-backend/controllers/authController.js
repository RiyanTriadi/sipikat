const pool = require('../config/db'); 
const bcrypt = require('bcryptjs');
const jwtConfig = require('../config/jwt');
const {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  addTokenToBlacklist,
  revokeUserRefreshSession
} = require('../utils/tokenService');
const { sendErrorResponse, applyNoStore } = require('../utils/http');
require('dotenv').config();

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
    applyNoStore(res);
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
    sendErrorResponse(res, err);
  }
};

/**
 * Refresh Access Token
 */
exports.refreshToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentRefreshToken = req.refreshToken;

    const newAccessToken = generateAccessToken(userId);
    const newRefreshToken = generateRefreshToken(userId);
    const newRefreshTokenExpiry = getRefreshTokenExpiry();

    const [result] = await pool.execute(
      'UPDATE tb_user SET refresh_token = ?, refresh_token_expires_at = ? WHERE id = ? AND refresh_token = ?',
      [newRefreshToken, newRefreshTokenExpiry, userId, currentRefreshToken]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({
        message: 'Refresh token tidak valid. Silakan login kembali.',
        authenticated: false
      });
    }

    await addTokenToBlacklist(currentRefreshToken, userId, 'refresh_rotation');

    res.cookie('accessToken', newAccessToken, jwtConfig.accessToken.cookieOptions);
    res.cookie('refreshToken', newRefreshToken, jwtConfig.refreshToken.cookieOptions);
    applyNoStore(res);

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
    sendErrorResponse(res, err);
  }
};

/**
 * Admin Logout
 */
exports.adminLogout = async (req, res) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  try {
    if (accessToken) {
      await addTokenToBlacklist(accessToken, req.user?.id || null, 'logout');
    }

    if (refreshToken) {
      await addTokenToBlacklist(refreshToken, req.user?.id || null, 'logout');
    }

    if (req.user?.id) {
      await revokeUserRefreshSession(req.user.id);
    }

    // Clear cookies
    res.clearCookie('accessToken', jwtConfig.accessToken.cookieOptions);
    res.clearCookie('refreshToken', jwtConfig.refreshToken.cookieOptions);
    applyNoStore(res);

    res.json({ message: 'Logout berhasil' });
  } catch (err) {
    console.error('Logout error:', err.message);
    
    // Even if there's an error, clear cookies
    res.clearCookie('accessToken', jwtConfig.accessToken.cookieOptions);
    res.clearCookie('refreshToken', jwtConfig.refreshToken.cookieOptions);
    
    sendErrorResponse(res, err, { publicMessage: 'Terjadi kesalahan saat logout.' });
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
    sendErrorResponse(res, err, {
      extra: { authenticated: false }
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

    await revokeUserRefreshSession(userId);

    // Note: We can't blacklist all access tokens easily without storing them
    // This is acceptable because access tokens are short-lived (15 minutes)

    res.json({ 
      message: 'Semua sesi telah dicabut. Silakan login kembali dari semua perangkat.' 
    });

  } catch (err) {
    console.error('Revoke tokens error:', err.message);
    sendErrorResponse(res, err);
  }
};
