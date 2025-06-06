<template>
  <AppLayout type="app">
    <div class="c-page fullPage maintenancePage">
      <div class="fullPageContent">
        <!--Logo-->
        <div class="logo">
          <Logo></Logo>
        </div>

        <!--Content-->
        <div class="text-center text-white">
          <i class="pi pi-wrench text-2xl mb-4"></i>
          <h1 class="mb-2">{{ $utils.t("Maintenance") }}</h1>
          <p class="mb-3">
            {{ $utils.t("Be part of something truly extraordinary.") }}
          </p>
        </div>

        <!--Socials-->
        <div class="socials">
          <a
            v-if="theme.contact.instagram"
            :href="theme.contact.instagram"
            target="_blank"
          >
            <i class="pi pi-instagram"></i>
          </a>

          <a
            v-if="theme.contact.facebook"
            :href="theme.contact.facebook"
            target="_blank"
          >
            <i class="pi pi-facebook"></i>
          </a>

          <a
            v-if="theme.contact.linkedin"
            :href="theme.contact.linkedin"
            target="_blank"
          >
            <i class="pi pi-linkedin"></i>
          </a>
        </div>
      </div>
      <div class="backPattern"></div>
    </div>
  </AppLayout>
</template>

<script>
export default {
  data() {
    return {}
  },

  computed: {
    theme() {
      return useAppConfig().theme
    },
  },

  beforeMount() {
    useSeoMeta({
      title: `Maintenance | ${this.theme.name}`,
    })
  },
}
</script>
