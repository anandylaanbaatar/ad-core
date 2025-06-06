<template>
  <Drawer
    v-model:visible="active"
    position="right"
    class="sidebar"
    :header="header"
    :blockScroll="true"
    @hide="reset"
  >
    <!--Collections-->
    <AdminFormsCollection
      v-if="id === 'collections'"
      :id="passData"
      :key="`form_collections_${key}`"
    ></AdminFormsCollection>

    <!--User Roles-->
    <AdminFormsUserRoles
      v-if="id === 'userRoles'"
      :account="passData"
      :key="`form_user_roles_${key}`"
    ></AdminFormsUserRoles>

    <!--Subscriptions-->
    <UserSubscriptions
      v-if="id === 'userSubscriptions'"
      :id="passData"
      :admin="true"
      :key="`user_subscriptions_${key}`"
    ></UserSubscriptions>

    <!--Subscription Classes-->
    <ProductsClassItem
      v-if="id === 'productClass'"
      :admin="true"
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
    }
  },

  computed: {
    header() {
      return
    },
  },

  mounted() {
    // Sidebars
    this.$bus.$on("sidebarAdmin", (item) => {
      this.id = item.id

      if (item.id) {
        this.active = true

        if (item.data) {
          this.passData = item.data
        }
      } else {
        this.reset()
      }
    })
    this.$bus.$on("sidebarAdminClose", () => {
      this.reset()
    })
  },

  methods: {
    reset() {
      this.id = null
      this.passData = null
      this.active = false
    },
  },
}
</script>
