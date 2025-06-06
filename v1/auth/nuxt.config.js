import { defu } from "defu"
import { createResolver } from "@nuxt/kit"
import { defineNuxtConfig } from "nuxt/config"
const { resolve } = createResolver(import.meta.url)

console.log("[Layer] :: Adding AD Auth - v2.0.0")

/**
 * Config
 */

const config = defineNuxtConfig({
  components: true,
})

/**
 * Middleware
 */

const middlewares = defineNuxtConfig({
  middleware: [resolve("./middleware/app.global.js")],
})

/**
 * Modules
 */

const modules = defineNuxtConfig({
  pinia: {
    storesDirs: [resolve("stores/**")],
  },
})

/**
 * Plugins
 */

const plugins = defineNuxtConfig({
  plugins: [resolve("./plugins/phone.client.js")],
})

export default defu(config, middlewares, modules, plugins)
