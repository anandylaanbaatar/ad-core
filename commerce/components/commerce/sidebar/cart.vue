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
          severity="primary"
          @click="$bus.$emit('goTo', '/products/all')"
        ></Button>
      </div>
    </div>

    <!--Products-->
    <div v-else>
      <div class="productsGrid row">
        <div class="productsGridScroll w-full">
          <ProductsCartItem
            v-for="(item, index) in cart.items"
            :product="item"
            :cartLineId="item.uid"
            :item="item.merchandise"
            :quantity="item.quantity"
            :key="`product_item_${index}`"
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
                {{ $currency.format(cart.cost.checkoutChargeAmount.amount) }}
              </h4>
            </div>
          </div>

          <div class="col-xs-6 mb10">
            <label class="font-bold font3 text-md">{{ $utils.t("Tax") }}</label>
          </div>
          <div class="col-xs-6">
            <div v-if="theme().type === 'commerce'" class="w-full text-right">
              <h4 v-if="useCommerceStore().allowTax">
                {{ $currency.format(cart.cost.totalTaxAmount.amount) }}
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
                  cart.cost.checkoutChargeAmount.amount !==
                  cart.cost.totalAmount.amount
                "
              >
                -{{
                  $currency.format(
                    cart.cost.checkoutChargeAmount.amount -
                      cart.cost.totalAmount.amount
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
                {{ $currency.format(cart.cost.totalAmount.amount) }}
              </h3>
              <h3 v-else>
                {{ $currency.format(cart.cost.subtotalAmount.amount) }}
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
      active: false,
    }
  },

  computed: {
    cart() {
      return useCommerceStore().cart
    },
    cartTotalQuantity() {
      if (this.cart && this.cart.totalQuantity) {
        return this.cart.totalQuantity
      }
      return
    },
    header() {
      let amount = ``

      if (this.cartTotalQuantity) {
        amount = ` (${this.cartTotalQuantity})`
      }

      return `${this.$utils.t("Cart")}${amount}`
    },
    isEmpty() {
      if (this.cart) {
        if (this.cart.items && this.cart.items.length > 0) {
          return false
        }
      }
      return true
    },
    isShopify() {
      if (features().auth.connect) {
        return features().auth.connect.shopify
      }
    },
  },

  async mounted() {
    if (this.isShopify) {
      await useGetCartItems()
    }
  },
}
</script>
