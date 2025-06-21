<template>
  <Drawer
    v-model:visible="active"
    position="full"
    class="imagePreview"
    :showCloseIcon="false"
    :blockScroll="true"
    @hide="reset"
  >
    <Button
      class="sm closeBtn absolute top-0 right-0 m-5"
      icon="pi pi-times"
      @click="reset"
    ></Button>

    <!--Single Image-->
    <div v-if="image" class="content">
      <div class="top"></div>

      <div class="center">
        <img class="image" :src="image" />
      </div>

      <div class="back" :style="$utils.setBackImage(image)">
        <div class="dimmer"></div>
      </div>
    </div>

    <!--Image Slider-->
    <div v-else-if="images" class="c-slider">
      <Splide ref="splide">
        <SplideSlide v-for="image in images" :key="`image_preview_${image}`">
          <div class="content" :style="`height:${height}px;`">
            <div class="center">
              <img class="image" :src="image.url" />
            </div>
            <div class="back" :style="$utils.setBackImage(image.url)">
              <div class="dimmer"></div>
            </div>
          </div>
        </SplideSlide>
      </Splide>
    </div>
  </Drawer>
</template>

<script>
export default {
  data() {
    return {
      images: null,
      image: null,
      height: null,
    }
  },

  computed: {
    active() {
      if (this.images || this.image) {
        return true
      }
      return false
    },
  },

  mounted() {
    this.$bus.$on("imagePreviewGlobal", (items) => {
      this.setHeight()

      if (typeof items === "object") {
        this.images = items
      } else if (typeof items === "string") {
        this.image = items
      }
    })
    this.$bus.$on("imagePreviewGlobalClose", () => {
      this.reset()
    })
  },

  methods: {
    reset() {
      this.image = null
      this.images = null
    },
    setHeight() {
      this.height = window.innerHeight - 30
    },
  },
}
</script>
