import { defu } from "defu"
import { createResolver } from "@nuxt/kit"
import { defineNuxtConfig } from "nuxt/config"
const { resolve } = createResolver(import.meta.url)

console.log("[Layer] :: Adding AD Payment - v2.0.0")

/**
 * Config
 */

const config = defineNuxtConfig({
  components: true,
})

const modules = defineNuxtConfig({
  pinia: {
    storesDirs: [resolve("stores/**")],
  },
})

const plugins = defineNuxtConfig({
  plugins: [
    // Note: Payment provider plugins are now in v1/integrations:
    // - v1/integrations/qpay
    // - v1/integrations/storepay
    // - v1/integrations/stripe
    resolve("./plugins/payment.js"),
  ],
})

export default defu(config, modules, plugins)
