/**
 * Map Provider Plugin
 *
 * Orchestrates provider initialization and automatic fallback.
 * Exposes the active map provider to the application.
 *
 * This plugin consumes providers registered by integration plugins:
 * - v1/integrations/googlemaps -> $googleMapsProvider
 * - v1/integrations/leaflet -> $leafletProvider
 */

export default defineNuxtPlugin(async (nuxtApp) => {
  // Only run on client side
  if (import.meta.server) {
    return
  }

  // Initialize providers from integration plugins
  const providers = {}

  // Google Maps provider (registered by googlemaps integration)
  if (nuxtApp.$googleMapsProvider) {
    providers.google = nuxtApp.$googleMapsProvider
  }

  // Leaflet provider (registered by leaflet integration)
  if (nuxtApp.$leafletProvider) {
    providers.leaflet = nuxtApp.$leafletProvider
  }

  if (Object.keys(providers).length === 0) {
    console.log('[MapProvider] No map providers registered')
    return
  }

  // Determine active provider with automatic fallback
  let activeProvider = null
  let activeProviderName = null

  // Check localStorage for saved preference
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('mapProvider')
    if (saved && providers[saved]) {
      activeProviderName = saved
    }
  }

  // Try to initialize providers in order of preference
  const preferredOrder = activeProviderName
    ? [activeProviderName, ...Object.keys(providers).filter(k => k !== activeProviderName)]
    : ['google', 'leaflet'].filter(k => providers[k])

  for (const providerName of preferredOrder) {
    const provider = providers[providerName]
    if (!provider) continue

    console.log(`[MapProvider] Trying to initialize ${providerName}...`)

    const initialized = await provider.initialize()

    if (initialized && provider.available) {
      activeProvider = provider
      activeProviderName = providerName
      console.log(`[MapProvider] Initialized: ${providerName}`)
      break
    } else {
      console.log(`[MapProvider] Failed to initialize ${providerName}`)
    }
  }

  if (!activeProvider) {
    console.error('[MapProvider] No map providers available')
    return
  }

  // Save preference to localStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('mapProvider', activeProviderName)
  }

  // Expose to nuxtApp
  nuxtApp.provide('mapProvider', activeProvider)
  nuxtApp.provide('mapProviderName', activeProviderName)
  nuxtApp.provide('mapProviders', providers)

  // Expose provider switch function
  nuxtApp.provide('switchMapProvider', async (providerName) => {
    const provider = providers[providerName]
    if (!provider) {
      console.error(`[MapProvider] Provider '${providerName}' not found`)
      return false
    }

    const initialized = await provider.initialize()

    if (initialized && provider.available) {
      nuxtApp.$mapProvider = provider
      nuxtApp.$mapProviderName = providerName

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('mapProvider', providerName)
      }

      console.log(`[MapProvider] Switched to ${providerName}`)
      return true
    }

    console.error(`[MapProvider] Failed to switch to ${providerName}`)
    return false
  })

  console.log(`[MapProvider] Active provider: ${activeProviderName}`)
})
