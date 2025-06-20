export default async function siteConfigModule(moduleOptions, nuxt) {
  // Setup Firebase DB
  const { initializeApp, cert, getApps, getApp } = await import(
    "firebase-admin/app"
  )
  const { getDatabase } = await import("firebase-admin/database")
  const credentials = {
    projectId: process.env.NUXT_FIREBASE_PROJECT_ID,
    clientEmail: process.env.NUXT_FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.NUXT_FIREBASE_PRIVATE_KEY.replace(
      /\\n/g,
      "\n"
    ).replace(/\\/g, ""),
  }
  const app = getApps().length
    ? getApp()
    : initializeApp({
        credential: cert(credentials),
        databaseURL: process.env.NUXT_FIREBASE_DATABASE_URL,
      })
  const db = getDatabase(app)

  // Get App Config
  const appConfig = nuxt.options.appConfig

  // Set Integrations and Features
  if (appConfig.theme.storeId) {
    const parentId =
      nuxt.options.runtimeConfig.public.features.multitenancy.parentId
    const storeId = appConfig.theme.storeId
    const configPath = `${parentId}/stores/${storeId}`
    const snapshot = await db.ref(configPath).once("value")

    // Check if site setup
    if (snapshot.exists()) {
      const storeData = snapshot.val()
      if (storeData) {
        // Set Default Private to hold integrations
        if (!nuxt.options.runtimeConfig.private) {
          nuxt.options.runtimeConfig.private = {}
        }

        // Store Setup
        if (storeData.tenantId) {
          // TenentId
          nuxt.options.runtimeConfig.public.features.multitenancy =
            storeData.tenantId

          // FileSystem
          nuxt.options.runtimeConfig.public.features.fileSystem = {
            bunny: {
              storageUrl: "https://storage.bunnycdn.com/melodu",
              cdnUrl: "https://melodu.b-cdn.net",
              filesPath: storeData.tenantId,
            },
          }
        }

        // Integrations Setup
        const integrations = storeData.integrations
        if (integrations) {
          // Shopify
          if (integrations.shopify) {
            const version = "2025-04"
            const storeDomain = `${integrations.shopify.store_domain}.myshopify.com`

            nuxt.options.runtimeConfig.private.shopify = {
              api_version: version,
              store_domain: storeDomain,
              storefront_access_token:
                integrations.shopify.storefront_access_token,
              graph_admin_access_token:
                integrations.shopify.graph_admin_access_token,
            }
            nuxt.options.runtimeConfig.public.integrations.shopify = true
            nuxt.options.runtimeConfig.public.features.shopify = {
              apiVersion: version,
              domain: storeDomain,
            }
            nuxt.options.runtimeConfig.public.features.auth.connect = {
              shopify: true,
            }
          }
          // Prismic
          if (integrations.prismic) {
            nuxt.options.runtimeConfig.public.integrations.prismic = true
            nuxt.options.runtimeConfig.public.features.prismic =
              integrations.prismic.repo
          }
        }

        console.log(`✅ [Commerce] Integrations Set!`)
      }
    }
  }

  // Turn off db and cleanup app to avoid long running process.
  db.goOffline()
  await app.delete()
}
