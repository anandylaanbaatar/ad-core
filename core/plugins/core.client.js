export default defineNuxtPlugin(async () => {
  const store = useCoreStore()

  // User Location
  await store.setUserLocation()

  // User Language
  await store.setUserLanguage()

  // Dark Mode
  store.setDarkMode(null)

  if (useRuntimeConfig().public.features.log) {
    console.log("[Plugins] ::: [Core] ::: Initialized!")
  }
})
