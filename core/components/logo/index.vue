<template>
  <div class="c-logo xl" @click="goTo">
    <img
      v-if="logo.mobileUrl"
      :src="logo.mobileUrl"
      :alt="theme.name_short"
      class="mobileOnly"
    />
    <img
      v-if="logo.url"
      :src="logo.url"
      :alt="theme.name_short"
      class="desktopOnly"
    />

    <h2 v-if="!logo.mobileUrl && !logo.url" class="mt-2">{{ theme.name }}</h2>
  </div>
</template>

<script>
export default {
  props: {
    noLink: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    theme() {
      return useAppConfig().theme
    },
    darkMode() {
      return useCoreStore().darkMode
    },
    isMobileScreen() {
      return window.matchMedia("(max-width: 768px)").matches
    },
    logo() {
      let logo = {
        url: null,
        mobileUrl: null,
        classes: null,
      }

      // Desktop
      if (this.darkMode && this.theme.logo?.desktop_dark) {
        logo.url = this.theme.logo.desktop_dark
      } else if (this.theme.logo?.desktop) {
        logo.url = this.theme.logo.desktop
      }

      // Mobile
      if (this.darkMode && this.theme.logo?.mobile_dark) {
        logo.mobileUrl = this.theme.logo.mobile_dark
      } else if (this.theme.logo?.mobile) {
        logo.mobileUrl = this.theme.logo.mobile
      }

      return logo
    },
  },

  methods: {
    goTo() {
      if (!this.noLink) {
        this.$bus.$emit("goTo", "/")
      }
    },
  },
}
</script>
