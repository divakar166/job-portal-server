const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'jobportal';

const generateToken = (userId, userType) => {
  return jwt.sign({ id: userId, type: userType }, JWT_SECRET, { expiresIn: '1h' });
};

module.exports = { generateToken };
