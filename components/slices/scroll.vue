<template>
  <template v-if="items">
    <Scroll ref="scrollSlider" :title="title">
      <div
        v-for="item in items"
        :key="`item_${item.id}`"
        class="c-scroll_item scrollItem"
      >
        <div class="content">
          <h2 v-if="item.title">{{ item.title }}</h2>
          <SlicesLink :link="item.link"></SlicesLink>
        </div>

        <div
          v-if="item.image.url"
          class="image"
          :style="$utils.setBackImage(item.image.url)"
        ></div>
        <div class="dimmer"></div>
      </div>
    </Scroll>
  </template>
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
    title() {
      if (this.data) {
        if (this.data.primary.title) {
          return this.data.primary.title
        }
      }
      return
    },
    items() {
      if (this.data) {
        if (this.data.primary.images) {
          return this.data.primary.images
        }
      }
      return
    },
  },

  mounted() {
    if (this.items) {
      setTimeout(() => {
        this.$refs.scrollSlider.init()
      }, 100)
    }
  },
}
</script>

<style lang="scss">
.scrollItem {
  width: 373px;
  min-width: 373px;
  height: 560px;
  overflow: hidden;

  .dimmer {
    display: none;
  }
  .p-glass-button {
    width: calc(100% - 30px);
    height: calc(560px - 15px);
    position: absolute !important;
    bottom: 15px;
  }
}
</style>
