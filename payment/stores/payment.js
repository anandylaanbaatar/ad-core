import { defineStore } from "pinia"

export const usePaymentStore = defineStore("payment", {
  id: "payment-store",

  state: () => ({
    customerId: null,
    stripeTestMode: false,
    paymentOptions: [
      {
        id: "qpay",
        title: "QPay",
        logo: "/images/theme/qpay_logo.png",
        active: false,
        options: {},
      },
      {
        id: "storepay",
        title: "StorePay",
        logo: "/images/theme/storepay_logo.png",
        active: false,
        options: {},
      },
      {
        id: "stripe",
        title: "Credit Card, Debit Card, Klarna",
        logo: "/images/theme/credit_card_icons.png",
        active: false,
        options: {},
      },
    ],
  }),

  actions: {
    set(key, data) {
      this[key] = data
    },

    setPaymentOptions() {
      const features = useRuntimeConfig().public.features

      if (features && features.payments) {
        const payments = features.payments

        for (let i = 0; i < this.paymentOptions.length; i++) {
          const paymentId = this.paymentOptions[i].id

          if (typeof payments[paymentId] !== "undefined") {
            this.paymentOptions[i].active = true
            this.paymentOptions[i].options = payments[paymentId]
          }
        }
      }
    },

    /**
     * Stripe
     */

    async setStripeCustomerId(userData) {
      let customerId = null

      const features = useRuntimeConfig().public.features
      const nuxtApp = useNuxtApp()

      if (!nuxtApp.$stripe) return

      let isMultitenant = false
      let tenantId = null
      let isTestMode = this.stripeTestMode

      // Check for Multitenancy
      if (features.multitenancy) {
        if (features.multitenancy.tenantId) {
          isMultitenant = true
          tenantId = features.multitenancy
        } else if (typeof features.multitenancy === "string") {
          isMultitenant = true
          tenantId = features.multitenancy
        }
      }

      // 1. Check for Customer Id in Auth User
      if (userData) {
        // Multitenant
        if (isMultitenant && tenantId) {
          if (isTestMode) {
            if (userData[tenantId] && userData[tenantId].test_customerId) {
              customerId = userData[tenantId].test_customerId
            }
          } else {
            if (userData[tenantId] && userData[tenantId].customerId) {
              customerId = userData[tenantId].customerId
            }
          }
          // Single Tenant
        } else {
          if (isTestMode) {
            if (userData.test_customerId) {
              customerId = userData.test_customerId
            }
          } else {
            if (userData.customerId) {
              customerId = userData.customerId
            }
          }
        }
      }

      // 2. Get CustomerId in Stripe by Email
      if (!customerId) {
        if (userData && userData.email) {
          const stripeCustomerId = await nuxtApp.$stripe.customer.get(
            userData.email
          )

          if (stripeCustomerId) {
            customerId = stripeCustomerId

            // Save User Customer Id
            let customerIdPath = `users/${userData.uid}`

            if (isMultitenant && tenantId) {
              customerIdPath = `users/${userData.uid}/${tenantId}`
            }
            let updates = {}

            if (isTestMode) {
              updates = {
                test_customerId: customerId,
              }
              this.test_customerId = customerId
            } else {
              updates = {
                customerId: customerId,
              }
            }

            await nuxtApp.$fire.actions.update(customerIdPath, updates)
          }
        }
      }

      // 3. Create CustomerId in Stripe by Email
      if (!customerId) {
        if (userData && userData.email) {
          const stripeCustomer = await nuxtApp.$stripe.customer.create(
            userData.email
          )

          if (stripeCustomer) {
            customerId = stripeCustomer.id

            // Save User Customer Id
            let customerIdPath = `users/${userData.uid}`

            if (isMultitenant && tenantId) {
              customerIdPath = `users/${userData.uid}/${tenantId}`
            }
            let updates = {
              customerId: customerId,
            }
            if (isTestMode) {
              updates = {
                test_customerId: customerId,
              }
            }

            await nuxtApp.$fire.actions.update(customerIdPath, updates)
          }
        }
      }

      if (customerId) {
        this.customerId = customerId
      }

      return customerId
    },
    async getStripeCustomerId(email) {
      return new Promise(async (resolve) => {
        const nuxtApp = useNuxtApp()

        if (!nuxtApp.$stripe) {
          resolve(null)
        }

        const customerId = await nuxtApp.$stripe.customer.get(email)

        if (customerId) {
          resolve(customerId)
        } else {
          resolve(null)
        }
      })
    },
    async createStripeCustomerId(email) {
      return new Promise(async (resolve) => {
        const nuxtApp = useNuxtApp()

        if (!nuxtApp.$stripe) {
          resolve(null)
        }

        const customer = await nuxtApp.$stripe.customer.create(email)

        if (customer && customer.id) {
          resolve(customer.id)
        } else {
          resolve(null)
        }
      })
    },
  },
})
