const CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
  "form-action 'none'",
  "connect-src 'self'",
  "img-src 'self' data: blob: https://api.edu-sipikat.com",
  "manifest-src 'self'",
  "object-src 'none'",
  "script-src 'none'",
  "style-src 'none'",
  "upgrade-insecure-requests",
].join('; ');

const setSecurityHeaders = (req, res, next) => {
  const forwardedProtoHeader = req.headers['x-forwarded-proto'];
  const forwardedProto = Array.isArray(forwardedProtoHeader)
    ? forwardedProtoHeader[0]
    : forwardedProtoHeader;
  const isHttps = req.secure || forwardedProto === 'https';

  res.set({
    'Content-Security-Policy': CONTENT_SECURITY_POLICY,
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  });

  if (isHttps) {
    res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
};

module.exports = {
  CONTENT_SECURITY_POLICY,
  setSecurityHeaders,
};
