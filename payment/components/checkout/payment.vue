<template>
  <Loader v-if="loading" type="small"></Loader>

  <section v-else class="mb-5">
    <h3 class="mb-3">{{ $utils.t("Payment") }}</h3>

    <!--Select Warning Message-->
    <Message
      v-if="options.payment === null"
      severity="warn"
      class="c-message my-3"
      :closable="false"
    >
      <template #icon>
        <i class="pi pi-exclamation-triangle"></i>
      </template>
      <span class="ml-2">{{ $utils.t("Select payment type.") }}</span>
      <template #closeicon>
        <i class="pi pi-trash"></i>
      </template>
    </Message>

    <!--Payment Select-->
    <ul v-if="paymentOptions.length > 0" class="c-radio">
      <template
        v-for="payment in paymentOptions"
        :key="`payment_type_${payment.id}`"
      >
        <li v-if="payment.active">
          <i
            class="pi"
            :class="{
              'pi-circle': options.payment !== payment.id,
              'pi-circle-fill': options.payment === payment.id,
            }"
          ></i>
          <div
            class="d-block"
            :class="{ active: options.payment === payment.id }"
            @click="selectItem('payment', payment.id)"
          >
            <div class="row">
              <div class="col-xs-6">{{ payment.title }}</div>
              <div class="col-xs-6 right">
                <div class="text-right">
                  <div v-if="payment.logo" class="c-payment-logo">
                    <img :src="payment.logo" :alt="payment.title" />
                  </div>

                  <i
                    v-else-if="payment.icon"
                    class="pi"
                    :class="payment.icon"
                  ></i>
                </div>
              </div>
            </div>
          </div>
        </li>
      </template>
    </ul>
    <UiEmpty
      v-else
      icon="pi-dollar"
      :desc="$utils.t('No Payment Providers Setup')"
    ></UiEmpty>

    <!--QPay-->
    <CheckoutQpay
      v-if="options.payment === 'qpay'"
      :cart="cart"
      :totalAmount="totalAmount"
      :account="account"
      :lineItems="lineItems"
      :shippingLine="shippingLine"
      :shippingAddress="shippingAddress"
      :discountCodes="discountCodes"
    ></CheckoutQpay>

    <!--StorePay-->
    <CheckoutStorepay
      v-else-if="options.payment === 'storepay'"
      :cart="cart"
      :totalAmount="totalAmount"
      :account="account"
      :lineItems="lineItems"
      :shippingLine="shippingLine"
      :shippingAddress="shippingAddress"
      :discountCodes="discountCodes"
    ></CheckoutStorepay>

    <!--Stripe-->
    <CheckoutStripe
      v-else-if="options.payment === 'stripe'"
      :cart="cart"
      :totalAmount="totalAmount"
      :account="account"
      :lineItems="lineItems"
      :shippingLine="shippingLine"
      :shippingAddress="shippingAddress"
      :discountCodes="discountCodes"
    ></CheckoutStripe>
  </section>
</template>

<script>
export default {
  props: {
    options: {
      type: Object,
      default: null,
    },
    account: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      loading: true,

      // Order
      draftOrderId: null,
    }
  },

  computed: {
    cart() {
      return useCommerceStore().cart
    },
    allAddresses() {
      if (this.account && this.account.addresses) {
        if (
          this.account.addresses.edges &&
          this.account.addresses.edges.length > 0
        ) {
          let addressItems = this.account.addresses.edges.map((i) => {
            let item = i.node

            if (item.address2) {
              if (item.address2 === "undefined") {
                item.address2 = null
              }
            }

            item.fullAddress = this.$address.formatAddress(item)
            return item
          })

          return addressItems
        }
      }
      return
    },
    locations() {
      return useCommerceStore().locations
    },

    // Shipping
    shippingLines() {
      return useCommerceStore().shippingLines
    },
    shippingLine() {
      // Pickup
      if (this.options.shipping === "pickup" && this.options.location) {
        return {
          title: this.$utils.t("Pickup at a store"),
          price: 0,
        }
      }

      // Address
      if (
        this.options.shipping &&
        this.options.address &&
        this.options.distance
      ) {
        if (this.options.distance.price <= this.shippingLines[0].price) {
          return this.shippingLines[0]
        } else if (this.options.distance.price >= this.shippingLines[3].price) {
          return this.shippingLines[3]
        } else if (this.options.distance.price <= this.shippingLines[1].price) {
          return this.shippingLines[1]
        } else if (this.options.distance.price <= this.shippingLines[2].price) {
          return this.shippingLines[2]
        }
      }

      // if (this.options.shipping === "address" && this.options.address) {
      //   return this.shippingLines[0]
      // }

      return null
    },
    shippingAddress() {
      if (
        this.options.shipping === "address" &&
        this.options.address &&
        this.allAddresses
      ) {
        let selectedAddress = this.allAddresses.find(
          (i) => i.id === this.options.address
        )

        if (selectedAddress) {
          return {
            address1: selectedAddress.address1
              ? selectedAddress.address1
              : null,
            address2: selectedAddress.address2
              ? selectedAddress.address2
              : null,
            city: selectedAddress.city ? selectedAddress.city : null,
            province: selectedAddress.province
              ? selectedAddress.province
              : null,
            country: selectedAddress.country ? selectedAddress.country : null,
            zip: selectedAddress.zip ? selectedAddress.zip : null,
          }
        }
      } else if (
        this.options.shipping === "pickup" &&
        this.options.location &&
        this.locations
      ) {
        let selectedAddress = this.locations.find(
          (i) => i.name === this.options.location
        )

        if (selectedAddress) {
          return {
            address1: selectedAddress.address1
              ? selectedAddress.address1
              : null,
            address2: selectedAddress.address2
              ? selectedAddress.address2
              : null,
            city: selectedAddress.city ? selectedAddress.city : null,
            province: selectedAddress.province
              ? selectedAddress.province
              : null,
            country: selectedAddress.country ? selectedAddress.country : null,
            zip: selectedAddress.zip ? selectedAddress.zip : null,
          }
        }
      }

      return null
    },

    // Cart
    lineItems() {
      if (this.cart && this.cart.items) {
        return this.cart.items.map((i) => {
          return {
            quantity: i.quantity,
            variantId: i.merchandise.id,
          }
        })
      }
      return null
    },
    discountCodes() {
      if (this.cart && this.cart.discountCodes) {
        if (this.cart.discountCodes.length > 0) {
          let allApplicableDiscountCodes = this.cart.discountCodes.filter(
            (i) => i.applicable
          )
          if (allApplicableDiscountCodes.length > 0) {
            return allApplicableDiscountCodes.map((i) => {
              return `${i.code}`
            })
          }
        }
      }
      return null
    },

    // Calculated
    totalAmount() {
      let cartAmount = 0
      let taxAmount = 0
      let shippingAmount = 0
      let totalAmount = 0
      let formatted = 0
      let chargeAmount = 0
      let discountAmount = 0

      if (this.cart && this.cart.cost && this.cart.cost.totalAmount) {
        if (theme().type === "commerce" && useCommerceStore().allowTax) {
          cartAmount = parseFloat(this.cart.cost.totalAmount.amount)
        } else {
          cartAmount = parseFloat(this.cart.cost.subtotalAmount.amount)
        }
      }
      if (this.shippingLine) {
        shippingAmount = parseFloat(this.shippingLine.price)
      }
      if (this.cart && this.cart.cost && this.cart.cost.checkoutChargeAmount) {
        chargeAmount = parseFloat(this.cart.cost.checkoutChargeAmount.amount)
      }
      if (this.cart) {
        let discountCodes = this.cart.discountCodes.filter(
          (i) => i.applicable === true
        )
        if (discountCodes.length > 0) {
          discountAmount = cartAmount - chargeAmount
        } else if (chargeAmount !== cartAmount) {
          discountAmount = cartAmount - chargeAmount
        }
      }

      totalAmount = cartAmount + shippingAmount
      formatted = this.$utils.formatPrice(totalAmount)

      let finalAmount = {
        cart: cartAmount,
        tax: taxAmount,
        shipping: shippingAmount,
        total: totalAmount,
        discount: discountAmount,
        charge: chargeAmount,
        formatted: formatted,
      }

      // console.log("Total Amount ::: ", finalAmount)

      return finalAmount
    },

    // Payment
    paymentOptions() {
      return usePaymentStore().paymentOptions.filter((i) => i.active)
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
      }
    },
  },

  async mounted() {
    this.loading = false
  },

  methods: {
    async selectItem(type, value) {
      this.options[type] = value

      console.log("Select Item ::: ", this.options)
    },
  },
}
</script>
