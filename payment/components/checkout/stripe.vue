<template>
  <Loader v-if="loading"></Loader>

  <div v-else class="d-block mt-3">
    <div class="w-full text-center py-3 mb-2">
      <img :src="paymentType.logo" height="35" :alt="paymentType.title" />
    </div>

    <section class="mb-5">
      <p v-if="cart" class="mb-5 font2 w-full text-center">
        {{ $utils.t("Total") }}: {{ $currency.format(totalAmount.total) }}
      </p>

      <div class="paymentArea">
        <form id="payment-form" class="c-payment">
          <div id="payment-element"></div>

          <Loader v-if="init" type="sm"></Loader>
          <template v-else>
            <Loader v-if="btnLoading" type="md"></Loader>

            <Button
              v-else
              label="Pay"
              class="w-full mt-4"
              @click="submit"
            ></Button>

            <Message v-if="error" severity="error" class="mt-3">{{
              error
            }}</Message>
          </template>
        </form>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  props: {
    cart: {
      type: Object,
      default: null,
    },
    totalAmount: {
      type: Object,
      default: null,
    },
    account: {
      type: Object,
      default: null,
    },
    lineItems: {
      type: Array,
      default: null,
    },
    shippingLine: {
      type: Object,
      default: null,
    },
    shippingAddress: {
      type: Object,
      default: null,
    },
    discountCode: {
      type: Array,
      default: null,
    },
  },

  data() {
    return {
      testMode: false,

      loading: true,
      checkoutLoading: true,

      // Order
      draftOrderId: null,

      // Payment
      payment: {
        loading: false,
      },

      // Stripe
      btnLoading: false,
      error: null,
      clientSecret: null,
    }
  },

  computed: {
    currency() {
      if (localStorage.getItem("currency")) {
        return localStorage.getItem("currency")
      } else {
        return useAppConfig().theme.currency
      }
    },
    orderForm() {
      return {
        email: this.account.email,
        phone: this.account.phone,
        lineItems: this.lineItems,
        shippingLine: this.shippingLine,
        shippingAddress: this.shippingAddress,
        presentmentCurrencyCode: this.currency,
        discountCodes: this.discountCodes,
        note: `Stripe`,
      }
    },
    paymentType() {
      return usePaymentStore().paymentOptions.find((i) => i.id === "stripe")
    },
    isDarkMode() {
      return useCoreStore().darkMode
    },
    customerId() {
      return usePaymentStore().customerId
    },
  },

  async mounted() {
    this.loading = false

    await this.createDraftOrder()
    this.initStripe()
  },
  beforeMount() {
    this.reset()
  },

  methods: {
    reset() {
      this.payment = {
        loading: false,
      }
    },

    // Orders
    async createDraftOrder() {
      if (localStorage.getItem("draftOrderId") !== null) {
        this.draftOrderId = localStorage.getItem("draftOrderId")
        await this.setInvoiceId()
        return
      }

      this.checkoutLoading = true

      const orderData = await this.$shopify.createDraftOrder(this.orderForm)

      if (
        orderData &&
        orderData.draftOrderCreate &&
        orderData.draftOrderCreate.draftOrder
      ) {
        let draftOrderId = orderData.draftOrderCreate.draftOrder.id.replace(
          "gid://shopify/DraftOrder/",
          ""
        )
        localStorage.setItem("draftOrderId", draftOrderId)
        this.draftOrderId = draftOrderId

        await this.setInvoiceId()
      }

      this.checkoutLoading = false
    },
    async setInvoiceId() {
      let invoiceData = localStorage.getItem("invoiceId")

      if (invoiceData) {
        this.payment.invoiceId = JSON.parse(invoiceData)
      } else {
        // await this.createStripeInvoice()
      }
    },
    async completeDraftOrder() {
      this.checkoutLoading = true

      const order = await this.$shopify.completeDraftOrder({
        orderId: this.draftOrderId,
      })

      if (order) {
        this.$bus.$emit("goTo", "/checkout/success")
      }

      this.checkoutLoading = false
    },

    // Stripe
    async initStripe() {
      if (this.init) return

      this.stripe = await this.$stripe.initStripe()

      // 1. Set Price
      await this.setPlan()

      // 2. Get Customer Id
      await this.setCustomer()

      // 3. Setup Payment Intent
      await this.setPaymentIntent()

      // 4. Setup Form
      await this.setupForm()

      this.init = true
    },
    async setPlan() {
      console.log("[Stripe] ::: Total Amount ::: ", this.totalAmount)
    },
    async setCustomer() {
      const user = this.account

      console.log("[Stripe] ::: Customer Id :: ", this.customerId)
    },
    async setPaymentIntent() {
      let paymentIntentOptions = {
        currency: this.currency,
        amount: parseFloat(this.totalAmount.total) * 100,
        customerId: this.customerId,
      }

      console.log(
        "[Stripe] ::: Payment Intent Options :: ",
        paymentIntentOptions
      )

      // Single Payment
      const paymentIntent =
        await this.$stripe.payment.intent(paymentIntentOptions)

      console.log("[Stripe] ::: Payment Intent :: ", paymentIntent)

      this.clientSecret = paymentIntent.client_secret
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
          colorPrimary: "#ffffff",
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

      this.form = document.querySelector("#payment-form")
      // this.form.addEventListener("submit", this.submit)
    },

    // Actions
    async submit() {
      // this.btnLoading = true
      const result = await this.elements.submit()
      // this.btnLoading = false

      console.log("[Stripe] ::: Form Submit :: ", result)

      // if (result && result.error) {
      //   this.btnLoading = false
      // }
      if (result && result.selectedPaymentMethod === "stripe") {
        const elements = this.elements

        // Payment Intent
        const { paymentIntent, error } = await this.stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${useAppConfig().theme.siteUrl}/checkout/success`,
          },
          redirect: "if_required",
        })

        // Error
        if (error) {
          console.log("[Stripe] ::: Confirm Payment Error :: ", error)
          this.error = error.message
          this.btnLoading = false
          return
        } else {
          console.log("[Stripe] ::: Confirm Payment Success :: ", paymentIntent)

          await this.completeDraftOrder()
        }
      }
    },
  },
}
</script>
