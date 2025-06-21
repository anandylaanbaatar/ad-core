<template>
  <form v-if="productId && product" id="subscribe-form" class="c-payment">
    <div id="payment-element"></div>

    <Loader v-if="!init" type="sm"></Loader>
    <template v-else>
      <Loader v-if="btnLoading" type="md"></Loader>
      <Button
        v-else-if="!error"
        type="submit"
        label="Subscribe"
        class="w-full mt-4"
      ></Button>

      <Message v-if="error" severity="error" class="mt-3">{{ error }}</Message>
    </template>
  </form>
</template>

<script>
export default {
  props: {
    productId: String,
  },

  data() {
    return {
      init: false,
      initError: false,
      loading: false,
      btnLoading: false,

      stripe: null,
      form: null,
      elements: null,
      error: null,
      clientSecret: null,
    }
  },

  computed: {
    isDarkMode() {
      const coreStore = useCoreStore()
      return coreStore.darkMode
    },
    products() {
      return useServicesStore().products
    },
    product() {
      if (this.products && this.productId) {
        return this.products.find((i) => i.id === this.productId)
      }
      return
    },
    customerId() {
      return usePaymentStore().customerId
    },
    user() {
      return useAuthStore().user
    },
  },

  async mounted() {
    this.initStripe()
    this.loading = false

    console.log("[Stripe Form] ::: User ::: ", this.user)
    console.log("[Stripe Form] ::: Product ::: ", this.product)
  },

  methods: {
    async initStripe() {
      if (this.init) return

      try {
        this.stripe = await this.$stripe.initStripe()

        // 1. Get Customer Id
        await this.setCustomer()

        // 2. Setup Payment Intent
        await this.setPaymentIntent()

        // 3. Setup Forms
        await this.setupForm()

        this.init = true
      } catch (err) {
        this.init = true
        this.loading = false
        this.error = "Error setting up payment form!"
      }
    },

    // Setup
    async setCustomer() {
      const user = await this.$fire.actions.user()
      this.user = user

      console.log("[Stripe] ::: Customer Id :: ", this.customerId)
    },
    async setPaymentIntent() {
      if (!this.product) return

      // Recurring Subscription
      if (this.product.interval !== "one_off") {
        const subscriptionEndAt = this.$utils
          .moment(this.product.end_date_time)
          .unix()

        const subscription = await this.$stripe.subscription.create(
          this.customerId,
          this.product.priceId,
          subscriptionEndAt
        )

        console.log("[Stripe] ::: Subscription :: ", subscription)

        this.subscriptionId = subscription.id
        this.clientSecret = subscription.clientSecret

        // Single Payment
      } else {
        const paymentIntent = await this.$stripe.payment.intent({
          currency: this.product.currency,
          amount: this.product.amount,
          customerId: this.customerId,
        })

        console.log("[Stripe] ::: Payment Intent :: ", paymentIntent)

        this.clientSecret = paymentIntent.client_secret
      }
    },
    async setupForm() {
      let appearance = {
        theme: "flat",
        variables: {
          colorPrimary: "#000000",
        },
        rules: {
          ".AccordionItem": {
            boxShadow: "none",
            borderRadius: "15px",
          },
          ".Block": {
            boxShadow: "none",
          },
          ".Input": {
            boxShadow: "none",
            borderRadius: "15px",
          },
          ".Label": {},
        },
      }
      if (this.isDarkMode) {
        appearance.theme = "night"
        appearance.variables = {
          colorPrimary: "#53c01e",
          colorBackground: "#1b1c1f",
          background: "#1b1c1f",
        }
      }
      const options = {
        // paymentMethodOrder: ["apple_pay", "google_pay", "card", "klarna"],
        layout: {
          type: "accordion",
          defaultCollapsed: false,
          radios: true,
          spacedAccordianItems: false,
        },
      }
      const clientSecret = this.clientSecret

      this.elements = this.stripe.elements({
        appearance,
        clientSecret,
      })
      const paymentElement = this.elements.create("payment", options)
      paymentElement.mount("#payment-element")

      this.form = document.querySelector("#subscribe-form")
      this.form.addEventListener("submit", this.submit)
    },

    // Actions
    async submit(event) {
      event.preventDefault()

      this.btnLoading = true
      const result = await this.elements.submit()

      console.log("[Stripe] ::: Form Submit ::", result)

      if (result && result.selectedPaymentMethod === "stripe") {
        const elements = this.elements

        const { paymentIntent, error } = await this.stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${theme().siteUrl}/services/success`,
          },
          redirect: "if_required",
        })

        if (error) {
          console.log("[Stripe] ::: Confirm Payment Error :: ", error)

          this.error = error.message
        } else {
          console.log("[Stripe] ::: Confirm Payment Success!", paymentIntent)

          await this.paymentSuccess(paymentIntent)
        }
      } else if (result && result.selectedPaymentMethod === "klarna") {
        console.log("[Stripe] ::: Use Klarna Method")

        const { paymentIntent, error } = await this.stripe.confirmKlarnaPayment(
          this.clientSecret,
          {
            return_url: `${theme().siteUrl}/services/success`,
          }
        )

        if (error) {
          console.log("[Stripe] ::: Confirm Klarna Error :: ", error)

          this.error = error.message
        } else {
          console.log("[Stripe] ::: Confirm Klarna Success :: ", paymentIntent)

          await this.paymentSuccess(paymentIntent)
        }
      }

      this.btnLoading = false
    },
    async paymentSuccess(paymentIntent) {
      if (this.user) {
        // Join Single Class
        if (this.product.interval === "one_off") {
          if (
            this.product.results &&
            this.product.results.classes &&
            this.product.results.classes.length > 0
          ) {
            const classItem = this.product.results.classes[0]
            await joinClass(this.product, classItem, this.user.uid)
          }
        } else {
          let subscriptions = []
          let subscription = {
            id: this.subscriptionId ? this.subscriptionId : null,
            productId: this.product.id,
          }
          subscriptions.push(subscription)

          await this.$fire.actions.update(
            `/users/${this.user.uid}/subscriptions`,
            subscriptions
          )
        }
      }

      await useServicesStore().setSubscriptions()
      await useServicesStore().setInvoices()

      this.$bus.$emit(
        "goTo",
        `/services/success?pi=${paymentIntent.id}&pics=${paymentIntent.client_secret}`
      )
    },
  },
}
</script>
