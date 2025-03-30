<template>
  <div v-if="text" class="container">
    <div class="c-quote">
      {{ text }}
    </div>
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
    text() {
      if (this.data) {
        return this.data.primary.text
      }
      return
    },
  },
}
</script>
