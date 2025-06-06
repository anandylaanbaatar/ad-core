<template>
  <div>
    <SlicesProductsCommerce
      v-if="data.variation === 'default'"
      :data="data"
    ></SlicesProductsCommerce>

    <SlicesProductsServices
      v-else-if="data.variation === 'services'"
      :data="data"
    ></SlicesProductsServices>
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
