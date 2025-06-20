<template>
  <div
    class="c-pageLoader"
    :class="{ enabled: theme.splash, active: show, hide: hide }"
  >
    <div class="image" :style="urlWithBackground"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: true,
      hide: false,
    }
  },

  computed: {
    theme() {
      return useAppConfig().theme
    },
    url() {
      if (this.theme && this.theme.splash) {
        let splashUrl = this.theme.splash

        if (splashUrl.indexOf("?auto=format,compress") !== -1) {
          splashUrl = splashUrl.replace("?auto=format,compress", "")
        }

        return splashUrl
      }
      return
    },
    urlWithBackground() {
      if (this.url) {
        return `background-image: url("${this.url}");`
      }
      return `background-image: url(/images/logos/splash.gif);`
    },
  },

  mounted() {
    if (!this.theme.splash) {
      this.show = false
    }

    this.$bus.$on("pageLoading", (showOrHide) => {
      this.show = showOrHide

      if (showOrHide) {
        this.hide = false
      }
    })

    // Timer
    let timer = 1300
    if (this.theme.splash) {
      if (this.theme.splashTimer) {
        timer = this.theme.splashTimer
      }
    }

    setTimeout(() => {
      this.hide = true

      setTimeout(() => {
        this.show = false
      }, 300)
    }, timer)
  },
}
</script>
