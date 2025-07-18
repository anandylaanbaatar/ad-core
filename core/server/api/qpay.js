import { defineEventHandler, readBody } from "h3"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const sandboxUrl = `https://merchant-sandbox.qpay.mn/v2`
  const baseUrl = `https://merchant.qpay.mn/v2`
  const config = useRuntimeConfig(event)

  if (!config.private.qpay) return

  const keys = config.private.qpay
  const base_token = keys.token
  const token = body.token

  let url = `${baseUrl}/invoice`
  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }

  // Create Invoice
  if (body.type === "getToken") {
    url = `${baseUrl}/auth/token`
    options = {
      method: "POST",
      headers: {
        Authorization: `Basic ${base_token}`,
      },
    }
  } else if (body.type === "createInvoice") {
    options.method = "POST"
    options.body = JSON.stringify(body.data)

    // Cancel Invoice
  } else if (body.type === "cancelInvoice") {
    url = `${baseUrl}/invoice/${body.invoiceId}`
    options.method = "DELETE"

    // Check Payment
  } else if (body.type === "checkPayment") {
    url = `${baseUrl}/payment/check`
    options.method = "POST"
    options.body = JSON.stringify(body.data)

    // Payment List
  } else if (body.type === "paymentList") {
    url = `${baseUrl}/payment/list`
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
