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

  // Commerce
  if (config.theme.type === "commerce") {
    // Store Id
    if (config.storeId) {
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

      console.log(
        "✅ Site config commerce loaded!",
        process.env.NUXT_SHOPIFY_STORE_DOMAIN,
        config.defaults.siteUrl
      )

      const tenantId = config.features.multitenancy.parentId
      const storeId = config.storeId
      const configPath = `${tenantId}/stores/${storeId}/integrations`
      const snapshot = await db.ref(configPath).once("value")

      if (snapshot.exists()) {
        const integrations = snapshot.val()
        console.log(`✅ Site integrations!`, integrations)
      }

      db.goOffline()
    }
  } else {
    console.log("✅ Site config loaded!", config.defaults.siteUrl)
  }
}
