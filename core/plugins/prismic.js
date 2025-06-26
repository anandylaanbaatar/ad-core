import * as prismic from "@prismicio/client"

export default defineNuxtPlugin(async (nuxtApp) => {
  if (import.meta.client) {
    if (!useRuntimeConfig().public.features.prismic) {
      console.log("[Plugins] ::: [Prismic] ::: Missing Repo Id!")
      return
    }

    if (useRuntimeConfig().public.features.log) {
      console.log("[Plugins] ::: [Prismic] ::: Initialized!")
    }
  } else {
    return
  }

  const repoId = useRuntimeConfig().public.features.prismic
  const prismicClient = prismic.createClient(repoId)

  return {
    provide: {
      prismicClient: prismicClient,
    },
  }
})
