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
    productCategoryHandle() {
      if (this.item) {
        if (this.item.collections) {
          if (this.item.collections.handle) {
            return this.item.collections.handle
          }
        }
      }
      return "all"
    },
    productUrl() {
      return `/products/${this.productCategoryHandle}/${this.item.id}_${this.item.handle}`
    },
    itemImages() {
      const images = this.item.images.map((image) => {
        let newItem = {
          id: image.files_id.id,
          file_id: image.files_id.file_id,
          url: image.files_id.url,
          pathUrl: this.productUrl,
        }

        if (this.item.variants) {
          let variants = this.item.variants.filter(
            (variant) => variant.image.id === image.id
          )
          if (variants && variants.length > 0) {
            newItem.pathUrl += `?variant=${variants[0].sku}`
          }
        }

        return newItem
      })

      if (this.item.variants) {
        for (let i = 0; i < this.item.variants.length; i++) {
          const variant = this.item.variants[i]

          if (variant.image) {
            if (!images.find((j) => j.id === variant.image.id)) {
              images.push({
                file_id: variant.image.file_id,
                id: variant.image.id,
                url: variant.image.url,
                pathUrl: `${this.productUrl}?variant=${variant.sku}`,
              })
            }
          }
        }
      }

      return images
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
