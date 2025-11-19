require('dotenv').config();

// JWT Configuration
const jwtConfig = {
  // Access Token Configuration
  accessToken: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    }
  },

  // Refresh Token Configuration
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE) || 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    }
  }
};

// Validate JWT secrets on startup
const validateSecrets = () => {
  const minSecretLength = 64; // 256 bits

  if (!jwtConfig.accessToken.secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  if (!jwtConfig.refreshToken.secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  }

  if (jwtConfig.accessToken.secret.length < minSecretLength) {
    console.warn(`⚠️  WARNING: JWT_SECRET should be at least ${minSecretLength} characters for security`);
  }

  if (jwtConfig.refreshToken.secret.length < minSecretLength) {
    console.warn(`⚠️  WARNING: JWT_REFRESH_SECRET should be at least ${minSecretLength} characters for security`);
  }

  if (jwtConfig.accessToken.secret === jwtConfig.refreshToken.secret) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different');
  }

  console.log('✅ JWT configuration validated successfully');
};

// Run validation
validateSecrets();

module.exports = jwtConfig;