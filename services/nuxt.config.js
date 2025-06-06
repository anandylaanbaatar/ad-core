import { defu } from "defu"
import { createResolver } from "@nuxt/kit"
import { defineNuxtConfig } from "nuxt/config"
const { resolve } = createResolver(import.meta.url)

console.log("[Layer] :: Adding AD Services - v2.0.0")

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

// const plugins = defineNuxtConfig({
//   plugins: [
//   ],
// })

export default defu(config, modules)
