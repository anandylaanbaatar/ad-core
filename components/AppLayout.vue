<template>
  <div class="app-layout">
    <LoaderPage></LoaderPage>

    <div>
      <!--Sidebars-->
      <!--Auth Sidebars-->
      <template v-if="authEnabled">
        <SidebarMenu ref="menu"></SidebarMenu>
        <SidebarAccount ref="account"></SidebarAccount>
        <SidebarSignUp ref="signUp"></SidebarSignUp>
        <SidebarResetPassword ref="resetPassword"></SidebarResetPassword>
        <SidebarVerifyEmail v-if="user" ref="verifyEmail"></SidebarVerifyEmail>
        <SidebarNotifications ref="notifications"></SidebarNotifications>
      </template>

      <!--Commerce Sidebars-->
      <template v-if="theme.type === 'commerce'">
        <SidebarCart ref="cart"></SidebarCart>
        <SidebarSearch ref="search"></SidebarSearch>
        <SidebarStores ref="stores"></SidebarStores>
        <SidebarFilters ref="filters"></SidebarFilters>
        <SidebarAddress ref="address"></SidebarAddress>
      </template>

      <Loader v-if="loading" type="xxl" class="fullPage"></Loader>

      <!--Header-->
      <template v-if="layout === 'regular' && !loading">
        <HeaderBanner></HeaderBanner>
        <Header></Header>
      </template>

      <!--Page-->
      <div v-if="!loading" class="c-page">
        <slot></slot>
      </div>

      <!--Footer-->
      <Footer v-if="layout === 'regular' && !loading"></Footer>
    </div>

    <!--Global Items-->
    <ScrollTop></ScrollTop>
    <Toast position="top-right" group="global"></Toast>
    <ConfirmDialog group="global"></ConfirmDialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      appInit: false,
      isInit: false,
    }
  },

  computed: {
    theme() {
      return useAppConfig().theme
    },
    layout() {
      return useCoreStore().layout
    },
    loading() {
      return useCoreStore().loading
    },
    authEnabled() {
      if (useRuntimeConfig().public.features.auth) {
        return true
      }
      return false
    },
    user() {
      if (this.authEnabled && useAuthStore()) {
        return useAuthStore().user
      }
      return
    },
    sidebars() {
      let sidebarCore = [
        "menu",
        "account",
        "signUp",
        "resetPassword",
        "verifyEmail",
        "notifications",
      ]
      let sidebarCommerce = ["cart", "search", "stores", "filters", "address"]

      if (this.theme.type === "commerce") {
        return [...sidebarCore, ...sidebarCommerce]
      }

      return sidebarCore
    },
  },

  async mounted() {
    this.globalItems()
  },

  methods: {
    async globalItems() {
      if (this.isInit) return
      this.isInit = true

      // Sidebars
      this.$bus.$on("openSidebar", (item) => {
        this.$bus.$emit("closeSidebars")

        setTimeout(() => {
          if (typeof item === "string") {
            if (item === "address") {
              this.$refs[item].reset()
            }
            if (this.$refs[item]) {
              this.$refs[item].active = true
            }
          } else if (typeof item === "object") {
            if (this.$refs[item.type]) {
              if (item.type === "address") {
                this.$refs[item.type].reset()
              }
              if (item.data) {
                this.$refs[item.type].fill(item.data)
              }
              this.$refs[item.type].active = true
            }
          }
        }, 100)
      })
      this.$bus.$on("closeSidebars", () => {
        for (let i = 0; i < this.sidebars.length; i++) {
          let sidebar = this.sidebars[i]

          if (this.$refs[sidebar]) {
            this.$refs[sidebar].active = false
          }
        }
      })

      // Go To Link
      this.$bus.$on("goTo", (link) => {
        this.$bus.$emit("closeSidebars")

        let routeObj = {
          path: link,
        }

        // Has Query Params
        if (link.indexOf("?") !== -1) {
          let fullLink = link.split("?")
          routeObj.path = fullLink[0]

          if (fullLink[1]) {
            routeObj.query = this.$utils.stringToObject(fullLink[1])
          }
        }

        this.$router.push(routeObj)
      })

      // Toast
      this.$bus.$on("toast", (data) => {
        this.$toast.add({
          group: "global",
          severity: data && data.severity ? data.severity : "secondary",
          summary: data && data.summary ? data.summary : "Success",
          detail: data && data.detail ? data.detail : "Message Content",
          life: 3000,
        })
      })

      // Confirm Toast
      this.$bus.$on("confirm", (data) => {
        let header = this.$utils.t("Logout")
        let message = this.$utils.t("Are you sure you want to Logout?")

        if (data && data.header) {
          header = this.$utils.t(data.header)
        }
        if (data && data.message) {
          message = this.$utils.t(data.message)
        }

        this.$confirm.require({
          group: "global",
          message: message,
          header: header,
          rejectLabel: this.$utils.t("Cancel"),
          acceptLabel: this.$utils.t("Confirm"),
          accept: () => {
            return data.callback()
          },
        })
      })

      // Commerce Logic
      if (this.theme.type === "commerce") {
        // Add To Cart
        this.$bus.$on("addToCart", async (product) => {
          await this.$refs.cart.addToCart(product)
        })

        // Update Item
        this.$bus.$on("updateItem", async (product) => {
          await this.$refs.cart.updateItem(product)
        })

        // Remove from Cart
        this.$bus.$on("removeFromCart", async (product) => {
          await this.$refs.cart.removeFromCart(product)
        })

        // Update Cart
        this.$bus.$on("updateCart", async () => {
          await this.$refs.cart.updateCart()
        })

        // Empty Cart
        this.$bus.$on("emptyCart", async () => {
          await this.$refs.cart.emptyCart()
        })

        // Update Discount Code
        this.$bus.$on("updateDiscountCode", async (data) => {
          await this.$refs.cart.updateDiscountCode(data)
        })

        // Save Product
        this.$bus.$on("saveProduct", async (product) => {
          const store = useCommerceStore()
          let productId = product.id
          let allSavedItems = store.savedItems

          if (allSavedItems.indexOf(productId) === -1) {
            allSavedItems.push(productId)
          }

          await store.setSavedItems(allSavedItems)

          this.$bus.$emit("toast", {
            severity: "success",
            summary: this.$utils.t("Product"),
            detail: this.$utils.t("Successfully added to wishlist."),
          })
        })
        this.$bus.$on("removeProduct", async (product) => {
          const store = useCommerceStore()
          let productId = product.id
          let newSavedItems = store.savedItems.filter((i) => i !== productId)

          await store.setSavedItems(newSavedItems)

          this.$bus.$emit("toast", {
            severity: "secondary",
            summary: this.$utils.t("Product"),
            detail: this.$utils.t("Successfully removed from wishlist."),
          })
        })
      }

      // Account
      if (this.authEnabled) {
        this.$bus.$on("updateAccount", async () => {
          await useAuthStore().setUser()

          if (this.$route.path.includes("checkout")) {
            this.$bus.$emit("closeSidebars")
          } else {
            this.$bus.$emit("openSidebar", "account")
          }
        })
      }

      // Url Query Actions
      if (this.$route.query.sidebar) {
        setTimeout(() => {
          this.$bus.$emit("openSidebar", this.$route.query.sidebar)
        }, 700)
      }
      if (this.authEnabled) {
        if (this.$route.query.resetPassword) {
          setTimeout(() => {
            this.$bus.$emit("openSidebar", "resetPassword")
          }, 700)
        }
        if (this.$route.query.login) {
          setTimeout(() => {
            this.$bus.$emit("openSidebar", "account")
          }, 700)
        }
      }
    },
  },
}
</script>
