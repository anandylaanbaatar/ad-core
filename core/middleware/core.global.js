export default defineNuxtRouteMiddleware(async (to, from) => {
  const appConfig = useAppConfig().theme
  let siteUrl = appConfig.siteUrl
  let siteName = appConfig.name
  let siteDesc = appConfig.description

  let meta = {
    url: siteUrl,
    title: `${siteName} | ${siteDesc}`,
    description: siteDesc,
    image: `/images/icons/apple-touch-icon.png`,
    keywords: appConfig.keywords,
    site: "@website",
  }

  if (appConfig.type !== "commerce") {
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
  }

  // Client Only
  if (import.meta.client) {
    const coreStore = useCoreStore()

    // Rules
    if (appConfig.rules) {
      // Redirect
      if (appConfig.rules.redirect) {
        if (appConfig.rules.redirect !== to.path) {
          return navigateTo({
            path: appConfig.rules.redirect,
          })
        }
      }

      // Maintenance
      if (appConfig.rules.maintenance) {
        const maintenancePath = "/full/maintenance"

        if (to.path !== maintenancePath) {
          return navigateTo({
            path: maintenancePath,
          })
        }
      }
    }

    // Main Splash Loading
    if (coreStore.loading) {
      setTimeout(() => {
        coreStore.set("loading", false)
      }, 500)
    }
  }
})
