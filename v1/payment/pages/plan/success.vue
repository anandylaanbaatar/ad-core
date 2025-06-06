<template>
  <AppLayout type="regular">
    <div class="c-page plan">
      <div class="container py-4">
        <div class="d-block">
          <div class="text-center py-4">
            <i class="pi pi-check text-xl mb-3"></i>
            <h1 class="c-title">Payment Success</h1>
            <p>We have received your payment. Your subscription has started.</p>

            <Button
              label="Watch Tv"
              class="mt-4"
              @click="$bus.$emit('goTo', '/secure/tv5')"
            ></Button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
export default {}
</script>
