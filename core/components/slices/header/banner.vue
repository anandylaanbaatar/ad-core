<template>
  <div
    v-if="!loading && banner"
    class="c-banner-header"
    :style="$utils.setBackColor(banner.background)"
  >
    <div class="c-banner-text font3">
      {{ banner.text }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      banner: null,
      resizeInit: false,
    }
  },

  async created() {
    if (integrations().prismic) {
      if (!this.$prismicClient) return

      const banner = await this.$prismicClient.getSingle("header_banner")

      if (banner) {
        if (banner.data.active) {
          this.banner = {
            text: banner.data.text,
            url: banner.data.link.url,
            background: banner.data.background_color,
          }
        }
      }

      this.loading = false
    }
  },
}
</script>
