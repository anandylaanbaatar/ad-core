/**
 * QPay Integration Plugin
 *
 * This plugin is only loaded when integrations.qpay = true
 * (conditionally registered via v1/integrations/qpay layer)
 */
export default defineNuxtPlugin(async () => {
  if (import.meta.client) {
    if (!useRuntimeConfig().public.features.payments) {
      console.log("[Plugins] ::: [Qpay] ::: Payments Not Setup Yet!")
      return
    }
    if (!useRuntimeConfig().public.features.payments.qpay) {
      console.log("[Plugins] ::: [Qpay] ::: Missing Qpay Config!")
      return
    }
    if (useRuntimeConfig().public.features.log) {
      console.log("[Plugins] ::: [QPay] ::: Initialized!")
    }
  } else {
    return
  }

  // Dynamic import - only load moment when QPay is enabled
  const { default: moment } = await import("moment")

  // Token
  const getToken = async () => {
    const res = await $fetch("/api/qpay", {
      method: "POST",
      body: {
        type: "getToken",
      },
    })

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
    const res = await $fetch("/api/qpay", {
      method: "POST",
      body: {
        type: "createInvoice",
        token: token,
        data: data,
      },
    })

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
