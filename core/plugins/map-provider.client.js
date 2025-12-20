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
  let savedPreference = null

  // Check localStorage for saved preference
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('mapProvider')
    if (saved && providers[saved]) {
      savedPreference = saved
      activeProviderName = saved
      console.log(`[MapProvider] Using saved preference: ${saved}`)
    } else if (saved && !providers[saved]) {
      // Clear stale preference if provider is no longer available
      console.log(`[MapProvider] Clearing stale preference: ${saved} (provider not available)`)
      localStorage.removeItem('mapProvider')
    }
  }

  // Try to initialize providers in order of preference
  // Default: Leaflet first (fast loading), then upgrade to Google Maps if available
  const preferredOrder = activeProviderName
    ? [activeProviderName, ...Object.keys(providers).filter(k => k !== activeProviderName)]
    : ['leaflet', 'google'].filter(k => providers[k])

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

  // If Leaflet was initialized (no saved preference) and Google Maps is available, try to upgrade
  // This ensures Leaflet loads fast, but we switch to Google Maps if properly configured
  if (activeProviderName === 'leaflet' && providers.google && !savedPreference) {
    console.log('[MapProvider] Leaflet loaded as default, checking if Google Maps is available...')

    // Try initializing Google Maps in the background
    setTimeout(async () => {
      const googleProvider = providers.google
      const googleInitialized = await googleProvider.initialize()

      if (googleInitialized && googleProvider.available) {
        console.log('[MapProvider] Google Maps is available and configured, saving preference for next session')
        // Save Google as preference for next time (don't switch mid-session to avoid UI disruption)
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('mapProvider', 'google')
        }
      }
    }, 1000) // Delay check to not block initial load
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
