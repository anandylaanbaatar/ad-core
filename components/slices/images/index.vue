<template>
  <div>
    <SlicesImagesSingleImage
      v-if="data.variation === 'default'"
      :data="data"
    ></SlicesImagesSingleImage>

    <SlicesImagesFourImages
      v-else-if="data.variation === 'fourImages'"
      :data="data"
    ></SlicesImagesFourImages>
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
