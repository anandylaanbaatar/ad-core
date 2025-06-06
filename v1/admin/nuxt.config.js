import { defu } from "defu"
import { createResolver } from "@nuxt/kit"
import { defineNuxtConfig } from "nuxt/config"
const { resolve } = createResolver(import.meta.url)

console.log("[Layer] :: Adding AD Admin - v2.0.1")

/**
 * Config
 */

const config = defineNuxtConfig({
  components: {
    path: resolve("components"),
    pathPrefix: true,
    global: true,
  },

  css: [resolve("./assets/scss/app.scss")],
})

/**
 * Middleware
 */

const middlewares = defineNuxtConfig({
  middleware: [resolve("./middleware/admin.global.js")],
})

/**
 * Server
 */

const servers = defineNuxtConfig({
  server: [resolve("server/**")],
})

/**
 * Modules
 */

const modules = defineNuxtConfig({
  pinia: {
    storesDirs: [resolve("stores/**")],
  },
})

export default defu(config, middlewares, servers, modules)
