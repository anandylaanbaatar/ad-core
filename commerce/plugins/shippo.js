// https://github.com/goshippo/shippo-javascript-sdk
// https://github.com/goshippo/shippo-javascript-sdk/blob/main/docs/sdks/ratesatcheckout/README.md#create
// https://docs.goshippo.com/shippoapi/public-api/#operation/CreateLiveRate

import { Shippo } from "shippo"

export default defineNuxtPlugin(() => {
  const KEY = useState("shippoKey", () =>
    process.env.NODE_ENV === "production"
      ? process.env.NUXT_SHIPPO_KEY
      : process.env.NUXT_SHIPPO_TEST_KEY
  )

  if (import.meta.client) {
    if (!useRuntimeConfig().public.integrations.shippo) {
      // console.log("[Plugins] ::: [Shippo] ::: Not Initialized!")
      return
    }
    if (!KEY.value) {
      console.log("[Plugins] ::: [Shippo] ::: Missing Integration Key!")
      return
    }

    console.log("[Plugins] ::: [Shippo] ::: Initialized!")
  } else {
    return
  }

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
