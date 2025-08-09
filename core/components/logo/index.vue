<template>
  <div class="c-logo xl" @click="$bus.$emit('goTo', '/')">
    <img
      v-if="theme.logo.desktop"
      :src="theme.logo.desktop"
      :alt="theme.name_short"
      class="desktopLogo"
      :class="{ lightOnly: theme.logo.desktop_dark }"
    />
    <img
      v-if="theme.logo.desktop_dark"
      :src="theme.logo.desktop_dark"
      :alt="theme.name_short"
      class="desktopLogo darkOnly"
    />

    <img
      v-if="theme.logo.mobile_dark && darkMode"
      :src="theme.logo.mobile_dark"
      :alt="theme.name_short"
      class="mobileLogo"
    />
    <img
      v-else-if="theme.logo.mobile"
      :src="theme.logo.mobile"
      :alt="theme.name_short"
      class="mobileLogo"
    />

    <h2 v-else class="mt-2">{{ theme.name }}</h2>
  </div>
</template>

<script>
export default {
  computed: {
    theme() {
      return useAppConfig().theme
    },
    darkMode() {
      return useCoreStore().darkMode
    },
  },
}
</script>
