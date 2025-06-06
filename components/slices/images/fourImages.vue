<template>
  <div v-if="item" class="hero images">
    <div class="container">
      <div class="row">
        <div v-for="i in 4" :key="`hero_image_${i}`" class="col-xs-6 col-md-3">
          <div
            class="c-block c-image imageItem"
            :class="`imageItem_${i}`"
            :style="$utils.setBackImage(item[`image_${i}`].url)"
          ></div>
        </div>
      </div>
    </div>
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

  computed: {
    item() {
      if (this.data && this.data.primary) {
        return this.data.primary
      }
      return
    },
  },
}
</script>
