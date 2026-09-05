const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'suraksha-drishti-sih2026-super-secure-key';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired session token' });
    }
    req.user = user;
    next();
  });
}

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Unauthorized. Required role: ${allowedRoles.join(' or ')}`
      });
    }
    next();
  };
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requireRole
};
