<template>
  <div v-if="item && isActive" class="c-header">
    <div class="c-header-container">
      <div class="c-header-left">
        <div>
          <Button
            v-if="!menu"
            icon="pi pi-equals"
            @click="openMenu"
            class="menuToggle mr-1 md:mr-3"
            aria-label="Menu Button"
          ></Button>
          <Button
            v-else
            icon="pi pi-times"
            @click="closeMenu"
            class="menuToggle mr-1 md:mr-3"
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
          <SwitcherDarkMode classes="desktopOnly"></SwitcherDarkMode>

          <Button
            icon="pi pi-heart"
            class="desktopOnly ml-1 md:ml-3"
            @click="$bus.$emit('goTo', '/saved')"
            aria-label="Saved Button"
          ></Button>

          <Button
            :badge="cartBadge"
            :label="cartButtonLabel"
            icon="pi pi-shopping-cart"
            class="ml-0 md:ml-3 hideLabelOnMobile"
            severity="secondary"
            @click="$bus.$emit('sidebarGlobal', { id: 'cart' })"
            aria-label="Cart Button"
          ></Button>

          <Button
            class="iconBtn ml-1 md:ml-3"
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
          <template
            v-if="filteredHeaderCollections && filteredHeaderCollections.first"
          >
            <div
              v-for="collection in filteredHeaderCollections.first"
              :key="`collection_${collection.id}`"
              class="col-xs-6 col-md-4 col-lg-2"
            >
              <div
                class="c-header-menu-item c-image"
                :class="{ hasImage: collection.image && collection.image.url }"
                :style="setStyle(collection)"
                @click="goTo(`/products/${collection.handle}/`)"
              >
                <div class="dimmer p-4 text-center">
                  <h3>{{ getTitle(collection.title) }}</h3>
                  <!-- <p>{{ collection.handle }}</p> -->
                </div>
              </div>
            </div>
          </template>

          <!--Browse All-->
          <div class="col-xs-12 col-md-4 col-lg-2">
            <div
              class="c-header-menu-item c-image allBtn"
              @click="goTo('/products/all/')"
            >
              <div class="dimmer p-4 text-center">
                <h4>{{ $utils.t("Browse All") }}</h4>
              </div>
            </div>
          </div>

          <!--Link Block-->
          <div
            v-if="filteredHeaderCollections && filteredHeaderCollections.last"
            class="col-xs-6 col-md-4 col-lg-2"
          >
            <div class="c-header-menu-item half links">
              <p class="mb-2">{{ $utils.t("Collections") }}</p>
              <h3
                v-for="collection in filteredHeaderCollections.last"
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

          <!--Mobile Only Items-->
          <div class="col-xs-12 mobileOnly block">
            <div class="c-divider my-2"></div>
            <div class="c-header-menu-item links">
              <h3 class="c-link mb-1" @click="goTo('/saved')">
                {{ $utils.t("Saved") }}
              </h3>

              <template v-if="user">
                <h3
                  class="c-link mb-1"
                  @click="$bus.$emit('sidebarGlobal', { id: 'account' })"
                >
                  {{ $utils.t("Profile") }}
                </h3>
              </template>
              <template v-else>
                <div class="row">
                  <div class="col-xs-6">
                    <Button
                      class="w-full"
                      severity="secondary"
                      @click="$bus.$emit('sidebarGlobal', { id: 'account' })"
                      >{{ $utils.t("Login") }}</Button
                    >
                  </div>
                  <div class="col-xs-6">
                    <Button
                      class="w-full"
                      severity="primary"
                      @click="$bus.$emit('sidebarGlobal', { id: 'signUp' })"
                      >{{ $utils.t("Sign Up") }}</Button
                    >
                  </div>
                </div>
              </template>
            </div>
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
  props: {
    item: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      menu: false,
      hide: false,
      height: null,
    }
  },

  computed: {
    theme() {
      return useAppConfig().theme
    },
    cartBadge() {
      return useCommerceStore().cartTotalItems
    },
    isAdvanced() {
      return useCommerceStore().advancedCollections
    },
    headerCollections() {
      if (useCommerceStore().collections) {
        return useCommerceStore().collections
      }
      return
    },
    filteredHeaderCollections() {
      if (this.headerCollections) {
        let filteredCol = this.headerCollections
        let col1 = []
        let col2 = []

        if (this.isAdvanced) {
          filteredCol = filteredCol.filter((i) => i.level.id === "level-1")
        }

        if (filteredCol.length > 4) {
          for (let i = 0; i < filteredCol.length; i++) {
            if (i < 4) {
              col1.push(filteredCol[i])
            } else {
              col2.push(filteredCol[i])
            }
          }
          if (col2.length > 9) {
            col2 = col2.splice(0, 9)
          }
        } else {
          col1 = filteredCol
          col2 = filteredCol
        }

        return {
          first: col1,
          last: col2,
        }
      }
      return
    },

    allCollections() {
      let headerTopCollections = useCommerceStore().collections

      console.log("Header Collections ::: ", headerTopCollections)

      if (headerTopCollections) {
        if (this.isAdvanced) {
          headerTopCollections = headerTopCollections.filter(
            (i) => i.level.id === "level-1"
          )
          if (headerTopCollections.length > 10) {
            return (headerTopCollections = headerTopCollections.splice(0, 10))
          }
        }

        return headerTopCollections
      }

      return []
    },
    filteredCollections() {
      if (this.allCollections) {
        const headerTopCollections = this.allCollections

        console.log("Top Collections ::: ", headerTopCollections)

        return {
          first: headerTopCollections,
          last: headerTopCollections,
        }

        // return {
        //   first: headerTopCollections.slice(0, 4),
        //   last: headerTopCollections.slice(4, headerTopCollections.length),
        // }
      }
      return
    },
    cartButtonLabel() {
      return this.$utils.t("Cart")
    },

    isActive() {
      if (this.item) {
        if (this.item.active) {
          return this.item.active
        }
      }
      return false
    },
    user() {
      if (useAuthStore().user) {
        return useAuthStore().user
      }
      return
    },
  },

  mounted() {
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
