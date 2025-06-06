<template>
  <div class="c-slider">
    <Loader v-if="loading"></Loader>

    <Splide v-else :options="sliderOptions" ref="splide">
      <slot></slot>
    </Splide>
  </div>
</template>

<script>
export default {
  props: {
    options: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      loading: true,
      mainOptions: {
        // type: "loop",
        padding: "15px",
        drag: "free",
        snap: true,
        perPage: 4,
        gap: "10px",
        breakpoints: {
          1280: {
            perPage: 4,
          },
          991: {
            perPage: 3,
          },
          767: {
            perPage: 2,
          },
          478: {
            perPage: 1,
          },
        },
      },
    }
  },

  computed: {
    sliderOptions() {
      let options = this.mainOptions

      if (this.options) {
        options = Object.assign(options, this.options)
      }

      return options
    },
  },

  async created() {
    setTimeout(() => {
      this.loading = false
    }, 100)
  },
}
</script>
