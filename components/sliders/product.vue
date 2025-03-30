<template>
  <div class="c-slider">
    <Loader v-if="loading"></Loader>

    <Splide v-else :options="sliderOptions" ref="splide">
      <SplideSlide v-for="item in itemImages" :key="`item_${item}`">
        <div
          class="c-block c-image size-m"
          :style="$utils.setBackImage(item.url)"
          @click.stop="goToUrl(item.pathUrl)"
        ></div>
      </SplideSlide>
    </Splide>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: null,
    },
    type: {
      type: String,
      default: "productItemSlider",
    },
  },

  data() {
    return {
      loading: false,
    }
  },

  computed: {
    sliderOptions() {
      let options = {
        padding: "0",
        drag: "free",
        snap: true,
        perPage: 1,
        gap: "0px",
        index: 2,
      }

      if (this.type && this.type === "productDetailedSlider") {
        options = {
          padding: "0",
          drag: "free",
          snap: true,
          perPage: 1,
          gap: "0px",
        }
      }

      return options
    },
    itemPath() {
      return `/products/${this.item.category.handle}/${this.item.id}_${this.item.handle}`
    },
    itemImages() {
      return this.item.images.map((image) => {
        let newItem = image
        let pathUrl = this.itemPath

        if (this.item.variants) {
          let variants = this.item.variants.filter(
            (variant) => variant.image.id === image.uid
          )
          if (variants && variants.length > 0) {
            pathUrl += `?variant=${variants[0].id}`
          }
        }

        newItem.pathUrl = pathUrl

        return newItem
      })
    },
  },

  methods: {
    goToUrl(url) {
      if (this.type === "productItemSlider") {
        this.$bus.$emit("goTo", url)
      }
    },
  },
}
</script>
