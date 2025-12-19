/**
 * StorePay Integration Layer
 *
 * Self-contained integration that registers:
 * - Plugin ($storepay)
 * - Server API route (/api/storepay)
 *
 * Only loaded when integrations.storepay = true in site.config.json
 */

import { defu } from "defu"
import { createResolver } from "@nuxt/kit"
import { defineNuxtConfig } from "nuxt/config"

const { resolve } = createResolver(import.meta.url)

console.log("[Layer] :: Adding StorePay Integration - v1.0.0")

/**
 * Plugins
 */
const plugins = defineNuxtConfig({
  plugins: [resolve("./plugins/storepay.js")],
})

/**
 * Server Routes
 */
const servers = defineNuxtConfig({
  serverDir: resolve("./server"),
})

export default defu(plugins, servers)
