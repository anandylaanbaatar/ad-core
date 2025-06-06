<template>
  <div class="sidebar verifyEmail">
    <FormsAuthVerifyEmail></FormsAuthVerifyEmail>

    <div class="bottom">
      <div @click="useAuthStore().logout()" class="btn">
        {{ $utils.t("Sign out from website?") }}
        <strong>{{ $utils.t("Logout") }}</strong>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    user() {
      return useAuthStore().user
    },
    active() {
      const config = useRuntimeConfig()

      if (config.public.features.auth.type === "shopify") {
        return false
      } else if (config.public.features.auth.type === "firebase") {
        if (this.user && !this.user.emailVerified) {
          return true
        }
      }

      return false
    },
  },
}
</script>
