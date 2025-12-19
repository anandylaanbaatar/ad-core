/**
 * Stripe Integration Plugin
 *
 * This plugin is only loaded when integrations.stripe = true
 * (conditionally registered via v1/integrations/stripe layer)
 *
 * https://docs.stripe.com/api/payment_intents?lang=node
 * https://docs.stripe.com/api/checkout/sessions/object?lang=node
 * https://docs.stripe.com/js/elements_object/create_without_intent
 * https://github.com/stripe-samples/subscription-use-cases/blob/main/fixed-price-subscriptions/client/vanillajs/change-plan.html
 */

export default defineNuxtPlugin(async () => {
  // Dynamic imports - only load Stripe when integration layer is active
  const { default: Stripe } = await import("stripe")
  const { loadStripe } = await import("@stripe/stripe-js")

  const getKeys = () => {
    let keys = {}

    if (process.env.NODE_ENV === "production") {
      if (useRuntimeConfig().private.stripe) {
        keys.key = useRuntimeConfig().private.stripe.key
        keys.secret = useRuntimeConfig().private.stripe.secret
      } else if (process.env.NUXT_STRIPE_KEY) {
        keys.key = process.env.NUXT_STRIPE_KEY
        keys.secret = process.env.NUXT_STRIPE_SECRET
      }
    } else {
      if (useRuntimeConfig().private.stripe) {
        keys.key = useRuntimeConfig().private.stripe.test_key
        keys.secret = useRuntimeConfig().private.stripe.test_secret
      } else if (process.env.NUXT_STRIPE_KEY) {
        keys.key = process.env.NUXT_STRIPE_TEST_KEY
        keys.secret = process.env.NUXT_STRIPE_TEST_SECRET
      }
    }

    return keys
  }
  const KEYS_ = useState("keys", () => getKeys())
  const mode =
    process.env.NODE_ENV === "production" ? "Production Mode" : "Test Mode"

  // Server-side only
  if (!import.meta.client) {
    return
  }

  // Missing Key Checks
  if (!useRuntimeConfig().public.features.payments) {
    console.log("[Plugins] ::: [Stripe] ::: Payments Not Setup Yet!")
    return
  }
  if (!useRuntimeConfig().public.features.payments.stripe) {
    console.log("[Plugins] ::: [Stripe] ::: Missing Stripe Config!")
    return
  }
  if (!KEYS_.value || !KEYS_.value.key || !KEYS_.value.secret) {
    console.log("[Plugins] ::: [Stripe] ::: Missing Stripe Key & Secret!")
    return
  }
  if (useRuntimeConfig().public.features.log) {
    console.log(`[Plugins] ::: [Stripe] ::: Initialized! ::: ${mode}`)
  }

  // Initialize Stripe
  const KEY = KEYS_.value.key
  const SECRET = KEYS_.value.secret
  const stripe = Stripe(SECRET)

  // Set Test Mode in Payment Store
  if (mode === "Test Mode") {
    usePaymentStore().set("stripeTestMode", true)
  }

  // Check Stripe after init
  let isValid = false
  try {
    // Minimal check: fetch account details to confirm key validity
    await stripe.accounts.retrieve()
    isValid = true
  } catch (err) {
    console.error(
      "[Stripe] Invalid or expired keys, plugin disabled:",
      err.message
    )
  }
  if (!isValid) {
    usePaymentStore().set("stripeDisabled", true)
    return { provide: { stripe: null } }
  }

  /**
   * Frontend
   */

  const initStripe = async () => {
    const stripeClient = await loadStripe(KEY)
    return stripeClient
  }

  // Product
  const getPrices = async () => {
    return new Promise(async (resolve) => {
      try {
        const res = await stripe.prices.list({ limit: 10 })
        const data = res

        data.data = res.data.map((i) => {
          let newPrice = i
          newPrice.formattedPrice = i.unit_amount / 100
          return newPrice
        })

        console.log("[Stripe] ::: Prices Success :: ", data)

        resolve(data)
      } catch (err) {
        console.log("[Stripe] ::: Prices Error :: ", err.message)
        resolve(null)
      }
    })
  }
  const createProduct = async (data) => {
    return new Promise(async (resolve) => {
      try {
        let form = {
          name: data.name,
          default_price_data: {
            unit_amount: data.amount,
            currency: data.currency,
          },
          expand: ["default_price"],
        }
        if (data.interval !== "one_off") {
          form.default_price_data.recurring = {
            interval: data.interval,
          }
        }

        const res = await stripe.products.create(form)
        resolve(res)
      } catch (err) {
        console.log("[Stripe] ::: Create Product Error :: ", err.message)
        resolve(null)
      }
    })
  }
  const updateProduct = async (data) => {
    return new Promise(async (resolve) => {
      try {
        let form = {
          name: data.name,
          default_price: data.priceId,
        }
        let priceForm = {
          currency: data.currency,
          unit_amount: data.amount,
          product: data.id,
        }
        if (data.interval !== "one_off") {
          priceForm.recurring = {
            interval: data.interval,
          }
        }

        // Create New Price
        const res2 = await stripe.prices.create(priceForm)
        if (res2) {
          form.default_price = res2.id
        }

        // Update Product
        const res = await stripe.products.update(data.id, form)

        // Disable Old Price
        const res3 = await stripe.prices.update(data.priceId, {
          active: false,
        })

        let result = res
        result.default_price = res2
        resolve(result)
      } catch (err) {
        console.log("[Stripe] ::: Update Product Error :: ", err.message)
        resolve(null)
      }
    })
  }
  const deleteProduct = async (id) => {
    return new Promise(async (resolve) => {
      try {
        // const res = await stripe.products.del(id)

        const res = await stripe.products.update(id, {
          active: false,
        })

        resolve(res)
      } catch (err) {
        console.log("[Stripe] ::: Delete Product Error :: ", err.message)
        resolve(null)
      }
    })
  }

  /**
   * Backend
   */

  // Payment
  const createPaymentIntent = async (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await stripe.paymentIntents.create({
          currency: data.currency,
          amount: data.amount,
          customer: data.customerId,
          automatic_payment_methods: {
            enabled: true,
          },
        })

        console.log("[Stripe] ::: Payment Intent Success :: ", res)

        resolve(res)
      } catch (err) {
        console.log(
          "[Stripe] ::: Error creating payment intent :: ",
          err.message
        )
        reject(null)
      }
    })
  }
  const confirmPaymentIntent = async (paymentIntentId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await stripe.paymentIntents.confirm(paymentIntentId)

        console.log("[Stripe] ::: Payment Intent Confirm Success :: ", res)

        resolve(res)
      } catch (err) {
        console.log(
          "[Stripe] ::: Error confirming payment intent :: ",
          err.message
        )
        reject(null)
      }
    })
  }
  const confirmPayment = async (elements, returnUrl) => {
    return new Promise(async (resolve, reject) => {
      const { error } = await stripe.confirmPayment(SECRET, {
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
      })

      if (error) {
        reject(error)
      } else {
        resolve({
          redirect: true,
          returnUrl: returnUrl,
        })
      }
    })
  }
  const createCheckoutSession = async (priceId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await stripe.checkout.sessions.create({
          mode: "subscription",
          line_itmes: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
        })

        console.log("[Stripe] ::: Payment Intent Success :: ", res)

        resolve(res.client_secret)
      } catch (err) {
        console.log(
          "[Stripe] ::: Error creating payment intent :: ",
          err.message
        )
        reject(null)
      }
    })
  }

  // Customer
  const createCustomer = async (email) => {
    return new Promise(async (resolve, reject) => {
      try {
        const customer = await stripe.customers.create({
          email: email,
        })

        resolve(customer)
      } catch (err) {
        console.log("[Stripe] ::: Customer Create Error :: ", err.message)
        reject(null)
      }
    })
  }
  const getCustomer = async (email) => {
    return new Promise(async (resolve, reject) => {
      try {
        const customersRes = await stripe.customers.search({
          query: `email~"${email}"`,
        })
        let customerId = null

        if (customersRes) {
          if (customersRes.data && customersRes.data.length > 0) {
            let customerObj = customersRes.data.find((i) => i.email === email)
            if (customerObj) {
              customerId = customerObj.id
            }
          }
        }

        resolve(customerId)
      } catch (err) {
        console.log("[Stripe] ::: Customer Get Error :: ", err.message)
        reject(null)
      }
    })
  }

  // Subscriptions
  const getAllSubscriptions = async (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        let options = {
          limit: 50,
          status: "all",
          expand: ["data.default_payment_method"],
        }
        if (data) {
          if (data.customerId) {
            options.customer = data.customerId
          }
          if (data.limit) {
            options.limit = data.limit
          }
          if (data.status) {
            options.status = data.status
          }
        }

        const subscriptions = await stripe.subscriptions.list(options)
        resolve(subscriptions)
      } catch (err) {
        console.log("[Stripe] ::: All Subscriptions Error :: ", err.message)
        resolve(null)
      }
    })
  }
  const createSubscription = async (customerId, priceId, endAt) => {
    return new Promise(async (resolve, reject) => {
      try {
        let options = {
          customer: customerId,
          items: [
            {
              price: priceId,
            },
          ],
          payment_behavior: "default_incomplete",
          expand: ["latest_invoice.payment_intent"],
        }
        if (endAt) {
          options.cancel_at = endAt
        }

        const subscription = await stripe.subscriptions.create(options)

        resolve({
          subscriptionId: subscription.id,
          clientSecret:
            subscription.latest_invoice.payment_intent.client_secret,
        })
      } catch (err) {
        console.log("[Stripe] ::: Subcsription error :: ", err.message)
        reject(null)
      }
    })
  }
  const cancelSubscription = async (subscriptionId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const deletedSubscription =
          await stripe.subscriptions.cancel(subscriptionId)

        resolve({
          subscription: deletedSubscription,
        })
      } catch (err) {
        console.log("[Stripe] ::: Cancel Subscription Error :: ", err.message)
        reject(null)
      }
    })
  }
  const updateSubscription = async (subscriptionId, priceLookupKey) => {
    return new Promise(async (resolve, reject) => {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const updatedSubscription = await stripe.subscriptions.update(
          subscriptionId,
          {
            items: [
              {
                id: subscription.items.data[0].id,
                price: priceLookupKey.toUpperCase(),
              },
            ],
          }
        )

        resolve({
          subscription: updatedSubscription,
        })
      } catch (err) {
        console.log("[Stripe] ::: Update Subscription Error :: ", err.message)
        reject(null)
      }
    })
  }

  // Invoices
  const getAllInvoices = async (customerId, subscriptionId) => {
    return new Promise(async (resolve) => {
      try {
        let options = {
          customer: customerId,
          status: "paid",
          limit: 50,
        }
        if (subscriptionId) {
          options.subscription = subscriptionId
        }
        const invoices = await stripe.invoices.list(options)

        resolve(invoices)
      } catch (err) {
        console.log("[Stripe] ::: All Invoices Error :: ", err.message)
        resolve(null)
      }
    })
  }

  return {
    provide: {
      stripe: {
        stripe,

        initStripe,

        product: {
          prices: getPrices,
          create: createProduct,
          update: updateProduct,
          delete: deleteProduct,
        },
        payment: {
          intent: createPaymentIntent,
          confirmIntent: confirmPaymentIntent,
          session: createCheckoutSession,
          confirm: confirmPayment,
        },
        customer: {
          create: createCustomer,
          get: getCustomer,
        },
        subscription: {
          list: getAllSubscriptions,
          create: createSubscription,
          cancel: cancelSubscription,
          update: updateSubscription,
        },
        invoice: {
          list: getAllInvoices,
        },
      },
    },
  }
})
