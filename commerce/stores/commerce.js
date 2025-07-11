// import moment from "moment"
import { defineStore } from "pinia"

export const useCommerceStore = defineStore("commerce", {
  id: "commerce-store",

  state: () => ({
    serverInit: false,
    clientInit: false,

    // User
    shopifyUser: null,

    // Cart
    initCart: null,
    cart: null,
    cartBadge: "0",

    // Saved Items
    savedItems: [],

    // Products
    productsCount: 0,

    // Collections
    collections: null,
    collectionsCount: 0,
    advancedCollections: false,

    allowTax:
      theme().type === "commerce"
        ? useAppConfig().theme.commerce.allowTax
        : null,

    // Location
    locations: null,
    selectedLocation:
      theme().type === "commerce"
        ? useAppConfig().theme.commerce.location
        : null,

    // Shipping
    shippingLines:
      theme().type === "commerce"
        ? useAppConfig().theme.commerce.shippingLines
        : null,
  }),

  actions: {
    set(key, data) {
      this[key] = data
    },

    // User
    async setUser(user) {
      if (user && user.connect && user.connect.shopify) {
        const accessToken = user.connect.shopify.accessToken
        const shopifyUser = await useNuxtApp().$shopify.customer({
          access_token: accessToken,
        })
        if (shopifyUser && !shopifyUser.error) {
          this.shopifyUser = shopifyUser

          console.log(
            "[Store] ::: [Commerce] ::: Shopify User Set!",
            shopifyUser
          )
        }
        return
      }

      const userData = useAuthStore().user

      console.log("[Store] ::: [Commerce] ::: Fire User ::", userData, user)

      if (userData && userData.connect && userData.connect.shopify) {
        const accessToken = userData.connect.shopify.accessToken
        const shopifyUser = await useNuxtApp().$shopify.customer({
          access_token: accessToken,
        })

        console.log("[Store] ::: [Commerce] ::: Shopify User ::", shopifyUser)

        if (shopifyUser && !shopifyUser.error) {
          this.shopifyUser = shopifyUser

          console.log(
            "[Store] ::: [Commerce] ::: Shopify User Set!",
            shopifyUser
          )
        }
      }
    },
    async getUserByEmail(email) {
      const user = await useNuxtApp().$shopify.customerByEmail({
        email: email,
      })
      if (user) {
        if (user.length > 0) {
          return user[0]
        }
      }
      return user
    },
    async getUserByToken(id) {
      return new Promise(async (resolve) => {
        const tokenData = await $fetch(`/api/firebase-token`, {
          method: "POST",
          body: { uid: id },
        })
        if (tokenData) {
          resolve(tokenData)
        } else {
          resolve(null)
        }
      })
    },

    // Location
    async setLocations() {
      const appConfig = useRuntimeConfig()

      if (!appConfig.public.integrations.shopify) {
        return
      }

      const nuxtApp = useNuxtApp()
      const allLocationsData = await nuxtApp.$shopify.locations()

      if (allLocationsData) {
        this.locations = allLocationsData.locations
      } else {
        console.log("[Store] ::: Locations :: Error getting locations!")
      }
    },
    async setLocation(location) {
      this.selectedLocation = location
      await this.setLocations()
    },

    // Collections
    async setCollections() {
      const appConfig = useRuntimeConfig()

      if (!appConfig.public.integrations.shopify) {
        return
      }

      const nuxtApp = useNuxtApp()

      const allCollections = await nuxtApp.$shopify.collections({
        limit: 150,
      })

      // Collections Count
      const collectionsCount = await nuxtApp.$shopify.collectionsCount()
      if (collectionsCount) {
        this.collectionsCount = collectionsCount
      }

      // Products Count
      const productsCount = await nuxtApp.$shopify.productsCount()

      if (productsCount) {
        this.productsCount = productsCount
      }

      if (allCollections && allCollections.items) {
        let allStoreCollections = allCollections.items.map((i) => {
          let newCollection = i

          // Advanced Collections
          if (newCollection.title.includes("|")) {
            this.advancedCollections = true
            let titleItems = newCollection.title.split("|")

            newCollection.level = {
              id: titleItems[0].trim().toLowerCase(),
              code: titleItems[1].trim(),
              title: titleItems[2].trim(),
            }
            newCollection.title = titleItems[2].trim()
          }
          return newCollection
        })

        if (this.advancedCollections) {
          // Sort by Code
          allStoreCollections = allStoreCollections.sort((a, b) => {
            return parseInt(a.level.code) - parseInt(b.level.code)
          })

          // Move all other collections to the end
          let allOtherCollections = allStoreCollections.filter((i) => {
            if (parseInt(i.level.code) < 1000) {
              return i
            }
          })
          if (allOtherCollections.length > 0) {
            let mainCollections = allStoreCollections.filter((i) => {
              if (parseInt(i.level.code) > 999) {
                return i
              }
            })
            allStoreCollections = [...mainCollections, ...allOtherCollections]
          }
        }

        this.collections = allStoreCollections
      } else {
        console.log("[Store] ::: Locations :: Error getting collections!")
      }
    },

    // Saved Items
    setSavedItems(savedItems) {
      if (savedItems) {
        this.savedItems = savedItems
        localStorage.setItem("savedItems", JSON.stringify(savedItems))
        return
      }

      let allSavedItems = localStorage.getItem("savedItems")
      if (allSavedItems) {
        this.savedItems = JSON.parse(allSavedItems)
      } else {
        this.savedItems = []
      }

      // console.log("[Store] ::: Saved Items :: ", this.savedItems)
    },
  },
})
