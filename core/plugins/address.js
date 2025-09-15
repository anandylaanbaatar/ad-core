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
    if (!useRuntimeConfig().public.features.googleMaps) {
      // console.log("[Plugins] ::: [Address] ::: Not Initialized!")
      return
    }
    if (!MAIN_KEY.value) {
      console.log("[Plugins] ::: [Address] ::: Missing Integration Key!")
      return
    }

    // console.log("[Plugins] ::: [Address] ::: Initialized!")
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
          navigator.geolocation.getCurrentPosition((position) => {
            let latLng = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
            resolve(latLng)
          })
        }
      }
      resolve(null)
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

  return {
    provide: {
      GoogleMap,
      Marker,
      address: {
        // Geo
        getBrowserLocation,
        geoLocation,

        // Search Location
        typeSearch,
        typeSearchGoogle,
        addressToLatLng,

        // Directions & Calculations
        getDirections,

        // Formatting
        formatAddress,
      },
    },
  }
})
