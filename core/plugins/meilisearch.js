import { MeiliSearch } from "meilisearch"

export default defineNuxtPlugin(() => {
  const KEY = useState("appKey", () => process.env.NUXT_MEILISEARCH_API_KEY)

  if (import.meta.client) {
    if (!useRuntimeConfig().public.integrations.meilisearch) {
      // console.log("[Plugins] ::: [Meilisearch] ::: Not Initialized!")
      return
    }
    if (!useRuntimeConfig().public.features.meilisearch) {
      console.log("[Plugins] ::: [Meilisearch] ::: Missing Config!")
      return
    }
    if (!KEY.value) {
      console.log("[Plugins] ::: [Meilisearch] ::: Missing API KEY!")
      return
    }

    // if (useRuntimeConfig().public.features.log) {
    console.log("[Plugins] ::: [Meilisearch] ::: Initialized!")
    // }
  } else {
    return
  }

  const API_KEY = KEY.value
  const API_HOST = useRuntimeConfig().public.features.meilisearch.host
  const API_INDEX = useRuntimeConfig().public.features.meilisearch.index
  const client = new MeiliSearch({
    host: API_HOST,
    apiKey: API_KEY,
  })

  // Predefine Index if Not Exists
  const createIndexIfNotExists = async (
    client,
    indexName,
    primaryKey = null
  ) => {
    try {
      await client.getIndex(indexName)
    } catch (e) {
      await client.createIndex(
        indexName,
        primaryKey ? { primaryKey } : undefined
      )
    }
  }
  // createIndexIfNotExists(client, API_INDEX)

  // Search
  const search = () => {}

  return {
    provide: {
      meilisearch: {
        client,
        search,
      },
    },
  }
})
