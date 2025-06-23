import { defineStore } from "pinia"

export const useServicesStore = defineStore("services", {
  id: "services-store",

  state: () => ({
    // Products & Collections
    products: null,
    collections: null,
    subscriptions: null,
  }),

  actions: {
    set(key, data) {
      this[key] = data
    },

    async setProducts() {
      if (!integrations().firebase) return

      const res = await useNuxtApp().$fire.actions.read(
        `${tenantPath()}/products`
      )

      if (res) {
        let allProducts = []

        for (const [key, value] of Object.entries(res)) {
          let newProduct = value
          newProduct.id = key
          newProduct.results = getClasses(newProduct)
          allProducts.push(newProduct)
        }

        this.products = allProducts
      } else {
        this.products = []
      }
    },
    async setCollections() {
      if (!integrations().firebase) return

      const res = await useNuxtApp().$fire.actions.read(
        `${tenantPath()}/collections`
      )

      if (res) {
        let allCollections = []

        for (const [key, value] of Object.entries(res)) {
          let collectionItem = value
          collectionItem.id = key
          allCollections.push(collectionItem)
        }

        // console.log("Collections ::: ", allCollections)

        this.collections = allCollections
      } else {
        this.collections = []
      }
    },
    async setSubscriptions() {
      if (!integrations().stripe) return
      if (!integrations().firebase) return

      const nuxtApp = useNuxtApp()
      if (!nuxtApp.$stripe) return

      const { data } = await nuxtApp.$stripe.subscription.list({
        limit: 100,
        status: "active",
      })

      // console.log("[Store] ::: Subscriptions :: ", data)

      this.subscriptions = data
    },
    async setInvoices() {
      if (!integrations().stripe) return
      if (!integrations().firebase) return

      const user = useAuthStore().user
      const nuxtApp = useNuxtApp()

      if (!user) return

      const customerId = user.customerId
      const { data } = await nuxtApp.$stripe.invoice.list(customerId)

      console.log("[Store] ::: Invoices :: ", data)

      if (!data) return

      this.invoices = data
    },
  },
})
