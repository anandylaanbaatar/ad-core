<template>
  <div v-if="image" class="c-block c-image">
    <PrismicImage :field="image" />
  </div>
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
    image() {
      if (this.data) {
        if (this.data.primary) {
          if (this.data.primary.image) {
            return this.data.primary.image
          }
        }
      }
      return
    },
  },
}
</script>
