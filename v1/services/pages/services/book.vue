<template>
  <AppLayout type="regular">
    <div class="c-page customPage">
      <Loader v-if="loading"></Loader>

      <div v-else>
        <!--Booking-->
        <div v-if="product" class="c-booking mt-6 mb-8">
          <div class="container">
            <div class="row">
              <!--Image Block-->
              <div class="col-xs-12 col-md-6">
                <div
                  class="c-block c-image size-xl mb-3"
                  :style="$utils.setBackImage(product.image)"
                ></div>
              </div>

              <div class="col-xs-12 col-md-6">
                <!--Product Block-->
                <div class="d-block p-6 text-center mb-3">
                  <Tag rounded class="c-custom-tag inverted mb-2">Classes</Tag>
                  <h1 class="mb-3">{{ product.name }}</h1>
                  <div class="mb-2">
                    <p>
                      At BettinkaPilates, we believe that true well-being comes
                      from within. Our classes are designed to help you
                      reconnect with your body. mind. spirit.
                    </p>
                  </div>

                  <h1 class="d-block text-center p-4 mt-4">
                    <span v-if="product.currency" class="text-sm">{{
                      product.currency.toUpperCase()
                    }}</span>
                    {{ product.amount_formatted }}
                    <span class="text-sm"
                      >/ {{ getClassInterval(product.interval) }}</span
                    >
                  </h1>
                </div>

                <!--Payment Block-->
                <template v-if="user()">
                  <div v-if="product" class="d-block p-6">
                    <PaymentForm :productId="product.id"></PaymentForm>
                  </div>
                </template>
                <NotLoggedIn v-else></NotLoggedIn>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="c-booking mt-6 mb-8">
          <div class="container">
            <div class="row">
              <!--Image Block-->
              <div class="col-xs-12 col-md-6">
                <div
                  class="c-block c-image size-xl mb-3"
                  :style="
                    $utils.setBackImage(
                      'https://images.prismic.io/bettinka-pilates/Z_o06uvxEdbNO-EZ_Group66.png?auto=format,compress'
                    )
                  "
                ></div>
              </div>

              <div class="col-xs-12 col-md-6">
                <!--Product Block-->
                <div class="d-block p-6 text-center mb-3">
                  <Tag rounded class="c-custom-tag inverted mb-2">Classes</Tag>
                  <h1 class="mb-3">Find your class</h1>
                  <div class="mb-2">
                    <p>
                      At BettinkaPilates, we believe that true well-being comes
                      from within. Our classes are designed to help you
                      reconnect with your body. mind. spirit.
                    </p>
                  </div>

                  <!-- <h1 class="d-block text-center p-4 mt-4">
                  <span v-if="product.currency" class="text-sm">{{
                    product.currency.toUpperCase()
                  }}</span>
                  {{ product.amount_formatted }}
                  <span class="text-sm"
                    >/ {{ getClassInterval(product.interval) }}</span
                  >
                </h1> -->
                </div>

                <ProductsListItem
                  v-for="product in products"
                  :key="`product_item_${product.id}`"
                  :product="product"
                  :image="true"
                ></ProductsListItem>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      productId: null,
    }
  },

  computed: {
    products() {
      return useServicesStore().products
    },
    product() {
      if (this.products && this.productId) {
        return this.products.find((i) => i.id === this.$route.query.id)
      }
      return
    },
  },

  mounted() {
    if (this.$route.query && this.$route.query.id) {
      this.productId = this.$route.query.id
    }
  },
}
</script>
