<template>
  <template v-if="isDarkMode !== null && isActive">
    <template v-if="type === 'toggle'">
      <div class="flex align-items-center">
        <ToggleSwitch v-model="isDarkMode" @value-change="toggleMode" />
        <h4 class="ml-2 c-link" @click="toggleMode">
          <template v-if="isDarkMode">Dark Mode</template>
          <template v-else>Light Mode</template>
        </h4>
      </div>
    </template>

    <template v-else>
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
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      isDarkMode: false,
    }
  },

  computed: {
    isActive() {
      const theme = useAppConfig().theme

      if (theme.darkLightMode !== null) {
        return false
      }

      return true
    },
    checkDarkMode() {
      return useCoreStore().darkMode
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
    toggleMode(e) {
      this.toggleDarkMode()
      this.isDarkMode = this.checkDarkMode
    },
  },
}
</script>
