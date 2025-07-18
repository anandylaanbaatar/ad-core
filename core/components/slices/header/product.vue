<template>
  <div v-if="item && isActive" class="c-header-product">
    <Logo></Logo>

    <!--Desktop Menu-->
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
    <div v-if="item.cta_button" class="ctaBtns desktopOnly">
      <template v-for="btn in item.cta_button">
        <Button
          v-if="
            (!isLoggedIn && btn.variant === 'Login') ||
            (!isLoggedIn && btn.variant === 'SignUp')
          "
          :key="`header_cta_${btn.key}`"
          class="ctaButton"
          :severity="ctaBtnSeverity(btn)"
          @click="ctaBtnClick(btn)"
          >{{ $utils.t(btn.text) }}</Button
        >
      </template>

      <Button
        v-if="isLoggedIn"
        class="desktopOnly"
        severity="secondary"
        icon="pi pi-user"
        rounded
        @click="
          $bus.$emit('sidebarGlobal', {
            id: 'account',
          })
        "
      ></Button>
    </div>
  </div>

  <!--Mobile Menu-->
  <div v-if="item && isActive" class="c-header-product-menu mobileOnly">
    <div class="menuBtn">
      <Button
        v-if="showMenu === false"
        rounded
        icon="pi pi-bars"
        @click="showMobileMenu"
      ></Button>
      <Button
        v-else
        rounded
        icon="pi pi-times"
        @click="hideMobileMenu"
      ></Button>
    </div>
    <div
      class="menuArea"
      :class="{ active: showMenu, hide: showMenu === 'hide' }"
    >
      <ul class="c-list">
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

      <div v-if="item.cta_button" class="ctaBtns">
        <template v-for="btn in item.cta_button">
          <Button
            v-if="
              (!isLoggedIn && btn.variant === 'Login') ||
              (!isLoggedIn && btn.variant === 'SignUp')
            "
            :key="`header_cta_${btn.key}`"
            class="ctaButton w-full mb-3"
            :severity="ctaBtnSeverity(btn)"
            @click="ctaBtnClick(btn)"
            >{{ $utils.t(btn.text) }}</Button
          >
        </template>

        <Button
          v-if="isLoggedIn"
          class="desktopOnly"
          severity="secondary"
          icon="pi pi-user"
          rounded
          @click="
            $bus.$emit('sidebarGlobal', {
              id: 'account',
            })
          "
        ></Button>
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

  data() {
    return {
      showMenu: false,
    }
  },

  computed: {
    theme() {
      return useAppConfig().theme
    },
    siteName() {
      if (this.theme) {
        return this.theme.name
      }
      return
    },
    isActive() {
      if (this.item) {
        if (this.item.active) {
          return this.item.active
        }
      }
      return false
    },
    links() {
      if (this.item) {
        if (this.item.links) {
          return this.item.links
        }
      }
      return
    },
    isLoggedIn() {
      if (useAuthStore()) {
        return useAuthStore().user
      }
      return false
    },
  },

  methods: {
    goTo(link) {
      if (!link) return

      this.hideMobileMenu(true)

      if (link.includes("#")) {
        location.href = link
      } else {
        this.$bus.$emit("goTo", link)
      }
    },
    isNavItem(link) {
      if (link) {
        if (this.$route.path === link) {
          return true
        }
      }
      return false
    },
    ctaBtnClick(link) {
      if (!link) return

      if (link.variant === "Login") {
        this.$bus.$emit("sidebarGlobal", {
          id: "account",
        })
      } else if (link.variant === "SignUp") {
        this.$bus.$emit("sidebarGlobal", {
          id: "signUp",
        })
      } else if (link.url) {
        this.goTo(link.url)
      }
    },
    ctaBtnSeverity(btn) {
      if (btn.variant === "Login") {
        return "secondary"
      } else if (btn.variant === "SignUp") {
        return "primary"
      } else {
        return btn.variant
      }
    },

    showMobileMenu() {
      this.showMenu = true
    },
    hideMobileMenu(force) {
      this.showMenu = "hide"

      setTimeout(() => {
        this.showMenu = false
      }, 400)
    },
  },
}
</script>
