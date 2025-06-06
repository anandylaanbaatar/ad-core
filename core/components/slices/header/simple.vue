<template>
  <div v-if="item && isActive" class="c-header simple"></div>
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
