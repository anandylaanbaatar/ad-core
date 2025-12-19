/**
 * Meilisearch Integration Layer
 *
 * Self-contained integration that registers:
 * - Plugin ($meilisearch)
 *
 * Only loaded when integrations.meilisearch = true in site.config.json
 */

import { defu } from "defu"
import { createResolver } from "@nuxt/kit"
import { defineNuxtConfig } from "nuxt/config"

const { resolve } = createResolver(import.meta.url)

console.log("[Layer] :: Adding Meilisearch Integration - v1.0.0")

/**
 * Plugins
 */
const plugins = defineNuxtConfig({
  plugins: [resolve("./plugins/meilisearch.js")],
})

export default defu(plugins)
