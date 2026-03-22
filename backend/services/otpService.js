// backend/services/otpService.js
const cache = require('../utils/cache');

const OTP_TTL_SECONDS = 15 * 60; // 15 minutes
const OTP_LENGTH = 6;

/**
 * Generate a random 6-digit numeric OTP
 */
const generateOTP = () => {
  return Math.floor(
    Math.pow(10, OTP_LENGTH - 1) + Math.random() * 9 * Math.pow(10, OTP_LENGTH - 1)
  ).toString();
};

/**
 * Store OTP in cache with confirmed: false
 */
const storeOTP = (userId, otp) => {
  return cache.insert(`otp:${userId}`, otp, OTP_TTL_SECONDS);
};

/**
 * Verify OTP (check code) - does NOT mark as confirmed yet
 * @returns {boolean} True if OTP matches
 */
const verifyOTP = (userId, otp) => {
  const item = cache._getCache().get(`otp:${userId}`);
  
  // Check all conditions
  if (!item) return false;
  if (item.expiresAt && Date.now() > item.expiresAt) {
    cache.remove(`otp:${userId}`);
    return false;
  }
  if (item.value !== otp) return false;
  
  return true; // OTP matches, but NOT confirmed yet
};

/**
 * Mark OTP as confirmed (after successful verification)
 */
const confirmOTP = (userId) => {
  return cache.updateMetadata(`otp:${userId}`, { confirmed: true });
};

/**
 * Check if OTP is confirmed
 */
const isOTPConfirmed = (userId) => {
  const item = cache._getCache().get(`otp:${userId}`);
  return item?.confirmed === true;
};

/**
 * Complete password reset: verify confirmed + delete record
 * @returns {boolean} True if successful
 */
const completeReset = (userId) => {
  const item = cache._getCache().get(`otp:${userId}`);
  
  // Must exist AND be confirmed
  if (!item || !item.confirmed) {
    return false;
  }
  
  // Delete the record (one-time use)
  cache.remove(`otp:${userId}`);
  return true;
};

/**
 * Check if user has an active OTP (for rate limiting)
 */
const hasActiveOTP = (userId) => {
  return cache.has(`otp:${userId}`);
};

/**
 * Clear OTP for a user (manual cleanup)
 */
const clearOTP = (userId) => {
  return cache.remove(`otp:${userId}`);
};

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,      // Step 2a: Check OTP code
  confirmOTP,     // Step 2b: Mark as confirmed
  isOTPConfirmed, // Step 3: Check before password change
  completeReset,  // Step 3: Verify + delete
  hasActiveOTP,
  clearOTP
};