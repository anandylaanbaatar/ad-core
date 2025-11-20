<template>
  <AppLayout type="regular">
    <div class="c-page">
      <div :class="container">
        <Loader v-if="loading"></Loader>

        <UiError v-else-if="error" type="custom" class="mt-4 p-8">
          <div class="text-center">
            <div>
              <h1>404</h1>
              <p class="my-2">{{ $utils.t(error) }}</p>
              <Button @click="$bus.$emit('goTo', '/')">{{
                $utils.t("Home")
              }}</Button>
            </div>
          </div>
        </UiError>

        <Slices v-else :slices="slices"></Slices>
      </div>
    </div>
  </AppLayout>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      error: false,
      page: null,
      slices: null,
    }
  },

  computed: {
    pageId() {
      return useRoute().params.id
    },
    container() {
      if (this.page) {
        if (this.page.data && this.page.data.page_type) {
          if (this.page.data.page_type === "Container") {
            return "container"
          } else if (this.page.data.page_type === "Blog") {
            return "container blog"
          } else if (this.page.data.page_type === "Full") {
            return ""
          }
        }
      }
      return "container"
    },
  },

  async created() {
    await this.getPage()
  },
  async mounted() {
    await this.getPage()
  },

  methods: {
    async getPage() {
      if (this.page) return

      // Check if CMS is enabled
      const config = useRuntimeConfig()
      const cmsProvider = config.public.features?.cms?.provider || 'prismic'
      const prismicEnabled = config.public.integrations.prismic
      const directusEnabled = config.public.integrations.directus

      if (!prismicEnabled && !directusEnabled) {
        this.errorPage("CMS Integration is disabled!")
        return
      }

      if (!this.pageId) {
        this.errorPage("No Page Found!")
        return
      }

      try {
        // Use CMS abstraction layer
        const cms = useCMS()
        const page = await cms.getPage(this.pageId)

        if (page) {
          this.page = page
          this.slices = page.data.slices
        } else {
          this.errorPage("Page not found in CMS")
        }

        this.loading = false
      } catch (err) {
        this.errorPage(err.message)
      }
    },
    async errorPage(errMsg) {
      let msg = errMsg ? errMsg : null

      console.log("[Page] ::: CMS page has errors!", msg)

      this.loading = false
      this.error = msg
    },
  },
}
</script>
