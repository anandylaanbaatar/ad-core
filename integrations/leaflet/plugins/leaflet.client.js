/**
 * Leaflet Integration Plugin
 *
 * Registers the LeafletProvider with the map provider system.
 * This plugin runs on client-side only.
 */

import { LeafletProvider } from '../utils/LeafletProvider.js'

export default defineNuxtPlugin(async (nuxtApp) => {
  // Only run on client side
  if (import.meta.server) {
    return
  }

  const config = useRuntimeConfig()

  // Check if leaflet is enabled in features
  const leafletConfig = config.public.features?.leaflet

  if (!leafletConfig?.enabled) {
    console.log('[Leaflet] Integration not enabled in features')
    return
  }

  // Create Leaflet provider instance
  const leafletProvider = new LeafletProvider({
    nominatimUrl: leafletConfig.nominatimUrl,
    osrmUrl: leafletConfig.osrmUrl,
    tileUrl: leafletConfig.tileUrl,
    attribution: leafletConfig.attribution
  })

  // Register the provider for the map-provider orchestration plugin to use
  nuxtApp.provide('leafletProvider', leafletProvider)

  console.log('[Leaflet] Provider registered')
})
