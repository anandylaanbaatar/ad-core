// NumVerify
// https://numverify.com/documentation?utm_source=APILayerProduct_Documentation&utm_medium=Referral
// API Layer:
// https://apilayer.com/marketplace/number_verification-api#documentation-tab

export default defineNuxtPlugin(async () => {
  if (!import.meta.client) return
  const config = useRuntimeConfig().public

  if (!config.features.auth && !config.features.auth.phoneVerify) return

  console.log("[Plugins] ::: [Phone] ::: Initialized!")

  const services = {
    numVerify: {
      tokens: [
        "3071d0f8ad3a5251ee31ae3c1608fcf3",
        "d505931ab9af76d3fb703e578971e9af",
      ],
    },
    apiLayer: {
      tokens: [
        "deH6xoglMnbufQ4s2Jmib2L1Kfr1Ll6B",
        "TwQF0rC0EB880g5daqwnZv6PzHs7Kxp1",
      ],
    },
  }
  const tokens = [...services.numVerify.tokens, ...services.apiLayer.tokens]

  /**
   * Verify Phone Number
   */

  const verify = async (country, number) => {
    return new Promise(async (resolve) => {
      if (!country) {
        console.log("[Plugins] ::: [Phone] ::: Missing country code!")
        resolve(null)
        return
      }
      if (!number) {
        console.log("[Plugins] ::: [Phone] ::: Missing phone number!")
        resolve(null)
        return
      }

      const randomNumber = Math.floor(Math.random() * tokens.length)
      const key = tokens[randomNumber]
      const baseUrl = `http://apilayer.net/api/validate?access_key=${key}&format=1`
      const url = `${baseUrl}&number=${number}&country_code=${country}`

      try {
        const res = await $fetch(url, {
          method: "GET",
        })

        console.log("[Plugins] ::: [Phone] ::: Verification Success :: ", res)

        resolve(res)
      } catch (err) {
        console.log("[Plugins] ::: [Phone] ::: Error :: ", err.message)
        resolve(null)
      }
    })
  }

  return {
    provide: {
      phone: {
        verify,
      },
    },
  }
})
