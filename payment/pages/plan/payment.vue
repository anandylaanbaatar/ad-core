<template>
  <AppLayout type="regular">
    <div class="c-page plans">
      <div class="container py-4">
        <h1 class="c-title text-center my-4">Payment</h1>

        <div v-if="plan" class="planArea">
          <Plan type="single" :plan="plan"></Plan>
        </div>

        <form id="subscribe-form" class="c-payment">
          <div id="payment-element"></div>

          <Loader v-if="!init" type="sm"></Loader>
          <template v-else>
            <Loader v-if="btnLoading" type="md"></Loader>
            <Button
              v-else
              type="submit"
              label="Subscribe"
              class="w-full mt-4"
            ></Button>

            <Message v-if="error" severity="error" class="mt-3">{{
              error
            }}</Message>
          </template>
        </form>
      </div>
    </div>
  </AppLayout>
</template>

<script>
export default {
  data() {
    return {
      init: false,
      loading: true,
      btnLoading: false,

      plan: null,
      user: null,
      customerId: null,

      stripe: null,
      form: null,
      elements: null,
      prices: null,
      error: null,
      clientSecret: null,
    }
  },

  computed: {
    isDarkMode() {
      const coreStore = useCoreStore()
      return coreStore.darkMode
    },
  },

  async mounted() {
    this.initStripe()
    this.loading = false
  },

  methods: {
    async initStripe() {
      if (this.init) return

      this.stripe = await this.$stripe.initStripe()

      // 1. Set Prices
      await this.setPlan()

      // 2. Get Customer Id
      await this.setCustomer()

      // 3. Setup Payment Intent
      await this.setPaymentIntent()

      // 4. Setup Forms
      await this.setupForm()

      this.init = true
    },

    // Setup
    async setPlan() {
      const route = useRoute()
      if (route.query.plan) {
        const { data } = await this.$stripe.product.prices()
        let plan = data.find((i) => i.lookup_key === route.query.plan)
        this.plan = plan

        // console.log("[Stripe] ::: Plan :: ", this.plan)
      }
    },
    async setCustomer() {
      if (!this.$stripe) return

      const user = await this.$fire.actions.user()
      this.user = user

      console.log("[Firebase] ::: User :: ", user)

      // Customer Exists
      if (user.customerId) {
        this.customerId = user.customerId

        // Create Stripe Customer and Update in DB.
      } else {
        const customer = await this.$stripe.customer.create(user.email)

        console.log("[Stripe] ::: Customer :: ", customer)

        this.customerId = customer.id

        await this.$fire.actions.update(`/users/${user.uid}`, {
          customerId: customer.id,
        })
      }
    },
    async setPaymentIntent() {
      if (!this.$stripe) return

      // Recurring Subscription
      if (this.plan && this.plan.type === "recurring") {
        const subscription = await this.$stripe.subscription.create(
          this.customerId,
          this.plan.id
        )

        console.log("[Stripe] ::: Subscription :: ", subscription)

        this.subscriptionId = subscription.id
        this.clientSecret = subscription.clientSecret

        // Single Payment
      } else {
        const paymentIntent = await this.$stripe.payment.intent({
          currency: this.plan.currency,
          amount: this.plan.unit_amount,
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
          colorPrimary: "#53c01e",
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
            return_url: `https://localhost:3000/plan/success`,
          },
          redirect: "if_required",
        })

        if (error) {
          console.log("[Stripe] ::: Confirm Payment Error :: ", error)

          this.error = error.message
        } else {
          console.log("[Stripe] ::: Confirm Payment Success!", paymentIntent)

          if (this.user) {
            await this.$fire.actions.update(`/users/${this.user.uid}`, {
              plan: this.plan.lookup_key,
              subscriptionId: this.subscriptionId ? this.subscriptionId : null,
            })
          }

          this.$bus.$emit(
            "goTo",
            `/plan/success?pi=${paymentIntent.id}&pics=${paymentIntent.client_secret}`
          )
        }
      }

      this.btnLoading = false
    },
  },
}
</script>
