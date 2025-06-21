import { defineEventHandler, readBody } from "h3"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const base = `https://service.storepay.mn:8778`
  const baseUrl = `${base}/lend-merchant`
  const config = useRuntimeConfig(event)

  if (!config.private.storepay) return

  const keys = config.private.storepay
  const base_token = keys.token
  const token = body.token
  const username = keys.storeUsername
  const password = keys.storePassword

  let url = `${baseUrl}`
  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }

  // Create Invoice
  if (body.type === "getToken") {
    url = `${base}/merchat-uaa/oauth/token?grant_type=password&username=${username}&password=${password}`
    options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${base_token}`,
      },
    }
  } else if (body.type === "createInvoice") {
    url = `${baseUrl}/merchant/loan`
    options.method = "POST"
    options.body = JSON.stringify(body.data)

    // Cancel Invoice
  } else if (body.type === "cancelInvoice") {
    url = `${baseUrl}/merchant/account/cancel`
    options.method = "POST"
    options.body = JSON.stringify(body.data)

    // Check Payment
  } else if (body.type === "checkPayment") {
    url = `${baseUrl}/merchant/loan/check/${body.invoiceId}`
    options.method = "GET"

    // User Check Possible Amount
  } else if (body.type === "checkPossibleAmount") {
    url = `${baseUrl}/user/possibleAmount`
    options.method = "POST"
    options.body = JSON.stringify(body.data)
  }

  try {
    const res = await $fetch(url, options)
    return res
  } catch (err) {
    return { err }
  }
})
