export default defineNuxtPlugin(() => {
  const KEY = useState("storepayKey", () => process.env.NUXT_STOREPAY_TOKEN)

  if (import.meta.client) {
    if (!useRuntimeConfig().public.integrations.storepay) {
      // console.log("[Plugins] ::: [Storepay] ::: Not Initialized!")
      return
    }
    if (!useRuntimeConfig().public.storepay) {
      console.log("[Plugins] ::: [Storepay] ::: Missing StorePay Config!")
      return
    }
    if (!KEY.value) {
      console.log("[Plugins] ::: [Storepay] ::: Missing Integration Key!")
      return
    }

    console.log("[Plugins] ::: [Storepay] ::: Initialized!")
  } else {
    return
  }

  const config = useRuntimeConfig()
  const key = KEY.value
  const base = "https://service.storepay.mn:8778"
  const baseUrl = `${base}/lend-merchant`
  const storeId = config.public.storepay.storeId
  const username = config.public.storepay.username
  const password = config.public.storepay.password

  // Token
  const getToken = async () => {
    let url = `${base}/merchat-uaa/oauth/token?grant_type=password&username=${username}&password=${password}`
    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${key}`,
      },
    }

    const res = await $fetch(url, options)
    return res
  }
  const isTokenExpired = (tokendata) => {}

  // Invoice
  const getInvoice = async (body) => {
    const res = await $fetch("/api/storepay", {
      method: "POST",
      body: {
        type: "createInvoice",
        token: body.token,
        data: {
          storeId: storeId,
          mobileNumber: body.phone,
          description: body.description,
          amount: body.amount,
        },
      },
    })

    // console.log("[StorePay] ::: Plugin ::: ", res)

    return res
  }
  const cancelInvoice = async (body) => {
    const res = await $fetch("/api/storepay", {
      method: "POST",
      body: {
        type: "cancelInvoice",
        token: body.token,
        data: {
          accountId: body.invoiceId,
        },
      },
    })

    // console.log("[StorePay] ::: Plugin ::: ", res)

    return res
  }
  const createQR = async (body) => {
    let url = `${baseUrl}/`
  }

  // Payment
  const checkPayment = async (body) => {
    const res = await $fetch("/api/storepay", {
      method: "POST",
      body: {
        type: "checkPayment",
        token: body.token,
        invoiceId: body.invoiceId,
      },
    })

    return res
  }

  // User
  const checkPossibleAmount = async (body) => {
    const res = await $fetch("/api/storepay", {
      method: "POST",
      body: {
        type: "checkPossibleAmount",
        token: body.token,
        data: {
          mobileNumber: body.phone,
        },
      },
    })

    return res
  }

  return {
    provide: {
      storepay: {
        getToken,
        getInvoice,
        cancelInvoice,
        checkPayment,
        checkPossibleAmount,
      },
    },
  }
})
