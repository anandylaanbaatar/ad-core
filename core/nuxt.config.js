import path from "node:path"
import { defu } from "defu"
import { createResolver } from "@nuxt/kit"
import { defineNuxtConfig } from "nuxt/config"
import Aura from "@primevue/themes/aura"
const { resolve } = createResolver(import.meta.url)
const { siteRuntimeConfig, siteConfig } = await import(
  path.resolve("./v1/core/site.config.js")
)

console.log("[Layer] :: Adding AD Core - v2.1.1")

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
  modules: ["@pinia/nuxt", "@primevue/nuxt-module"],

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
}

// i18n
if (siteRuntimeConfig.public.features.i18n) {
  modulesConfig.modules.push("@nuxtjs/i18n")
  modulesConfig.i18n = {
    vueI18n: resolve("../../config/i18n.config.js"),
  }
}

// Robots
if (siteRuntimeConfig.public.features.robots) {
  modulesConfig.modules.push("@nuxtjs/robots")
  modulesConfig.robots = {
    UserAgent: "*",
    Disallow: "",
  }
}

// Firebase
if (siteRuntimeConfig.public.integrations.firebase) {
  modulesConfig.modules.push("nuxt-vuefire")
}

// Prismic
if (siteRuntimeConfig.public.integrations.prismic) {
  modulesConfig.modules.push("@nuxtjs/prismic")
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
    resolve("./plugins/forms.client.js"),
    resolve("./plugins/general.client.js"),
    resolve("./plugins/notifications.js"),
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

  vue: {
    compilerOptions: {
      // Ignore media-controller player tag
      isCustomElement: (tag) => {
        if (
          tag.startsWith("media-") ||
          tag.startsWith("mux-") ||
          tag.startsWith("youtube-") ||
          tag.startsWith("vimeo-") ||
          (siteConfig.appConfig.theme.type !== "commerce" &&
            tag.startsWith("CommerceSidebar"))
        ) {
          return tag
        }
        return
      },
    },
  },
})

export default defu(middlewares, modules, build, app, plugins)
