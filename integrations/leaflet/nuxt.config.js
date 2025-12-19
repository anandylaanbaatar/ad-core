/**
 * Leaflet Integration Layer
 *
 * Self-contained integration that registers:
 * - LeafletProvider for OSM-based mapping
 * - Nominatim geocoding service
 * - Leaflet CSS
 *
 * Only loaded when integrations.leaflet = true in site.config.json
 */

import { defu } from "defu"
import { createResolver } from "@nuxt/kit"
import { defineNuxtConfig } from "nuxt/config"

const { resolve } = createResolver(import.meta.url)

console.log("[Layer] :: Adding Leaflet Integration - v1.0.0")

/**
 * App (CSS)
 */
const app = defineNuxtConfig({
  css: ["leaflet/dist/leaflet.css"],
})

/**
 * Plugins
 */
const plugins = defineNuxtConfig({
  plugins: [resolve("./plugins/leaflet.client.js")],
})

export default defu(app, plugins)
