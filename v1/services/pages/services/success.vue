<template>
  <div class="c-page customPage">
    <Loader v-if="loading"></Loader>

    <div v-else>
      <div class="container py-4">
        <div class="d-block">
          <div class="text-center py-4">
            <i class="pi pi-check text-xl mb-3"></i>
            <h1 class="c-title">Payment Success</h1>
            <p>We have received your payment. Your subscription has started.</p>
            <Button
              class="mt-4"
              @click="$bus.$emit('sidebarGlobal', { id: 'account' })"
            >
              My Subscriptions
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
    }
  },
}
</script>
