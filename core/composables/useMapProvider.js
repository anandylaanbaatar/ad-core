/**
 * useMapProvider Composable
 *
 * Provides access to the active map provider in Vue components.
 */

export const useMapProvider = () => {
  const nuxtApp = useNuxtApp()

  const provider = computed(() => nuxtApp.$mapProvider)
  const providerName = computed(() => nuxtApp.$mapProviderName)
  const providers = computed(() => nuxtApp.$mapProviders)

  const isGoogle = computed(() => providerName.value === 'google')
  const isLeaflet = computed(() => providerName.value === 'leaflet')

  const switchProvider = async (name) => {
    if (nuxtApp.$switchMapProvider) {
      return await nuxtApp.$switchMapProvider(name)
    }
    return false
  }

  return {
    provider,
    providerName,
    providers,
    isGoogle,
    isLeaflet,
    switchProvider
  }
}

export default useMapProvider
