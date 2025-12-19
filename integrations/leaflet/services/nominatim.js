/**
 * Nominatim Service
 *
 * OpenStreetMap Nominatim API client with usage policy compliance:
 * - Rate limiting: 1 request per second
 * - Caching: 24-hour cache with LRU eviction
 * - User-Agent: Identifies application
 * - Attribution: Required on map display
 *
 * Usage Policy: https://operations.osmfoundation.org/policies/nominatim/
 */

export class NominatimService {
  constructor(config = {}) {
    this.baseUrl = config.url || 'https://nominatim.openstreetmap.org'
    this.userAgent = config.userAgent || 'ADCommerce/2.1.0 (https://adcommerce.mn; contact@adcommerce.mn)'

    // Rate limiting: 1 req/sec
    this.lastRequestTime = 0
    this.minRequestInterval = 1000 // milliseconds

    // Cache: 24-hour LRU with 100-entry limit
    this.cache = new Map()
    this.cacheMaxSize = config.cacheMaxSize || 100
    this.cacheDuration = config.cacheDuration || 24 * 60 * 60 * 1000 // 24 hours
  }

  /**
   * Enforce rate limiting (1 req/sec)
   * @private
   */
  async _rateLimit() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    this.lastRequestTime = Date.now()
  }

  /**
   * Get from cache if available and not expired
   * @private
   */
  _getFromCache(key) {
    const cached = this.cache.get(key)

    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > this.cacheDuration) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  /**
   * Store in cache with LRU eviction
   * @private
   */
  _storeInCache(key, data) {
    // LRU eviction: remove oldest entry if cache is full
    if (this.cache.size >= this.cacheMaxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Make API request with rate limiting and caching
   * @private
   */
  async _request(endpoint, params = {}) {
    // Add format and addressdetails to all requests
    const queryParams = {
      format: 'json',
      addressdetails: 1,
      ...params
    }

    // Build cache key
    const cacheKey = `${endpoint}:${JSON.stringify(queryParams)}`

    // Check cache first
    const cached = this._getFromCache(cacheKey)
    if (cached) {
      return cached
    }

    // Rate limit
    await this._rateLimit()

    // Build URL
    const url = new URL(endpoint, this.baseUrl)
    Object.keys(queryParams).forEach(key => {
      url.searchParams.append(key, queryParams[key])
    })

    // Make request
    try {
      const response = await $fetch(url.toString(), {
        headers: {
          'User-Agent': this.userAgent
        }
      })

      // Cache result
      this._storeInCache(cacheKey, response)

      return response
    } catch (error) {
      console.error('[Nominatim] Request failed:', error)
      throw error
    }
  }

  /**
   * Search for addresses
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async search(query, options = {}) {
    const params = {
      q: query,
      limit: options.limit || 5,
      ...options
    }

    return await this._request('/search', params)
  }

  /**
   * Reverse geocoding (coordinates → address)
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {Object} options - Options
   * @returns {Promise<Object>} Place object
   */
  async reverse(lat, lng, options = {}) {
    const params = {
      lat,
      lon: lng,
      ...options
    }

    return await this._request('/reverse', params)
  }

  /**
   * Lookup by OSM ID
   * @param {string} osmId - OSM ID (e.g., "R12345")
   * @param {Object} options - Options
   * @returns {Promise<Object>} Place object
   */
  async lookup(osmId, options = {}) {
    const params = {
      osm_ids: osmId,
      ...options
    }

    return await this._request('/lookup', params)
  }

  /**
   * Clear cache manually
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.cacheMaxSize,
      entries: Array.from(this.cache.keys())
    }
  }
}

export default NominatimService
