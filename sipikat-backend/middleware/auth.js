const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  // Read token from cookie instead of Authorization header
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ 
      message: 'No token provided',
      authenticated: false 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        message: 'Invalid or expired token',
        authenticated: false 
      });
    }
    
    // Attach user info to request
    req.user = decoded.user;
    next();
  });
};

module.exports = authenticateToken;