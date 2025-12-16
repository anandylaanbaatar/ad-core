/**
 * Google Maps Provider
 *
 * Wraps existing Google Maps functionality in the MapProviderInterface.
 * Maintains backward compatibility with current implementation.
 */

import { MapProviderInterface } from './MapProviderInterface.js'

export class GoogleMapsProvider extends MapProviderInterface {
  constructor(config = {}) {
    super()
    this.config = config
    this.apiKey = config.apiKey
    this.cors = config.cors
    this._available = false
    this._initialized = false
  }

  get name() {
    return 'google'
  }

  get available() {
    return this._available
  }

  /**
   * Initialize Google Maps (check if script loaded)
   * @returns {Promise<boolean>}
   */
  async initialize() {
    if (this._initialized) {
      return this._available
    }

    // Check if Google Maps is available
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      this._available = true
      this._initialized = true
      return true
    }

    // Wait up to 5 seconds for script to load
    const timeout = 5000
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        this._available = true
        this._initialized = true
        return true
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    this._available = false
    this._initialized = true
    return false
  }

  /**
   * Get browser location
   */
  async getBrowserLocation() {
    return new Promise((resolve) => {
      if (typeof navigator !== 'undefined') {
        if (navigator && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            })
          }, () => {
            resolve(null)
          })
        } else {
          resolve(null)
        }
      } else {
        resolve(null)
      }
    })
  }

  /**
   * IP-based geolocation
   */
  async geoLocation() {
    const url = `http://ip-api.com/json/`

    try {
      const data = await $fetch(url, { method: 'get' })
      return data
    } catch (err) {
      console.error('[GoogleMaps] Geolocation failed:', err)
      throw err
    }
  }

  /**
   * Search for addresses (Google Places Autocomplete API)
   */
  async typeSearchGoogle(value) {
    const address = encodeURIComponent(value)
    const url = `${this.cors}/https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${address}&types=geocode&key=${this.apiKey}`

    try {
      const data = await $fetch(url, { method: 'get' })
      return data
    } catch (err) {
      console.error('[GoogleMaps] Search failed:', err)
      throw err
    }
  }

  /**
   * Geocode address to coordinates
   */
  async addressToLatLng(value) {
    const address = encodeURIComponent(value)
    const url = `${this.cors}/https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${this.apiKey}`

    try {
      const data = await $fetch(url, { method: 'get' })
      return data
    } catch (err) {
      console.error('[GoogleMaps] Geocoding failed:', err)
      throw err
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async latLngToAddress(lat, lng) {
    const url = `${this.cors}/https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`

    try {
      const data = await $fetch(url, { method: 'get' })
      if (data.results && data.results.length > 0) {
        return data.results[0]
      }
      return null
    } catch (err) {
      console.error('[GoogleMaps] Reverse geocoding failed:', err)
      throw err
    }
  }

  /**
   * Get directions between two addresses
   */
  async getDirections(address1, address2) {
    const faddress1 = address1.replace(/ /g, '+')
    const faddress2 = address2.replace(/ /g, '+')
    const url = `${this.cors}/https://maps.googleapis.com/maps/api/directions/json?origin=${faddress1}&destination=${faddress2}&key=${this.apiKey}`

    try {
      const data = await $fetch(url, { method: 'get' })
      return data
    } catch (err) {
      console.error('[GoogleMaps] Directions failed:', err)
      throw err
    }
  }

  /**
   * Format address object to string
   */
  formatAddress(address) {
    if (!address) return ''

    let formattedAddress = ''

    const addSep = (sep) => {
      if (formattedAddress !== '') {
        const separator = sep || ', '
        formattedAddress += separator
      }
    }

    if (address.address2) {
      addSep()
      formattedAddress += address.address2
    }
    if (address.address1) {
      addSep(' - ')
      formattedAddress += address.address1
    }
    if (address.province) {
      addSep()
      formattedAddress += address.province
    }
    if (address.city) {
      addSep()
      formattedAddress += address.city
    }
    if (address.zip) {
      formattedAddress += ' '
      formattedAddress += address.zip
    }
    if (address.country) {
      formattedAddress += ', '
      formattedAddress += address.country
    }

    return formattedAddress
  }

  /**
   * Create Google Map instance
   * Note: Components will use google.maps.Map directly
   */
  createMap(elementId, options) {
    throw new Error('Use google.maps.Map directly in components for Google Maps')
  }

  /**
   * Create Google Marker instance
   * Note: Components will use google.maps.Marker directly
   */
  createMarker(position, options) {
    throw new Error('Use google.maps.Marker directly in components for Google Maps')
  }

  /**
   * Create Google InfoWindow instance
   * Note: Components will use google.maps.InfoWindow directly
   */
  createInfoWindow(options) {
    throw new Error('Use google.maps.InfoWindow directly in components for Google Maps')
  }
}

export default GoogleMapsProvider
