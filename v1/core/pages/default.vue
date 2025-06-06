<template>
  <AppLayout type="app">
    <div class="c-page fullPage">
      <div class="container">
        <div class="text-center">
          <h1 class="mb-6">{{ $utils.t("Welcome to AD Websites") }}</h1>
          <div
            class="c-block c-image size-md"
            :style="$utils.setBackImage('/images/logos/splash.gif')"
          ></div>
          <p class="mt-4">
            This is the default website page. Just create a new index page or
            create a home page with your cms.
          </p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
export default {
  data() {
    return {}
  },
}
</script>
