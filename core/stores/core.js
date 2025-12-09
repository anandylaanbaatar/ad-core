import moment from "moment"
import { defineStore } from "pinia"

export const useCoreStore = defineStore("core", {
  id: "core-store",

  state: () => ({
    // cors: "https://cors.adcreative.studio",
    cors: "https://cors.melodu.com",
    globalItemsInit: false,
    appInitialized: false, // Track if app has completed first load

    darkMode: null,
    currency: useAppConfig().theme.currency,
    language: useAppConfig().theme.language,
    timezone: useAppConfig().theme.timezone,

    userLocation: null,
    user: null,
    userNotifications: [],

    // Only show loading if pageTransition is enabled
    loading: useAppConfig().theme?.pageTransition !== false,
    layout: useAppConfig().theme.type,
  }),

  actions: {
    set(key, data) {
      this[key] = data
    },

    // Language
    async setUserLocation() {
      const userLocation = localStorage.getItem("userLocation")
      const expireDays = 7

      const setUserLocationAPI = async () => {
        await $fetch(`https://ipapi.co/json/`, {
          method: "get",
        })
          .then((data) => {
            let newData = data

            newData.timestamp = moment().unix()

            this.userLocation = newData

            localStorage.setItem("userLocation", JSON.stringify(newData))

            console.log(
              "[Store] ::: [Location] :: Setup user location from API! ",
              newData
            )
          })
          .catch((err) => {
            console.log(
              "[Store] ::: [Location] :: Error getting user location: ",
              err.message
            )
          })
      }
      const isExpired = (timestamp) => {
        let currentDate = moment()
        let isExpiredTime = moment.unix(timestamp)

        // console.log(
        //   "[Location] ::: Current Time :: ",
        //   currentDate.format("YYYY-MM-DD HH:mm")
        // )
        // console.log(
        //   "[Location] ::: Timestamp :: ",
        //   isExpiredTime.format("YYYY-MM-DD HH:mm")
        // )

        let isExpiredNow = currentDate.diff(isExpiredTime, "days") >= expireDays

        // console.log("[Location] :: Is Expired :: ", isExpiredNow)

        return isExpiredNow
      }

      if (userLocation) {
        let userLocationData = JSON.parse(userLocation)

        // Timestamp does not exist
        if (!userLocationData.timestamp) {
          console.log(
            "[Store] ::: [Location] :: User location timestamp not setup! "
          )

          await setUserLocationAPI()

          // Data Exists
        } else if (isExpired(userLocationData.timestamp)) {
          console.log("[Store] ::: [Location] :: Setup user location expired! ")

          await setUserLocationAPI()
        } else {
          this.userLocation = userLocationData

          // console.log(
          //   "[Store] ::: [Location] :: Setup user location from Localhost! ",
          //   userLocationData
          // )
        }
      } else {
        await setUserLocationAPI()
      }
    },
    setUserLanguage() {
      const userLang = localStorage.getItem("language")

      if (userLang) {
        this.language = userLang
        localStorage.setItem("language", userLang)
      } else if (this.userLocation) {
        if (this.userLocation.countryCode === "MN") {
          localStorage.setItem("language", "mn")
          this.language = "mn"
        }
      }

      if (this.language === "mn") {
        const nuxtApp = useNuxtApp()
        nuxtApp.$i18n.setLocale("mn")
      }
    },

    // Dark Mode
    setDarkMode(value) {
      const appConfig = useAppConfig()

      if (appConfig.theme.darkLightMode !== null) {
        const mode = appConfig.theme.darkLightMode

        if (mode === "dark") {
          this.darkMode = true
          localStorage.setItem("darkMode", true)
          document.documentElement.classList.add("my-app-dark")
          return
        } else if (mode === "light") {
          this.darkMode = false
          localStorage.setItem("darkMode", false)
          return
        }
      }

      if (value === null) {
        let isDarkMode = localStorage.getItem("darkMode")

        if (isDarkMode === null) {
          if (
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
          ) {
            this.darkMode = true
            localStorage.setItem("darkMode", true)
            document.documentElement.classList.add("my-app-dark")
          } else {
            this.darkMode = false
            localStorage.setItem("darkMode", false)
            document.documentElement.classList.remove("my-app-dark")
          }
        } else {
          this.darkMode = JSON.parse(localStorage.getItem("darkMode"))

          if (this.darkMode) {
            document.documentElement.classList.add("my-app-dark")
          }
        }
      } else {
        this.darkMode = value
        localStorage.setItem("darkMode", value)

        if (value) {
          document.documentElement.classList.add("my-app-dark")
        } else {
          document.documentElement.classList.remove("my-app-dark")
        }
      }
    },
  },
})
