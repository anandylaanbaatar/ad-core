<template>
  <template v-if="slice">
    <SlicesHeaderStudio
      v-if="slice.variation === 'default'"
      :item="slice.primary"
    ></SlicesHeaderStudio>

    <SlicesHeaderCommerce
      v-if="slice.variation === 'commerce'"
      :item="slice.primary"
    ></SlicesHeaderCommerce>

    <SlicesHeaderSimple
      v-if="slice.variation === 'simple'"
      :item="slice.primary"
    ></SlicesHeaderSimple>

    <SlicesHeaderProduct
      v-if="slice.variation === 'product'"
      :item="slice.primary"
    ></SlicesHeaderProduct>
  </template>
</template>

<script>
export default {
  data() {
    return {
      slice: null,
    }
  },

  async mounted() {
    if (integrations().prismic) {
      if (!this.$prismicClient) return

      try {
        const item = await this.$prismicClient.getSingle("header")

        if (item && item.data) {
          if (item.data.slices && item.data.slices.length > 0) {
            this.slice = item.data.slices[0]
          }
        }
      } catch (err) {
        console.log("[Prismic] ::: Error ::", err.message)
      }
    }
  },
}
</script>
