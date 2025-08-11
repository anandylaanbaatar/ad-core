<template>
  <div
    class="sidebar cartSidebar overflow-y-auto"
    :class="{ 'h-full': isEmpty }"
  >
    <!--Empty-->
    <div v-if="isEmpty" class="emptyArea">
      <div>
        <i class="pi pi-shopping-cart"></i>
        <h4>{{ $utils.t("Cart is Empty") }}</h4>
        <p>
          {{
            $utils.t(
              "You can add any product to your cart and get delivered to your home. In stock products will be delivered in 1-2 business days in your local country."
            )
          }}
        </p>

        <Button
          :label="$utils.t('Shop All Products')"
          severity="secondary"
          @click="$bus.$emit('goTo', '/products/all')"
        ></Button>
      </div>
    </div>

    <!--Products-->
    <div v-else>
      <div class="productsGrid row">
        <div class="productsGridScroll w-full">
          <ProductsCartItem
            v-for="cartItem in cartItems"
            :cartItem="cartItem"
            :key="`product_cartItem_${cartItem.key}`"
          ></ProductsCartItem>
        </div>
      </div>

      <div class="bottom">
        <div class="row">
          <div class="col-xs-6">
            <label class="font-bold font3 text-md">{{
              $utils.t("Sub Total")
            }}</label>
          </div>
          <div class="col-xs-6">
            <div class="w-full text-right">
              <h4>
                {{ $currency.format(cartTotals.subtotalAmount) }}
              </h4>
            </div>
          </div>

          <div class="col-xs-6 mb10">
            <label class="font-bold font3 text-md">{{ $utils.t("Tax") }}</label>
          </div>
          <div class="col-xs-6">
            <div v-if="theme().type === 'commerce'" class="w-full text-right">
              <h4 v-if="useCommerceStore().allowTax">
                {{ $currency.format(cartTotals.taxAmount) }}
              </h4>
              <h4 v-else>-</h4>
            </div>
          </div>

          <div class="col-xs-6 mb10">
            <label class="font-bold font3 text-md">{{
              $utils.t("Discount")
            }}</label>
          </div>
          <div class="col-xs-6">
            <div class="w-full text-right">
              <!-- <h4
                v-if="
                  cartTotals.discountAmount
                "
              >
                {{
                  $currency.format(
                    cartTotals.discountAmount
                  )
                }}
              </h4> -->
              <h4>-</h4>
            </div>
          </div>

          <div class="col-xs-6">
            <h3 class="font-bold font3 text-md">{{ $utils.t("Total") }}</h3>
          </div>
          <div class="col-xs-6">
            <div v-if="theme().type === 'commerce'" class="w-full text-right">
              <h3 v-if="useCommerceStore().allowTax">
                {{ $currency.format(cartTotals.taxAmount) }}
              </h3>
              <h3 v-else>
                {{ $currency.format(cartTotals.totalAmount) }}
              </h3>
            </div>
          </div>

          <div class="col-xs-12">
            <Button
              block
              large
              :label="$utils.t('Checkout')"
              class="w-full checkoutBtn"
              @click="$bus.$emit('goTo', '/checkout/v2')"
            ></Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      init: false,
      active: false,
      cartItems: null,
    }
  },

  computed: {
    cart() {
      return useCommerceStore().cart
    },
    isEmpty() {
      if (this.cart && this.cart.length > 0) {
        return false
      }
      return true
    },
    cartTotals() {
      let totals = {
        items: useCommerceStore().cartTotalItems,
        taxAmount: 0,
        discountAmount: 0,
        shippingAmount: 0,
        subtotalAmount: 0,
        totalAmount: 0,
      }

      if (!this.isEmpty && this.cartItems) {
        for (let i = 0; i < this.cartItems.length; i++) {
          const cartItem = this.cartItems[i]

          if (cartItem.variant && cartItem.variant.price) {
            totals.subtotalAmount += cartItem.qty * cartItem.variant.price
          } else if (cartItem.product && cartItem.product.price) {
            totals.subtotalAmount += cartItem.qty * cartItem.product.price
          }
        }
      }

      totals.totalAmount = totals.subtotalAmount

      return totals
    },
    header() {
      let amount = ``

      if (this.cartTotals.items) {
        amount = ` (${this.cartTotals.items})`
      }

      return `${this.$utils.t("Cart")}${amount}`
    },
  },

  async mounted() {
    await this.getProducts()

    this.$bus.$on("updateCart", async () => {
      await this.getProducts()
    })
  },

  methods: {
    reset() {
      this.cartItems = null
    },
    async getProducts() {
      this.reset()

      if (this.cart && this.cart.length) {
        const cartIds = this.cart.map((i) => i.id)
        const productsRes = await this.$algolia.getMultiple(cartIds)
        const products = productsRes.results ?? null
        let cartItems = []

        if (products) {
          for (let i = 0; i < this.cart.length; i++) {
            const cartItem = this.cart[i]
            const product = products.find((j) => j.id === cartItem.id)

            let data = {
              ...cartItem,
            }
            if (product) {
              data.product = product

              if (cartItem.variantSku && product.variants) {
                const variant = product.variants.find(
                  (j) => j.sku === cartItem.variantSku
                )

                if (variant) {
                  data.variant = variant
                }
              }
            }

            cartItems.push(data)
          }

          this.cartItems = cartItems
        }

        console.log("Cart Items ::: ", this.cartItems)
      }
    },
  },
}
</script>
