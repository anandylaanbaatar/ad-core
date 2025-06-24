export default defineNuxtPlugin(async () => {
  if (import.meta.client) {
    const store = usePaymentStore()

    store.setPaymentOptions()

    if (useRuntimeConfig().public.features.log) {
      console.log("[Plugins] ::: [Payment] ::: Initialized!")
    }
  }
})
