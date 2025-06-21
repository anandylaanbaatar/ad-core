export default defineNuxtPlugin(async () => {
  if (import.meta.client) {
    const store = usePaymentStore()

    store.setPaymentOptions()

    console.log("[Plugins] ::: [Payment] ::: Initialized!")
  }
})
