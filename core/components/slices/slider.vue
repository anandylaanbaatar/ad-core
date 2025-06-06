<template>
  <div class="container">
    <div class="c-slider">
      <Loader v-if="loading"></Loader>

      <Splide v-else-if="items" :options="sliderOptions" ref="splide">
        <SplideSlide v-for="item in items" :key="`item_${item}`">
          <div class="c-block c-image size-xl" :style="setStyle(item)">
            <div class="c-block-bottom-left">
              <div class="c-block-text">
                <h3 v-if="item.title">{{ item.title }}</h3>
                <p v-if="item.sub_title">{{ item.sub_title }}</p>

                <Button
                  v-if="item.link.url"
                  label="Shop"
                  class="mt-3"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  @click="$bus.$emit('goTo', item.link.url)"
                ></Button>
              </div>
            </div>
          </div>
        </SplideSlide>
      </Splide>
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

  data() {
    return {
      loading: true,
      sliderOptions: {
        type: "loop",
        padding: "4rem",
        drag: "free",
        snap: true,
        perPage: 1,
        gap: "10px",
        breakpoints: {
          1400: {
            perPage: 1,
          },
          1199: {
            perPage: 1,
          },
          767: {
            perPage: 1,
            padding: 0,
          },
          575: {
            perPage: 1,
          },
        },
      },
    }
  },

  computed: {
    items() {
      if (this.data) {
        return this.data.primary.sliders
      }
      return null
    },
  },

  async created() {
    setTimeout(() => {
      this.loading = false
    }, 100)
  },

  methods: {
    setStyle(item) {
      if (item) {
        let style = ``

        if (item.image && item.image.url) {
          style += `${this.$utils.setBackImage(item.image.url)}`
        }
        if (item.background_color) {
          style += `${this.$utils.setBackColor(item.background_color)}`
        }

        return style
      }
      return
    },
  },
}
</script>
