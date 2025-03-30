<template>
  <div
    v-if="useAppConfig().theme.splash"
    class="c-pageLoader"
    :class="{ active: show }"
  >
    <div class="image"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: true,
    }
  },

  computed: {
    url() {
      return ""
    },
    urlWithBackground() {
      if (this.url) {
        return `background-image: url("${this.url}");`
      }
      return ""
    },
  },

  mounted() {
    this.$bus.$on("pageLoading", (showOrHide) => {
      this.show = showOrHide
    })
    setTimeout(() => {
      this.show = false
    }, 1300)
  },
}
</script>

<style lang="scss">
.c-pageLoader .image {
  background-image: url("https://images.prismic.io/adoriginalstudio/Zzn-Ea8jQArT08hI_ad_loader-3.gif");
}
</style>
