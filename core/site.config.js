import path from "node:path"
import * as prismic from "@prismicio/client"

/**
 * Base Config
 */

let config = await import(path.resolve("config/site.config.json"))
let prismicConfig = null

/**
 * Prismic Config
 */

const getSitePrismicConfig = async (repoId) => {
  const endpoint = prismic.getRepositoryEndpoint(repoId)
  const client = prismic.createClient(endpoint)
  let siteSettings = null

  try {
    siteSettings = await client.getSingle("website_settings")
  } catch (err) {
    console.log("Prismic Client error ::: ", err.message)
  }

  if (siteSettings && siteSettings.data) {
    return siteSettings.data
  }

  return null
}
if (config.features.prismic) {
  prismicConfig = await getSitePrismicConfig(config.features.prismic)

  if (prismicConfig) {
    // Required Fields
    if (prismicConfig.site_id) {
      config.theme.storeId = prismicConfig.site_id
    }
    if (prismicConfig.site_type) {
      config.theme.type = prismicConfig.site_type
    }
    if (prismicConfig.site_name) {
      config.defaults.name = prismicConfig.site_name
    }
    if (prismicConfig.site_url) {
      config.defaults.siteUrl = prismicConfig.site_url
    }

    // Location Specific Required Fields
    if (prismicConfig.site_language) {
      config.theme.language = prismicConfig.site_language
    }
    if (prismicConfig.site_country) {
      config.theme.country = prismicConfig.site_country
    }
    if (prismicConfig.site_currency) {
      config.theme.currency = prismicConfig.site_currency
    }
    if (prismicConfig.site_timezone) {
      config.theme.timezone = prismicConfig.site_timezone
    }

    // Optional Fields
    if (prismicConfig.site_name_short) {
      config.defaults.name_short = prismicConfig.site_name_short
    }
    if (prismicConfig.site_slogan) {
      config.defaults.slogan = prismicConfig.site_slogan
    }
    if (prismicConfig.site_description) {
      config.defaults.description = prismicConfig.site_description
    }

    // Theme
    if (prismicConfig.site_logo) {
      if (prismicConfig.site_logo.url) {
        config.logo.desktop = prismicConfig.site_logo.url
      }
    }
    if (prismicConfig.site_logo_dark) {
      if (prismicConfig.site_logo_dark.url) {
        config.logo.desktop_dark = prismicConfig.site_logo_dark.url
      }
    }
    if (prismicConfig.site_mobile_logo) {
      if (prismicConfig.site_mobile_logo.url) {
        config.logo.mobile = prismicConfig.site_mobile_logo.url
      }
    }
    if (prismicConfig.site_mobile_logo_dark) {
      if (prismicConfig.site_mobile_logo_dark.url) {
        config.logo.mobile_dark = prismicConfig.site_mobile_logo_dark.url
      }
    }
    if (prismicConfig.site_splash) {
      if (prismicConfig.site_splash.url) {
        config.theme.splash = prismicConfig.site_splash.url
      }
    }
    if (prismicConfig.site_light_dark_mode) {
      if (prismicConfig.site_light_dark_mode === "both") {
        config.theme.darkLightMode = null
      } else if (prismicConfig.site_light_dark_mode === "light") {
        config.theme.darkLightMode = "light"
      } else if (prismicConfig.site_light_dark_mode === "dark") {
        config.theme.darkLightMode = "dark"
      }
    }

    // Contact
    if (prismicConfig.contact_email) {
      config.contact.email = prismicConfig.contact_email
    }
    if (prismicConfig.contact_phone) {
      config.contact.phone = prismicConfig.contact_phone
    }
  }

  console.log("[Site Config] ::: Using Prismic Settings!")
}

/**
 * Variables
 * Version
 * Theme Type
 */

const themeType = config.theme.type === "commerce" ? "Commerce" : "Theme"
const version = `AD ${themeType} - ${config.defaults.version}`
const siteDefault = {
  siteUrl: config.defaults.siteUrl,
  title: `${config.defaults.name} | ${config.defaults.description}`,
  name: config.defaults.name,
  name_short: config.defaults.name_short,
  description: config.defaults.description,
  full_description: config.defaults.full_description,
  keywords: config.defaults.keywords,
  slogan: config.defaults.slogan,
  logo: {
    desktop: config.logo.desktop,
    desktop_dark: config.logo.desktop_dark,
    mobile: config.logo.mobile,
    mobile_dark: config.logo.mobile_dark,
  },
}

/**
 *  1. Theme
 */

let themeOverrides = {
  version: version,
  contact: config.contact,
}
let theme = Object.assign(config.theme, siteDefault, themeOverrides)

/**
 * 2. Base Config
 */

let siteConfig = {
  compatibilityDate: config.config.compatibilityDate,
  extends: config.config.extends,
  runtimeConfig: null,
  appConfig: {
    theme: null,
  },
  app: {
    head: null,
  },
}

/**
 * 3. Runtime Config
 */

let siteRuntimeConfig = {
  public: {
    // Integrations
    integrations: config.integrations,

    // Features
    features: config.features,
  },
}

// Firebase
if (config.integrations.firebase) {
  // Setup Firebase App Config
  if (config.config.firebaseConfig) {
    siteRuntimeConfig.public.firebase = config.config.firebaseConfig

    // // Firebase Push Notifications
    // if (config.config.firebaseWebPushKey) {
    //   siteRuntimeConfig.public.features.firebaseWebPushKey =
    //     config.config.firebaseWebPushKey
    // }

    // Vuefire Module
    siteConfig.vuefire = {
      config: config.config.firebaseConfig,
      auth: {
        enabled: false,
        errorMap: "debug",
        popupRedirectResolver: false,
        persistence: ["indexedDBLocal"],
        sessionCookie: false,
      },
    }
  }
}
// Prismic
if (config.features.prismic) {
  siteConfig.prismic = {
    endpoint: config.features.prismic,
    preview: false,
  }
}

/**
 * 4. Payments
 */

if (config.features.payments) {
  let payments = {}

  if (!siteRuntimeConfig.private) {
    siteRuntimeConfig.private = {}
  }

  // QPay
  if (config.features.payments.qpay) {
    const token = process.env.NUXT_QPAY_TOKEN

    if (token) {
      siteRuntimeConfig.private.qpay = {
        token: token,
        invoiceCode: config.features.payments.qpay.invoiceCode,
      }
      siteRuntimeConfig.public.integrations.qpay = true
      payments.qpay = {
        invoiceCode: config.features.payments.qpay.invoiceCode,
      }
    }
  }
  // StorePay
  if (config.features.payments.storepay) {
    const token = process.env.NUXT_STOREPAY_TOKEN

    if (token) {
      siteRuntimeConfig.private.storepay = {
        token: token,
        storeId: config.features.payments.storepay.storeId,
        storeUsername: config.features.payments.storepay.storeUsername,
        storePassword: config.features.payments.storepay.storePassword,
      }
      siteRuntimeConfig.public.integrations.storepay = true
      payments.storepay = {
        storeId: config.features.payments.storepay.storeId,
      }
    }
  }
  // Stripe
  if (config.features.payments.stripe) {
    const key = process.env.NUXT_STRIPE_KEY
    const secret = process.env.NUXT_STRIPE_SECRET
    const test_key = process.env.NUXT_STRIPE_TEST_KEY
    const test_secret = process.env.NUXT_STRIPE_TEST_SECRET
    const isTestMode = process.env.NODE_ENV === "production" ? false : true

    if (key && secret && test_key && test_secret) {
      siteRuntimeConfig.private.stripe = {
        key: key,
        secret: secret,
        test_key: test_key,
        test_secret: test_secret,
        isTestMode: isTestMode,
      }
      siteRuntimeConfig.public.integrations.stripe = true
      payments.stripe = {
        active: true,
      }
    }
  }

  if (Object.keys(payments).length > 0) {
    siteRuntimeConfig.public.features.payments = payments
  }
}

/**
 * 5. Commerce Settings
 */

if (config.theme.type === "commerce" && config.commerce) {
  let siteShippingLines = []

  // Shipping Lines
  if (config.commerce.shipping) {
    if (config.commerce.shipping.local) {
      siteShippingLines.push({
        title: "Local Shipping",
        price: config.commerce.shipping.local,
      })
    }
    if (config.commerce.shipping.city) {
      siteShippingLines.push({
        title: "City Shipping",
        price: config.commerce.shipping.city,
      })
    }
    if (config.commerce.shipping.provincial) {
      siteShippingLines.push({
        title: "Provincial Shipping",
        price: config.commerce.shipping.provincial,
      })
    }
    if (config.commerce.shipping.international) {
      siteShippingLines.push({
        title: "International Shipping",
        price: config.commerce.shipping.international,
      })
    }
  }

  // Theme
  theme.commerce = {
    location: config.commerce.location,
    allowTax: config.commerce.allowTax,
    shippingLines: siteShippingLines,
  }
}

// Site Head
const siteHead = {
  htmlAttrs: {
    lang: "en",
  },
  title: `${siteDefault.name} | ${siteDefault.description}`,
  description: siteDefault.full_description,
  keywords: siteDefault.keywords,
  link: [
    {
      rel: "shortcut icon",
      href: "/images/icons/favicon.ico",
    },
    {
      rel: "icon",
      type: "image/svg+xml",
      href: "/images/icons/favicon.svg",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/images/icons/icon-16x16.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/images/icons/icon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "72x72",
      href: "/images/icons/icon-72x72.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "96x96",
      href: "/images/icons/icon-96x96.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "384x384",
      href: "/images/icons/icon-384x384.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "512x512",
      href: "/images/icons/icon-512x512.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/images/icons/apple-touch-icon.png",
    },
    {
      rel: "apple-touch-icon-precomposed",
      sizes: "180x180",
      href: "/images/icons/apple-touch-icon.png",
    },
    {
      rel: "manifest",
      href: "/manifest.json",
    },
  ],
}

// Set Runtime Config
siteConfig.appConfig.theme = theme
siteConfig.app.head = siteHead
siteConfig.runtimeConfig = siteRuntimeConfig

export { siteConfig, siteRuntimeConfig }
