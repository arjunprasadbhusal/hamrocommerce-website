// API Cache utility for frontend
// Caches API responses in memory for faster subsequent requests

class APICache {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes default TTL
  }

  // Generate cache key from URL and params
  generateKey(url, params = {}) {
    return `${url}_${JSON.stringify(params)}`;
  }

  // Get cached data
  get(url, params = {}) {
    const key = this.generateKey(url, params);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // Set cache data
  set(url, params = {}, data, customTTL = null) {
    const key = this.generateKey(url, params);
    const ttl = customTTL || this.ttl;

    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  }

  // Clear specific cache
  clear(url, params = {}) {
    const key = this.generateKey(url, params);
    this.cache.delete(key);
  }

  // Clear all cache
  clearAll() {
    this.cache.clear();
  }

  // Clear expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const apiCache = new APICache();

// Enhanced fetch with caching
export const cachedFetch = async (url, options = {}, cacheTTL = null) => {
  const cacheKey = url;
  
  // Check cache first for GET requests
  if (!options.method || options.method === 'GET') {
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log(`[Cache HIT] ${url}`);
      return { data: cached, fromCache: true };
    }
  }

  console.log(`[Cache MISS] ${url}`);
  
  // Fetch from API
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    // Cache successful GET requests
    if ((!options.method || options.method === 'GET') && response.ok) {
      apiCache.set(cacheKey, {}, data, cacheTTL);
    }

    return { data, fromCache: false };
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Cleanup expired cache every 5 minutes
setInterval(() => {
  apiCache.cleanup();
}, 5 * 60 * 1000);

export default apiCache;
