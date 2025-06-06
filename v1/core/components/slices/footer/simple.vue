<template>
  <div
    v-if="item && isActive"
    class="c-footer simple"
    :class="{ noBorder: !item.border }"
  >
    <div class="container">
      <p class="text-center">
        © {{ currentYear }} {{ copyright }} - {{ siteName }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: null,
    },
  },

  computed: {
    theme() {
      return useAppConfig().theme
    },
    siteName() {
      if (this.theme) {
        return this.theme.name
      }
      return
    },
    copyright() {
      return this.$utils.t("All rights reserved.")
    },
    currentYear() {
      return this.$utils.getCurrentYear()
    },

    isActive() {
      if (this.item) {
        if (this.item.active) {
          return this.item.active
        }
      }
      return false
    },
  },
}
</script>
