/**
 * Stripe Integration Layer
 *
 * Self-contained integration that registers:
 * - Plugin ($stripe)
 *
 * Only loaded when integrations.stripe = true in site.config.json
 */

import { defu } from "defu"
import { createResolver } from "@nuxt/kit"
import { defineNuxtConfig } from "nuxt/config"

const { resolve } = createResolver(import.meta.url)

console.log("[Layer] :: Adding Stripe Integration - v1.0.0")

/**
 * Plugins
 */
const plugins = defineNuxtConfig({
  plugins: [resolve("./plugins/stripe.js")],
})

export default defu(plugins)
