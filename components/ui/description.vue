<template>
  <article v-if="desc" v-html="getItemDescription(desc)"></article>
</template>

<script>
import * as prismic from "@prismicio/client"

export default {
  props: {
    desc: {
      type: Array,
      default: null,
    },
  },

  methods: {
    getItemDescription(description) {
      return prismic.asHTML(description)
    },
  },
}
</script>
