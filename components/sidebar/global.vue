<template>
  <Drawer
    v-model:visible="active"
    :position="position"
    class="sidebar"
    :header="header"
    :blockScroll="true"
    :showCloseIcon="true"
    @hide="reset"
  >
    <!--
    -- Auth
    -->

    <!--SignIn & Account-->
    <AuthSidebarAccount
      v-if="id === 'account'"
      :item="passData"
      :key="`account_${key}`"
    ></AuthSidebarAccount>

    <!--SignUp-->
    <AuthSidebarSignUp
      v-if="id === 'signUp'"
      :item="passData"
      :key="`signUp_${key}`"
    ></AuthSidebarSignUp>

    <!--Reset Password-->
    <AuthSidebarResetPassword
      v-if="id === 'resetPassword'"
      :item="passData"
      :key="`resetPassword_${key}`"
    ></AuthSidebarResetPassword>

    <!--Verify Email-->
    <AuthSidebarVerifyEmail
      v-if="id === 'verifyEmail' && user()"
      :item="passData"
      :key="`verifyEmail_${key}`"
    ></AuthSidebarVerifyEmail>

    <!--
    -- Notifications
    -->

    <AuthSidebarNotifications
      v-if="id === 'notifications'"
      :item="passData"
      :key="`notifications_${key}`"
    ></AuthSidebarNotifications>

    <!--
    -- Commerce
    -->

    <template v-if="theme().type === 'commerce'">
      <!--Address-->
      <CommerceSidebarAddress
        v-if="id === 'address'"
        :item="passData"
        :key="`address_${key}`"
      ></CommerceSidebarAddress>

      <!--Cart-->
      <CommerceSidebarCart
        v-if="id === 'cart'"
        :item="passData"
        :key="`cart_${key}`"
      ></CommerceSidebarCart>

      <!--Filters-->
      <CommerceSidebarFilters
        v-if="id === 'filters'"
        :item="passData"
        :key="`filters_${key}`"
      ></CommerceSidebarFilters>

      <!--Stores-->
      <CommerceSidebarStores
        v-if="id === 'stores'"
        :item="passData"
        :key="`stores_${key}`"
      ></CommerceSidebarStores>

      <!--Search-->
      <CommerceSidebarSearch
        v-if="id === 'search'"
        :item="passData"
        :key="`search_${key}`"
      ></CommerceSidebarSearch>
    </template>

    <!--
    -- Payments
    -->

    <template v-if="features().payments && features().payments.active">
      <PaymentSidebar
        v-if="id === 'payments'"
        :item="passData"
        :key="`payments_${key}`"
      ></PaymentSidebar>
    </template>

    <!--
    -- Services
    -->

    <!--Subscriptions-->
    <UserSubscriptions
      v-if="id === 'userSubscriptions'"
      :id="passData"
      :key="`user_subscriptions_${key}`"
    ></UserSubscriptions>

    <!--Class Item-->
    <ProductsClassItem
      v-if="id === 'productClass'"
      :item="passData"
    ></ProductsClassItem>
  </Drawer>
</template>

<script>
export default {
  data() {
    return {
      id: null,
      passData: null,
      active: false,
      key: 0,
      position: "right",
    }
  },

  computed: {
    header() {
      return ""
    },
  },

  mounted() {
    // Sidebars
    this.$bus.$on("sidebarGlobal", (item) => {
      this.id = item.id

      if (item.id) {
        if (item.id === "search") {
          this.position = "top"
        }
        this.active = true

        if (item.data) {
          this.passData = item.data
        }
      } else {
        this.reset()
      }
    })
    this.$bus.$on("sidebarGlobalClose", () => {
      this.reset()
    })
  },

  methods: {
    reset() {
      this.id = null
      this.passData = null
      this.active = false

      if (this.position !== "right") {
        setTimeout(() => {
          this.position = "right"
        }, 500)
      }
    },
  },
}
</script>
