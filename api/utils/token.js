const jwt = require('jsonwebtoken');

// Your secret key for signing tokens
const JWT_SECRET = process.env.JWT_SECRET || 'jobportal';

// Generate a token
const generateToken = (userId, userType) => {
  return jwt.sign({ id: userId, type: userType }, JWT_SECRET, { expiresIn: '1h' });
};

module.exports = { generateToken };
