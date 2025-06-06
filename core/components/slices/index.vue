<template>
  <div v-if="slices" class="slices">
    <div v-for="slice in slices" class="slice" :key="`slice_item_${slice.id}`">
      <!--Hero-->
      <SlicesHero v-if="slice.slice_type === 'hero'" :data="slice"></SlicesHero>

      <!--Blocks-->
      <SlicesBlocks
        v-else-if="slice.slice_type === 'blocks'"
        :data="slice"
      ></SlicesBlocks>

      <!--Sliders-->
      <SlicesSlider
        v-else-if="slice.slice_type === 'slider'"
        :data="slice"
      ></SlicesSlider>

      <!--Products Grid-->
      <SlicesProducts
        v-else-if="slice.slice_type === 'products_grid'"
        :data="slice"
      ></SlicesProducts>

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

      <!--Images-->
      <SlicesImages
        v-else-if="slice.slice_type === 'image'"
        :data="slice"
      ></SlicesImages>

      <!--Description-->
      <SlicesDescription
        v-if="slice.slice_type === 'description'"
        :data="slice"
      ></SlicesDescription>

      <!--Embed-->
      <SlicesEmbed
        v-if="slice.slice_type === 'embed'"
        :data="slice"
      ></SlicesEmbed>

      <!--Mailing List-->
      <SlicesFormsMailingList
        v-if="slice.slice_type === 'mailing_list'"
        :data="slice"
      ></SlicesFormsMailingList>

      <!--Testimonials-->
      <SlicesTestimonials
        v-if="slice.slice_type === 'testimonials'"
        :data="slice"
      ></SlicesTestimonials>
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
}
</script>
