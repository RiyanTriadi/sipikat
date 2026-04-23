const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const jwtConfig = require('../config/jwt');
const { handleRefreshTokenReuse } = require('../utils/tokenService');

const authenticateToken = async (req, res, next) => {
  try {
    // Extract access token from cookie
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ 
        message: 'Token akses tidak ditemukan. Silakan login.',
        authenticated: false 
      });
    }

    // Check if token is blacklisted
    const [blacklisted] = await pool.execute(
      'SELECT id FROM token_blacklist WHERE token = ? AND expires_at > NOW() LIMIT 1',
      [accessToken]
    );

    if (blacklisted.length > 0) {
      return res.status(403).json({
        message: 'Token telah dicabut. Silakan login kembali.',
        authenticated: false
      });
    }

    // Verify JWT token
    jwt.verify(accessToken, jwtConfig.accessToken.secret, async (err, decoded) => {
      if (err) {
        // Check if error is due to expiration
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ 
            message: 'Token telah kadaluarsa. Silakan refresh token.',
            authenticated: false,
            expired: true
          });
        }

        // Other JWT errors 
        return res.status(403).json({ 
          message: 'Token tidak valid.',
          authenticated: false 
        });
      }

      // Verify user still exists in database
      try {
        const [users] = await pool.execute(
          'SELECT id, name, email FROM tb_user WHERE id = ? LIMIT 1',
          [decoded.sub]
        );

        if (users.length === 0) {
          return res.status(403).json({
            message: 'User tidak ditemukan.',
            authenticated: false
          });
        }

        // Attach user info to request object
        req.user = {
          id: users[0].id,
          name: users[0].name,
          email: users[0].email
        };

        next();
      } catch (dbError) {
        console.error('Database error in auth middleware:', dbError);
        return res.status(500).json({
          message: 'Terjadi kesalahan server.',
          authenticated: false
        });
      }
    });

  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan saat memverifikasi token.',
      authenticated: false
    });
  }
};

/**
 * Middleware to verify refresh token
 */
const authenticateRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ 
        message: 'Refresh token tidak ditemukan.',
        authenticated: false 
      });
    }

    const [blacklisted] = await pool.execute(
      'SELECT id FROM token_blacklist WHERE token = ? AND expires_at > NOW() LIMIT 1',
      [refreshToken]
    );

    if (blacklisted.length > 0) {
      const decoded = jwt.decode(refreshToken);
      if (decoded?.sub) {
        await handleRefreshTokenReuse({
          userId: decoded.sub,
          presentedToken: refreshToken
        });
      }

      return res.status(403).json({
        message: 'Reuse refresh token terdeteksi. Semua sesi telah dicabut, silakan login kembali.',
        authenticated: false,
        reuseDetected: true
      });
    }

    jwt.verify(refreshToken, jwtConfig.refreshToken.secret, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ 
          message: 'Refresh token tidak valid atau telah kadaluarsa.',
          authenticated: false 
        });
      }

      if (decoded.type !== 'refresh') {
        return res.status(403).json({
          message: 'Tipe token tidak valid.',
          authenticated: false
        });
      }

      try {
        const [users] = await pool.execute(
          'SELECT id, name, email, refresh_token, refresh_token_expires_at FROM tb_user WHERE id = ? LIMIT 1',
          [decoded.sub]
        );

        if (users.length === 0) {
          return res.status(403).json({
            message: 'Refresh token tidak valid.',
            authenticated: false
          });
        }

        const user = users[0];

        if (!user.refresh_token || user.refresh_token !== refreshToken) {
          await handleRefreshTokenReuse({
            userId: decoded.sub,
            presentedToken: refreshToken
          });

          return res.status(403).json({
            message: 'Reuse refresh token terdeteksi. Semua sesi telah dicabut, silakan login kembali.',
            authenticated: false,
            reuseDetected: true
          });
        }

        const expiresAt = new Date(user.refresh_token_expires_at);
        if (expiresAt < new Date()) {
          return res.status(403).json({
            message: 'Refresh token telah kadaluarsa. Silakan login kembali.',
            authenticated: false
          });
        }

        req.user = {
          id: user.id,
          name: user.name,
          email: user.email
        };
        req.refreshToken = refreshToken;

        next();
      } catch (dbError) {
        console.error('Database error in refresh token middleware:', dbError);
        return res.status(500).json({
          message: 'Terjadi kesalahan server.',
          authenticated: false
        });
      }
    });

  } catch (error) {
    console.error('Refresh token middleware error:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan saat memverifikasi refresh token.',
      authenticated: false
    });
  }
};

module.exports = {
  authenticateToken,
  authenticateRefreshToken
};
