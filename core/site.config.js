import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getDatabase } from "firebase-admin/database"
import path from "node:path"
import { readFile } from "fs/promises"
const config = await import(path.resolve("config/site.config.json"))

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
  let serviceAccount = null

  // Setup Firebase Service Account
  if (config.config.firebaseServiceAccount) {
    serviceAccount = path.resolve("config/serviceAccount.json")
    process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccount
  }
  // Setup Firebase App Config
  if (config.config.firebaseConfig) {
    siteRuntimeConfig.public.firebase = config.config.firebaseConfig

    if (config.config.firebaseWebPushKey) {
      siteRuntimeConfig.public.features.firebaseWebPushKey =
        config.config.firebaseWebPushKey
    }

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
    if (serviceAccount) {
      siteConfig.vuefire.admin = {
        serviceAccount: serviceAccount,
      }
    }
  }

  // // Setup Site Settings from Firebase remotely
  // if (config.storeId) {
  //   if (config.config.firebaseConfig && config.features.multitenancy.parentId) {
  //     // Get Service Account Data
  //     const serviceAccountPath = path.resolve("config/serviceAccount.json")
  //     const rawConfig = await readFile(serviceAccountPath, "utf-8")
  //     const serviceAccountData = JSON.parse(rawConfig)

  //     // Init Firebase Admin
  //     if (!getApps().length) {
  //       initializeApp({
  //         credential: cert(serviceAccountData),
  //         databaseURL: config.config.firebaseConfig.databaseURL,
  //       })
  //     }
  //     const db = getDatabase()
  //     const parentId = config.features.multitenancy.parentId
  //     const storeId = config.storeId
  //     const snapshot = await db
  //       .ref(`${parentId}/stores/${storeId}`)
  //       .once("value")
  //     const settings = snapshot.val()

  //     if (settings) {
  //       siteRuntimeConfig.public.siteSettings = settings
  //     }
  //   }
  // }
}

/**
 * 4. Payments
 */

if (config.payment && config.payment.payments) {
  let sitePayments = []

  // Payments
  if (config.payment.payments) {
    if (config.payment.payments.qpay && config.payment.payments.qpay.active) {
      sitePayments.push({
        id: "qpay",
        title: "QPay",
        logo: "/images/theme/qpay_logo.png",
        active: true,
        qpay_invoice_code: config.payment.payments.qpay.invoiceCode,
      })
    }
    if (
      config.payment.payments.storepay &&
      config.payment.payments.storepay.active
    ) {
      sitePayments.push({
        id: "storepay",
        title: "StorePay",
        logo: "/images/theme/storepay_logo.png",
        active: true,
      })
      siteRuntimeConfig.public.storepay = config.payment.payments.storepay
    }
    if (config.payment.payments.card && config.integrations.stripe) {
      sitePayments.push({
        id: "card",
        title: "Credit Card, Debit Card, Klarna",
        logo: "/images/theme/credit_card_icons.png",
        active: true,
      })
    }
  }

  theme.payment = {
    payments: sitePayments,
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
