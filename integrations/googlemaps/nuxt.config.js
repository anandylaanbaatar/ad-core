/**
 * Google Maps Integration Layer
 *
 * Self-contained integration that registers:
 * - GoogleMapsProvider for Google Maps API
 *
 * Only loaded when integrations.googlemaps = true in site.config.json
 */

import { defu } from "defu"
import { createResolver } from "@nuxt/kit"
import { defineNuxtConfig } from "nuxt/config"

const { resolve } = createResolver(import.meta.url)

console.log("[Layer] :: Adding Google Maps Integration - v1.0.0")

/**
 * Plugins
 */
const plugins = defineNuxtConfig({
  plugins: [resolve("./plugins/googlemaps.client.js")],
})

export default defu(plugins)
