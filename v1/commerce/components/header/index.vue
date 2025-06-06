<template>
  <div class="c-header">
    <div class="c-header-container">
      <div class="c-header-left">
        <div>
          <Button
            v-if="!menu"
            icon="pi pi-bars"
            @click="openMenu"
            class="menuToggle mr-3"
            aria-label="Menu Button"
          ></Button>
          <Button
            v-else
            icon="pi pi-times"
            @click="closeMenu"
            class="menuToggle mr-3"
            aria-label="Menu Button"
          ></Button>

          <Button
            icon="pi pi-search"
            @click="$bus.$emit('sidebarGlobal', { id: 'search' })"
            aria-label="Search Button"
          ></Button>
        </div>
      </div>

      <div class="c-header-center">
        <Logo></Logo>
      </div>

      <div class="c-header-right">
        <div>
          <SwitcherDarkMode></SwitcherDarkMode>

          <Button
            icon="pi pi-heart"
            class="desktopOnly ml-3"
            @click="$bus.$emit('goTo', '/saved')"
            aria-label="Saved Button"
          ></Button>

          <Button
            :badge="cartBadge"
            :label="cartButtonLabel"
            icon="pi pi-shopping-cart"
            class="ml-3 hideLabelOnMobile"
            severity="secondary"
            @click="$bus.$emit('sidebarGlobal', { id: 'cart' })"
            aria-label="Cart Button"
          ></Button>

          <Button
            class="iconBtn ml-3"
            icon="pi pi-user"
            @click="$bus.$emit('sidebarGlobal', { id: 'account' })"
            aria-label="Account Button"
          ></Button>
        </div>
      </div>
    </div>
  </div>

  <div class="c-header-menu" :class="{ active: menu, hide: hide }">
    <div class="c-header-menu-content">
      <div class="c-header-container">
        <div class="row">
          <!--Collections Block-->
          <template v-if="filteredCollections && filteredCollections.first">
            <div
              v-for="collection in filteredCollections.first"
              :key="`collection_${collection.id}`"
              class="col-xs-6 col-md-4 col-lg-2"
            >
              <div
                class="c-header-menu-item c-image"
                :style="setStyle(collection)"
                @click="goTo(`/products/${collection.handle}/`)"
              >
                <div class="dimmer p-4 text-center">
                  <h2>{{ getTitle(collection.title) }}</h2>
                </div>
              </div>
            </div>
          </template>

          <!--Browse All-->
          <div class="col-xs-12 col-md-4 col-lg-2">
            <div
              class="c-header-menu-item c-image allBtn"
              :style="`background-image:url(https://images.prismic.io/tumen-v2/Z_LLmndAxsiBwXWA_coloured-blurred-background_1112-513.jpg?auto=format,compress);`"
              @click="goTo('/products/all/')"
            >
              <div class="dimmer p-4 text-center">
                <h2>{{ $utils.t("Browse All") }}</h2>
              </div>
            </div>
          </div>

          <!--Link Block-->
          <div
            v-if="filteredCollections && filteredCollections.last"
            class="col-xs-6 col-md-4 col-lg-2"
          >
            <div class="c-header-menu-item half links">
              <p class="mb-2">{{ $utils.t("Collections") }}</p>
              <h3
                v-for="collection in filteredCollections.last"
                :key="`menu_collection_${collection.id}`"
                @click="goTo(`/products/${collection.handle}/`)"
                class="c-link mb-1"
              >
                {{ getTitle(collection.title) }}
              </h3>
              <h3 @click="goTo(`/products/all`)" class="c-link mb-1">
                {{ $utils.t("Browse All") }}
              </h3>
            </div>

            <!--Featured
            <div
              class="c-header-menu-item half c-image"
              :style="
                $utils.setBackImage(
                  'https://cdn.shopify.com/s/files/1/0899/8138/7066/files/v9---White.jpg?v=1729344749'
                )
              "
              @click="
                goTo(
                  '/products/t-shirts/9710804107578_ad-graph-tennis-v9?variant=50065566073146'
                )
              "
            >
              <div class="dimmer p-4 text-center">
                <h2>Featured</h2>
              </div>
            </div>
            -->
          </div>
        </div>
      </div>
    </div>
    <div
      class="c-header-menu-dimmer"
      :style="`height:${height}px;`"
      @click="closeMenu"
    ></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menu: false,
      hide: false,
      height: null,
      collections: null,
    }
  },

  computed: {
    theme() {
      return useAppConfig().theme
    },
    cartBadge() {
      const store = useCommerceStore()
      let amount = "0"

      if (store.cartBadge && store.cartBadge !== "0") {
        amount = store.cartBadge
      }

      return amount
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
    filteredCollections() {
      if (this.allCollections) {
        return {
          first: this.allCollections.slice(0, 4),
          last: this.allCollections.slice(4, this.allCollections.length),
        }
      }
    },
    cartButtonLabel() {
      return this.$utils.t("Cart")
    },
  },

  mounted() {
    this.collections = this.allCollections

    if (window) {
      this.height = window.innerHeight
    }
  },

  methods: {
    openMenu() {
      this.menu = true
      this.hide = false
    },
    closeMenu() {
      this.hide = true

      setTimeout(() => {
        this.menu = false
        this.hide = false
      }, 400)
    },
    goTo(link) {
      this.menu = false
      this.$bus.$emit("goTo", link)
    },
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

      return ""
    },
    getTitle(title) {
      return this.$utils.t(title)
    },
  },
}
</script>
