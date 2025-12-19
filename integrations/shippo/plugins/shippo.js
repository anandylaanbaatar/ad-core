/**
 * Shippo Integration Plugin
 *
 * This plugin is only loaded when integrations.shippo = true
 * (conditionally registered via v1/integrations/shippo layer)
 *
 * https://github.com/goshippo/shippo-javascript-sdk
 * https://github.com/goshippo/shippo-javascript-sdk/blob/main/docs/sdks/ratesatcheckout/README.md#create
 * https://docs.goshippo.com/shippoapi/public-api/#operation/CreateLiveRate
 */
export default defineNuxtPlugin(async () => {
  const KEY = useState("shippoKey", () =>
    process.env.NODE_ENV === "production"
      ? process.env.NUXT_SHIPPO_KEY
      : process.env.NUXT_SHIPPO_TEST_KEY
  )

  if (import.meta.client) {
    if (!KEY.value) {
      console.log("[Plugins] ::: [Shippo] ::: Missing Integration Key!")
      return
    }

    if (useRuntimeConfig().public.features.log) {
      console.log("[Plugins] ::: [Shippo] ::: Initialized!")
    }
  } else {
    return
  }

  // Dynamic import - only load shippo when integration is enabled
  const { Shippo } = await import("shippo")

  const key = KEY.value
  const shippo = new Shippo({
    apiKeyHeader: key,
  })

  const getCarrierList = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await shippo.carrierAccounts.list({
          page: 1,
          results: 5,
        })
        resolve(result)
      } catch (err) {
        console.log("[Shippo] ::: Error :: ", err.message)
        reject(null)
      }
    })
  }
  const createRate = async (params) => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await shippo.ratesAtCheckout.create(params)
        resolve(result)
      } catch (err) {
        console.log("[Shippo] ::: Error :: ", err.message)
        reject(null)
      }
    })
  }
  const createParcel = async (params) => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await shippo.parcels.create(params)

        resolve(result)
      } catch (err) {
        console.log("[Shippo] ::: Error :: ", err.message)
        reject(null)
      }
    })
  }

  return {
    provide: {
      shippo: {
        getCarrierList,
        createRate,
        createParcel,
      },
    },
  }
})
