<template>
  <div v-if="item && isActive" class="c-footer studio">
    <div class="container py-4">
      <div class="c-footer-container">
        <!--Top-->
        <div class="row">
          <div class="col-xs-12 col-md-6 col-lg-4 mb-4 md:mb-0">
            <Logo v-if="item.logo"></Logo>

            <template v-if="item.show_version">
              <Tag class="cursor-pointer my-3" rounded severity="primary">
                <div class="flex items-center gap-2 px-1">
                  {{ version }}
                </div>
              </Tag>
              <br />
            </template>

            <template v-if="item.show_language_currency">
              <p class="mb-1 mt-3">
                {{ $utils.t("Language") }} & {{ $utils.t("Currency") }}
              </p>
              <SwitcherLanguage class="mb-1"></SwitcherLanguage>
              <SwitcherCurrency></SwitcherCurrency>
            </template>
          </div>

          <div class="col-xs-12 col-md-6 col-lg-8">
            <div class="row">
              <!--Links-->
              <div class="col-xs-12 col-md-6 col-lg-6 mb-4 md:mb-0">
                <p v-if="item.links_title" class="label mb-2">
                  {{ $utils.t(item.links_title) }}
                </p>

                <ul class="c-list contactList">
                  <li
                    v-for="link in item.links"
                    :key="`footer_link_${link.link.key}`"
                    class="c-link"
                  >
                    <p v-if="link.label" class="label mb-2">{{ link.label }}</p>
                    <a
                      v-if="link.link && link.link.url"
                      :href="`${link.link.url}`"
                      class="link"
                      >{{ link.link.text }}</a
                    >
                  </li>
                </ul>
              </div>

              <!--Pages-->
              <div class="col-xs-12 col-md-6 col-lg-2 mb-4 md:mb-0">
                <p v-if="item.pages_title" class="label mb-2">
                  {{ item.pages_title }}
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
              <div class="col-xs-12 col-md-6 col-lg-2">
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
        </div>

        <!--Bottom-->
        <div class="c-footer-bottom center row">
          <div class="col-xs-12 top">
            <ul class="c-list-nav">
              <li v-for="item in listItems" :key="`list_item_${item.id}`">
                <div
                  class="c-list-item font3"
                  :class="{ active: isNavItem(item.link) }"
                  @click="$bus.$emit('goTo', item.link)"
                >
                  {{ item.title }}
                  <span class="c-list-item-span"></span>
                </div>
              </li>
            </ul>
          </div>

          <div class="col-xs-12 col-md-6 col-lg-4 left">
            <p>© {{ currentYear }} {{ copyright }} - {{ siteName }}</p>
          </div>
          <div class="col-xs-12 col-md-6 col-lg-4 center">
            <p
              @click="goToExternal('https://www.adcreative.studio')"
              class="c-link text-black font3"
            >
              Website by AD Creative Studio
            </p>
          </div>
          <div class="col-xs-12 col-md-6 col-lg-4 right">
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

    // Links
    listItems() {
      return useSiteStore().links
    },
    footerListItems() {
      return useSiteStore().footerLinks
    },
    isActive() {
      if (this.item) {
        if (this.item.active) {
          return this.item.active
        }
      }
      return false
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
