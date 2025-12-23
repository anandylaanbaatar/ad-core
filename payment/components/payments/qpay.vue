<template>
  <Loader v-if="loading"></Loader>

  <div v-else class="d-block light">
    <div class="w-full text-center py-3 mb-2">
      <img :src="paymentType.logo" height="35" :alt="paymentType.title" />
    </div>

    <section class="mb-5">
      <p
        v-if="payment.status !== 'complete'"
        class="mb-5 font2 w-full text-center"
      >
        {{ $utils.t("Total") }}:
        <span v-if="amount">{{ $currency.format(amount) }}</span>
      </p>

      <div class="paymentArea">
        <template v-if="payment.status === 'complete'">
          <div class="text-center">
            <i class="pi pi-check text-lg"></i>
            <p>{{ $utils.t("Payment successfull") }}</p>
          </div>
        </template>

        <template v-else-if="payment.invoice">
          <div class="row">
            <div class="col-xs-12 text-center paymentQrCodeArea">
              <p class="mb-2">
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
                class="col-xs-3 col-md-3 col-lg-2"
                v-for="url in payment.invoice.urls"
                :key="`urls_${url.name}`"
              >
                <div class="paymentItem">
                  <a
                    :href="url.link"
                    target="_blank"
                    class="flex align-items-center"
                  >
                    <div>
                      <img
                        :src="url.logo"
                        :alt="url.name"
                        width="80"
                        height="80"
                      />
                      <p>{{ url.description }}</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="row paymentActionBtnArea">
            <div class="col-xs-12 text-center px-3">
              <div class="w-full flex flex-wrap align-items-center">
                <div class="w-full">
                  <Message
                    v-if="payment.statusMsg"
                    closable
                    class="mt-4 c-message"
                    severity="warn"
                    >{{ payment.statusMsg }}</Message
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
    testMode: {
      type: Boolean,
      default: false,
    },
    invoiceNumber: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      default: null,
    },
  },

  data() {
    return {
      loading: true,

      // Payment
      payment: {
        accessToken: null,
        loading: false,
        status: null,
        statusMsg: null,
        invoiceId: null,
        invoice: null,
        confirmation: null,
      },
    }
  },

  computed: {
    user() {
      return useAuthStore().user
    },
    paymentType() {
      return usePaymentStore().paymentOptions.find((i) => i.id === "qpay")
    },
  },

  async mounted() {
    this.loading = false
    await this.createQPayInvoice()
  },
  beforeUnmount() {
    this.reset()
  },

  methods: {
    reset() {
      this.payment = {
        accessToken: null,
        loading: false,
        status: null,
        statusMsg: null,
        invoiceId: null,
        invoice: null,
        confirmation: null,
      }
    },

    // QPay
    async setQPayToken() {
      // Check if QPay plugin is available
      if (!this.$qpay) {
        this.payment.status = "error"
        console.error("[QPay] Plugin not initialized - check integrations.qpay config")
        return false
      }

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
      if (qpayData) {
        this.payment.accessToken = qpayData.access_token
      }
      return true
    },
    async createQPayInvoice() {
      this.payment.loading = true
      this.payment.invoiceId = `${this.invoiceNumber}`

      const tokenSet = await this.setQPayToken()
      if (!tokenSet) {
        this.payment.loading = false
        return
      }

      let qpayInvoice = {
        invoice_code: this.paymentType.options.invoiceCode,
        sender_invoice_no: this.payment.invoiceId,
        invoice_receiver_code: "terminal",
        invoice_description: `${useAppConfig().theme.name} - ${this.payment.invoiceId}`,
        amount: this.amount,
        callback_url: `${window.location.href}/success?invoice=${this.payment.invoiceId}`,
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
      this.payment.status = "pending"

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
            this.paymentComplete()
          } else {
            // Payment Successfull
            if (data && data.count > 0) {
              this.payment.statusMsg = this.$utils.t("Payment successfull.")
              this.payment.confirmation = data[0]

              this.paymentComplete()
              return

              // Payment Not Complete Yet
            } else {
              this.payment.status = "pending"
              this.payment.statusMsg = this.$utils.t("Payment pending.")

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

          this.payment.status = "error"
          this.payment.statusMsg = this.$utils.t(
            "Error while processing payment."
          )

          setTimeout(() => {
            this.payment.loading = false
          }, 3000)
        })
    },

    // Payment Complete
    paymentComplete() {
      this.payment.status = "complete"
      this.$bus.$emit("toast", {
        severity: "success",
        summary: this.$utils.t("Success"),
        detail: this.$utils.t(`Payment successfull.`),
      })

      setTimeout(() => {
        this.$emit("complete", {
          invoiceId: this.payment.invoiceId,
          confirmation: this.payment.invoice?.invoice_id,
          isTestMode: this.testMode,
          method: "qpay",
        })
      }, 3000)
    },
  },
}
</script>
