const jwt = require('jsonwebtoken');

// This function runs BEFORE any protected route handler.
// It checks: "Does this request have a valid login token?"
// If yes -> let the request continue (call next())
// If no -> send back 401 Unauthorized and STOP (do not call next())
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization; // expected format: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not logged in. Please log in to continue.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info (id, username) to the request for later use
    next(); // token is valid, proceed to the actual route
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }
}

module.exports = requireAuth;
