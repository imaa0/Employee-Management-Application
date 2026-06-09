const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "workmate-ems-secret-key-change-in-prod";
const JWT_EXPIRES_IN = "24h";

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Middleware: require a valid JWT in Authorization header
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Unauthorized – no token provided" });
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, error: "Unauthorized – invalid or expired token" });
  }

  req.user = payload;
  next();
}

/**
 * Middleware: require specific role(s)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "Forbidden – insufficient permissions" });
    }
    next();
  };
}

module.exports = { generateToken, verifyToken, requireAuth, requireRole };
