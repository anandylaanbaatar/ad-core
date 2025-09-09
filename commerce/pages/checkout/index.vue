<template>
  <AppLayout type="regular">
    <div class="c-page">
      <Loader v-if="loading"></Loader>

      <div v-else class="container py-4">
        <div class="row checkoutArea">
          <div class="col-xs-12 col-md-8">
            <!--Account-->
            <CheckoutAccount ref="account"></CheckoutAccount>

            <template v-if="user">
              <!--Shipping-->
              <CheckoutShipping :options="options"></CheckoutShipping>

              <!--Payment-->
              <CheckoutPayment
                v-if="isShippingSelected"
                :options="options"
                @complete="createOrder"
              ></CheckoutPayment>
            </template>
          </div>

          <!--Cart Summary-->
          <CheckoutSummary
            ref="summary"
            :options="options"
            class="col-xs-12 col-md-4"
            @restart="reset"
          ></CheckoutSummary>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
export default {
  data() {
    return {
      loading: true,

      // Order
      options: {
        profile: null,
        shipping: null,
        address: null,
        payment: null,
        discountCodes: null,
      },
    }
  },

  computed: {
    user() {
      return useAuthStore().user
    },
    customer() {
      return useCommerceStore().customer
    },
    orderNumber() {
      return useCommerceStore().orderNumber
    },
    cart() {
      return {
        cart: useCommerceStore().cart,
        items: useCommerceStore().cartItems,
        isEmpty: useCommerceStore().cart.length === 0 ? true : false,
        totals: useCommerceStore().cartTotals,
        lineItems: useCommerceStore().cartItems.map((i) => {
          return {
            product: i.variant.product,
            product_variant: i.variant.id,
            quantity: i.qty,
            price: i.variant.price,
            subtotal: i.variant.price * i.qty,
            total: i.variant.price * i.qty,
          }
        }),
      }
    },
    isShippingSelected() {
      if (this.options) {
        if (this.options.shipping === "address") {
          if (this.options.address) {
            return true
          }
        }
        if (this.options.shipping === "pickup") {
          if (this.options.location) {
            return true
          }
        }
      }
    },
  },

  async mounted() {
    await this.init()
  },

  methods: {
    async init() {
      this.loading = true
      this.options.profile = this.customer
      this.loading = false
    },
    async reset() {
      this.loading = true
      this.options = {
        profile: null,
        shipping: null,
        address: null,
        payment: null,
        discountCodes: null,
      }
      await this.init()
    },

    // Orders
    async createOrder(payment) {
      let formData = {
        tenant_id: features().multitenancy.tenantId,
        order_number: this.orderNumber,
        status: "pending",
        fulfillment_status: "open",
        customer: null,
        subtotal: this.cart.totals.subtotalAmount,
        tax_total: this.cart.totals.taxAmount,
        discount_total: this.cart.totals.discountAmount,
        shipping_total: this.cart.totals.shippingAmount,
        total: this.cart.totals.totalAmount,
        shipping_address: null,
        shipping_method: null,
        line_items: this.cart.lineItems.map((item) => {
          return {
            line_items_id: item,
          }
        }),
        payment: {
          tenant_id: features().multitenancy.tenantId,
          status: "paid",
          total: payment.total,
          method: payment.method,
        },
      }

      // Customer
      if (useCommerceStore()?.customer) {
        formData.customer = useCommerceStore().customer.id
      }
      // Shipping and Method
      if (this.options.shipping === "pickup") {
        formData.shipping_address = this.options.location?.address?.id
        formData.shipping_method = `Pickup from store`
      } else if (this.options.shipping === "address") {
        formData.shipping_address = this.options.address
        formData.shipping_method = `Deliver to customer address`
      }

      console.log("Order Form ::: ", formData)

      const order = await this.$directus.order.create(formData)

      console.log("Create Order ::: ", order)

      if (order?.success) {
        // Update Order Number
        if (theme().storeId) {
          await this.$fire.actions.update(
            `adcommerce/stores/${theme().storeId}`,
            {
              orderNumber: parseInt(this.orderNumber) + 1,
            }
          )
          await useCommerceStore().setOrderNumber()
        }
        // Clear Cart
        await useCommerceStore().clearCart()

        // Redirect
        this.$bus.$emit("goTo", `/checkout/success`)
      }
    },
  },
}
</script>
