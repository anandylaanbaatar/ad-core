import { defu } from "defu"
import { createResolver } from "@nuxt/kit"
import { defineNuxtConfig } from "nuxt/config"
const { resolve } = createResolver(import.meta.url)

console.log("[Layer] :: Adding AD Commerce - v2.0.0")

/**
 * Config
 */

const config = defineNuxtConfig({
  components: true,
})

const middlewares = defineNuxtConfig({
  middleware: [resolve("./middleware/commerce.global.js")],
})

const modules = defineNuxtConfig({
  pinia: {
    storesDirs: [resolve("stores/**")],
  },
})

const plugins = defineNuxtConfig({
  plugins: [
    resolve("./plugins/shopify.js"),
    resolve("./plugins/shippo.js"),
    resolve("./plugins/commerce.js"),
  ],
})

export default defu(config, middlewares, modules, plugins)
