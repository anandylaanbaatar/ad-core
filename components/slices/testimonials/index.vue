<template>
  <div>
    <SlicesTestimonialsSlider
      v-if="data.variation === 'default'"
      :data="data"
    ></SlicesTestimonialsSlider>

    <SlicesTestimonialsGrid
      v-else-if="data.variation === 'grid'"
      :data="data"
    ></SlicesTestimonialsGrid>
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
}
</script>
