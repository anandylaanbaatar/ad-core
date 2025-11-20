<template>
  <article v-if="desc" v-html="getItemDescription(desc)"></article>
</template>

<script>
import { renderRichText } from '~/utils/richtext'

export default {
  props: {
    desc: {
      type: [Array, String, Object],
      default: null,
    },
  },

  methods: {
    getItemDescription(description) {
      return renderRichText(description)
    },
  },
}
</script>
