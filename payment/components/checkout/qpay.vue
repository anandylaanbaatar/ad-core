<template>
  <Loader v-if="loading"></Loader>

  <div v-else class="d-block mt-3">
    <div class="w-full text-center py-3 mb-2">
      <img :src="paymentType.logo" height="35" :alt="paymentType.title" />
    </div>

    <section class="mb-5">
      <p v-if="cart" class="mb-5 font2 w-full text-center">
        {{ $utils.t("Total") }}: {{ $currency.format(totalAmount.total) }} ({{
          $utils.formatPrice(totalAmount.total) + "₮"
        }})
      </p>

      <div class="paymentArea">
        <template v-if="payment.invoice">
          <div class="row">
            <div class="col-xs-12 text-center paymentQrCodeArea">
              <p class="mb-2">
                {{ $utils.t("Draft Order Id") }}: {{ payment.invoiceId }}
              </p>
              <p class="mb-4">
                {{ $utils.t("Invoice Id") }}: {{ payment.invoice.invoice_id }}
              </p>

              <a :href="payment.invoice.qPay_shortUrl" target="_blank">
                <img
                  v-if="payment.invoice.qr_image"
                  :src="`data:image/jpeg;base64,${payment.invoice.qr_image}`"
                  alt="QR Code"
                  width="250"
                  height="250"
                  class="paymentQrImage"
                />
              </a>
            </div>

            <div v-if="payment.invoice.urls" class="row paymentBankIconsArea">
              <div
                class="col-xs-3 col-md-3 col-lg-2 paymentItem"
                v-for="url in payment.invoice.urls"
                :key="`urls_${url.name}`"
              >
                <a :href="url.link" target="_blank">
                  <img :src="url.logo" :alt="url.name" width="80" height="80" />
                  <p>{{ url.description }}</p>
                </a>
              </div>
            </div>
          </div>

          <div class="row paymentActionBtnArea">
            <div class="col-xs-12 text-center px-3">
              <div class="w-full flex flex-wrap align-items-center">
                <div class="w-full">
                  <Message
                    v-if="payment.checkPaymentMsg"
                    closable
                    class="mt-4 c-message"
                    severity="warn"
                    >{{ payment.checkPaymentMsg }}</Message
                  >
                </div>
              </div>
            </div>
          </div>
        </template>

        <Loader v-else-if="payment.loading" type="small"></Loader>
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
      checkoutLoading: false,

      // Order
      draftOrderId: null,

      // Payment
      payment: {
        accessToken: null,
        loading: false,
        modal: false,
        invoiceId: null,
        invoice: null,
        list: null,
        checkPaymentMsg: null,
      },
    }
  },

  computed: {
    orderForm() {
      return {
        email: this.account.email,
        phone: this.account.phone,
        lineItems: this.lineItems,
        shippingLine: this.shippingLine,
        shippingAddress: this.shippingAddress,
        presentmentCurrencyCode: "MNT",
        discountCodes: this.discountCodes,
        note: `QPay`,
      }
    },
    paymentType() {
      return useAppConfig().theme.payment.payments.find((i) => i.id === "qpay")
    },
    invoiceCode() {
      return this.paymentType.qpay_invoice_code
    },
  },

  async mounted() {
    this.loading = false

    await this.createDraftOrder()
  },
  beforeUnmount() {
    this.reset()
  },

  methods: {
    reset() {
      this.payment = {
        accessToken: null,
        loading: false,
        modal: false,
        invoiceId: null,
        invoice: null,
        list: null,
        checkPaymentMsg: null,
      }
      this.draftOrderId = null
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
        await this.createQPayInvoice()
      }

      console.log("[QPay] ::: Set Invoice Id :: ", this.payment.invoiceId)
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

    // QPay Payment
    async setQPayToken() {
      // QPay Token
      let qpay_token = localStorage.getItem("qpay_token")
      let qpayData = null
      let isExpired = null

      // Existing Token
      if (qpay_token) {
        qpayData = JSON.parse(qpay_token)
        isExpired = this.$qpay.isTokenExpired(qpayData)

        if (isExpired) {
          qpayData = null
          isExpired = null
        }
      }
      // Create New Token
      if (qpayData === null) {
        const res = await this.$qpay.getToken()
        qpayData = res

        if (res) {
          localStorage.setItem("qpay_token", JSON.stringify(res))
        }
      }

      // Set Payment Token
      this.payment.accessToken = qpayData.access_token
    },
    async createQPayInvoice() {
      this.payment.loading = true
      this.payment.invoiceId = this.draftOrderId // Set Draft Order Id

      await this.setQPayToken()

      let qpayInvoice = {
        invoice_code: this.invoiceCode,
        sender_invoice_no: this.payment.invoiceId,
        invoice_receiver_code: "terminal",
        invoice_description: `${useAppConfig().theme.name} - ${this.payment.invoiceId}`,
        amount: this.totalAmount.total,
        callback_url: `${useAppConfig().theme.siteUrl}/checkout/success?invoice=${this.payment.invoiceId}`,
      }

      console.log("QPay ::: Create Invoice :: ", qpayInvoice)

      await $fetch("/api/qpay", {
        method: "POST",
        body: {
          token: this.payment.accessToken,
          type: "createInvoice",
          data: qpayInvoice,
        },
      })
        .then(async (data) => {
          if (data && data.err) {
            console.log("QPay ::: Create Invoice :: Error: ", data)

            this.payment.loading = false
          } else {
            console.log("QPay ::: Create Invoice :: Success: ", data)

            this.payment.invoice = data
            this.payment.loading = false

            await this.checkQPayPayment()
          }
        })
        .catch((err) => {
          console.log("QPay ::: Create Invoice :: Error: ", err)

          // this.payment.invoice = err
          this.payment.loading = false
        })
    },
    async checkQPayPayment() {
      this.payment.loading = true

      if (!this.payment.invoice.invoice_id) {
        this.payment.loading = false
        return
      }

      let qpayPaymentData = {
        object_type: "INVOICE",
        object_id: `${this.payment.invoice.invoice_id}`,
        offset: {
          page_number: 1,
          page_limit: 100,
        },
      }

      console.log("QPay ::: Check Payment :: ", qpayPaymentData)

      await $fetch(`/api/qpay`, {
        method: "POST",
        body: {
          token: this.payment.accessToken,
          type: "checkPayment",
          data: qpayPaymentData,
        },
      })
        .then(async (data) => {
          console.log("Qpay ::: Check Payment :: Success: ", data)

          // Test Mode
          if (this.testMode) {
            await this.completeDraftOrder()
          } else {
            // Payment Successfull
            if (data && data.count > 0) {
              this.payment.checkPaymentMsg = this.$utils.t(
                "Payment successfull."
              )

              await this.completeDraftOrder()
              return

              // Payment Not Complete Yet
            } else {
              this.payment.checkPaymentMsg = this.$utils.t("Payment pending.")

              setTimeout(async () => {
                await this.checkQPayPayment()
              }, 5000)
            }

            setTimeout(() => {
              this.payment.loading = false
            }, 3000)
          }
        })
        .catch((err) => {
          console.log("Qpay ::: Check Payment :: Error: ", err)

          this.payment.checkPaymentMsg = this.$utils.t(
            "Error while processing payment."
          )

          setTimeout(() => {
            this.payment.loading = false
          }, 3000)
        })
    },
  },
}
</script>
