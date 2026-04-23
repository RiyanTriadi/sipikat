const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const jwtConfig = require('../config/jwt');

const getRefreshTokenExpiry = () => {
  const expiryMs = parseInt(process.env.SESSION_COOKIE_MAX_AGE, 10) || 7 * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + expiryMs);
};

const generateAccessToken = (userId) => jwt.sign(
  {
    sub: userId,
    type: 'access',
    jti: crypto.randomUUID()
  },
  jwtConfig.accessToken.secret,
  { expiresIn: jwtConfig.accessToken.expiresIn }
);

const generateRefreshToken = (userId) => jwt.sign(
  {
    sub: userId,
    type: 'refresh',
    jti: crypto.randomUUID()
  },
  jwtConfig.refreshToken.secret,
  { expiresIn: jwtConfig.refreshToken.expiresIn }
);

const getTokenExpiryFromJwt = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
  } catch (error) {
    console.error('Failed to decode token expiry:', error.message);
  }

  return new Date();
};

const addTokenToBlacklist = async (token, userId = null, reason = 'revoked') => {
  if (!token) return;

  const expiresAt = getTokenExpiryFromJwt(token);
  await pool.execute(
    'INSERT INTO token_blacklist (token, expires_at, user_id, reason) VALUES (?, ?, ?, ?)',
    [token, expiresAt, userId, reason]
  );
};

const cleanupExpiredBlacklistedTokens = async () => {
  const [result] = await pool.execute(
    'DELETE FROM token_blacklist WHERE expires_at <= NOW()'
  );

  return result.affectedRows || 0;
};

const revokeUserRefreshSession = async (userId) => {
  await pool.execute(
    'UPDATE tb_user SET refresh_token = NULL, refresh_token_expires_at = NULL WHERE id = ?',
    [userId]
  );
};

const handleRefreshTokenReuse = async ({ userId, presentedToken, reason = 'refresh_token_reuse' }) => {
  if (!userId) return;

  try {
    const [users] = await pool.execute(
      'SELECT refresh_token FROM tb_user WHERE id = ? LIMIT 1',
      [userId]
    );

    const storedRefreshToken = users[0]?.refresh_token;

    if (storedRefreshToken) {
      await addTokenToBlacklist(storedRefreshToken, userId, 'refresh_session_revoked');
    }

    if (presentedToken && presentedToken !== storedRefreshToken) {
      await addTokenToBlacklist(presentedToken, userId, reason);
    }

    await revokeUserRefreshSession(userId);
  } catch (error) {
    console.error('Error while handling refresh token reuse:', error.message);
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  getTokenExpiryFromJwt,
  addTokenToBlacklist,
  cleanupExpiredBlacklistedTokens,
  revokeUserRefreshSession,
  handleRefreshTokenReuse
};
