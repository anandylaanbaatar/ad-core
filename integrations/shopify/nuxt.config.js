/**
 * Shopify Integration Layer
 *
 * Self-contained integration that registers:
 * - Plugin ($shopify)
 * - Server API routes (/api/shopify/*)
 *
 * Only loaded when integrations.shopify = true in site.config.json
 */

import { defu } from "defu"
import { createResolver } from "@nuxt/kit"
import { defineNuxtConfig } from "nuxt/config"

const { resolve } = createResolver(import.meta.url)

console.log("[Layer] :: Adding Shopify Integration - v1.0.0")

/**
 * Plugins
 */
const plugins = defineNuxtConfig({
  plugins: [resolve("./plugins/shopify.js")],
})

/**
 * Server Routes
 * Auto-discovered from server/api directory
 */
const servers = defineNuxtConfig({
  serverDir: resolve("./server"),
})

export default defu(plugins, servers)
