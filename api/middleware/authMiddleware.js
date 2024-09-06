const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) { // Log errors for debugging
      return res.sendStatus(403);
    }
    req.user = user.developer; // Attach the decoded user to the request
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = { authenticateToken };
