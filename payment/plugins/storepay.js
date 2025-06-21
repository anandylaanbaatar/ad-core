export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    if (!useRuntimeConfig().public.integrations.storepay) {
      // console.log("[Plugins] ::: [Storepay] ::: Not Initialized!")
      return
    }
    if (!useRuntimeConfig().public.features.payments) {
      console.log("[Plugins] ::: [Storepay] ::: Payments Not Setup Yet!")
      return
    }
    if (!useRuntimeConfig().public.features.payments.storepay) {
      console.log("[Plugins] ::: [Storepay] ::: Missing StorePay Config!")
      return
    }

    console.log("[Plugins] ::: [Storepay] ::: Initialized!")
  } else {
    return
  }

  // Token
  const getToken = async () => {
    const res = await $fetch("/api/storepay", {
      method: "POST",
      body: {
        type: "getToken",
      },
    })

    return res
  }

  // Invoice
  const getInvoice = async (body) => {
    const res = await $fetch("/api/storepay", {
      method: "POST",
      body: {
        type: "createInvoice",
        token: body.token,
        data: {
          storeId: parseInt(body.storeId),
          mobileNumber: body.phone,
          description: body.description,
          amount: body.amount,
        },
      },
    })

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
