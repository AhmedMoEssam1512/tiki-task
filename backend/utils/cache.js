// backend/utils/cache.js

// In-memory cache store (Map)
const cache = new Map();

/**
 * Insert a value into the cache with optional expiration
 * @param {string} key - Unique identifier for the cached item
 * @param {any} value - The value to store
 * @param {number} ttlSeconds - Time to live in seconds (optional, 0 = no expiry)
 * @returns {boolean} Success status
 */
const insert = (key, value, ttlSeconds = 0) => {
  // Clear any existing timeout for this key
  const existing = cache.get(key);
  if (existing && existing.timeoutId) {
    clearTimeout(existing.timeoutId);
  }

  let timeoutId = null;

  // Set auto-expiration if TTL provided
  if (ttlSeconds > 0) {
    timeoutId = setTimeout(() => {
      cache.delete(key);
    }, ttlSeconds * 1000);
  }

  // Store value with expiration metadata
  cache.set(key, {
    value,
    expiresAt: ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null,
    timeoutId
  });

  return true;
};

/**
 * Get a value from the cache
 * @param {string} key - Unique identifier for the cached item
 * @returns {any|null} The cached value or null if not found/expired
 */
const get = (key) => {
  const item = cache.get(key);

  // Key doesn't exist
  if (!item) return null;

  // Check if expired
  if (item.expiresAt && Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }

  return item.value;
};

/**
 * Delete a specific key from the cache
 * @param {string} key - The key to delete
 * @returns {boolean} True if deleted, false if not found
 */
const remove = (key) => {
  const item = cache.get(key);
  if (item && item.timeoutId) {
    clearTimeout(item.timeoutId);
  }
  return cache.delete(key);
};

/**
 * Check if a key exists in the cache (and is not expired)
 * @param {string} key - The key to check
 * @returns {boolean} True if exists and valid
 */
const has = (key) => {
  return get(key) !== null;
};

/**
 * Clear the entire cache
 */
const clear = () => {
  // Clear all timeouts
  for (const [, item] of cache.entries()) {
    if (item.timeoutId) {
      clearTimeout(item.timeoutId);
    }
  }
  cache.clear();
};

/**
 * Get cache statistics (for monitoring/debugging)
 * @returns {object} Cache stats
 */
const getStats = () => {
  const now = Date.now();
  let active = 0;
  let expired = 0;

  for (const [, item] of cache.entries()) {
    if (!item.expiresAt || now <= item.expiresAt) {
      active++;
    } else {
      expired++;
    }
  }

  return {
    total: cache.size,
    active,
    expired
  };
};

/**
 * Cleanup all expired entries (manual trigger)
 * @returns {number} Number of entries cleaned
 */
const cleanup = () => {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, item] of cache.entries()) {
    if (item.expiresAt && now > item.expiresAt) {
      if (item.timeoutId) {
        clearTimeout(item.timeoutId);
      }
      cache.delete(key);
      cleaned++;
    }
  }

  return cleaned;
};

/**
 * Update metadata for a cached item (e.g., mark OTP as confirmed)
 * @param {string} key - The cache key
 * @param {object} updates - Fields to update (e.g., { confirmed: true })
 * @returns {boolean} True if updated, false if key not found
 */
const updateMetadata = (key, updates) => {
  const item = cache.get(key);
  
  if (!item) return false;
  
  // Merge updates into the item
  Object.assign(item, updates);
  
  // Re-set in Map to ensure reference is updated
  cache.set(key, item);
  
  return true;
};

// ... rest of existing code ...

// Export public API
module.exports = {
  insert,
  get,
  remove,
  has,
  clear,
  getStats,
  cleanup,
  updateMetadata,  // ← NEW: Export the new function
  
  _getCache: () => cache
};