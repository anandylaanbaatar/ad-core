export default defineNuxtPlugin(async () => {
  const store = useCommerceStore()

  // Collections
  await store.setCollections()

  if (import.meta.client) {
    // Locations
    await store.setLocations()

    // Saved Products
    store.setSavedItems()

    console.log("[Plugins] ::: [Commerce] ::: Initialized!")
  }
})
