/**
 * Leaflet + OpenStreetMap Provider
 *
 * Provides OSM-based mapping with Nominatim geocoding and OSRM routing.
 * Implements MapProviderInterface with full feature parity to Google Maps.
 */

import { MapProviderInterface } from './MapProviderInterface.js'
import { NominatimService } from '../services/nominatim.js'

export class LeafletProvider extends MapProviderInterface {
  constructor(config = {}) {
    super()
    this.config = config
    this.nominatim = new NominatimService({
      url: config.nominatimUrl || 'https://nominatim.openstreetmap.org',
      userAgent: config.userAgent || 'ADCommerce/2.1.0 (https://adcommerce.mn; contact@adcommerce.mn)'
    })
    this.osrmUrl = config.osrmUrl || 'https://router.project-osrm.org'
    this.tileUrl = config.tileUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    this.attribution = config.attribution || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    this._available = false
    this._initialized = false
    this._L = null
  }

  get name() {
    return 'leaflet'
  }

  get available() {
    return this._available
  }

  /**
   * Initialize Leaflet (dynamic import)
   * @returns {Promise<boolean>}
   */
  async initialize() {
    if (this._initialized) {
      return this._available
    }

    try {
      // Dynamic import of Leaflet (client-side only)
      if (typeof window !== 'undefined') {
        this._L = await import('leaflet')
        this._available = true
      }
    } catch (error) {
      console.error('[Leaflet] Initialization failed:', error)
      this._available = false
    }

    this._initialized = true
    return this._available
  }

  /**
   * Get Leaflet library instance
   */
  getL() {
    if (!this._L) {
      throw new Error('Leaflet not initialized. Call initialize() first.')
    }
    return this._L.default || this._L
  }

  /**
   * Get browser location
   */
  async getBrowserLocation() {
    return new Promise((resolve, reject) => {
      if (typeof navigator !== 'undefined') {
        if (navigator && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('[Leaflet] Browser location obtained:', position.coords)
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              })
            },
            (error) => {
              console.error('[Leaflet] Geolocation error:', error.message)
              // Resolve with null instead of reject to maintain backwards compatibility
              resolve(null)
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          )
        } else {
          console.warn('[Leaflet] Geolocation not supported')
          resolve(null)
        }
      } else {
        console.warn('[Leaflet] Navigator not available')
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
      console.error('[Leaflet] Geolocation failed:', err)
      throw err
    }
  }

  /**
   * Search for addresses (Nominatim)
   * Returns Google Places-compatible format
   */
  async typeSearchGoogle(value) {
    try {
      const results = await this.nominatim.search(value, { limit: 5 })

      // Transform to Google Places format
      const predictions = results.map(result => ({
        description: result.display_name,
        place_id: result.place_id,
        structured_formatting: {
          main_text: result.display_name.split(',')[0],
          secondary_text: result.display_name.split(',').slice(1).join(',').trim()
        },
        _nominatim: result // Keep original data
      }))

      return {
        predictions,
        status: 'OK'
      }
    } catch (err) {
      console.error('[Leaflet] Search failed:', err)
      return {
        predictions: [],
        status: 'ERROR'
      }
    }
  }

  /**
   * Geocode address to coordinates (Nominatim)
   */
  async addressToLatLng(address) {
    try {
      const results = await this.nominatim.search(address, { limit: 1 })

      if (results && results.length > 0) {
        const result = results[0]

        // Transform to Google Geocoding format
        return {
          results: [{
            place_id: result.place_id,
            formatted_address: result.display_name,
            geometry: {
              location: {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon)
              }
            },
            address_components: this._nominatimToAddressComponents(result.address),
            _nominatim: result
          }],
          status: 'OK'
        }
      }

      return {
        results: [],
        status: 'ZERO_RESULTS'
      }
    } catch (err) {
      console.error('[Leaflet] Geocoding failed:', err)
      return {
        results: [],
        status: 'ERROR'
      }
    }
  }

  /**
   * Reverse geocode coordinates to address (Nominatim)
   */
  async latLngToAddress(lat, lng) {
    try {
      const result = await this.nominatim.reverse(lat, lng)

      if (result) {
        // Transform to Google Place format
        return {
          place_id: result.place_id,
          formatted_address: result.display_name,
          geometry: {
            location: {
              lat: parseFloat(result.lat),
              lng: parseFloat(result.lon)
            }
          },
          address_components: this._nominatimToAddressComponents(result.address),
          _nominatim: result
        }
      }

      return null
    } catch (err) {
      console.error('[Leaflet] Reverse geocoding failed:', err)
      throw err
    }
  }

  /**
   * Get directions between two addresses (OSRM)
   */
  async getDirections(address1, address2) {
    try {
      // Geocode both addresses first
      const origin = await this.addressToLatLng(address1)
      const destination = await this.addressToLatLng(address2)

      if (!origin.results.length || !destination.results.length) {
        return {
          routes: [],
          status: 'ZERO_RESULTS'
        }
      }

      const originLoc = origin.results[0].geometry.location
      const destLoc = destination.results[0].geometry.location

      // Call OSRM routing API
      const url = `${this.osrmUrl}/route/v1/driving/${originLoc.lng},${originLoc.lat};${destLoc.lng},${destLoc.lat}?overview=full&steps=true`

      const data = await $fetch(url, { method: 'get' })

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0]

        // Transform to Google Directions format
        return {
          routes: [{
            legs: [{
              distance: {
                text: `${(route.distance / 1000).toFixed(1)} km`,
                value: route.distance
              },
              duration: {
                text: `${Math.round(route.duration / 60)} min`,
                value: route.duration
              },
              start_address: address1,
              end_address: address2,
              start_location: originLoc,
              end_location: destLoc,
              steps: route.legs[0].steps.map(step => ({
                distance: {
                  text: `${step.distance} m`,
                  value: step.distance
                },
                duration: {
                  text: `${Math.round(step.duration)} sec`,
                  value: step.duration
                },
                html_instructions: step.maneuver.type,
                travel_mode: 'DRIVING'
              }))
            }],
            overview_polyline: route.geometry
          }],
          status: 'OK'
        }
      }

      return {
        routes: [],
        status: 'ZERO_RESULTS'
      }
    } catch (err) {
      console.error('[Leaflet] Directions failed:', err)
      return {
        routes: [],
        status: 'ERROR'
      }
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
   * Create Leaflet map instance
   */
  createMap(elementId, options = {}) {
    const L = this.getL()

    const element = typeof elementId === 'string'
      ? document.getElementById(elementId)
      : elementId

    const map = L.map(element, {
      center: options.center || [47.9173341, 106.9155],
      zoom: options.zoom || 15,
      zoomControl: options.zoomControl !== false,
      attributionControl: options.attributionControl !== false
    })

    // Add tile layer
    L.tileLayer(this.tileUrl, {
      attribution: this.attribution,
      maxZoom: 19
    }).addTo(map)

    return map
  }

  /**
   * Create Leaflet marker
   */
  createMarker(position, options = {}) {
    const L = this.getL()

    // Convert {lat, lng} to [lat, lng] if needed
    const latlng = Array.isArray(position)
      ? position
      : [position.lat, position.lng]

    return L.marker(latlng, {
      draggable: options.draggable || false,
      ...options
    })
  }

  /**
   * Create Leaflet popup (InfoWindow equivalent)
   */
  createInfoWindow(options = {}) {
    const L = this.getL()

    return L.popup({
      content: options.content || '',
      ...options
    })
  }

  /**
   * Transform Nominatim address to Google address_components format
   * @private
   */
  _nominatimToAddressComponents(address) {
    if (!address) return []

    const components = []

    if (address.house_number) {
      components.push({
        long_name: address.house_number,
        short_name: address.house_number,
        types: ['street_number']
      })
    }

    if (address.road) {
      components.push({
        long_name: address.road,
        short_name: address.road,
        types: ['route']
      })
    }

    if (address.suburb || address.neighbourhood) {
      components.push({
        long_name: address.suburb || address.neighbourhood,
        short_name: address.suburb || address.neighbourhood,
        types: ['sublocality_level_1', 'sublocality', 'political']
      })
    }

    if (address.city || address.town || address.village) {
      components.push({
        long_name: address.city || address.town || address.village,
        short_name: address.city || address.town || address.village,
        types: ['locality', 'political']
      })
    }

    if (address.county) {
      components.push({
        long_name: address.county,
        short_name: address.county,
        types: ['administrative_area_level_2', 'political']
      })
    }

    if (address.state) {
      components.push({
        long_name: address.state,
        short_name: address.state,
        types: ['administrative_area_level_1', 'political']
      })
    }

    if (address.postcode) {
      components.push({
        long_name: address.postcode,
        short_name: address.postcode,
        types: ['postal_code']
      })
    }

    if (address.country) {
      components.push({
        long_name: address.country,
        short_name: address.country_code ? address.country_code.toUpperCase() : '',
        types: ['country', 'political']
      })
    }

    return components
  }
}

export default LeafletProvider
