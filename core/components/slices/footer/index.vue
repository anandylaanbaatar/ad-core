<template>
  <template v-if="slice">
    <SlicesFooterStudio
      v-if="slice.variation === 'default'"
      :item="slice.primary"
    ></SlicesFooterStudio>

    <SlicesFooterCommerce
      v-if="slice.variation === 'commerce'"
      :item="slice.primary"
    ></SlicesFooterCommerce>

    <SlicesFooterSimple
      v-if="slice.variation === 'simple'"
      :item="slice.primary"
    ></SlicesFooterSimple>
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
      try {
        const { client } = usePrismic()
        const item = await client.getSingle("footer")

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
