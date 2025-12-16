/**
 * Map Provider Interface
 *
 * Defines the contract that all map providers must implement.
 * This abstraction allows seamless switching between Google Maps, Leaflet, Mapbox, etc.
 */

export class MapProviderInterface {
  constructor() {
    if (new.target === MapProviderInterface) {
      throw new TypeError("Cannot construct MapProviderInterface instances directly")
    }
  }

  /**
   * Provider identifier
   * @type {string}
   */
  get name() {
    throw new Error("Method 'name' must be implemented")
  }

  /**
   * Whether provider is available and ready to use
   * @type {boolean}
   */
  get available() {
    throw new Error("Method 'available' must be implemented")
  }

  /**
   * Initialize the provider (load scripts, check availability)
   * @returns {Promise<boolean>} True if initialization successful
   */
  async initialize() {
    throw new Error("Method 'initialize()' must be implemented")
  }

  /**
   * Get user's current location from browser GPS
   * @returns {Promise<{lat: number, lng: number}|null>}
   */
  async getBrowserLocation() {
    throw new Error("Method 'getBrowserLocation()' must be implemented")
  }

  /**
   * Get location from IP address (fallback geolocation)
   * @returns {Promise<Object>}
   */
  async geoLocation() {
    throw new Error("Method 'geoLocation()' must be implemented")
  }

  /**
   * Search for addresses (autocomplete)
   * @param {string} value - Search query
   * @returns {Promise<Object>} Search results with predictions array
   */
  async typeSearchGoogle(value) {
    throw new Error("Method 'typeSearchGoogle()' must be implemented")
  }

  /**
   * Convert address string to coordinates (geocoding)
   * @param {string} address - Address to geocode
   * @returns {Promise<Object>} Results with geometry.location
   */
  async addressToLatLng(address) {
    throw new Error("Method 'addressToLatLng()' must be implemented")
  }

  /**
   * Convert coordinates to address (reverse geocoding)
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Place object with address components
   */
  async latLngToAddress(lat, lng) {
    throw new Error("Method 'latLngToAddress()' must be implemented")
  }

  /**
   * Calculate route between two addresses
   * @param {string} origin - Starting address
   * @param {string} destination - Ending address
   * @returns {Promise<Object>} Routes with legs, steps, distance, duration
   */
  async getDirections(origin, destination) {
    throw new Error("Method 'getDirections()' must be implemented")
  }

  /**
   * Format address object to readable string
   * @param {Object} address - Address object
   * @returns {string} Formatted address string
   */
  formatAddress(address) {
    throw new Error("Method 'formatAddress()' must be implemented")
  }

  /**
   * Create a map instance
   * @param {string|HTMLElement} elementId - Map container ID or element
   * @param {Object} options - Map configuration options
   * @returns {Object} Map instance
   */
  createMap(elementId, options) {
    throw new Error("Method 'createMap()' must be implemented")
  }

  /**
   * Create a marker instance
   * @param {Object|Array} position - Marker position {lat, lng} or [lat, lng]
   * @param {Object} options - Marker options
   * @returns {Object} Marker instance
   */
  createMarker(position, options) {
    throw new Error("Method 'createMarker()' must be implemented")
  }

  /**
   * Create an info window/popup
   * @param {Object} options - Info window options
   * @returns {Object} Info window instance
   */
  createInfoWindow(options) {
    throw new Error("Method 'createInfoWindow()' must be implemented")
  }
}

export default MapProviderInterface
