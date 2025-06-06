export default defineNuxtPlugin(async () => {
  const store = usePaymentStore()

  if (import.meta.client) {
    console.log("[Plugins] ::: [Payment] ::: Initialized!")
  }
})
