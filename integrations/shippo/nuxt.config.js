/**
 * Shippo Integration Layer
 *
 * Self-contained integration that registers:
 * - Plugin ($shippo)
 *
 * Only loaded when integrations.shippo = true in site.config.json
 */

import { defu } from "defu"
import { createResolver } from "@nuxt/kit"
import { defineNuxtConfig } from "nuxt/config"

const { resolve } = createResolver(import.meta.url)

console.log("[Layer] :: Adding Shippo Integration - v1.0.0")

/**
 * Plugins
 */
const plugins = defineNuxtConfig({
  plugins: [resolve("./plugins/shippo.js")],
})

export default defu(plugins)
