import algoliasearch from "algoliasearch"

export default defineNuxtPlugin(() => {
  const APP_ID_ = useState("appId", () => process.env.NUXT_ALGOLIA_APP_ID)
  const APP_KEY_ = useState("appKey", () => process.env.NUXT_ALGOLIA_APP_KEY)

  if (import.meta.client) {
    if (!useRuntimeConfig().public.integrations.algolia) {
      // console.log("[Plugins] ::: [Algolia] ::: Not Initialized!")
      return
    }
    if (!useRuntimeConfig().public.features.algolia) {
      console.log("[Plugins] ::: [Algolia] ::: Missing Index ID")
    }
    if (!APP_ID_.value) {
      console.log("[Plugins] ::: [Algolia] ::: Missing APP ID!")
      return
    }
    if (!APP_KEY_.value) {
      console.log("[Plugins] ::: [Algolia] ::: Missing APP KEY!")
      return
    }

    console.log("[Plugins] ::: [Algolia] ::: Initialized!")
  } else {
    return
  }

  const APP_ID = APP_ID_.value
  const APP_KEY = APP_KEY_.value
  const client = algoliasearch(APP_ID, APP_KEY)
  const channelIndex = client.initIndex(
    useRuntimeConfig().public.features.algolia
  )

  /**
   * Channels
   */

  // Filters and Categories
  const channelFilters = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const countries = await channelIndex.searchForFacetValues(
          "country",
          "",
          {
            page: 0,
          }
        )
        const categories = await channelIndex.searchForFacetValues(
          "categories",
          "",
          {
            page: 0,
          }
        )
        const providers = await channelIndex.searchForFacetValues(
          "provider",
          "",
          {
            page: 0,
          }
        )

        resolve({
          countries: countries.facetHits,
          categories: categories.facetHits,
          providers: providers.facetHits,
        })
      } catch (err) {
        reject(err)
      }
    })
  }
  // Search Channels
  const searchChannels = async (filters) => {
    let limit = 30
    let page = filters.page
    let query = ""

    let searchOptions = {
      page: page,
      hitsPerPage: limit,
      facetFilters: [],
      // numericFilters: ['streamsCount>0']
    }

    if (filters) {
      if (filters.limit) {
        searchOptions.hitsPerPage = filters.limit
      }
      if (filters.query) {
        query = filters.query
      }
      if (filters.country) {
        searchOptions.facetFilters.push(`country:${filters.country}`)
      }
      if (filters.category) {
        searchOptions.facetFilters.push(`categories:${filters.category}`)
      }
      if (filters.ids) {
        let filterIDs = ``

        for (let i = 0; i < filters.ids.length; i++) {
          if (filterIDs !== "") filterIDs += " OR "
          filterIDs += `id:${filters.ids[i]}`
        }

        searchOptions.filters = filterIDs
      }
    }

    return new Promise((resolve, reject) => {
      channelIndex
        .search(query, searchOptions)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
  // Indexing
  const saveObject = async (record) => {
    await channelIndex.saveObject(record).wait()

    console.log(`Algolia ::: Save Record :: `, record.objectID)
  }
  const bulkSaveObjects = async (records) => {
    const newClient = algoliasearch(APP_ID, APP_KEY)

    let batchObjects = []

    for (let i = 0; i < records.length; i++) {
      let channel = records[i]
      channel.objectID = channel.id

      batchObjects.push({
        action: "updateObject",
        indexName: "channels",
        body: channel,
      })
    }

    await newClient.multipleBatch(batchObjects)

    console.log("Algolia ::: Batch Save Records :: ", records.length)
  }
  const bulkDeleteObjects = async (records) => {
    const newClient = algoliasearch(APP_ID, APP_KEY)

    let batchObjects = []

    for (let i = 0; i < records.length; i++) {
      let channel = records[i]

      batchObjects.push({
        action: "deleteObject",
        indexName: "channels",
        body: {
          objectID: channel.id,
        },
      })
    }

    await newClient.multipleBatch(batchObjects)

    console.log("Algolia ::: Batch Delete Records :: ", records.length)
  }

  return {
    provide: {
      algolia: {
        // Channels
        channelFilters,
        searchChannels,

        // Indexing
        saveObject,
        bulkSaveObjects,
        bulkDeleteObjects,
      },
    },
  }
})
