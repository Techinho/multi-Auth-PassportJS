// utils/jwtUtils.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Cookie options
const accessTokenCookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: '/',
};

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/auth/refresh-token', // Only sent to refresh endpoint
};

// Generate access token (short-lived)
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user._id || user.id, 
      email: user.email,
      type: 'access'
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Generate refresh token (long-lived)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      id: user._id || user.id, 
      email: user.email,
      type: 'refresh'
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

// Verify access token
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Hash refresh token for storage
const hashToken = async (token) => {
  return await bcrypt.hash(token, 10);
};

// Compare refresh token
const compareToken = async (token, hashedToken) => {
  return await bcrypt.compare(token, hashedToken);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  compareToken,
  accessTokenCookieOptions,
  refreshTokenCookieOptions
};