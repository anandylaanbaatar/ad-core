<template>
  <section v-if="description" class="c-description">
    <!-- <PrismicRichText :field="description"></PrismicRichText> -->
    <p v-if="description.length">{{ description[0]?.text }}</p>
  </section>
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
    description() {
      if (this.data) {
        if (this.data.primary && this.data.primary.description) {
          return this.data.primary.description
        }
      }
      return
    },
  },
}
</script>
