<template>
  <div v-if="slices" class="slices">
    <div v-for="slice in slices" class="slice" :key="`slice_item_${slice.id}`">
      <!--Hero-->
      <SlicesHero v-if="slice.slice_type === 'hero'" :data="slice"></SlicesHero>

      <!--Sliders-->
      <SlicesSlider
        v-else-if="slice.slice_type === 'slider'"
        :data="slice"
      ></SlicesSlider>

      <!--Products Grid-->
      <SlicesProductsGrid
        v-else-if="slice.slice_type === 'products_grid'"
        :data="slice"
      ></SlicesProductsGrid>

      <!--Quote-->
      <SlicesQuote
        v-else-if="slice.slice_type === 'quote'"
        :data="slice"
      ></SlicesQuote>

      <!--Space-->
      <SlicesSpace
        v-else-if="slice.slice_type === 'space'"
        :data="slice"
      ></SlicesSpace>

      <!--Scroll-->
      <SlicesScroll
        v-else-if="slice.slice_type === 'scroll'"
        :data="slice"
      ></SlicesScroll>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    slices: {
      type: Array,
      default: null,
    },
  },

  // created() {
  //   console.log("[Prismic] ::: Slices ::: ", this.slices)
  // },
}
</script>
