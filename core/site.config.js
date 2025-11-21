import path from "node:path"
import * as prismic from "@prismicio/client"
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args))

/**
 * Base Config
 */

let config = await import(path.resolve("config/site.config.json"))
let mainConfig = null

/**
 * AD Commerce Config
 */

const getCommerceConfig = async (storeId) => {
  const url = config.features.directus.apiUrl
  const fields = `
    *,
    locations.*,
    locations.address.*,
    tax_rates.*,
    store_sales_channels.sales_channels_id.*
  `
  const res = await fetch(
    `${url}/items/tenants?filter[store_id][_eq]=${storeId}&fields=${fields}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NUXT_DIRECTUS_ADMIN_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  )

  if (!res.ok) {
    throw new Error("Failed to fetch tenant info ::: ", res.statusText)
  }
  const data = await res.json()

  if (data?.data?.length) {
    return data.data[0]
  }

  return
}
if (
  config.integrations.directus &&
  config.features.directus &&
  process.env.NUXT_STORE_ID &&
  process.env.NUXT_DIRECTUS_ADMIN_TOKEN
) {
  mainConfig = await getCommerceConfig(process.env.NUXT_STORE_ID)

  // console.log("Tenant ::: ", mainConfig)

  if (mainConfig) {
    // Required Fields
    if (mainConfig.store_id) {
      config.theme.storeId = mainConfig.store_id
    }
    if (mainConfig.tenant_id) {
      config.features.multitenancy.tenantId = mainConfig.tenant_id
    }

    // Settings
    if (mainConfig.store_name) {
      config.defaults.name = mainConfig.store_name
    }
    if (mainConfig.store_theme) {
      config.theme.type = mainConfig.store_theme
    }
    if (mainConfig.store_url) {
      config.defaults.storeUrl = mainConfig.store_url
    }
    if (mainConfig.store_timezone) {
      config.theme.timezone = mainConfig.store_timezone
    }
    if (mainConfig.store_country) {
      config.theme.country = mainConfig.store_country
    }
    if (mainConfig.store_currency) {
      config.theme.currency = mainConfig.store_currency
    }
    if (mainConfig.store_language) {
      config.theme.language = mainConfig.store_language
    }

    // Theme
    if (mainConfig.store_logo) {
      config.logo.desktop = mainConfig.store_logo
    }
    if (mainConfig.store_logo_dark) {
      config.logo.desktop_dark = mainConfig.store_logo_dark
    }
    if (mainConfig.store_mobile_logo) {
      config.logo.mobile = mainConfig.store_mobile_logo
    }
    if (mainConfig.store_mobile_logo_dark) {
      config.logo.mobile_dark = mainConfig.store_mobile_logo_dark
    }
    if (mainConfig.store_splash) {
      config.theme.splash = mainConfig.store_splash
    }
    if (mainConfig.store_light_dark_mode) {
      if (mainConfig.store_light_dark_mode === "both") {
        config.theme.darkLightMode = null
      } else if (mainConfig.store_light_dark_mode === "light") {
        config.theme.darkLightMode = "light"
      } else if (mainConfig.store_light_dark_mode === "dark") {
        config.theme.darkLightMode = "dark"
      }
    }

    // Optional Fields
    if (mainConfig.store_name_short) {
      config.defaults.name_short = mainConfig.store_name_short
    }
    if (mainConfig.store_slogan) {
      config.defaults.slogan = mainConfig.store_slogan
    }
    if (mainConfig.store_description) {
      config.defaults.description = mainConfig.store_description
    }

    // Contact
    if (mainConfig.contact_email) {
      config.contact.email = mainConfig.contact_email
    }
    if (mainConfig.contact_phone) {
      config.contact.phone = mainConfig.contact_phone
    }

    // Commerce
    if (mainConfig.store_theme === "commerce") {
      if (!config.commerce) {
        config.commerce = {}
      }

      // if (mainConfig.commerce_allow_tax) {
      //   config.commerce.allowTax = mainConfig.commerce_allow_tax
      // }
      // if (mainConfig.commerce_weight_unit) {
      //   config.commerce.weightUnit = mainConfig.commerce_weight_unit
      // }

      // Sales Channels
      if (mainConfig.store_sales_channels?.length) {
        config.commerce.salesChannels = mainConfig.store_sales_channels.map(
          (i) => i.sales_channels_id
        )
      }
    }

    console.log(
      `✅ [Site Config] Store Directus Settings Set!`,
      mainConfig.tenant_id
    )
  }
}

/**
 * Directus CMS Config (Website Settings)
 */
let directusCMSConfig = null

const getDirectusCMSConfig = async () => {
  // Use storefront API URL for CMS content
  const url =
    config.features.directus?.storefront?.apiUrl ||
    config.features.directus?.admin?.apiUrl ||
    "https://storefront.adcommerce.mn"
  const token = process.env.NUXT_DIRECTUS_STOREFRONT_TOKEN

  if (!token) {
    console.log(
      "NUXT_DIRECTUS_STOREFRONT_TOKEN not found, skipping Directus CMS config"
    )
    return null
  }

  const fields = `
    *,
    site_logo.*,
    site_logo_dark.*,
    site_mobile_logo.*,
    site_mobile_logo_dark.*,
    site_splash.*
  `

  try {
    const res = await fetch(
      `${url}/items/cms_website_settings?fields=${fields.replace(/[\s\b]/g, "")}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!res.ok) {
      console.log("Failed to fetch Directus CMS settings")
      return null
    }

    const data = await res.json()

    if (data?.data) {
      return data.data
    }
  } catch (err) {
    console.log("Directus CMS Config error ::: ", err.message)
  }

  return null
}

// Try Directus CMS config if enabled and no commerce config loaded
if (
  config.integrations.directus &&
  config.features.directus &&
  process.env.NUXT_DIRECTUS_STOREFRONT_TOKEN &&
  !mainConfig
) {
  directusCMSConfig = await getDirectusCMSConfig()

  if (directusCMSConfig) {
    // Required Fields
    if (directusCMSConfig.site_id) {
      config.theme.storeId = directusCMSConfig.site_id
    }
    if (directusCMSConfig.site_type) {
      config.theme.type = directusCMSConfig.site_type
    }
    if (directusCMSConfig.site_name) {
      config.defaults.name = directusCMSConfig.site_name
    }
    if (directusCMSConfig.site_url) {
      config.defaults.siteUrl = directusCMSConfig.site_url
    }

    // Location Specific Required Fields
    if (directusCMSConfig.site_language) {
      config.theme.language = directusCMSConfig.site_language
    }
    if (directusCMSConfig.site_country) {
      config.theme.country = directusCMSConfig.site_country
    }
    if (directusCMSConfig.site_currency) {
      config.theme.currency = directusCMSConfig.site_currency
    }
    if (directusCMSConfig.site_timezone) {
      config.theme.timezone = directusCMSConfig.site_timezone
    }

    // Optional Fields
    if (directusCMSConfig.site_name_short) {
      config.defaults.name_short = directusCMSConfig.site_name_short
    }
    if (directusCMSConfig.site_slogan) {
      config.defaults.slogan = directusCMSConfig.site_slogan
    }
    if (directusCMSConfig.site_description) {
      config.defaults.description = directusCMSConfig.site_description
    }

    // Theme - Transform Directus file objects to URLs (use storefront API)
    const storefrontUrl =
      config.features.directus?.storefront?.apiUrl ||
      "https://storefront.adcommerce.mn"

    if (directusCMSConfig.site_logo) {
      const logoUrl = directusCMSConfig.site_logo.id
        ? `${storefrontUrl}/assets/${directusCMSConfig.site_logo.id}`
        : directusCMSConfig.site_logo
      config.logo.desktop = logoUrl
    }
    if (directusCMSConfig.site_logo_dark) {
      const logoUrl = directusCMSConfig.site_logo_dark.id
        ? `${storefrontUrl}/assets/${directusCMSConfig.site_logo_dark.id}`
        : directusCMSConfig.site_logo_dark
      config.logo.desktop_dark = logoUrl
    }
    if (directusCMSConfig.site_mobile_logo) {
      const logoUrl = directusCMSConfig.site_mobile_logo.id
        ? `${storefrontUrl}/assets/${directusCMSConfig.site_mobile_logo.id}`
        : directusCMSConfig.site_mobile_logo
      config.logo.mobile = logoUrl
    }
    if (directusCMSConfig.site_mobile_logo_dark) {
      const logoUrl = directusCMSConfig.site_mobile_logo_dark.id
        ? `${storefrontUrl}/assets/${directusCMSConfig.site_mobile_logo_dark.id}`
        : directusCMSConfig.site_mobile_logo_dark
      config.logo.mobile_dark = logoUrl
    }
    if (directusCMSConfig.site_splash) {
      const splashUrl = directusCMSConfig.site_splash.id
        ? `${storefrontUrl}/assets/${directusCMSConfig.site_splash.id}`
        : directusCMSConfig.site_splash
      config.theme.splash = splashUrl
    }
    if (directusCMSConfig.site_light_dark_mode) {
      if (directusCMSConfig.site_light_dark_mode === "both") {
        config.theme.darkLightMode = null
      } else if (directusCMSConfig.site_light_dark_mode === "light") {
        config.theme.darkLightMode = "light"
      } else if (directusCMSConfig.site_light_dark_mode === "dark") {
        config.theme.darkLightMode = "dark"
      }
    }

    // Contact
    if (directusCMSConfig.contact_email) {
      config.contact.email = directusCMSConfig.contact_email
    }
    if (directusCMSConfig.contact_phone) {
      config.contact.phone = directusCMSConfig.contact_phone
    }

    console.log("[Site Config] ::: Using Directus CMS Settings!")
  }
}

/**
 * Prismic Config
 */
let prismicConfig = null

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
if (config.features.prismic && !mainConfig && !directusCMSConfig) {
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

// // Prismic
// if (config.features.prismic) {
//   siteConfig.prismic = {
//     endpoint: config.features.prismic,
//     preview: false,
//   }
// }

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

// if (config.theme.type === "commerce" && config.commerce) {
//   // let siteShippingLines = []

//   // // Shipping Lines
//   // if (config.commerce.shipping) {
//   //   if (config.commerce.shipping.local) {
//   //     siteShippingLines.push({
//   //       title: "Local Shipping",
//   //       price: config.commerce.shipping.local,
//   //     })
//   //   }
//   //   if (config.commerce.shipping.city) {
//   //     siteShippingLines.push({
//   //       title: "City Shipping",
//   //       price: config.commerce.shipping.city,
//   //     })
//   //   }
//   //   if (config.commerce.shipping.provincial) {
//   //     siteShippingLines.push({
//   //       title: "Provincial Shipping",
//   //       price: config.commerce.shipping.provincial,
//   //     })
//   //   }
//   //   if (config.commerce.shipping.international) {
//   //     siteShippingLines.push({
//   //       title: "International Shipping",
//   //       price: config.commerce.shipping.international,
//   //     })
//   //   }
//   // }

//   // // Theme
//   // theme.commerce = {
//   //   location: config.commerce.location,
//   //   allowTax: config.commerce.allowTax,
//   //   shippingLines: siteShippingLines,
//   // }
// }

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
