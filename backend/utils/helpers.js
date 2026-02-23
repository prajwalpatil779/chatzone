/**
 * Utility Functions
 * Helper functions for various operations
 */

const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId, iat: Math.floor(Date.now() / 1000) },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Format response
const formatResponse = (success, message, data = null, error = null) => {
  return {
    success,
    message,
    data,
    ...(error && { error }),
  };
};

// Validate ObjectId
const isValidObjectId = (id) => {
  return require('mongoose').Types.ObjectId.isValid(id);
};

// Get pagination params
const getPaginationParams = (page = 1, limit = 20) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(parseInt(limit), 100); // Max 100 per page
  const skip = (pageNum - 1) * limitNum;

  return { skip, limit: limitNum, page: pageNum };
};

module.exports = {
  generateToken,
  formatResponse,
  isValidObjectId,
  getPaginationParams,
};
