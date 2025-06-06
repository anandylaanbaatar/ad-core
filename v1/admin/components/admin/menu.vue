<template>
  <div class="admin-menu">
    <div>
      <div class="top">
        <ul>
          <li
            v-for="item in menuItems"
            :key="`menu_item_${item.id}`"
            class="admin-menu-item"
            :class="{ active: isNavItem(item.link) }"
            @click="$bus.$emit('goTo', item.link)"
          >
            <h4>
              <i v-if="item.icon" :class="item.icon"></i>
              <span>{{ item.title }}</span>
            </h4>
          </li>
        </ul>
      </div>

      <div class="bottom">
        <div
          class="admin-menu-item"
          @click="$bus.$emit('goTo', '/admin/settings')"
          :class="{ active: isNavItem('/admin/settings') }"
        >
          <h4><i class="pi pi-cog"></i> <span>Settings</span></h4>
        </div>

        <div class="admin-menu-item" @click="$bus.$emit('goTo', '/')">
          <h4><i class="pi pi-arrow-left"></i> <span>Go To Website</span></h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menuItems: [
        {
          id: "home",
          title: "Home",
          link: "/admin",
          icon: "pi pi-home",
        },
        {
          id: "users",
          title: "Users",
          link: "/admin/users",
          icon: "pi pi-users",
        },
        {
          id: "orders",
          title: "Orders",
          link: "/admin/orders",
          icon: "pi pi-box",
        },
        {
          id: "collections",
          title: "Collections",
          link: "/admin/collections",
          icon: "pi pi-database",
        },
        {
          id: "products",
          title: "Products",
          link: "/admin/products",
          icon: "pi pi-tags",
        },
        {
          id: "schedule",
          title: "Schedule",
          link: "/admin/schedule",
          icon: "pi pi-calendar",
        },
        {
          id: "media",
          title: "Media",
          link: "/admin/media",
          icon: "pi pi-image",
        },
      ],
    }
  },

  methods: {
    isNavItem(link) {
      if (link) {
        if (link === "/admin") {
          return this.$route.path === link
        }
        if (this.$route.path.includes(link)) {
          return true
        }
      }
      return false
    },
  },
}
</script>
