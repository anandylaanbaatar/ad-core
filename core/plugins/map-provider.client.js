/**
 * Map Provider Plugin
 *
 * Orchestrates provider initialization and automatic fallback.
 * Exposes the active map provider to the application.
 */

import { GoogleMapsProvider } from '../utils/map/GoogleMapsProvider.js'
import { LeafletProvider } from '../utils/map/LeafletProvider.js'

export default defineNuxtPlugin(async (nuxtApp) => {
  // Only run on client side
  if (import.meta.server) {
    return
  }

  const config = useRuntimeConfig()
  const coreStore = useCoreStore()

  // Check feature flags
  const googleMapsEnabled = config.public.features?.googleMaps
  const leafletEnabled = config.public.features?.leaflet?.enabled

  if (!googleMapsEnabled && !leafletEnabled) {
    console.log('[MapProvider] No map providers enabled')
    return
  }

  // Get Google Maps API key
  const googleMapsKey = useState('googleMapKey', () => process.env.NUXT_GOOGLE_MAPS_TOKEN)

  // Initialize providers
  const providers = {}

  // Google Maps provider
  if (googleMapsEnabled && googleMapsKey.value) {
    providers.google = new GoogleMapsProvider({
      apiKey: googleMapsKey.value,
      cors: coreStore.cors
    })
  }

  // Leaflet provider
  if (leafletEnabled) {
    providers.leaflet = new LeafletProvider({
      nominatimUrl: config.public.features?.leaflet?.nominatimUrl,
      osrmUrl: config.public.features?.leaflet?.osrmUrl,
      tileUrl: config.public.features?.leaflet?.tileUrl,
      attribution: config.public.features?.leaflet?.attribution
    })
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
