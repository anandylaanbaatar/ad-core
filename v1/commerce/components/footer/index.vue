<template>
  <div class="c-footer">
    <div class="container py-4">
      <div class="c-footer-container">
        <div class="row">
          <div class="col-xs-12 col-md-6 col-lg-4">
            <Logo></Logo>

            <Tag class="cursor-pointer my-3" rounded severity="primary">
              <div class="flex items-center gap-2 px-1">
                {{ version }}
              </div>
            </Tag>
            <br />

            <p class="mb-1 mt-3">
              {{ $utils.t("Language") }} & {{ $utils.t("Currency") }}
            </p>
            <SwitcherLanguage class="mb-1"></SwitcherLanguage>
            <SwitcherCurrency></SwitcherCurrency>
          </div>

          <div class="col-xs-12 col-md-6 col-lg-8">
            <div class="row">
              <!--Collections-->
              <div v-if="allCollections" class="col-xs-12 col-md-6 col-lg-4">
                <p class="label mb-2">{{ $utils.t("Collections") }}</p>
                <ul class="c-list">
                  <li
                    v-for="collection in allCollections"
                    :key="`footer_collection_item_${collection.id}`"
                    @click="
                      $bus.$emit('goTo', `/products/${collection.handle}/`)
                    "
                    class="c-link"
                  >
                    {{ getTitle(collection.title) }}
                  </li>
                </ul>
              </div>

              <!--About Us-->
              <div class="col-xs-12 col-md-6 col-lg-4">
                <p class="label mb-2">Company</p>
                <ul class="c-list">
                  <li>{{ $utils.t("About Us") }}</li>
                  <li>{{ $utils.t("FAQ") }}</li>
                  <li>{{ $utils.t("Contact Us") }}</li>
                </ul>
              </div>

              <!--Shop The Look-->
              <!-- <div class="col-xs-12 col-md-6 col-lg-3">
                <p class="label mb-2">Shop The Look</p>
                <ul class="c-list">
                  <li>2024 {{ $utils.t("Collection") }}</li>
                  <li>Tennis {{ $utils.t("Collection") }}</li>
                </ul>
              </div> -->

              <!--Social-->
              <div class="col-xs-12 col-md-6 col-lg-4">
                <p class="label mb-2">{{ $utils.t("Follow Us") }}</p>
                <ul class="c-list">
                  <li class="c-link mb-2">
                    <Nuxt-link
                      v-if="useAppConfig().theme.contact.facebook"
                      :to="useAppConfig().theme.contact.facebook"
                      target="_blank"
                    >
                      <Button icon="pi pi-facebook"></Button>
                    </Nuxt-link>

                    <Nuxt-link
                      v-if="useAppConfig().theme.contact.instagram"
                      :to="useAppConfig().theme.contact.instagram"
                      target="_blank"
                    >
                      <Button icon="pi pi-instagram" class="ml-2"></Button>
                    </Nuxt-link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="col-xs-12 col-md-6 col-lg-4 c-footer-bottom left">
            <img
              height="25"
              src="/images/theme/credit_card_icons.png"
              alt="Credit Cards"
              class="mt-2"
            />
          </div>
          <div class="col-xs-12 col-md-6 col-lg-4 c-footer-bottom center">
            <p>
              {{ siteName }} - {{ copyright }} -
              {{ currentYear }}
            </p>
          </div>
          <div class="col-xs-12 col-md-6 col-lg-4 c-footer-bottom right">
            <p>
              <span
                class="c-link mr-4"
                @click="$bus.$emit('goTo', '/terms_of_service')"
                >Terms of Service</span
              >
              <span
                class="c-link"
                @click="$bus.$emit('goTo', '/privacy_policy')"
                >Privacy Policy</span
              >
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      versionLabel: null,
      copyright: null,
      siteName: null,
      currentYear: null,
    }
  },

  computed: {
    version() {
      const appConfig = useAppConfig()
      return appConfig.theme.version
    },
    isAdvanced() {
      return useCommerceStore().advancedCollections
    },
    allCollections() {
      let allTopCollections = useCommerceStore().collections

      if (allTopCollections) {
        if (this.isAdvanced) {
          allTopCollections = allTopCollections.filter(
            (i) => i.level.id === "level-1"
          )
          if (allTopCollections.length > 10) {
            return (allTopCollections = allTopCollections.splice(0, 10))
          }
        }

        return allTopCollections
      }

      return []
    },
  },

  mounted() {
    this.versionLabel = this.$utils.t("Version")
    this.copyright = this.$utils.t("Copyright")
    this.siteName = useAppConfig().theme.name
    this.currentYear = this.$utils.getCurrentYear()
  },

  methods: {
    getTitle(title) {
      return this.$utils.t(title)
    },
  },
}
</script>
