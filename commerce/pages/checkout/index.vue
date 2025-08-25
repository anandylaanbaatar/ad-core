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
      this.options.profile = this.user
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
  },
}
</script>
