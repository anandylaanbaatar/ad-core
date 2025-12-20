<template>
  <div class="mapArea">
    <div id="infowindow-content">
      <span id="place-address"></span>
    </div>

    <div class="relative">
      <InputGroup class="searchAddressInputGroup relative">
        <InputGroupAddon class="bg-transparent pr-0">
          <i class="pi pi-search"></i>
        </InputGroupAddon>
        <InputText
          id="searchAddress"
          ref="searchAddress"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          :placeholder="$utils.t('Search address')"
          class="searchAddressInput"
        />
        <InputGroupAddon class="p-0 m-0 bg-transparent w-12rem">
          <Button
            :label="$utils.t('Find Address')"
            icon="pi pi-map-marker"
            class="w-full h-full m-0 sm"
            severity="secondary"
            @click="getBrowserLocation"
          ></Button>
        </InputGroupAddon>
      </InputGroup>

      <!-- Search Results Dropdown (Leaflet only) -->
      <div
        v-if="isLeaflet && showSearchResults && searchResults.length > 0"
        class="search-results-dropdown"
      >
        <div
          v-for="(result, index) in searchResults"
          :key="result.place_id || index"
          class="search-result-item"
          @click="selectSearchResult(result)"
        >
          <i class="pi pi-map-marker mr-2"></i>
          <div class="result-content">
            <div class="result-main">{{ result.structured_formatting?.main_text || result.description.split(',')[0] }}</div>
            <div class="result-secondary">{{ result.structured_formatting?.secondary_text || result.description.split(',').slice(1).join(',') }}</div>
          </div>
        </div>
      </div>
    </div>

    <div id="map"></div>

    <!-- Loader overlay -->
    <div v-if="isLoading" class="map-loader-overlay">
      <Loader type="md" color="primary"></Loader>
      <p class="mt-2">{{ $utils.t("Getting address...") }}</p>
    </div>

    <label class="w-full">
      <i class="pi pi-map-marker"></i>
      {{ $utils.t("Click or Drag marker to find address.") }}
    </label>
  </div>
</template>

<script>
/**
 * Shared Address Map Component
 *
 * This component provides a unified map interface that automatically uses
 * Leaflet (OpenStreetMap) or Google Maps based on availability and configuration.
 *
 * Provider Priority:
 * 1. Load Leaflet first for fast initial rendering (no API key required)
 * 2. Check if Google Maps is properly configured (NUXT_GOOGLE_MAPS_TOKEN)
 * 3. If Google Maps works, save preference for next session
 *
 * The fallback logic is handled by the map-provider.client.js plugin which:
 * - Initializes Leaflet first for fast loading
 * - Checks if Google Maps is available in the background
 * - Saves Google Maps as preference for subsequent visits if available
 *
 * Usage:
 * <AddressMap :address="addressObject" @geocode="handleGeocode" @loading="handleLoading" />
 *
 * Events:
 * - geocode: Emitted when an address is selected/pinned, returns parsed address object
 * - loading: Emitted when geocoding starts/ends, returns boolean
 */

import {
  parseGooglePlace,
  parseFormattedAddress,
  useAddressParsing,
} from "~/v1/core/composables/useAddressParsing.js"
import { useMapProvider } from "~/v1/core/composables/useMapProvider.js"

export default {
  name: 'AddressMap',

  props: {
    address: {
      type: [String, Object],
      default: null,
    },
    // Default map center (Ulaanbaatar, Mongolia)
    defaultPosition: {
      type: Object,
      default: () => ({
        lat: 47.9173341,
        lng: 106.9155,
      }),
    },
  },

  emits: ['geocode', 'loading'],

  data() {
    return {
      map: null,
      autocomplete: null,
      infowindow: null,
      marker: null,
      formattedAddress: null,
      userGeoInfo: null,
      isLeaflet: false,
      mapPosition: {
        lat: 47.9173341,
        lng: 106.9155,
      },
      searchResults: [],
      showSearchResults: false,
      searchDebounceTimer: null,
      isLoading: false,
    }
  },

  async mounted() {
    console.log("[AddressMap] Address:", this.address)

    // Set default position
    this.mapPosition = { ...this.defaultPosition }

    // Wait for map provider to be available
    const providerReady = await this.waitForMapProvider()
    if (!providerReady) {
      console.error("[AddressMap] No map provider available after waiting")
      return
    }

    // Check which map provider is active
    // Default to Leaflet unless Google Maps is explicitly available
    const { providerName, switchProvider } = useMapProvider()
    const currentProvider = providerName?.value

    console.log("[AddressMap] Current provider:", currentProvider)

    // Default to Leaflet - only use Google Maps if explicitly set as the provider
    if (currentProvider === 'google') {
      // Verify Google Maps API is actually available
      const googleReady = await this.waitForGoogleMaps()
      if (googleReady) {
        this.isLeaflet = false
        console.log("[AddressMap] Using Google Maps")
      } else {
        console.warn("[AddressMap] Google Maps not available, falling back to Leaflet")
        // Try to switch to Leaflet provider
        if (switchProvider) {
          await switchProvider('leaflet')
        }
        this.isLeaflet = true
      }
    } else {
      // Use Leaflet for 'leaflet' provider or if no provider is set
      this.isLeaflet = true
      console.log("[AddressMap] Using Leaflet (default)")
    }

    this.initMap()
  },

  beforeUnmount() {
    this.reset()
    // Clean up event listeners
    if (this.isLeaflet) {
      const searchInput = this.$refs.searchAddress?.$el
      if (searchInput) {
        searchInput.removeEventListener('input', this.handleSearchInput)
        searchInput.removeEventListener('focus', this.handleSearchFocus)
      }
      document.removeEventListener('click', this.handleOutsideClick)
    }
    // Clear debounce timer
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer)
    }
  },

  methods: {
    /**
     * Wait for map provider to be available
     * @param {number} timeout - Max wait time in ms (default 5000)
     * @returns {Promise<boolean>} - True if a map provider is available
     */
    async waitForMapProvider(timeout = 5000) {
      const startTime = Date.now()

      while (Date.now() - startTime < timeout) {
        const { provider } = useMapProvider()
        if (provider?.value) {
          console.log("[AddressMap] Map provider is ready")
          return true
        }
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      console.warn("[AddressMap] Map provider not available after", timeout, "ms")
      return false
    },

    /**
     * Wait for Google Maps API to be available
     * @param {number} timeout - Max wait time in ms (default 5000)
     * @returns {Promise<boolean>} - True if Google Maps is available
     */
    async waitForGoogleMaps(timeout = 5000) {
      const startTime = Date.now()

      while (Date.now() - startTime < timeout) {
        if (typeof window !== 'undefined' && window.google && window.google.maps) {
          console.log("[AddressMap] Google Maps API is ready")
          return true
        }
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      console.warn("[AddressMap] Google Maps API not available after", timeout, "ms")
      return false
    },

    reset() {
      this.map = null
      this.autocomplete = null
      this.infowindow = null
      this.marker = null
      this.formattedAddress = null
      this.userGeoInfo = null
      this.mapPosition = { ...this.defaultPosition }
    },

    async getBrowserLocation() {
      console.log("[AddressMap] Getting browser location...")

      if (!this.map) {
        console.error("[AddressMap] Map not initialized yet")
        return
      }

      try {
        const position = await this.$address.getBrowserLocation()

        console.log("[AddressMap] Browser location:", position)

        if (position) {
          if (this.isLeaflet) {
            console.log("[AddressMap] Updating Leaflet map with browser location")
            this.map.setView([position.lat, position.lng], 18)
            await this.setMarkerLeaflet(position)
            await this.geoCoderByLatLngLeaflet(position.lat, position.lng)
          } else {
            console.log("[AddressMap] Updating Google map with browser location")
            this.map.setZoom(18)
            this.map.setCenter(position)
            this.setMarker(position)
            this.geoCoderByLatLng(position.lat, position.lng)
          }
        } else {
          console.warn("[AddressMap] No position returned from browser")
          this.$nuxt.$bus?.$emit("toast", {
            severity: "warn",
            summary: this.$utils.t("Location Access"),
            detail: this.$utils.t("Unable to get your location. Please enable location access in your browser."),
          })
        }
      } catch (error) {
        console.error("[AddressMap] Failed to get browser location:", error)
        this.$nuxt.$bus?.$emit("toast", {
          severity: "error",
          summary: this.$utils.t("Error"),
          detail: this.$utils.t("Failed to get your location. Please try again."),
        })
      }
    },

    async geoCoderByAddress(address) {
      if (!address) return

      const res = await this.$address.addressToLatLng(address)

      console.log("[AddressMap] Geocode from address to lat lng:", res)

      if (res && res.results && res.results.length > 0) {
        this.mapPosition = {
          lat: res.results[0].geometry.location.lat,
          lng: res.results[0].geometry.location.lng,
        }
      }
    },

    geoCoderByPlace(place) {
      const geocoder = new google.maps.Geocoder()

      geocoder
        .geocode({ placeId: place.place_id })
        .catch((e) => console.log("Geocoder failed due to: " + e))
    },

    geoCoderByLatLng(lat, lng) {
      const geocoder = new google.maps.Geocoder()

      geocoder
        .geocode({
          location: {
            lat: lat,
            lng: lng,
          },
        })
        .then(({ results }) => {
          if (results && results.length > 0) {
            this.formatPlace(results[0])
          }
        })
        .catch((e) => console.log("Geocoder failed due to: " + e))
    },

    async checkDefaultAddress() {
      if (this.address) {
        if (this.address.lat && this.address.lng) {
          this.mapPosition = {
            lat: parseFloat(this.address.lat),
            lng: parseFloat(this.address.lng),
          }
        } else if (typeof this.address === 'string') {
          await this.geoCoderByAddress(this.address)
        } else if (this.address.full_address) {
          await this.geoCoderByAddress(this.address.full_address)
        }
      }
    },

    // Map Initialization
    initMap() {
      setTimeout(async () => {
        await this.checkDefaultAddress()

        if (this.isLeaflet) {
          await this.setMapLeaflet()
          await this.setMarkerLeaflet()
          this.setupLeafletAutocomplete()
        } else {
          await this.setMap()
          this.setInfoWindow()
          this.setAutoComplete()
          await this.setMarker()
        }
      }, 300)
    },

    // Google Maps Methods
    async setMap() {
      const { Map } = await google.maps.importLibrary("maps")

      let mapPosition = this.mapPosition
      let mapZoom = 15

      if (this.address) {
        mapZoom = 18

        if (this.address.lat && this.address.lng) {
          mapPosition = {
            lat: parseFloat(this.address.lat),
            lng: parseFloat(this.address.lng),
          }
        }

        console.log("[AddressMap] Set Map with address:", this.address)
      }

      this.map = new Map(document.getElementById("map"), {
        center: mapPosition,
        mapId: "8e428c2868f9b88e",
        zoom: mapZoom,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })

      this.map.addListener("click", async (event) => {
        const position = event.latLng
        await this.setMarker(position)
        this.map.setCenter(position)
        this.map.setZoom(18)
        this.geoCoderByLatLng(position.lat(), position.lng())
      })
    },

    setCoordinates(lat, lng) {
      this.mapPosition = {
        lat: lat,
        lng: lng,
      }
    },

    setAutoComplete() {
      this.autocomplete = new google.maps.places.Autocomplete(
        document.getElementById("searchAddress"),
        {
          fields: [
            "place_id",
            "address_components",
            "geometry",
            "icon",
            "name",
            "formatted_address",
          ],
          strictBounds: false,
        }
      )
      this.autocomplete.bindTo("bounds", this.map)

      // Events
      this.autocomplete.addListener("place_changed", () => {
        this.infowindow.close()

        const place = this.autocomplete.getPlace()

        if (!place.place_id) {
          return
        }

        const position = place.geometry.location
        this.setMarker(position)
        this.map.setCenter(position)
        this.map.setZoom(18)

        this.geoCoderByPlace(place)
        this.formatPlace(place)
      })
    },

    setInfoWindow() {
      this.infowindow = new google.maps.InfoWindow()
      const infowindowContent = document.getElementById("infowindow-content")
      this.infowindow.setContent(infowindowContent)
    },

    setInfoWindowContent() {
      const position = this.marker.position

      this.infowindow.setContent(`Pin at: ${position.lat()}, ${position.lng()}`)
      this.infowindow.open(this.map, this.marker)
    },

    async setMarker(position) {
      if (this.marker) {
        this.marker.setVisible(false)
        this.marker = null
      }

      let markerPosition = position ? position : this.mapPosition

      const marker = new google.maps.Marker({
        map: this.map,
        position: markerPosition,
        draggable: true,
      })

      // Events
      marker.addListener("click", (event) => {
        const position = event.latLng
        this.map.setCenter(position)
        this.map.setZoom(18)
        this.setInfoWindowContent()
      })

      marker.addListener("dragend", (event) => {
        const position = event.latLng
        this.map.setCenter(position)
        this.map.setZoom(18)
        this.geoCoderByLatLng(position.lat(), position.lng())
      })

      this.marker = marker
    },

    setMapItems(place) {
      // Set Map
      this.map.setZoom(18)
      this.map.setCenter(place.geometry.location)

      // Set Marker
      this.setMarker(place.geometry.location)

      this.marker.setPlace({
        placeId: place.place_id,
        location: place.geometry.location,
      })
      this.marker.setVisible(true)

      // Set InfoWindow
      const infowindowContent = document.getElementById("infowindow-content")

      infowindowContent.children["place-address"].textContent =
        place.formatted_address

      // Set Visible Address
      this.formattedAddress = place.formatted_address
    },

    // Results and Address Mapping
    formatPlace(place) {
      let formData = parseGooglePlace(place)

      // Fallback for empty address1 and address2 using formatted_address
      if (place.formatted_address) {
        if (!formData.address1 || !formData.address2) {
          const fullAddress = parseFormattedAddress(
            place.formatted_address,
            formData.country
          )

          if (!formData.address1) {
            formData.address1 = fullAddress.address1
          }
          if (!formData.address2) {
            formData.address2 = fullAddress.address2
          }

          console.log("[AddressMap] Full Address:", formData, fullAddress)
        }
      }

      this.$emit("geocode", formData)
    },

    // Leaflet Methods
    async setMapLeaflet() {
      const { provider } = useMapProvider()

      if (!provider?.value) {
        console.error('[AddressMap] Leaflet provider not available')
        return
      }

      const mapPosition = this.address?.lat && this.address?.lng
        ? [parseFloat(this.address.lat), parseFloat(this.address.lng)]
        : [this.mapPosition.lat, this.mapPosition.lng]

      const mapZoom = this.address ? 18 : 15

      this.map = provider.value.createMap(document.getElementById('map'), {
        center: mapPosition,
        zoom: mapZoom,
      })

      // Map click event
      this.map.on('click', async (e) => {
        const { lat, lng } = e.latlng
        await this.setMarkerLeaflet({ lat, lng })
        this.map.setView([lat, lng], 18)
        await this.geoCoderByLatLngLeaflet(lat, lng)
      })
    },

    async setMarkerLeaflet(position) {
      const { provider } = useMapProvider()

      if (!provider?.value) {
        console.error('[AddressMap] Leaflet provider not available for marker')
        return
      }

      if (this.marker) {
        this.map.removeLayer(this.marker)
        this.marker = null
      }

      const pos = position || this.mapPosition
      const latlng = [pos.lat, pos.lng]

      this.marker = provider.value.createMarker(latlng, { draggable: true })
      this.marker.addTo(this.map)

      // Marker events
      this.marker.on('click', (e) => {
        const { lat, lng } = e.target.getLatLng()
        this.map.setView([lat, lng], 18)
      })

      this.marker.on('dragend', async (e) => {
        const { lat, lng } = e.target.getLatLng()
        this.map.setView([lat, lng], 18)
        await this.geoCoderByLatLngLeaflet(lat, lng)
      })
    },

    async geoCoderByLatLngLeaflet(lat, lng) {
      const { provider } = useMapProvider()

      if (!provider?.value) {
        console.error('[AddressMap] Leaflet provider not available for geocoding')
        return
      }

      // Set loading state
      this.isLoading = true
      this.$emit('loading', true)

      try {
        // Use reverse geocoding for coordinates to address
        const result = await provider.value.latLngToAddress(lat, lng)

        if (result) {
          this.formatPlaceLeaflet(result)
        }
      } catch (error) {
        console.error('[AddressMap] Reverse geocoding failed:', error)
      } finally {
        // Clear loading state
        this.isLoading = false
        this.$emit('loading', false)
      }
    },

    formatPlaceLeaflet(place) {
      const { parseNominatimPlace } = useAddressParsing()

      // Check if this is a Nominatim result
      const formData = place._nominatim
        ? parseNominatimPlace(place._nominatim)
        : parseNominatimPlace(place)

      this.$emit("geocode", formData)
    },

    // Leaflet Autocomplete Methods
    setupLeafletAutocomplete() {
      // Wait for next tick to ensure component is fully mounted
      this.$nextTick(() => {
        // PrimeVue InputText: access the actual input element
        const searchInput = this.$refs.searchAddress?.$el

        console.log('[AddressMap] Setting up Leaflet autocomplete', searchInput)

        if (!searchInput) {
          console.warn('[AddressMap] Search input not found')
          return
        }

        // Add input event listener
        searchInput.addEventListener('input', this.handleSearchInput)
        searchInput.addEventListener('focus', this.handleSearchFocus)

        // Close results on outside click
        document.addEventListener('click', this.handleOutsideClick)

        console.log('[AddressMap] Leaflet autocomplete setup complete')
      })
    },

    handleSearchInput(event) {
      const value = event.target.value.trim()

      console.log('[AddressMap] Search input changed:', value)

      // Clear previous timer
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
      }

      if (!value || value.length < 3) {
        this.searchResults = []
        this.showSearchResults = false
        console.log('[AddressMap] Search value too short or empty')
        return
      }

      console.log('[AddressMap] Scheduling search for:', value)

      // Debounce search (300ms)
      this.searchDebounceTimer = setTimeout(async () => {
        await this.searchAddress(value)
      }, 300)
    },

    handleSearchFocus() {
      if (this.searchResults.length > 0) {
        this.showSearchResults = true
      }
    },

    handleOutsideClick(event) {
      const searchInput = this.$refs.searchAddress?.$el
      const resultsContainer = document.querySelector('.search-results-dropdown')

      if (searchInput && !searchInput.contains(event.target) &&
          resultsContainer && !resultsContainer.contains(event.target)) {
        this.showSearchResults = false
      }
    },

    async searchAddress(query) {
      console.log('[AddressMap] Searching for:', query)

      try {
        const result = await this.$address.typeSearchGoogle(query)

        console.log('[AddressMap] Search results:', result)

        if (result && result.predictions) {
          console.log('[AddressMap] Found predictions:', result.predictions.length)
          this.searchResults = result.predictions
          this.showSearchResults = true
        } else {
          console.warn('[AddressMap] No predictions found in result')
          this.searchResults = []
          this.showSearchResults = false
        }
      } catch (error) {
        console.error('[AddressMap] Search failed:', error)
        this.searchResults = []
        this.showSearchResults = false
      }
    },

    async selectSearchResult(result) {
      const searchInput = this.$refs.searchAddress?.$el
      if (searchInput) {
        searchInput.value = result.description
      }

      this.showSearchResults = false

      // Set loading state
      this.isLoading = true
      this.$emit('loading', true)

      // Get full place details
      try {
        const geocodeResult = await this.$address.addressToLatLng(result.description)

        if (geocodeResult && geocodeResult.results && geocodeResult.results.length > 0) {
          const place = geocodeResult.results[0]

          // Update map position
          const position = {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          }

          this.map.setView([position.lat, position.lng], 18)
          await this.setMarkerLeaflet(position)

          // Format and emit the address
          this.formatPlaceLeaflet(place)
        }
      } catch (error) {
        console.error('[AddressMap] Failed to geocode selected result:', error)
      } finally {
        // Clear loading state
        this.isLoading = false
        this.$emit('loading', false)
      }
    },
  },
}
</script>

<style scoped>
.map-loader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  border-radius: 8px;
}

.map-loader-overlay p {
  color: #000000;
  font-weight: 500;
  margin: 0;
}

.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid #e6e8ec;
  border-radius: 8px;
  margin-top: 4px;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
}

.search-result-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background: rgba(0, 0, 0, 0.03);
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-main {
  font-weight: 500;
  color: #000000;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-secondary {
  font-size: 0.875rem;
  color: #777e90;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pi-map-marker {
  color: #000000;
  font-size: 1rem;
  margin-top: 2px;
  flex-shrink: 0;
}
</style>

<style>
/* Dark mode styles - unscoped to ensure proper application */
.my-app-dark .map-loader-overlay,
body.my-app-dark .map-loader-overlay {
  background: rgba(20, 20, 22, 0.9) !important;
}

.my-app-dark .map-loader-overlay p,
body.my-app-dark .map-loader-overlay p {
  color: #ffffff !important;
}

.my-app-dark .search-results-dropdown,
body.my-app-dark .search-results-dropdown {
  background: #141416 !important;
  border-color: #353945 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
}

.my-app-dark .search-result-item,
body.my-app-dark .search-result-item {
  border-bottom-color: rgba(255, 255, 255, 0.08) !important;
}

.my-app-dark .search-result-item:hover,
body.my-app-dark .search-result-item:hover {
  background: rgba(255, 255, 255, 0.05) !important;
}

.my-app-dark .result-main,
body.my-app-dark .result-main {
  color: #ffffff !important;
}

.my-app-dark .result-secondary,
body.my-app-dark .result-secondary {
  color: #777e90 !important;
}

.my-app-dark .pi-map-marker,
body.my-app-dark .pi-map-marker {
  color: #ffffff !important;
}
</style>
