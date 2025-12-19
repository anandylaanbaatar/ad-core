/**
 * QPay Integration Layer
 *
 * Self-contained integration that registers:
 * - Plugin ($qpay)
 * - Server API route (/api/qpay)
 *
 * Only loaded when integrations.qpay = true in site.config.json
 */

import { defu } from "defu"
import { createResolver } from "@nuxt/kit"
import { defineNuxtConfig } from "nuxt/config"

const { resolve } = createResolver(import.meta.url)

console.log("[Layer] :: Adding QPay Integration - v1.0.0")

/**
 * Plugins
 */
const plugins = defineNuxtConfig({
  plugins: [resolve("./plugins/qpay.js")],
})

/**
 * Server Routes
 */
const servers = defineNuxtConfig({
  serverDir: resolve("./server"),
})

export default defu(plugins, servers)
