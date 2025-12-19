/**
 * Loops Integration Layer
 *
 * Self-contained integration that registers:
 * - Plugin ($loops)
 * - Server API (/api/loops)
 *
 * Only loaded when integrations.loops = true in site.config.json
 */

import { defu } from "defu"
import { createResolver } from "@nuxt/kit"
import { defineNuxtConfig } from "nuxt/config"

const { resolve } = createResolver(import.meta.url)

console.log("[Layer] :: Adding Loops Integration - v1.0.0")

/**
 * Plugins
 */
const plugins = defineNuxtConfig({
  plugins: [resolve("./plugins/loops.js")],
})

/**
 * Server
 */
const server = defineNuxtConfig({
  serverDir: resolve("./server"),
  nitro: {
    scanDirs: [resolve("./server")],
  },
})

export default defu(plugins, server)
