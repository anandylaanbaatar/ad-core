<template>
  <div
    class="sidebar cartSidebar overflow-y-auto"
    :class="{ 'h-full': cart.isEmpty }"
  >
    <!--Empty-->
    <div v-if="cart.isEmpty" class="emptyArea">
      <div>
        <i class="pi pi-shopping-cart"></i>
        <h4>{{ $utils.t("Cart is Empty") }}</h4>
        <!-- <p>
          {{
            $utils.t(
              "You can add any product to your cart and get delivered to your home. In stock products will be delivered in 1-2 business days in your local country."
            )
          }}
        </p> -->

        <Button
          :label="$utils.t('Shop All Products')"
          severity="secondary"
          class="sm"
          icon="pi pi-arrow-right"
          iconPos="right"
          @click="$bus.$emit('goTo', '/products/all')"
        ></Button>
      </div>
    </div>

    <!--Products-->
    <div v-else>
      <div class="productsGrid row">
        <div class="productsGridScroll w-full">
          <ProductsCartItem
            v-for="cartItem in cart.items"
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
                {{ $currency.format(cart.totals.subtotalAmount) }}
              </h4>
            </div>
          </div>

          <div class="col-xs-6 mb10">
            <label class="font-bold font3 text-md">{{ $utils.t("Tax") }}</label>
          </div>
          <div class="col-xs-6">
            <div v-if="theme().type === 'commerce'" class="w-full text-right">
              <h4 v-if="useCommerceStore().allowTax">
                {{ $currency.format(cart.totals.taxAmount) }}
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
                  cart.totals.discountAmount
                "
              >
                {{
                  $currency.format(
                    cart.totals.discountAmount
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
                {{ $currency.format(cart.totals.taxAmount) }}
              </h3>
              <h3 v-else>
                {{ $currency.format(cart.totals.totalAmount) }}
              </h3>
            </div>
          </div>

          <div v-if="!isCheckoutPage" class="col-xs-12">
            <Button
              block
              large
              :label="$utils.t('Checkout')"
              class="w-full checkoutBtn"
              @click="$bus.$emit('goTo', '/checkout')"
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
    }
  },

  computed: {
    cart() {
      return {
        cart: useCommerceStore().cart,
        items: useCommerceStore().cartItems,
        isEmpty: useCommerceStore().cart.length === 0 ? true : false,
        totals: useCommerceStore().cartTotals,
      }
    },
    isCheckoutPage() {
      if (this.$route.path.includes("checkout")) {
        return true
      }
      return false
    },
  },
}
</script>
