<template>
  <div v-if="item && isActive" class="c-header">
    <div class="c-header-container">
      <div class="c-header-left">
        <Logo class="desktopOnly"></Logo>

        <Button
          v-if="!menu"
          icon="pi pi-bars"
          @click="openMenu"
          class="menuToggle mr-3 mobileOnly"
          aria-label="Menu Button"
        ></Button>
        <Button
          v-else
          icon="pi pi-times"
          @click="closeMenu"
          class="menuToggle mr-3 mobileOnly"
          aria-label="Menu Button"
        ></Button>
      </div>

      <div class="c-header-center">
        <ul class="c-list-nav desktopOnly">
          <li v-for="link in links" :key="`list_item_${link.key}`">
            <div
              class="c-list-item font3"
              :class="{ active: isNavItem(link.url) }"
              @click="goTo(link.url)"
            >
              {{ $utils.t(link.text) }}
              <span class="c-list-item-span"></span>
            </div>
          </li>
        </ul>

        <Logo class="mobileOnly"></Logo>
      </div>

      <div class="c-header-right">
        <div>
          <SwitcherDarkMode></SwitcherDarkMode>

          <template v-if="isLoggedIn">
            <!-- <Button
              icon="pi pi-heart"
              class="desktopOnly ml-3"
              @click="$bus.$emit('goTo', '/saved')"
              aria-label="Saved Button"
            ></Button> -->

            <Button
              class="iconBtn ml-3"
              icon="pi pi-user"
              @click="$bus.$emit('sidebarGlobal', { id: 'account' })"
              aria-label="Account Button"
            ></Button>
          </template>

          <template v-else>
            <Button
              link
              label="Login"
              class="desktopOnly mr-3"
              @click="$bus.$emit('sidebarGlobal', { id: 'account' })"
            ></Button>
            <Button
              rounded
              label="Book a Class"
              class="primary"
              @click="goTo('/services/book')"
            ></Button>
          </template>
        </div>
      </div>
    </div>
  </div>

  <div class="c-header-menu" :class="{ active: menu, hide: hide }">
    <div class="c-header-menu-content">
      <div class="c-header-container">
        <div class="row">
          <div class="col-xs-12">
            <ul class="c-list">
              <li v-for="link in links" :key="`mobile_list_item_${link.key}`">
                <div
                  class="c-list-item font3"
                  :class="{ active: isNavItem(link.url) }"
                  @click="goTo(link.url)"
                >
                  {{ $utils.t(link.text) }}
                  <span class="c-list-item-span"></span>
                </div>
              </li>
            </ul>

            <div class="c-divider my-3"></div>

            <ul class="c-list">
              <template v-if="isLoggedIn">
                <li @click="menuClick('account')">
                  <div class="c-list-item font3">{{ $utils.t("Account") }}</div>
                </li>
              </template>
              <template v-else>
                <li @click="menuClick('login')">
                  <div class="c-list-item font3">{{ $utils.t("Login") }}</div>
                </li>
                <li @click="menuClick('signUp')">
                  <div class="c-list-item font3">{{ $utils.t("Sign Up") }}</div>
                </li>
              </template>
            </ul>
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
    links() {
      if (this.item) {
        if (this.item.links) {
          return this.item.links
        }
      }
      return
    },
    authEnabled() {
      if (useRuntimeConfig().public.features.auth) {
        return true
      }
      return false
    },
    isLoggedIn() {
      if (useAuthStore()) {
        if (useAuthStore().user) {
          return true
        }
      }
      return false
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
    menuClick(action) {
      this.menu = false

      if (action === "login" || action === "account") {
        this.$bus.$emit("sidebarGlobal", { id: "account" })
      } else if (action === "signUp") {
        this.$bus.$emit("sidebarGlobal", { id: "signUp" })
      }
    },
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
  },
}
</script>
