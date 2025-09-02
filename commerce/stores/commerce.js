import { defineStore } from "pinia"

export const useCommerceStore = defineStore("commerce", {
  id: "commerce-store",

  state: () => ({
    serverInit: false,
    clientInit: false,

    // User
    customer: null,

    // Cart
    initCart: null,
    cart: [],
    cartItems: [],

    // Orders
    orderNumber: null,

    // Saved Items
    savedItems: [],

    // Collections
    collections: null,
    collectionsCount: 0,
    advancedCollections: false,

    allowTax:
      theme().type === "commerce"
        ? useAppConfig().theme.commerce?.allowTax
        : null,

    // Location
    locations: null,
    selectedLocation: null,

    // Shipping
    shippingLines:
      theme().type === "commerce"
        ? useAppConfig().theme.commerce?.shippingLines
        : null,
    shippingAmount: null,
  }),

  getters: {
    cartTotalItems(state) {
      return state.cart.reduce((sum, item) => sum + item.qty, 0)
    },
    cartTotalPrice(state) {
      return state.cart.reduce((sum, item) => sum + item.price * item.qty, 0)
    },
    cartTotals(state) {
      let totals = {
        itemsTotal: state.cartTotalItems,
        taxAmount: 0,
        discountAmount: 0,
        shippingAmount: this.shippingAmount || 0,
        subtotalAmount: 0,
        totalAmount: 0,
      }

      // Cart Items
      if (state.cartItems.length) {
        for (let i = 0; i < state.cartItems.length; i++) {
          const cartItem = state.cartItems[i]

          // SubTotal
          if (cartItem.variant && cartItem.variant.price) {
            totals.subtotalAmount += cartItem.qty * cartItem.variant.price
          } else if (cartItem.product && cartItem.product.price) {
            totals.subtotalAmount += cartItem.qty * cartItem.product.price
          }
        }
      }
      // Shipping

      totals.totalAmount = totals.subtotalAmount + totals.shippingAmount

      return totals
    },
  },

  actions: {
    set(key, data) {
      this[key] = data
    },

    // Store Expired
    async isStoreExpired() {
      const storeId = theme().storeId
      if (!storeId) return false
      const nuxtApp = useNuxtApp()

      const plan = await nuxtApp.$fire.actions.read(
        `adcommerce/stores/${storeId}/plan`
      )

      // console.log("Check Store Plan ::: ", plan)

      if (plan && plan.endDate) {
        return nuxtApp.$utils.isExpired(plan.endDate)
        // return true
      }

      return false
    },

    // User
    async setUser(user) {
      const userData = useAuthStore().user
      const nuxtApp = useNuxtApp()
      let customer = null

      const isArraysEqual = (a, b) => {
        return a.length === b.length && a.every((val, i) => val === b[i])
      }

      // const tenantId =
      //   useRuntimeConfig().public.features?.multitenancy?.tenantId

      console.log("[Commerce] ::: UserData ::: ", user, userData)

      // 1. Check Customer Exists
      const customerData = await nuxtApp.$directus.customer.item({
        uid: userData.uid,
      })

      console.log("[Commerce] ::: Customer Exists ::: ", customerData)

      // Check Customer
      if (
        customerData.success &&
        customerData.data &&
        customerData.data.length
      ) {
        customer = customerData.data[0]

        // Update and Set
        let updates = {}
        if (customer.first_name !== userData.firstName) {
          updates.first_name = userData.firstName
          customer.first_name = userData.firstName
        }
        if (customer.last_name !== userData.lastName) {
          updates.last_name = userData.lastName
          customer.last_name = userData.lastName
        }
        if (customer.email !== userData.email) {
          updates.email = userData.email
          customer.email = userData.email
        }
        if (customer.phone !== userData.phone) {
          updates.phone = userData.phone
          customer.phone = userData.phone
        }
        if (customer.is_email_subscribed !== userData.acceptsMarketing) {
          customer.is_email_subscribed = userData.acceptsMarketing
          updates.is_email_subscribed = userData.acceptsMarketing
        }
        if (customer.tenants && userData.tenants) {
          if (!isArraysEqual(customer.tenants, userData.tenants)) {
            customer.tenants = userData.tenants
            updates.tenants = userData.tenants
          }
        } else {
          customer.tenants = userData.tenants
          updates.tenants = userData.tenants
        }
        if (Object.keys(updates).length > 0) {
          const customerUpdate = await nuxtApp.$directus.customer.update({
            id: customer.id,
            ...updates,
          })

          console.log("[Commerce] ::: Customer Updated ::: ", customerUpdate)

          if (customerUpdate.success && customerUpdate.data) {
            customer = customerUpdate.data
          }
        }
      } else {
        // Create and Set
        const customerCreate = await nuxtApp.$directus.customer.create({
          uid: userData.uid,
          tenants: userData.tenants,
          first_name: userData.firstName || null,
          last_name: userData.lastName || null,
          email: userData.email || null,
          phone: userData.phone || null,
          is_email_subscribed: userData.acceptsMarketing,
          is_sms_subscribed: userData.phone ? true : false,
        })

        console.log("[Commerce] ::: Customer Created ::: ", customerCreate)

        if (customerCreate.success && customerCreate.data) {
          customer = customerCreate.data
        }
      }

      this.customer = customer
      console.log("[Commerce] ::: Customer Set ::: ", this.customer)
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

      if (!appConfig.public.features.multitenancy.tenantId) {
        return
      }

      const nuxtApp = useNuxtApp()

      const locationsRes = await nuxtApp.$directus.location.list({
        tenantId: appConfig.public.features.multitenancy.tenantId,
      })

      console.log("Locations ::: ", locationsRes)

      if (locationsRes?.success && locationsRes?.data) {
        const allLocations = locationsRes.data

        if (allLocations.length) {
          this.locations = allLocations

          if (!this.selectedLocation) {
            this.selectedLocation = allLocations[0]
          }
        }
      }
    },
    async setLocation(location) {
      this.selectedLocation = location
      await this.setLocations()
    },

    // Collections
    async setCollections() {
      const appConfig = useRuntimeConfig()

      if (!appConfig.public.features.multitenancy.tenantId) {
        return
      }

      const nuxtApp = useNuxtApp()

      const allCollections = await nuxtApp.$directus.collection.list({
        tenantId: appConfig.public.features.multitenancy.tenantId,
      })

      // console.log("Collections ::: ", allCollections)

      if (allCollections?.success && allCollections?.data) {
        const allStoreCollections = allCollections.data

        // .map((i) => {
        //   let newCollection = i
        //   const level = i.sub_collections ? "Level-2" : "Level-1"

        //   newCollection.level = {
        //     id: i.id,
        //     code: level,
        //     title: i.title,
        //   }

        //   return newCollection
        // })

        this.collections = allStoreCollections
      }
    },

    // Cart
    async resetCart() {
      this.shippingAmount = null
      await this.setOrderNumber()
    },
    loadCartFromStorage() {
      if (import.meta.client) {
        const tenantId =
          useRuntimeConfig().public.features.multitenancy.tenantId
        const stored = localStorage.getItem(`${tenantId}_cart`)

        if (stored) {
          this.cart = JSON.parse(stored)
        } else {
          this.saveCartToStorage()
        }
      }
    },
    saveCartToStorage() {
      if (import.meta.client) {
        const tenantId =
          useRuntimeConfig().public.features.multitenancy.tenantId
        localStorage.setItem(`${tenantId}_cart`, JSON.stringify(this.cart))
      }
    },
    async setCartItems() {
      this.loadCartFromStorage()

      const cart = this.cart
      const cartIds = cart.map((i) => i.id)
      const nuxtApp = useNuxtApp()
      let productsRes = null
      let products = []
      let cartItems = []

      if (cartIds.length) {
        productsRes = await nuxtApp.$algolia.getMultiple(cartIds)
      }
      if (productsRes && productsRes.results) {
        for (let i = 0; i < productsRes.results.length; i++) {
          const item = productsRes.results[i]

          if (item) {
            products.push(item)
          }
        }
      }
      if (products.length) {
        for (let i = 0; i < cart.length; i++) {
          const cartItem = cart[i]
          const product = products.find((j) => j.id === cartItem.id)

          let data = {
            ...cartItem,
          }
          if (product) {
            data.product = product

            if (cartItem.variantSku && product.variants) {
              const variant = product.variants.find(
                (j) => j.sku === cartItem.variantSku
              )

              if (variant) {
                data.variant = variant
              }
            }
          }

          cartItems.push(data)
        }
      }
      if (!cartItems.length) {
        this.clearCart()
      }

      this.cartItems = cartItems
    },
    async addToCart(item) {
      const productId = item.id
      const qty = item.qty ?? 1
      const variantSku = item.variantSku ?? null
      const merge = item.merge ?? true
      const key = variantSku ? `${productId}-${variantSku}` : `${productId}`

      const existingIndex = this.cart.findIndex((i) => i.key === key)

      if (existingIndex > -1) {
        if (merge) {
          this.cart[existingIndex].qty += qty
        } else {
          this.cart.push({ id: productId, qty, variantSku, key })
        }
      } else {
        this.cart.push({ id: productId, qty, variantSku, key })
      }

      this.saveCartToStorage()
      await this.setCartItems()

      useNuxtApp().$bus.$emit("toast", {
        severity: "success",
        summary: useNuxtApp().$utils.t("Cart"),
        detail: useNuxtApp().$utils.t("Successfully added item to cart."),
      })
    },
    async removeFromCart(key) {
      this.cart = this.cart.filter((i) => i.key !== key)

      this.saveCartToStorage()
      await this.setCartItems()

      useNuxtApp().$bus.$emit("toast", {
        severity: "success",
        summary: useNuxtApp().$utils.t("Cart"),
        detail: useNuxtApp().$utils.t("Successfully removed item from cart."),
      })
    },
    async updateQuantity(key, qty) {
      const index = this.cart.findIndex((i) => i.key === key)

      if (index > -1) {
        if (qty <= 0) {
          this.removeFromCart(key)
        } else {
          this.cart[index].qty = qty
        }
      }

      this.saveCartToStorage()
      await this.setCartItems()
    },
    async clearCart() {
      this.cart = []
      this.resetCart()
      this.saveCartToStorage()
      await this.setCartItems()
    },

    // Orders
    async setOrderNumber() {
      const storeId = theme().storeId
      if (!storeId) return

      const orderNumber = await useNuxtApp().$fire.actions.read(
        `adcommerce/stores/${storeId}/orderNumber`
      )

      this.orderNumber = orderNumber
    },

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
    },
  },
})
