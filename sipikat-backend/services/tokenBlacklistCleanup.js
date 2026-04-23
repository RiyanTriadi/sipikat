const { cleanupExpiredBlacklistedTokens } = require('../utils/tokenService');

const DEFAULT_INTERVAL_MS = 60 * 60 * 1000;

const runBlacklistCleanup = async () => {
  try {
    const deletedCount = await cleanupExpiredBlacklistedTokens();
    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} expired blacklisted tokens`);
    }
  } catch (error) {
    console.error('Failed to clean token blacklist:', error.message);
  }
};

const startTokenBlacklistCleanup = () => {
  runBlacklistCleanup();

  const intervalMs = parseInt(process.env.TOKEN_BLACKLIST_CLEANUP_INTERVAL_MS, 10) || DEFAULT_INTERVAL_MS;
  return setInterval(runBlacklistCleanup, intervalMs);
};

module.exports = {
  runBlacklistCleanup,
  startTokenBlacklistCleanup
};
