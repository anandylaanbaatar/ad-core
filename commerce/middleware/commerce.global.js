export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log("[Middleware] ::: [Commerce] ::: Initialized!")

  const nuxtApp = useNuxtApp()
  const appConfig = useAppConfig().theme
  let siteUrl = appConfig.siteUrl
  let siteName = appConfig.name
  let siteDesc = appConfig.description

  // Site Settings
  if (useRuntimeConfig().public.features.prismic) {
    const { client } = usePrismic()
    const siteSettings = await client.getSingle("website_settings")

    if (siteSettings && siteSettings.data) {
      const siteConfig = siteSettings.data

      if (siteConfig.name) {
        siteName = siteConfig.name
      }
      if (siteConfig.description) {
        siteDesc = siteConfig.description
      }
    }
  }

  let meta = {
    url: siteUrl,
    title: `${siteName} | ${siteDesc}`,
    description: siteDesc,
    image: `/images/icons/apple-touch-icon.png`,
    keywords: appConfig.keywords,
    site: "@website",
  }

  // Set Collections
  const commerceStore = useCommerceStore()
  const collections = commerceStore.collections

  /**
   * Regular Pages
   */

  const pages = {
    saved: "Saved",
    search: "Search",
    contact: "Contact",
  }
  if (pages[to.name]) {
    meta.url = `${siteUrl}${to.path}`
    meta.title = `${pages[to.name]} | ${siteName}`
  }

  /**
   * Dynamic Pages
   */

  if (to.name === `products-category-id_handle`) {
    if (to.params && to.params.id) {
      const res = await nuxtApp.$shopify.product({
        productId: to.params.id,
      })

      if (res) {
        meta.url = `${siteUrl}${to.path}`
        meta.title = `${res.title} | ${siteName}`
        meta.description = res.description
        meta.image = res.image

        if (to.query && to.query.variant) {
          meta.image = res.variants.find(
            (i) => i.id === to.query.variant
          ).image.url
        }
      }
    }
  } else if (to.name === `products-category`) {
    if (to.params && to.params.category) {
      meta.url = `${siteUrl}${to.path}`
      let isCollectionSet = false

      // Get Collection Title from Store
      if (to.params.category !== "all") {
        isCollectionSet = collections !== null ? true : false

        if (isCollectionSet) {
          const collection = collections.find(
            (i) => i.handle === to.params.category
          )
          if (collection) {
            meta.title = `${collection.title} | Collections | ${siteName}`

            if (collection.image && collection.image.url) {
              meta.image = collection.image.url
            }
          }
        }
      }

      // Set Collection Title as All
      if (!isCollectionSet) {
        meta.title = `All | Collections | ${siteName}`
      }
    }
  }

  useServerSeoMeta({
    robots: "index, follow",
  })
  useHead({
    title: meta.title,
    meta: [
      {
        name: "description",
        content: meta.description,
      },
      {
        rel: "canonical",
        href: meta.url,
      },
      {
        rel: "amphtml",
        href: meta.url,
      },
      {
        name: "keywords",
        content: meta.keywords,
      },
      {
        itemprop: "name",
        content: meta.title,
      },
      {
        itemprop: "description",
        content: meta.description,
      },
      {
        itemprop: "image",
        content: meta.image,
      },
      // twitter card
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      { name: "twitter:site", content: meta.site },
      {
        name: "twitter:title",
        content: meta.title,
      },
      {
        name: "twitter:description",
        content: meta.description,
      },
      {
        name: "twitter:image",
        content: meta.image,
      },
      {
        name: "twitter:image:alt",
        content: meta.title,
      },
      {
        name: "twitter:url",
        content: meta.url,
      },
      // Open Graph
      { property: "og:site_name", content: meta.site },
      { property: "og:type", content: "website" },
      {
        property: "og:title",
        content: meta.title,
      },
      {
        property: "og:description",
        content: meta.description,
      },
      {
        property: "og:image",
        content: meta.image,
      },
      {
        property: "og:url",
        content: meta.url,
      },
      {
        property: "og:image:secure_url",
        content: meta.image,
      },
      {
        property: "og:image:alt",
        content: meta.title,
      },
    ],
    link: [
      {
        rel: "canonical",
        href: meta.url,
      },
    ],
  })

  // Inject Scripts to Head
  if (import.meta.server) {
    // StorePay
    if (process.env.NUXT_STOREPAY_TOKEN) {
      useHead({
        script: [
          {
            src: "https://cdn.jsdelivr.net/gh/davidshimjs/qrcodejs/qrcode.min.js",
          },
        ],
      })
    }
  }

  // Minor Cleanups & Init Cart
  if (import.meta.client) {
    if (localStorage) {
      if (localStorage.getItem("accessToken")) {
        localStorage.removeItem("accessToken")
      }
    }

    // Set Default Cart Items
    if (!commerceStore.initCart) {
      commerceStore.set("initCart", true)
      await useGetCartItems()
    }
  }
})
