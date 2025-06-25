<template>
  <AppLayout type="regular">
    <div class="c-page customPage">
      <Loader v-if="loading"></Loader>

      <div v-else>
        <Slices v-if="slices" :slices="slices"></Slices>
      </div>
    </div>
  </AppLayout>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      page: null,
      slices: null,
    }
  },

  async created() {
    // if (this.page === null) {
    //   await this.getPage()
    // }
  },
  async mounted() {
    // if (this.page === null) {
    //   await this.getPage(true)
    // }
  },

  methods: {
    async getPage(routePage) {
      if (useRuntimeConfig().public.integrations.prismic) {
        if (!this.$prismicClient) return

        try {
          const page = await this.$prismicClient.getByUID("page", "home")

          console.log("[Prismic] ::: Page :::", page)

          this.page = page
          this.slices = page.data.slices

          setTimeout(() => {
            this.loading = false
          }, 1500)
        } catch (err) {
          console.log("Prismic ::: Error :: ", err)

          this.loading = false
        }
      } else {
        this.loading = false

        if (routePage) {
          window.location.href = "/default"
        }
      }
    },
  },
}
</script>
