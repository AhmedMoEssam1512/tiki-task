const logger = require('../config/logger');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // Get authorization header (case-insensitive)
  const authHeader = req.headers.authorization || req.headers['Authorization'];

  // Check if header exists and starts with 'Bearer'
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.debug('Token required - Bearer token not found');
    return next(new AppError('Token required', 401));
  }

  // Extract token (remove 'Bearer ' prefix)
  const token = authHeader.split(' ')[1];

  if (!token) {
    logger.debug('Token required - Token is empty');
    return next(new AppError('Token required', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      logger.debug('Invalid token payload - No user ID');
      return next(new AppError('Invalid token payload', 401));
    }

    req.user = {
      id: decoded.id,
    };
    logger.debug(`User authenticated successfully: ${JSON.stringify(req.user)}`);
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      logger.debug('Invalid token - JsonWebTokenError');
      return next(new AppError('Invalid token', 401));
    }
    if (err.name === 'TokenExpiredError') {
      logger.debug('Token expired - TokenExpiredError');
      return next(new AppError('Token expired', 401));
    }
    logger.debug(`Authentication failed: ${err.message}`);
    return next(new AppError('Authentication failed', 401));
  }
};

module.exports = {
  protect
};