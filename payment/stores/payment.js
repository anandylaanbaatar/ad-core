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
          tenantId = features.multitenancy.tenantId
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

      // REMOVED: Steps 2 & 3 - Stripe customer creation now handled by Firebase Cloud Function
      //
      // The centralized auth API + cloud function automatically creates Stripe customers
      // during user signup. This client-side logic is no longer needed.
      //
      // If customerId is not found in Firebase, it means:
      // - User was created before the cloud function was deployed, OR
      // - Cloud function failed to create the Stripe customer
      //
      // In these cases, we'll log a warning but won't create the customer client-side.
      // The cloud function will handle retry logic and non-blocking execution.

      if (!customerId && userData && userData.email) {
        console.warn(
          "[Payment Store] ::: Stripe customer ID not found for user:",
          userData.uid,
          "- Cloud function should have created it during signup"
        )
      }

      if (customerId) {
        this.customerId = customerId
      }

      return customerId
    },
    /**
     * DEPRECATED: getStripeCustomerId - read-only lookup now handled by setStripeCustomerId
     * Kept for backwards compatibility but no longer actively used.
     */
    async getStripeCustomerId(email) {
      console.warn("[Payment Store] ::: getStripeCustomerId is deprecated")
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

    /**
     * DEPRECATED: createStripeCustomerId - now handled by Firebase Cloud Function
     * This method should not be called. Cloud function creates Stripe customers automatically.
     */
    async createStripeCustomerId(email) {
      console.error("[Payment Store] ::: createStripeCustomerId is DEPRECATED - use centralized auth API")
      return null
    },
  },
})
