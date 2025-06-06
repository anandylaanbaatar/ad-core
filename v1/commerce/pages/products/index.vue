<template>
  <AppLayout type="regular">
    <div class="c-page shop">
      <Loader v-if="loading"></Loader>
    </div>
  </AppLayout>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
    }
  },

  created() {
    this.$bus.$emit("goTo", "/products/all")
  },
}
</script>
