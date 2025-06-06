<template>
  <AppLayout type="regular">
    <div class="c-page">
      <Loader v-if="loading"></Loader>

      <div v-else class="container py-4">
        <div class="row checkoutArea">
          <div class="col-xs-12 col-md-8">
            <template v-if="account">
              <!--Account-->
              <CheckoutAccount
                ref="account"
                :account="account"
              ></CheckoutAccount>

              <!--Shipping-->
              <CheckoutShipping
                :options="options"
                :account="account"
              ></CheckoutShipping>

              <!--Payment-->
              <CheckoutPayment
                v-if="isShippingSelected"
                :options="options"
                :account="account"
                :totalAmount="$refs.summary.totalAmount"
              ></CheckoutPayment>
            </template>
            <template v-else>
              <CheckoutAccount ref="account"></CheckoutAccount>
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
    async isLoggedIn() {
      return useCommerceStore().shopifyUser
    },

    // Account
    account() {
      const store = useCommerceStore()
      const user = store.shopifyUser

      if (user) {
        return user
      }
      return null
    },
    profile() {
      if (this.account) {
        let newProfile = this.account
        newProfile.uid = this.account.id.replace("gid://shopify/Customer/", "")
        return newProfile
      }
      return null
    },

    // Shipping
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

      return false
    },
  },

  async mounted() {
    await this.init()
  },

  methods: {
    async init() {
      this.loading = true
      this.options.profile = this.profile
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
