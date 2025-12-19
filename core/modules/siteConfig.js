export default async function siteConfigModule(moduleOptions, nuxt) {
  // Setup Firebase DB
  const { initializeApp, cert, getApps, getApp } = await import(
    "firebase-admin/app"
  )
  const { getDatabase } = await import("firebase-admin/database")

  // Check if Env Var setup.
  if(!process.env.NUXT_FIREBASE_PROJECT_ID) return
  if(!process.env.NUXT_FIREBASE_CLIENT_EMAIL) return
  if(!process.env.NUXT_FIREBASE_PRIVATE_KEY) return

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
          nuxt.options.runtimeConfig.public.features.multitenancy = {
            parentId: parentId,
            tenantId: storeData.tenantId,
          }

          // FileSystem
          nuxt.options.runtimeConfig.public.features.fileSystem = {
            bunny: {
              storageUrl: "https://storage.bunnycdn.com/melodu",
              cdnUrl: "https://melodu.b-cdn.net",
              filesPath: "adcommerce",
            },
          }
        }

        // Integrations Setup
        const integrations = storeData.integrations
        if (integrations) {
          /**
           * CMS Integrations
           */

          // Firebase
          if (integrations.firebase) {
            nuxt.options.runtimeConfig.public.integrations.firebase = true
            if (integrations.firebase.config) {
              nuxt.options.runtimeConfig.public.features.firebase =
                integrations.firebase.config
            }
          }

          // Prismic
          if (integrations.prismic) {
            nuxt.options.runtimeConfig.public.integrations.prismic = true
            nuxt.options.runtimeConfig.public.features.prismic =
              integrations.prismic.repo
          }

          // Directus (Admin CMS)
          if (integrations.directus) {
            nuxt.options.runtimeConfig.public.integrations.directus = true
            if (integrations.directus.apiUrl) {
              nuxt.options.runtimeConfig.public.features.directus = {
                ...nuxt.options.runtimeConfig.public.features.directus,
                admin: {
                  apiUrl: integrations.directus.apiUrl,
                },
              }
            }
            if (integrations.directus.token) {
              nuxt.options.runtimeConfig.private.directus = {
                token: integrations.directus.token,
              }
            }
          }

          // Storefront (Directus Storefront CMS)
          if (integrations.storefront) {
            nuxt.options.runtimeConfig.public.integrations.storefront = true
            if (integrations.storefront.apiUrl) {
              nuxt.options.runtimeConfig.public.features.directus = {
                ...nuxt.options.runtimeConfig.public.features.directus,
                storefront: {
                  apiUrl: integrations.storefront.apiUrl,
                },
              }
            }
            if (integrations.storefront.token) {
              nuxt.options.runtimeConfig.private.storefront = {
                token: integrations.storefront.token,
              }
            }
          }

          /**
           * E-Commerce Integrations
           */

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

          /**
           * Search Integrations
           */

          // Algolia
          if (integrations.algolia) {
            nuxt.options.runtimeConfig.public.integrations.algolia = true
            nuxt.options.runtimeConfig.public.features.algolia = {
              appId: integrations.algolia.appId,
              indexName: integrations.algolia.indexName,
            }
            if (integrations.algolia.apiKey) {
              nuxt.options.runtimeConfig.private.algolia = {
                apiKey: integrations.algolia.apiKey,
              }
            }
          }

          // Meilisearch
          if (integrations.meilisearch) {
            nuxt.options.runtimeConfig.public.integrations.meilisearch = true
            nuxt.options.runtimeConfig.public.features.meilisearch = {
              host: integrations.meilisearch.host,
              indexName: integrations.meilisearch.indexName,
            }
            if (integrations.meilisearch.apiKey) {
              nuxt.options.runtimeConfig.private.meilisearch = {
                apiKey: integrations.meilisearch.apiKey,
              }
            }
          }

          /**
           * Payments
           */

          let payments = {}

          // QPay
          if (integrations.qpay) {
            nuxt.options.runtimeConfig.private.qpay = {
              token: integrations.qpay.token,
              invoiceCode: integrations.qpay.invoiceCode,
            }
            nuxt.options.runtimeConfig.public.integrations.qpay = true

            payments.qpay = {
              invoiceCode: integrations.qpay.invoiceCode,
            }
          }

          // StorePay
          if (integrations.storepay) {
            nuxt.options.runtimeConfig.private.storepay = {
              token: integrations.storepay.token,
              storeId: integrations.storepay.storeId,
              storeUsername: integrations.storepay.storeUsername,
              storePassword: integrations.storepay.storePassword,
            }
            nuxt.options.runtimeConfig.public.integrations.storepay = true

            payments.storepay = {
              storeId: integrations.storepay.storeId,
            }
          }

          // Stripe
          if (integrations.stripe) {
            const isTestMode =
              process.env.NODE_ENV === "production" ? false : true
            nuxt.options.runtimeConfig.private.stripe = {
              key: integrations.stripe.key,
              secret: integrations.stripe.secret,
              test_key: integrations.stripe.test_key,
              test_secret: integrations.stripe.test_secret,
              isTestMode: isTestMode,
            }
            nuxt.options.runtimeConfig.public.integrations.stripe = true
            payments.stripe = {
              active: true,
            }
          }

          if (Object.keys(payments).length > 0) {
            nuxt.options.runtimeConfig.public.features.payments = payments
          }

          /**
           * Notification & Marketing Integrations
           */

          // Loops (Email Marketing)
          if (integrations.loops) {
            nuxt.options.runtimeConfig.public.integrations.loops = true
            nuxt.options.runtimeConfig.public.features.notifications = {
              ...nuxt.options.runtimeConfig.public.features.notifications,
              loops: {
                listId: integrations.loops.listId,
                mailingFormId: integrations.loops.mailingFormId,
                mailingListId: integrations.loops.mailingListId,
              },
            }
            if (integrations.loops.apiKey) {
              nuxt.options.runtimeConfig.private.loops = {
                apiKey: integrations.loops.apiKey,
              }
            }
          }

          // OneSignal (Push Notifications)
          if (integrations.onesignal) {
            nuxt.options.runtimeConfig.public.integrations.onesignal = true
            nuxt.options.runtimeConfig.public.features.onesignal = {
              appId: integrations.onesignal.appId,
            }
            if (integrations.onesignal.apiKey) {
              nuxt.options.runtimeConfig.private.onesignal = {
                apiKey: integrations.onesignal.apiKey,
              }
            }
          }

          /**
           * Shipping Integrations
           */

          // Shippo
          if (integrations.shippo) {
            nuxt.options.runtimeConfig.public.integrations.shippo = true
            if (integrations.shippo.token) {
              nuxt.options.runtimeConfig.private.shippo = {
                token: integrations.shippo.token,
              }
            }
          }

          /**
           * Maps & Location Integrations
           */

          // Google Maps
          if (integrations.googlemaps) {
            nuxt.options.runtimeConfig.public.integrations.googlemaps = true
            nuxt.options.runtimeConfig.public.features.googleMaps = true
            if (integrations.googlemaps.apiKey) {
              nuxt.options.runtimeConfig.private.googlemaps = {
                apiKey: integrations.googlemaps.apiKey,
              }
            }
          }

          // Leaflet (OpenStreetMap)
          if (integrations.leaflet) {
            nuxt.options.runtimeConfig.public.integrations.leaflet = true
            nuxt.options.runtimeConfig.public.features.leaflet = {
              enabled: true,
              nominatimUrl:
                integrations.leaflet.nominatimUrl ||
                "https://nominatim.openstreetmap.org",
              osrmUrl:
                integrations.leaflet.osrmUrl ||
                "https://router.project-osrm.org",
              tileUrl:
                integrations.leaflet.tileUrl ||
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
              attribution:
                integrations.leaflet.attribution ||
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }
          }
        }

        console.log(`✅ [Site Config] Integrations Set!`)
      }
    }
  }

  // Turn off db and cleanup app to avoid long running process.
  db.goOffline()
  await app.delete()

  // console.log("[Modules] ::: [Firebase] ::: Init!")
}
