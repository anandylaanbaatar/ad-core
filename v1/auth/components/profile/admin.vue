<template>
  <div
    v-if="isActive"
    @click="$bus.$emit('goTo', '/admin')"
    class="d-block flex align-items-center c-link mb-2"
  >
    <h3>{{ $utils.t("Admin") }}</h3>
    <Button
      icon="pi pi-arrow-right"
      severity="secondary"
      class="sm ml-auto"
      @click="$bus.$emit('goTo', '/admin')"
      v-tooltip.left="$utils.t('Admin Panel')"
    ></Button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      active: true,
    }
  },

  computed: {
    isActive() {
      if (this.$route.path.includes("/admin")) {
        return false
      }
      return true
    },
  },
}
</script>
