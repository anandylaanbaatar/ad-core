<template>
  <template v-if="isDarkMode !== null">
    <Button
      v-if="!isDarkMode"
      v-tooltip.left="$utils.t('Dark Mode')"
      icon="pi pi-moon"
      @click="toggleDarkMode"
      class="desktopOnly"
    ></Button>
    <Button
      v-else
      v-tooltip.left="$utils.t('Light Mode')"
      icon="pi pi-sun"
      @click="toggleDarkMode"
      class="desktopOnly"
    ></Button>
  </template>
</template>

<script>
export default {
  data() {
    return {
      isDarkMode: false,
    }
  },

  computed: {
    checkDarkMode() {
      const store = useCoreStore()
      return store.darkMode
    },
  },

  mounted() {
    this.isDarkMode = this.checkDarkMode
  },

  methods: {
    toggleDarkMode() {
      const store = useCoreStore()

      if (store.darkMode) {
        store.setDarkMode(false)
      } else {
        store.setDarkMode(true)
      }
    },
  },
}
</script>
