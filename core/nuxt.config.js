import { defu } from "defu"
import { createResolver } from "@nuxt/kit"
import { defineNuxtConfig } from "nuxt/config"
import Aura from "@primevue/themes/aura"
import { readFileSync } from "fs"
import { resolve as pathResolve } from "path"

const { resolve } = createResolver(import.meta.url)

// Load site config to conditionally register plugins
let siteConfig = { integrations: {}, features: {} }
try {
  const configPath = pathResolve(process.cwd(), "config/site.config.json")
  siteConfig = JSON.parse(readFileSync(configPath, "utf-8"))
} catch (e) {
  console.warn("[Layer] :: Could not load site.config.json, using defaults")
}

const integrations = siteConfig.integrations || {}

// Prevent duplicate logging during Nuxt layer resolution
if (!globalThis.__AD_CORE_LOADED__) {
  globalThis.__AD_CORE_LOADED__ = true
  console.log("[Layer] :: Adding AD Core - v2.1.1")
}

/**
 * Integration Layers (conditionally loaded based on config)
 */
const integrationLayers = []

if (integrations.leaflet) {
  integrationLayers.push(resolve("../integrations/leaflet"))
}

if (integrations.googlemaps) {
  integrationLayers.push(resolve("../integrations/googlemaps"))
}

/**
 * Middleware
 */

const middlewares = defineNuxtConfig({
  middleware: [resolve("./middleware/core.global.js")],
})

/**
 * App
 */

const app = defineNuxtConfig({
  target: "static",
  components: true,

  // Conditionally extend integration layers
  extends: integrationLayers,

  alias: {
    "@core": resolve("./assets/scss"),
  },

  css: [
    "primeflex/primeflex.css",
    "flexboxgrid/css/flexboxgrid.min.css",
    "primeicons/primeicons.css",
    "@splidejs/vue-splide/css",
    // Note: Leaflet CSS is now handled by v1/integrations/leaflet layer
    resolve("./assets/scss/app.scss"),
  ],

  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },
})

/**
 * Modules
 */

let modulesConfig = {
  modules: [
    "@pinia/nuxt",
    "@primevue/nuxt-module",
    "@nuxtjs/i18n",
    "@nuxtjs/robots",
    "nuxt-vuefire",
    // "@nuxtjs/prismic",
    resolve("./modules/siteConfig"),
  ],

  pinia: {
    storesDirs: [resolve("stores/**")],
  },
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          prefix: "p",
          darkModeSelector: ".my-app-dark",
          cssLayer: {
            name: "primevue",
            order: "app-styles, primevue",
          },
        },
      },
      ripple: true,
    },
  },
  i18n: {
    vueI18n: resolve("../../config/i18n.config.js"),
    bundle: {
      optimizeTranslationDirective: false,
    },
  },
  robots: {
    UserAgent: "*",
    Disallow: "",
  },
}

const modules = defineNuxtConfig(modulesConfig)

/**
 * Servers
 */

// const servers = defineNuxtConfig({
//   server: [resolve("server/**")],
// })

/**
 * Plugins
 */

const plugins = defineNuxtConfig({
  plugins: [
    resolve("./plugins/utils.js"),
    // Conditionally load integration plugins
    ...(integrations.algolia ? [resolve("./plugins/algolia.js")] : []),
    resolve("./plugins/map-provider.client.js"),
    resolve("./plugins/address.js"),
    resolve("./plugins/currency.js"),
    ...(integrations.prismic ? [resolve("./plugins/prismic.js")] : []),
    ...(integrations.directus ? [resolve("./plugins/directus.js")] : []),
    ...(integrations.storefront ? [resolve("./plugins/storefront.js")] : []),
    // Note: Meilisearch plugin is now in v1/integrations/meilisearch layer
    // Note: Shopify plugin is now in v1/integrations/shopify layer
    ...(integrations.firebase ? [resolve("./plugins/firebase.client.js")] : []),
    resolve("./plugins/forms.js"),
    resolve("./plugins/general.client.js"),
    resolve("./plugins/notifications.js"),
    resolve("./plugins/lazy.client.js"),
    resolve("./plugins/core.client.js"),
  ],
})

/**
 * Build
 */

const build = defineNuxtConfig({
  pages: true,

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          additionalData: `@use "@core/basics/variables" as *;`,
        },
      },
    },
  },

  build: {
    transpile: ["primevue"],
    loaders: {
      sass: {
        implementation: require("sass"),
      },
      scss: {
        implementation: require("sass"),
      },
    },
    // Disable HMR messages
    hotMiddleware: {
      client: {
        noInfo: true,
      },
    },
  },

  vue: {
    compilerOptions: {
      // Ignore media-controller player tag

      // (siteConfig.appConfig.theme.type !== "commerce" &&
      //   tag.startsWith("CommerceSidebar"))

      isCustomElement: (tag) => {
        if (
          tag.startsWith("media-") ||
          tag.startsWith("mux-") ||
          tag.startsWith("youtube-") ||
          tag.startsWith("vimeo-")
        ) {
          return tag
        }
        return
      },
    },
  },
})

export default defu(middlewares, modules, build, app, plugins)
