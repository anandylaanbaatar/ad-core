<template>
  <div class="d-block mt-3">
    <div class="w-full text-center py-3 mb-2">
      <img :src="paymentType.logo" height="30" :alt="paymentType.title" />
    </div>

    <div class="c-form row">
      <div class="c-field col-xs-12 mb-3">
        <!--Form-->
        <template v-if="!storepay.user">
          <label for="phone">{{ $utils.t("Phone") }}</label>

          <InputGroup>
            <InputGroupAddon class="c-phoneDropdown-wrapper">
              <Select
                v-if="allCountries"
                v-model="form.selectedCountry"
                :options="allCountries"
                optionLabel="name"
                :placeholder="$utils.t('Select')"
                class="c-phoneDropdown"
                @change="validation"
                :disabled="loading"
              >
                <template #value="slotProps">
                  <div v-if="slotProps.value" class="flex align-items-center">
                    <img
                      :alt="slotProps.value.label"
                      :src="`https://flagcdn.com/w20/${slotProps.value.code.toLowerCase()}.png`"
                      :class="`mr-2 flag flag-${slotProps.value.code.toLowerCase()}`"
                    />
                    <div>{{ slotProps.value.dialCode }}</div>
                  </div>
                  <span v-else>
                    {{ slotProps.placeholder }}
                  </span>
                </template>
                <template #option="slotProps">
                  <div class="flex align-items-center">
                    <img
                      :alt="slotProps.option.label"
                      :src="`https://flagcdn.com/w20/${slotProps.option.code.toLowerCase()}.png`"
                      :class="`mr-2 flag flag-${slotProps.option.code.toLowerCase()}`"
                    />
                    <div>
                      {{ slotProps.option.dialCode }} -
                      {{ slotProps.option.name }}
                    </div>
                  </div>
                </template>
              </Select>
            </InputGroupAddon>

            <InputText
              id="phone"
              class="c-phoneDropdown-input"
              v-model="form.phone"
              aria-describedby="phone-help"
              :placeholder="$utils.t('Phone')"
              autocomplete="off"
              :invalid="errors.phone"
              @change="validation"
              :disabled="loading"
            />
          </InputGroup>

          <small v-if="errors.phone" id="phone-help" class="error">{{
            errors.phone
          }}</small>

          <Loader v-if="loading" type="small"></Loader>
          <Button
            v-else
            :label="$utils.t('Check StorePay Amount')"
            class="w-full p-3 mt-3"
            @click="checkStorePayUser"
            :disabled="!isValid"
          ></Button>
        </template>

        <template v-else>
          <!--User Info-->
          <div class="c-block text-center relative py-6 mb-3">
            <Button
              icon="pi pi-arrow-left"
              rounded
              severity="secondary"
              class="sm absolute top-0 left-0 m-3"
              @click="reset"
              v-tooltip.right="$utils.t('Cancel')"
            ></Button>
            <Button
              icon="pi pi-user-edit"
              rounded
              severity="secondary"
              class="c-block-top-right mt-3 mr-3 sm"
              @click="reset"
              v-tooltip.left="$utils.t('Update')"
            ></Button>

            <div>
              <i class="pi pi-user userIcon text-3xl mb-2"></i>
              <h4 class="mb-2">{{ storepay.user.phone }}</h4>
              <p class="mb-1 font2">
                {{ $utils.t("Available loan amount") }}:
                {{ $currency.format(storepay.user.amount) }}
              </p>
              <p class="font2">
                {{ $utils.t("Loan amount") }}:
                {{ $currency.format(totalAmount.total) }}
              </p>
              <p v-if="storepay.invoiceId" class="mt-1">
                {{ $utils.t("Loan id") }}: {{ storepay.invoiceId }}
              </p>
            </div>
          </div>

          <!--Pay Now-->
          <template v-if="storepay.user.isValid">
            <div class="qrCodeArea">
              <div id="qrcode"></div>
            </div>

            <template v-if="!storepay.invoiceId">
              <Loader v-if="loading" type="small"></Loader>
              <Button
                v-else
                :label="$utils.t('Pay Now')"
                class="w-full p-3"
                @click="createStorePayInvoice"
              ></Button>
            </template>
          </template>
        </template>

        <Message
          v-if="storepay.checkPaymentMsg"
          :closable="false"
          class="mt-4 c-message"
          severity="warn"
          >{{ storepay.checkPaymentMsg }}</Message
        >
      </div>
    </div>
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
      loading: true,
      paymentLoading: false,

      form: {
        phone: null,
        selectedCountry: null,
      },
      isValid: false,
      errors: {
        phone: null,
      },

      storepay: {
        access_token: null,
        invoiceId: null,
        checkPaymentMsg: null,
      },

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
    paymentType() {
      return usePaymentStore().paymentOptions.find((i) => i.id === "storepay")
    },
    allCountries() {
      return this.$forms.phoneCountries()
    },
    userCountry() {
      const store = useCommerceStore()

      if (store.userLocation) {
        return store.userLocation.countryCode.toLowerCase()
      }

      return null
    },
    orderForm() {
      return {
        email: this.account.email,
        phone: this.account.phone,
        lineItems: this.lineItems,
        shippingLine: this.shippingLine,
        shippingAddress: this.shippingAddress,
        presentmentCurrencyCode: "MNT",
        discountCodes: this.discountCodes,
        note: `StorePay ::: ${this.storepay.invoiceId}`,
      }
    },
  },

  async mounted() {
    if (this.account && this.account.phone) {
      const parsedPhone = this.$utils.parsePhoneNumber(this.account.phone)

      this.form.selectedCountry = this.allCountries.find(
        (i) => i.code.toLowerCase() === "mn"
      )
      this.form.phone = parsedPhone.nationalNumber
      this.isValid = true
    }

    this.loading = false
  },
  beforeUnmount() {
    this.reset()
  },

  methods: {
    reset() {
      this.isValid = false
      this.errors = {}
      this.storepay.invoiceId = null
      this.storepay.checkPaymentMsg = null
      this.storepay.user = null
      this.draftOrderId = null
    },
    validation() {
      this.reset()

      const validation = this.$forms.validateForm(
        this.form,
        this.form.selectedCountry.code
      )

      this.isValid = validation.isValid
    },

    // StorePay Payment
    async setStorePayToken() {
      const res = await this.$storepay.getToken()

      if (res) {
        localStorage.setItem(`storepay_token`, JSON.stringify(res))

        this.storepay.accessToken = res.access_token
      }
    },
    async checkStorePayUser() {
      this.loading = true

      await this.setStorePayToken()

      const res = await this.$storepay.checkPossibleAmount({
        phone: this.form.phone,
      })

      console.log("[StorePay] ::: Check User Amount ::", res)

      if (res && res.status === "Success") {
        let isValid = true

        if (this.totalAmount.total < 100000) {
          isValid = false
          this.showErrorMsg(
            `StorePay-ээр төлбөр төлөхийн тулд нийт төлбөр 100,000₮ өөс дээш бараа худалдан авалт байх ёстой.`,
            -1
          )
        } else if (this.totalAmount.total > res.value) {
          isValid = false
          this.showErrorMsg(
            `Таний StorePay-ийн нийт зээлийн боломжит үлдэгдэл хүрэлцэхгүй байна.`,
            -1
          )
        }

        this.storepay.user = {
          amount: res.value,
          phone: this.form.phone,
          isValid: isValid,
        }

        if (isValid) {
          await this.createStorePayInvoice()
        }
      } else if (res && res.status === "Failed") {
        this.showErrorMsg(
          "Хэрэглэгч StorePay-д бүртгэлгүй эсвэл хараахан идэвхжүүлээгүй байна.",
          10000
        )
      }

      this.loading = false
    },
    async createStorePayInvoice() {
      this.loading = true

      await this.setStorePayToken()

      let storepayInvoice = {
        token: this.storepay.accessToken,
        storeId: this.paymentType.options.storeId,
        phone: this.form.phone,
        amount: this.totalAmount.total,
        description: theme().name,
      }

      const res = await this.$storepay.getInvoice(storepayInvoice)

      if (res && res.status === "Success" && res.value) {
        this.storepay.invoiceId = res.value

        await this.createQRCode()
        await this.checkStorePayPayment()
      } else if (res && res.status === "Failed") {
        if (res.msgList) {
          this.showErrorMsg(res.msgList[0].text, 15000)
        }
      }

      this.loading = false
    },
    async createQRCode() {
      this.loading = true

      let qrCodeData = {
        storeCode: this.paymentType.options.storeId,
        description: theme().name,
        amount: this.totalAmount.total,
      }

      new QRCode("qrcode", JSON.stringify(qrCodeData))

      this.loading = false
    },
    async checkStorePayPayment() {
      if (this.paymentLoading) return
      if (!this.storepay.invoiceId) return

      const res = await this.$storepay.checkPayment({
        token: this.storepay.accessToken,
        invoiceId: this.storepay.invoiceId,
      })

      console.log("[StorePay] ::: Check Invoice :: ", res)

      // if (res && res.data) {
      //   setTimeout(async () => {
      //     this.storepay.isConfirmed = true
      //     this.showErrorMsg("Төлбөр ажилттай хийгдсэн байна.")
      //     this.paymentLoading = false

      //     await this.createDraftOrder()
      //   }, 5000)
      // }

      if (res && res.data) {
        if (res.data.isConfirmed === true) {
          this.storepay.isConfirmed = true
          this.paymentLoading = false
          this.showErrorMsg("Төлбөр ажилттай хийгдсэн байна.")

          await this.createDraftOrder()
        } else {
          this.storepay.isConfirmed = false
          this.showErrorMsg("Эхний төлбөр хараахан хийгдээгүй байна.")

          setTimeout(async () => {
            this.paymentLoading = false
            await this.checkStorePayPayment()
          }, 5000)
        }
      }

      this.paymentLoading = false
    },

    // Orders
    async createDraftOrder() {
      if (localStorage.getItem("draftOrderId") !== null) {
        this.draftOrderId = localStorage.getItem("draftOrderId")

        await this.completeDraftOrder()
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

        await this.completeDraftOrder()
      }

      this.checkoutLoading = false
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

    showErrorMsg(msg, timer) {
      if (!msg) return

      let time = timer ? timer : 7000
      this.storepay.checkPaymentMsg = msg

      if (timer !== -1) {
        setTimeout(() => {
          this.storepay.checkPaymentMsg = null
        }, time)
      }
    },
  },
}
</script>
