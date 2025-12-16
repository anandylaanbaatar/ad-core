import { GoogleMap, Marker } from "vue3-google-map"

export default defineNuxtPlugin((nuxtApp) => {
  const cors = useCoreStore().cors
  const MAIN_KEY = useState(
    "googleMapKey",
    () => process.env.NUXT_GOOGLE_MAPS_TOKEN
  )

  // Register Scripts
  if (import.meta.server) {
    if (process.env.NUXT_GOOGLE_MAPS_TOKEN) {
      if (useRuntimeConfig().public.features.googleMaps) {
        useHead({
          script: [
            {
              src: `//maps.googleapis.com/maps/api/js?key=${process.env.NUXT_GOOGLE_MAPS_TOKEN}&libraries=places&marker&v=weekly&loading=async`,
              async: true,
              defer: true,
            },
          ],
        })
      }
    }
  }

  if (import.meta.client) {
    const config = useRuntimeConfig()
    const hasGoogleMaps = config.public.features.googleMaps
    const hasLeaflet = config.public.features?.leaflet?.enabled

    // Plugin is needed for both Google Maps and Leaflet
    if (!hasGoogleMaps && !hasLeaflet) {
      console.log("[Plugins] ::: [Address] ::: No map provider enabled!")
      return
    }

    // Google Maps key is only required if Google Maps is enabled
    if (hasGoogleMaps && !MAIN_KEY.value) {
      console.log("[Plugins] ::: [Address] ::: Missing Google Maps key!")
      return
    }

    console.log("[Plugins] ::: [Address] ::: Initialized for:", hasGoogleMaps ? 'Google Maps' : 'Leaflet')
  } else {
    return
  }

  const KEY = MAIN_KEY.value

  /**
   * Main Components
   */

  nuxtApp.vueApp.component("GoogleMap", GoogleMap)
  nuxtApp.vueApp.component("Marker", Marker)

  /**
   * Geo Location
   */

  const geoLocation = async () => {
    return new Promise(async (resolve, reject) => {
      // let url = `https://geo.erxes.io`
      let url = `http://ip-api.com/json/`

      await $fetch(url, {
        method: "get",
      })
        .then((data) => {
          resolve(data)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
  const getBrowserLocation = () => {
    return new Promise((resolve) => {
      if (typeof navigator !== "undefined") {
        if (navigator && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('[Address] Browser location obtained:', position.coords)
              let latLng = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }
              resolve(latLng)
            },
            (error) => {
              console.error('[Address] Geolocation error:', error.message)
              resolve(null)
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          )
        } else {
          console.warn('[Address] Geolocation not supported')
          resolve(null)
        }
      } else {
        console.warn('[Address] Navigator not available')
        resolve(null)
      }
    })
  }

  /**
   * Search Location
   */

  const typeSearch = async (value) => {
    return new Promise(async (resolve, reject) => {
      let url = `https://z4ryw4kny0.execute-api.ap-southeast-1.amazonaws.com/production/searchByAddress?address=`
      let address = encodeURIComponent(value)
      let reqUrl = cors + url + address

      await $fetch(reqUrl, {
        method: "get",
      })
        .then((data) => {
          resolve(data)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  const typeSearchGoogle = async (value) => {
    return new Promise(async (resolve, reject) => {
      let address = encodeURIComponent(value)
      let url = `${cors}/https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${address}&types=geocode&key=${KEY}` // components=country:mn &types=establishment&location=37.76999%2C-122.44696

      await $fetch(url, {
        method: "get",
      })
        .then((data) => {
          resolve(data)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  const addressToLatLng = async (value) => {
    return new Promise(async (resolve, reject) => {
      let address = encodeURIComponent(value)
      let url = `${cors}/https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${KEY}` // &components=country:MN

      await $fetch(url, {
        method: "get",
      })
        .then((data) => {
          resolve(data)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  /**
   * Directions & Calculations
   */

  const getDirections = async (address1, address2) => {
    return new Promise(async (resolve, reject) => {
      let faddress1 = address1.replace(/ /g, "+")
      let faddress2 = address2.replace(/ /g, "+")
      let url = `${cors}/https://maps.googleapis.com/maps/api/directions/json?origin=${faddress1}&destination=${faddress2}&key=${KEY}` // &components=country:MN

      await $fetch(url, {
        method: "get",
      })
        .then((data) => {
          resolve(data)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  /**
   * Format Addresses
   */

  const formatAddress = (address) => {
    if (!address) return

    let formattedAddress = ""

    const addSep = (sep) => {
      if (formattedAddress !== "") {
        let separator = sep || ", "
        formattedAddress += separator
      }
    }

    if (address.address2) {
      addSep()
      formattedAddress += address.address2
    }
    if (address.address1) {
      addSep(" - ")
      formattedAddress += address.address1
    }
    if (address.province) {
      addSep()
      formattedAddress += address.province
    }
    if (address.city) {
      addSep()
      formattedAddress += address.city
    }
    if (address.zip) {
      formattedAddress += " "
      formattedAddress += address.zip
    }
    if (address.country) {
      formattedAddress += ", "
      formattedAddress += address.country
    }

    return formattedAddress
  }

  /**
   * Get active map provider
   * Delegates all methods to the active provider (Google or Leaflet)
   */
  const getProvider = () => {
    return nuxtApp.$mapProvider
  }

  return {
    provide: {
      GoogleMap,
      Marker,
      address: {
        // Geo - delegate to provider
        getBrowserLocation: async () => {
          const provider = getProvider()
          return provider ? await provider.getBrowserLocation() : await getBrowserLocation()
        },
        geoLocation: async () => {
          const provider = getProvider()
          return provider ? await provider.geoLocation() : await geoLocation()
        },

        // Search Location - delegate to provider
        typeSearch,
        typeSearchGoogle: async (value) => {
          const provider = getProvider()
          return provider ? await provider.typeSearchGoogle(value) : await typeSearchGoogle(value)
        },
        addressToLatLng: async (value) => {
          const provider = getProvider()
          return provider ? await provider.addressToLatLng(value) : await addressToLatLng(value)
        },
        latLngToAddress: async (lat, lng) => {
          const provider = getProvider()
          if (provider && provider.latLngToAddress) {
            return provider.latLngToAddress(lat, lng)
          }
          // Fallback: Use addressToLatLng with coordinates string
          return await addressToLatLng(`${lat},${lng}`)
        },

        // Directions & Calculations - delegate to provider
        getDirections: async (address1, address2) => {
          const provider = getProvider()
          return provider ? await provider.getDirections(address1, address2) : await getDirections(address1, address2)
        },

        // Formatting - delegate to provider
        formatAddress: (address) => {
          const provider = getProvider()
          return provider ? provider.formatAddress(address) : formatAddress(address)
        },
      },
    },
  }
})
