export default defineNuxtRouteMiddleware(async (to, from) => {
  // Client Only
  if (!import.meta.client) return

  // Set Products
  if (integrations().firebase) {
    const store = useServicesStore()
    if (store.init) return

    await store.setCollections()
    await store.setProducts()
    await store.setSubscriptions()
    await store.setInvoices()

    store.set("init", true)

    // console.log("[Middleware] ::: Set All Data!")
  }
})
