<template>
  <SlicesFormsMailingListBlock
    v-if="data.variation === 'default'"
    :data="data"
  ></SlicesFormsMailingListBlock>

  <SlicesFormsMailingListGrid
    v-else-if="data.variation === 'grid'"
    :data="data"
  ></SlicesFormsMailingListGrid>
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
