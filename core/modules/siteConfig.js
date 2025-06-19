import path from "node:path"

export default async function siteConfigModule(moduleOptions, nuxt) {
  const { initializeApp, cert, getApps, getApp } = await import(
    "firebase-admin/app"
  )
  const { getDatabase } = await import("firebase-admin/database")
  const siteConfigData = await import(path.resolve("config/site.config.json"), {
    with: { type: "json" },
  })
  let config = siteConfigData.default

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

  // Commerce
  if (config.theme.type === "commerce" && config.storeId) {
    const tenantId = config.features.multitenancy.parentId
    const storeId = config.storeId
    const configPath = `${tenantId}/stores/${storeId}/integrations`
    const snapshot = await db.ref(configPath).once("value")

    if (snapshot.exists()) {
      const integrations = snapshot.val()

      if (integrations) {
        if (!nuxt.options.runtimeConfig.private) {
          nuxt.options.runtimeConfig.private = {}
        }

        // Shopify
        if (integrations.shopify) {
          const version = "2025-04"
          const storeDomain = `${integrations.shopify.store_domain}.myshopify.com`

          process.env.NUXT_SHOPIFY_API_VERSION = version
          process.env.NUXT_SHOPIFY_STORE_DOMAIN = storeDomain
          process.env.NUXT_SHOPIFY_GRAPH_ADMIN_ACCESS_TOKEN =
            integrations.shopify.graph_admin_access_token
          process.env.NUXT_SHOPIFY_STOREFRONT_ACCESS_TOKEN =
            integrations.shopify.storefront_access_token

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
        }
        // Prismic
        if (integrations.prismic) {
          nuxt.options.runtimeConfig.public.integrations.prismic = true
          nuxt.options.runtimeConfig.public.features.prismic =
            integrations.prismic.repo
        }

        console.log(`✅ [Commerce] Integrations Set!`)
      }
    }

    console.log(
      "✅ [Commerce] Config Set!",
      process.env.NUXT_SHOPIFY_STORE_DOMAIN,
      config.defaults.siteUrl
    )
  } else {
    console.log("✅ [Site] Config Set!", config.defaults.siteUrl)
  }

  // Turn off db and cleanup app to avoid long running process.
  db.goOffline()
  await app.delete()
}
