<template>
  <div v-if="item && isActive" class="c-footer">
    <div class="container py-4">
      <div class="c-footer-container">
        <div class="row">
          <!--Top-->
          <div class="col-xs-12 col-md-6 col-lg-4">
            <Logo v-if="item.logo" class="mb-3"></Logo>

            <template v-if="item.show_version">
              <Tag
                class="cursor-pointer mb-3"
                rounded
                severity="primary"
                @click="goToExternal('https://commerce.adcreative.studio')"
              >
                <div class="flex items-center gap-2 px-1">
                  {{ version }}
                </div>
              </Tag>
              <br />
            </template>

            <div v-if="item.show_language_currency" class="mb-3">
              <p class="mb-1 mt-3">
                {{ $utils.t("Language") }} & {{ $utils.t("Currency") }}
              </p>
              <SwitcherLanguage class="mb-1"></SwitcherLanguage>
              <SwitcherCurrency></SwitcherCurrency>
            </div>
          </div>

          <div class="col-xs-12 col-md-6 col-lg-8">
            <div class="row">
              <!--Collections-->
              <template v-if="item.collection_links">
                <div
                  v-if="allCollections"
                  class="col-xs-12 col-md-6 col-lg-4 mb-3"
                >
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
              </template>

              <!--Links-->
              <template v-else>
                <div v-if="item.links" class="col-xs-12 col-md-6 col-lg-4 mb-3">
                  <p v-if="item.links_title" class="label mb-2">
                    {{ $utils.t(item.links_title) }}
                  </p>
                  <ul class="c-list contactList">
                    <li
                      v-for="link in item.links"
                      :key="`footer_link_${link.link.key}`"
                      class="c-link"
                    >
                      <p v-if="link.label" class="label mb-2">
                        {{ link.label }}
                      </p>
                      <a
                        v-if="link.link && link.link.url"
                        :href="`${link.link.url}`"
                        class="link"
                        >{{ link.link.text }}</a
                      >
                    </li>
                  </ul>
                </div>
              </template>

              <!--Pages-->
              <div class="col-xs-12 col-md-6 col-lg-4 mb-3">
                <p v-if="item.pages_title" class="label mb-2">
                  {{ $utils.t(item.pages_title) }}
                </p>

                <ul class="c-list">
                  <li
                    v-for="page in item.pages"
                    :key="`footer_item_${page.link.key}`"
                    class="c-link"
                    @click="$bus.$emit('goTo', page.link.url)"
                  >
                    {{ $utils.t(page.link.text) }}
                  </li>
                </ul>
              </div>

              <!--Social-->
              <div class="col-xs-12 col-md-6 col-lg-4 mb-3">
                <p v-if="item.social_title" class="label mb-2">
                  {{ $utils.t(item.social_title) }}
                </p>

                <ul class="c-list">
                  <li class="mb-2">
                    <Nuxt-link
                      v-for="social in item.socials"
                      :key="`footer_social_${social.link.key}`"
                      :to="social.link.url"
                      :target="social.link.target"
                    >
                      <Button
                        v-if="social.social_id === 'facebook'"
                        icon="pi pi-facebook"
                      ></Button>

                      <Button
                        v-else-if="social.social_id === 'twitter'"
                        icon="pi pi-twitter"
                        class="ml-2"
                      ></Button>

                      <Button
                        v-else-if="social.social_id === 'instagram'"
                        icon="pi pi-instagram"
                        class="ml-2"
                      ></Button>

                      <Button
                        v-else-if="social.social_id === 'pinterest'"
                        icon="pi pi-pinterest"
                        class="ml-2"
                      ></Button>

                      <Button
                        v-else-if="social.social_id === 'linkedin'"
                        icon="pi pi-linkedin"
                        class="ml-2"
                      ></Button>

                      <Button
                        v-else-if="social.social_id === 'github'"
                        icon="pi pi-github"
                        class="ml-2"
                      ></Button>

                      <Button
                        v-else-if="social.social_id === 'dribbble'"
                        icon="pi pi-dribbble"
                        class="ml-2"
                      ></Button>

                      <Button
                        v-else-if="social.social_id === 'tiktok'"
                        icon="pi pi-tiktok"
                        class="ml-2"
                      ></Button>

                      <Button
                        v-else-if="social.social_id === 'vimeo'"
                        icon="pi pi-vimeo"
                        class="ml-2"
                      ></Button>

                      <Button
                        v-else-if="social.social_id === 'youtube'"
                        icon="pi pi-youtube"
                        class="ml-2"
                      ></Button>

                      <Button
                        v-else-if="social.social_id === 'reddit'"
                        icon="pi pi-reddit"
                        class="ml-2"
                      ></Button>
                    </Nuxt-link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!--Bottom-->
          <div class="col-xs-12 col-md-6 col-lg-4 c-footer-bottom left">
            <img
              height="25"
              src="/images/theme/credit_card_icons.png"
              alt="Credit Cards"
              class="mt-2"
            />
          </div>
          <div class="col-xs-12 col-md-6 col-lg-4 c-footer-bottom center">
            <p>© {{ currentYear }} {{ copyright }} - {{ siteName }}</p>
          </div>
          <div class="col-xs-12 col-md-6 col-lg-4 c-footer-bottom right">
            <p>
              <span
                class="c-link mr-4"
                @click="$bus.$emit('goTo', '/terms_of_service')"
                >{{ $utils.t("Terms of Service") }}</span
              >
              <span
                class="c-link"
                @click="$bus.$emit('goTo', '/privacy_policy')"
                >{{ $utils.t("Privacy Policy") }}</span
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
  props: {
    item: {
      type: Object,
      default: null,
    },
  },

  computed: {
    // Data
    theme() {
      return useAppConfig().theme
    },
    version() {
      if (this.theme) {
        return this.theme.version
      }
      return
    },
    versionLabel() {
      return this.$utils.t("Version")
    },
    siteName() {
      if (this.theme) {
        return this.theme.name
      }
      return
    },
    copyright() {
      return this.$utils.t("All rights reserved.")
    },
    currentYear() {
      return this.$utils.getCurrentYear()
    },
    isActive() {
      if (this.item) {
        if (this.item.active) {
          return this.item.active
        }
      }
      return false
    },

    // Links
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

  methods: {
    getTitle(title) {
      return this.$utils.t(title)
    },
    isNavItem(link) {
      if (link) {
        if (this.$route.path === link) {
          return true
        }
      }
      return false
    },
    goToExternal(link) {
      location.href = link
    },
  },
}
</script>
