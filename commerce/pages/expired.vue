<template>
  <AppLayout type="app">
    <div class="c-page fullPage comingSoonPage">
      <div class="fullPageContent">
        <div class="logo">
          <Logo :noLink="true"></Logo>
        </div>

        <div class="text-center text-white w-full">
          <i class="pi pi-shop text-2xl mb-3"></i>
          <h1 class="text-white mb-2">{{ $utils.t("Store Expired") }}</h1>
          <p class="text-white opacity-50">
            {{ $utils.t("This store has been expired.") }}
          </p>

          <div class="c-divider white"></div>

          <a href="https://www.adcommerce.mn" target="_blank">
            <h4 class="mr-3">{{ $utils.t("E-Commerce Platform by") }}</h4>
            <img
              src="https://images.prismic.io/ad-commerce/aFTfLnfc4bHWijyh_ad_commerce_logo.png?auto=format,compress"
              height="20"
              alt="adcommerce.mn"
            />
          </a>
          <a href="https://www.adcommerce.mn" target="_blank" class="mt-3">
            <p class="opacity-50">www.adcommerce.mn</p>
          </a>
          <div class="mt-3 flex align-items-center justify-content-center">
            <div>
              <a
                href="https://www.facebook.com/people/AD-Commerce/61578386691605/"
                target="_blank"
                class="mr-3"
              >
                <i class="pi pi-facebook text-lg"></i>
              </a>
              <a href="https://www.instagram.com/adcommerce.mn" target="_blank">
                <i class="pi pi-instagram text-lg"></i>
              </a>
            </div>
          </div>
        </div>

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
      title: `Store Expired | ${this.theme.name}`,
    })
  },
  mounted() {
    setTimeout(() => {
      useCoreStore().set("layout", "app")
    }, 500)
  },
}
</script>
