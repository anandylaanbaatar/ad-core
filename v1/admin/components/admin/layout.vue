<template>
  <AppLayout type="app">
    <div class="admin-layout">
      <div class="wrapper">
        <AdminHeader></AdminHeader>

        <div class="admin-page" :class="{ collapsed: menuCollapsed || closed }">
          <AdminMenu></AdminMenu>

          <div class="admin-content" :class="{ 'p-0': padding === 'none' }">
            <slot></slot>
          </div>
        </div>

        <AdminSidebar ref="adminSidebar"></AdminSidebar>
      </div>
    </div>
  </AppLayout>
</template>

<script>
export default {
  props: {
    padding: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      closed: false,
      menuCollapsed: false,
      resizeInit: false,
    }
  },

  mounted() {
    if (window) {
      this.setLayout()

      if (this.resizeInit) return
      window.onresize = (e) => {
        this.resizeInit = true
        this.setLayout()
      }
    }
  },

  methods: {
    setLayout() {
      if (window.innerWidth < 768) {
        this.menuCollapsed = true
      } else {
        this.menuCollapsed = false
      }
    },
  },
}
</script>
