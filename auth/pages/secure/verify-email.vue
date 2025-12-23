<template>
  <AppLayout type="app">
    <div class="page auth fullPage">
      <div class="fullPageContent">
        <div v-if="user" class="c-block verifyEmailBlock">
          <i class="pi pi-envelope text-2xl mb-4"></i>
          <h3 class="mb-2">Verify Email</h3>
          <p class="mb-3">We have sent you a verification email to:</p>
          <div class="mb-4">
            <Tag severity="warn">{{ user.email }}</Tag>
          </div>
          <div>
            <Loader type="sm" v-if="sendingEmail"></Loader>
            <template v-else>
              <Button
                label="Check Verification"
                severity="secondary"
                icon="pi pi-refresh"
                class="mr-3"
                @click="reload"
              ></Button>
              <Button
                label="Resend Email"
                severity="secondary"
                icon="pi pi-envelope"
                @click="sendEmailVerification"
              ></Button>
            </template>
          </div>
        </div>
      </div>

      <Button
        severity="secondary"
        class="sm absolute right-0 bottom-0 m-4"
        icon="pi pi-sign-out"
        iconPos="right"
        label="Logout"
        @click="logout"
      ></Button>
    </div>
  </AppLayout>
</template>

<script>
export default {
  data() {
    return {
      sendingEmail: false,
      user: null,
    }
  },

  async mounted() {
    await this.checkUser()
  },

  methods: {
    reload() {
      window.location.href = "/secure/verify-email"
    },
    async checkUser() {
      const user = await this.$fire.actions.user()

      if (user) {
        this.user = user
        this.$fire.actions.listen(`/users/${user.uid}`, async (data) => {
          console.log("[Firebase] ::: Listen User ::: ", data)

          if (data.emailVerified) {
            const authStore = useAuthStore()
            await authStore.set("user", data)
            await authStore.set("userLoggedIn", true)

            this.$bus.$emit("goTo", "/")
          }
        })
      }
    },
    async sendEmailVerification() {
      this.sendingEmail = true
      await this.$fire.actions.resendEmailVerification()

      this.$bus.$emit("toast", {
        severity: "success",
        summary: "Email Sent",
        detail: "Successfully sent verification email.",
      })

      setTimeout(() => {
        this.sendingEmail = false
      }, 3000)
    },
    async logout() {
      await useAuthStore().logout()
    },
  },
}
</script>
