/**
 * Google Maps Integration Plugin
 *
 * Registers the GoogleMapsProvider with the map provider system.
 * This plugin runs on client-side only.
 */

import { GoogleMapsProvider } from '../utils/GoogleMapsProvider.js'

export default defineNuxtPlugin(async (nuxtApp) => {
  // Only run on client side
  if (import.meta.server) {
    return
  }

  const config = useRuntimeConfig()
  const coreStore = useCoreStore()

  // Check if Google Maps is enabled in features
  const googleMapsEnabled = config.public.features?.googleMaps

  if (!googleMapsEnabled) {
    console.log('[GoogleMaps] Integration not enabled in features')
    return
  }

  // Get Google Maps API key
  const googleMapsKey = useState('googleMapKey', () => process.env.NUXT_GOOGLE_MAPS_TOKEN)

  if (!googleMapsKey.value) {
    console.log('[GoogleMaps] No API key provided')
    return
  }

  // Create Google Maps provider instance
  const googleMapsProvider = new GoogleMapsProvider({
    apiKey: googleMapsKey.value,
    cors: coreStore.cors
  })

  // Register the provider for the map-provider orchestration plugin to use
  nuxtApp.provide('googleMapsProvider', googleMapsProvider)

  console.log('[GoogleMaps] Provider registered')
})
