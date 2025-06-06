import moment from "moment"

export default defineNuxtPlugin(() => {
  const KEY = useState("qpayKey", () => process.env.NUXT_QPAY_TOKEN)

  if (import.meta.client) {
    if (!useRuntimeConfig().public.integrations.qpay) {
      // console.log("[Plugins] ::: [QPay] ::: Not Initialized!")
      return
    }
    if (!KEY.value) {
      console.log("[Plugins] ::: [QPay] ::: Missing Key!")
      return
    }

    console.log("[Plugins] ::: [QPay] ::: Initialized!")
  } else {
    return
  }

  const key = KEY.value
  const baseUrl = "https://merchant.qpay.mn/v2"
  const sandboxUrl = "https://merchant-sandbox.qpay.mn/v2"

  // Token
  const getToken = async () => {
    let url = `${baseUrl}/auth/token`
    let options = {
      method: "POST",
      headers: {
        Authorization: `Basic ${key}`,
      },
    }

    const res = await $fetch(url, options)

    return res
  }
  const isTokenExpired = (tokenData) => {
    let currentTime = moment.utc()
    let expiresIn = moment.unix(tokenData.expires_in)
    let diff = expiresIn.diff(currentTime, "hours")

    // Not Expired
    if (diff > 3) {
      return false
    } else {
      return true
    }
  }

  // Invoice
  const getInvoice = async (token, data) => {
    let url = `${baseUrl}/invoice`
    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
    const res = await $fetch(url, options)

    return res
  }

  return {
    provide: {
      qpay: {
        getToken,
        isTokenExpired,
        getInvoice,
      },
    },
  }
})
