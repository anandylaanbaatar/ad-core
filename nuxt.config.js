import path from "node:path"
import { defu } from "defu"
import { createResolver } from "@nuxt/kit"
import { defineNuxtConfig } from "nuxt/config"
import Aura from "@primevue/themes/aura"
const { resolve } = createResolver(import.meta.url)
const siteConfigPath = path.resolve("./site.config.js")
const { siteRuntimeConfig } = await import(siteConfigPath)

console.log("[Layer] :: Adding AD Core - v1.3.2")

/**
 * Config
 */

const config = defineNuxtConfig({
  runtimeConfig: {
    public: {
      BASE_URL: process.env.BASE_URL,
    },
  },
})

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

  css: [
    "primeflex/primeflex.css",
    "flexboxgrid/css/flexboxgrid.min.css",
    "primeicons/primeicons.css",
    "@splidejs/vue-splide/css",
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
    vueI18n: resolve("./i18n.config.js"),
  },

  robots: {
    UserAgent: "*",
    Disallow: "",
  },
}

// Firebase
if (siteRuntimeConfig.public.integrations.firebase) {
  if (!modulesConfig.modules) {
    modulesConfig.modules = ["nuxt-vuefire"]
  } else {
    modulesConfig.modules.push("nuxt-vuefire")
  }
}

// Prismic
if (siteRuntimeConfig.public.integrations.prismic) {
  if (!modulesConfig.modules) {
    modulesConfig.modules = ["@nuxtjs/prismic"]
  } else {
    modulesConfig.modules.push("@nuxtjs/prismic")
  }
  modulesConfig.prismic = {
    endpoint: siteRuntimeConfig.public.features.prismic,
  }
}

const modules = defineNuxtConfig(modulesConfig)

/**
 * Plugins
 */

const plugins = defineNuxtConfig({
  plugins: [
    resolve("./plugins/utils.js"),
    resolve("./plugins/address.js"),
    resolve("./plugins/currency.js"),
    resolve("./plugins/algolia.js"),
    resolve("./plugins/firebase.client.js"),
    resolve("./plugins/mitt.client.js"),
    resolve("./plugins/splide.client.js"),
    resolve("./plugins/forms.client.js"),
    resolve("./plugins/infinite.client.js"),
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
})

export default defu(config, middlewares, modules, build, app, plugins)
