<template>
  <Scroll ref="shopthelookSlider">
    <div
      v-for="item in items"
      :key="`item_${item.id}`"
      class="c-scroll_item scrollItem"
    >
      <div class="content">
        <h2 v-if="item.title">{{ item.title }}</h2>

        <Button label="Shop the look" block class="p-glass-button"></Button>
      </div>

      <div
        v-if="item.image && item.image.url"
        class="image"
        :style="$utils.setBackImage(item.image.url)"
      ></div>
      <div class="dimmer"></div>
    </div>
  </Scroll>
</template>

<script>
export default {
  data() {
    return {
      items: [
        {
          id: 1,
          image: {
            url: "https://a.storyblok.com/f/237022/6ed51acb7f/shop-the-look_6.png/m/800x0/",
          },
        },
        {
          id: 2,
          image: {
            url: "https://a.storyblok.com/f/237022/d22aae98d9/shop-the-look_11.png/m/800x0/",
          },
        },
        {
          id: 3,
          image: {
            url: "https://a.storyblok.com/f/237022/79a823607e/shop-the-look_8.png/m/800x0/",
          },
        },
        {
          id: 4,
          image: {
            url: "https://a.storyblok.com/f/237022/47bdc9763a/shop-the-look_9.png/m/800x0/",
          },
        },
        {
          id: 5,
          image: {
            url: "https://a.storyblok.com/f/237022/e43e478430/shop-the-look_2.png/m/800x0/",
          },
        },
        {
          id: 5,
          image: {
            url: "https://a.storyblok.com/f/237022/a8c691465c/shop-the-look_10.png/m/800x0/",
          },
        },
      ],
    }
  },

  mounted() {
    this.$refs.shopthelookSlider.init()
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
