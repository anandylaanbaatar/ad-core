<template>
  <div v-if="data" class="c-space" :style="setStyle"></div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default: null,
    },
  },

  computed: {
    setStyle() {
      let style = ``

      if (this.data) {
        if (this.data.primary.height) {
          style += `height:${this.data.primary.height};`
        }
      }

      return style
    },
  },
}
</script>
