import { initializeApp, cert, getApps, getApp } from "firebase-admin/app"
import { getDatabase } from "firebase-admin/database"
import path from "node:path"
let config = await import(path.resolve("config/site.config.json"))

export default async function siteConfigModule(moduleOptions, nuxt) {
  // const { nuxt } = this

  // Use Firebase Admin credentials from env
  const {
    NUXT_FIREBASE_PROJECT_ID,
    NUXT_FIREBASE_CLIENT_EMAIL,
    NUXT_FIREBASE_PRIVATE_KEY,
    NUXT_FIREBASE_DATABASE_URL,
  } = process.env

  if (
    !NUXT_FIREBASE_PROJECT_ID ||
    !NUXT_FIREBASE_CLIENT_EMAIL ||
    !NUXT_FIREBASE_PRIVATE_KEY ||
    !NUXT_FIREBASE_DATABASE_URL
  ) {
    throw new Error(
      "❌ Firebase env variables are missing. Add them to your .env file."
    )
  }

  const credentials = {
    projectId: NUXT_FIREBASE_PROJECT_ID,
    clientEmail: NUXT_FIREBASE_CLIENT_EMAIL,
    privateKey: NUXT_FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n").replace(
      /\\/g,
      ""
    ),
  }

  const app = getApps().length
    ? getApp()
    : initializeApp({
        credential: cert(credentials),
        databaseURL: NUXT_FIREBASE_DATABASE_URL,
      })

  const db = getDatabase(app)

  const tenantId = config.features.multitenancy.parentId
  const storeId = config.storeId
  const configPath =
    moduleOptions.path || `${tenantId}/stores/${storeId}/integrations`

  const snapshot = await db.ref(configPath).once("value")

  if (!snapshot.exists()) {
    throw new Error(`❌ Site config not found at Firebase path "${configPath}"`)
  }

  const siteConfig = snapshot.val()

  /**
   * Setup Remote Config
   */

  if (config.storeId) {
    if (siteConfig) {
      // Shopify
      if (siteConfig.shopify) {
        const version = "2025-04"
        const storeDomain = `${siteConfig.shopify.store_domain}.myshopify.com`

        process.env.NUXT_SHOPIFY_API_VERSION = version
        process.env.NUXT_SHOPIFY_STORE_DOMAIN = storeDomain
        process.env.NUXT_SHOPIFY_GRAPH_ADMIN_ACCESS_TOKEN =
          siteConfig.shopify.graph_admin_access_token
        process.env.NUXT_SHOPIFY_STOREFRONT_ACCESS_TOKEN =
          siteConfig.shopify.storefront_access_token

        nuxt.options.runtimeConfig.public.integrations.shopify = true
        nuxt.options.runtimeConfig.public.features.shopify = {
          apiVersion: version,
          domain: storeDomain,
        }
      }
      // Prismic
      if (siteConfig.prismic) {
        nuxt.options.runtimeConfig.public.integrations.prismic = true
        nuxt.options.runtimeConfig.public.features.prismic =
          siteConfig.prismic.repo
      }
    }
  }

  // nuxt.options.runtimeConfig.public.siteConfig = siteConfig

  console.log("✅ Site config loaded!", process.env.NUXT_SHOPIFY_STORE_DOMAIN)
}
