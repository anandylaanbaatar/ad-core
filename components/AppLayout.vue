<template>
  <div class="app-layout" :class="layoutType">
    <!--Splash Loader-->
    <LoaderPage v-if="splashLoading"></LoaderPage>

    <div>
      <!--Page Loader-->
      <Loader v-if="siteLoading()" type="xxl" class="fullPage"></Loader>

      <!--Header-->
      <template v-if="layoutType === 'regular' && !siteLoading()">
        <SlicesHeaderBanner></SlicesHeaderBanner>
        <SlicesHeader></SlicesHeader>
      </template>

      <!--Page-->
      <div
        v-show="!siteLoading()"
        :class="{
          'c-page': layoutType === 'regular',
          'c-app-layout': layoutType === 'app',
        }"
      >
        <slot></slot>
      </div>

      <!--Footer-->
      <SlicesFooter
        v-if="layoutType === 'regular' && !siteLoading()"
      ></SlicesFooter>
    </div>

    <!--Global Items-->
    <template v-if="globalItemsInit">
      <SidebarGlobal></SidebarGlobal>
      <ScrollTop></ScrollTop>
      <Toast position="bottom-right" group="global"></Toast>
      <ConfirmDialog group="global"></ConfirmDialog>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: null,
    },
  },

  computed: {
    globalItemsInit() {
      return useCoreStore().globalItemsInit
    },
    layoutType() {
      if (this.type) {
        return this.type
      }
      return layout()
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

      if (theme().type === "commerce") {
        let sidebarCommerce = ["cart", "search", "stores", "filters", "address"]
        sidebarCore = [...sidebarCore, ...sidebarCommerce]
      }

      if (features().payments && features().payments.active) {
        sidebarCore.push("payments")
      }

      return sidebarCore
    },
    splashLoading() {
      return useCoreStore().loading
    },
  },

  async mounted() {
    this.globalItems()
  },

  methods: {
    async globalItems() {
      if (this.globalItemsInit) return

      // Go To Link
      this.$bus.$on("goTo", (link) => {
        this.$bus.$emit("sidebarGlobalClose")

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
          life: data && data.life ? data.life : 3000,
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

      // Auth
      if (authEnabled()) {
        // Account
        this.$bus.$on("updateAccount", async () => {
          await useAuthStore().setUser()

          if (this.$route.path.includes("checkout")) {
            this.$bus.$emit("sidebarGlobalClose")
          } else {
            this.$bus.$emit("sidebarGlobal", { id: "account" })
          }
        })

        // Verify Email
        if (user()) {
          if (!user().emailVerified) {
            this.$bus.$emit("sidebarGlobal", { id: "verifyEmail" })
          }
        }
      }

      // Url Query Actions
      if (this.$route.query.sidebar) {
        setTimeout(() => {
          this.$bus.$emit("sidebarGlobal", { id: this.$route.query.sidebar })
        }, 700)
      }
      if (authEnabled()) {
        if (this.$route.query.resetPassword) {
          setTimeout(() => {
            this.$bus.$emit("sidebarGlobal", { id: "resetPassword" })
          }, 700)
        }
        if (this.$route.query.login) {
          setTimeout(() => {
            this.$bus.$emit("sidebarGlobal", { id: "account" })
          }, 700)
        }
        if (this.$route.query.logout) {
          setTimeout(async () => {
            await useAuthStore().logout()
          }, 700)
        }
      }

      // Set Global Init
      useCoreStore().set("globalItemsInit", true)
    },
  },
}
</script>
