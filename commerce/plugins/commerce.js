export default defineNuxtPlugin(async () => {
  if (import.meta.client) {
    console.log("[Plugins] ::: [Commerce] ::: Initialized!")

    useCommerceStore().loadCartFromStorage()
  }
})
