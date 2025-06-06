<template>
  <div>
    <SlicesHeroSingleBlock
      v-if="data.variation === 'default'"
      :data="data"
    ></SlicesHeroSingleBlock>

    <SlicesHeroTextDescription
      v-else-if="data.variation === 'heroTextDescription'"
      :data="data"
    ></SlicesHeroTextDescription>

    <SlicesHeroTwoBlocks
      v-else-if="data.variation === 'twoBlocks'"
      :data="data"
    ></SlicesHeroTwoBlocks>

    <SlicesHeroThreeBlocks
      v-else-if="data.variation === 'threeBlocks'"
      :data="data"
    ></SlicesHeroThreeBlocks>
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
