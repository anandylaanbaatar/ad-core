import moment from "moment-timezone"

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.client) {
    if (!useRuntimeConfig().public.integrations.shopify) {
      // console.log("[Plugins] ::: [Shopify] ::: Not Initialized!")
      return
    }
    if (useRuntimeConfig().public.features.log) {
      console.log("[Plugins] ::: [Shopify] ::: Initialized!")
    }
  }

  /**
   * Utils
   */

  const fetchData = async (data) => {
    return new Promise(async (resolve, reject) => {
      await $fetch("/api/query", {
        method: "post",
        body: data,
      })
        .then((data) => {
          resolve(data)
        })
        .catch((err) => {
          console.log("Error ::: ", err)
          reject(null)
        })
    })
  }
  const getIds = (id) => {
    let ids = id.split("/")
    return {
      uid: id,
      id: ids[ids.length - 1],
    }
  }

  const mapImage = (image) => {
    let item = image
    let itemIds = getIds(item.id)

    item.id = itemIds.id
    item.uid = itemIds.uid

    return item
  }
  const mapCollection = (collection) => {
    let item = collection
    let itemIds = getIds(item.id)

    item.id = itemIds.id
    item.uid = itemIds.uid

    return item
  }
  const mapVariant = (variant) => {
    let item = variant
    let itemIds = getIds(item.id)

    item.id = itemIds.id
    item.uid = itemIds.uid

    // Store Availability
    if (item.storeAvailability) {
      item.storeAvailability = item.storeAvailability.edges.map((i) => {
        let itemStore = i.node
        let itemStoreIds = getIds(itemStore.location.id)

        itemStore.location.id = itemStoreIds.id
        itemStore.location.uid = itemStoreIds.uid

        return itemStore
      })
    }

    return item
  }
  const mapProduct = (product) => {
    let item = product

    // Product Id
    if (item.id) {
      let ids = getIds(item.id)
      item.uid = ids.uid
      item.id = ids.id
    }

    // Collections && Categories
    if (item.collections) {
      item.collections = product.collections.edges.map((i) =>
        mapCollection(i.node)
      )
      item.category = item.collections[0]
    }

    // Images
    if (item.featuredImage && item.featuredImage.url) {
      let featuredImageIds = getIds(item.featuredImage.id)

      item.featuredImage.id = featuredImageIds.id
      item.featuredImage.uid = featuredImageIds.uid

      item.image = item.featuredImage.url
    }
    if (item.images) {
      item.images = product.images.edges.map((i) => mapImage(i.node))
    }

    // Variants
    if (item.variants) {
      item.variants = product.variants.edges.map((i) => mapVariant(i.node))

      // Price
      if (item.variants.length > 0) {
        item.price = item.variants[0].price.amount
        item.currency = item.variants[0].price.currencyCode
      }
    }

    return item
  }
  const mapLocation = (location) => {
    let item = location
    let itemIds = getIds(item.id)

    item.id = itemIds.id
    item.uid = itemIds.uid

    return item
  }
  const mapOrder = (order) => {
    let item = order
    let itemIds = getIds(item.id)

    item.id = itemIds.id
    item.uid = itemIds.uid

    return item
  }

  /**
   * Products
   * https://shopify.dev/docs/api/admin-rest/2024-07/resources/product#get-products?ids=632910392,921728736
   */

  // REST - deprecated
  const products = async (params) => {
    return await fetchData({
      method: "get",
      params: params,
      type: "products",
    })
  }
  const productsV2 = async (params) => {
    const productsData = await fetchData({
      graphql: true,
      params: params,
      type: "products",
    })

    if (productsData) {
      // Return products with collection
      if (productsData.collection) {
        const allProducts = productsData.collection.products
        let allCollectionData = productsData.collection
        delete allCollectionData.products

        return {
          collection: mapCollection(allCollectionData),
          items: allProducts.edges.map((i) => mapProduct(i.node)),
          meta: allProducts.pageInfo,
        }
        // Return all products
      }
      if (productsData.products) {
        return {
          items: productsData.products.edges.map((i) => mapProduct(i.node)),
          meta: productsData.products.pageInfo,
        }
      }
    }

    return productsData
  }
  const product = async (params) => {
    const productData = await fetchData({
      graphql: true,
      params: params,
      type: "product",
    })

    if (productData && productData.product) {
      return mapProduct(productData.product)
    }

    return null
  }
  const productsCount = async (params) => {
    const allProductsCount = await fetchData({
      graphqlAdmin: true,
      params: params,
      type: "productsCount",
    })

    if (allProductsCount) {
      if (
        allProductsCount.productsCount &&
        allProductsCount.productsCount.count
      ) {
        return allProductsCount.productsCount.count
      }
    }

    return null
  }
  const createProduct = async (dataInput) => {
    return await fetchData({
      graphqlAdmin: true,
      type: "createProduct",
      dataInput: dataInput,
    })
  }
  const createProductVariant = async (dataInput) => {
    return await fetchData({
      graphqlAdmin: true,
      type: "createProductVariant",
      dataInput: dataInput,
    })
  }
  const publishProduct = async (dataInput) => {
    return await fetchData({
      graphqlAdmin: true,
      type: "publishProduct",
      dataInput: dataInput,
    })
  }

  /**
   * Collections
   */

  const collections = async (params) => {
    const allCollections = await fetchData({
      graphql: true,
      params: params,
      type: "collections",
    })

    if (allCollections) {
      if (allCollections.collections) {
        return allCollections.collections.edges.map((i) =>
          mapCollection(i.node)
        )
      }
    }

    return null
  }
  const collection = async (params) => {
    const collection = await fetchData({
      graphql: true,
      params: params,
      type: "collection",
    })

    return collection
  }
  const collectionsCount = async (params) => {
    const allCollectionsCount = await fetchData({
      graphqlAdmin: true,
      params: params,
      type: "collectionsCount",
    })

    if (allCollectionsCount) {
      if (
        allCollectionsCount.collectionsCount &&
        allCollectionsCount.collectionsCount.count
      ) {
        return allCollectionsCount.collectionsCount.count
      }
    }

    return null
  }

  /**
   * Customer
   */

  const isTokenExpired = (tokenData) => {
    if (!tokenData) return

    const theme = useAppConfig().theme
    const timezone = theme.timezone
    const dateNow = moment().tz(timezone)
    const dateExpires = moment(tokenData.expiresAt).tz(timezone)
    const diff = dateNow.diff(dateExpires, "minutes")

    if (diff > 0) {
      console.log("[Shopify] ::: Token Expired ::: ", `${diff} minutes passed.`)
      return true
    } else {
      return false
    }
  }
  const getUserToken = () => {
    const user = useAuthStore().user

    if (user) {
      console.log("[Plugins] ::: [Shopify] ::: Get user token :: ", user)
      const tokenData = user.connect.shopify

      // Check if it's expired
      if (isTokenExpired(tokenData)) {
        return null
      } else {
        return tokenData.accessToken
      }
    } else {
      return null
    }
  }
  const login = async (params) => {
    const res = await fetchData({
      graphql: true,
      type: "login",
      params: params,
    })

    if (
      res &&
      res.customerAccessTokenCreate &&
      res.customerAccessTokenCreate.customerAccessToken
    ) {
      return res.customerAccessTokenCreate.customerAccessToken
    } else {
      let errorData = {
        error: [
          {
            field: "system",
            message: nuxtApp.$utils.t("Error occurred"),
          },
        ],
        data: res,
      }

      if (
        res &&
        res.customerAccessTokenCreate &&
        res.customerAccessTokenCreate.customerUserErrors
      ) {
        if (res.customerAccessTokenCreate.customerUserErrors.length > 0) {
          if (
            res.customerAccessTokenCreate.customerUserErrors[0].code ===
            "UNIDENTIFIED_CUSTOMER"
          ) {
            errorData.error = nuxtApp.$utils.t("Email or password is incorrect")
          }
        }
      }

      return errorData
    }
  }
  const resetPassword = async (params) => {
    const res = await fetchData({
      graphql: true,
      type: "resetPassword",
      params: params,
    })

    if (res && res.customerRecover && res.customerRecover.userErrors) {
      if (res.customerRecover.userErrors.length > 0) {
        let errorData = {
          error: res.customerRecover.userErrors,
          data: res,
        }
        return errorData
      }
    }
    if (res.graphQLErrors) {
      if (res.graphQLErrors.length > 0) {
        let errorData = {
          error: [
            {
              field: "system",
              message: res.graphQLErrors[0].message,
            },
          ],
          data: res,
        }
        return errorData
      }
    }

    return res
  }
  const resetPasswordUrl = async (params) => {
    const res = await fetchData({
      graphql: true,
      type: "resetPasswordUrl",
      params: params,
    })

    return res
  }
  const signUp = async (dataInput) => {
    let dataInput2 = dataInput

    const res = await fetchData({
      graphql: true,
      type: "signUp",
      dataInput: dataInput2,
    })

    console.log("Shopify Sign Up ::: ", res)

    if (res && res.graphQLErrors && res.graphQLErrors.length > 0) {
      return res.graphQLErrors[0]
    }
    if (res && res.customerCreate && res.customerCreate.customer) {
      return res.customerCreate.customer
    } else {
      let errorData = {
        error: [
          {
            field: "system",
            message: nuxtApp.$utils.t("Error occurred"),
          },
        ],
        data: res,
      }

      if (res && res.customerCreate && res.customerCreate.customerUserErrors) {
        if (res.customerCreate.customerUserErrors.length > 0) {
          let errors = []

          for (
            let i = 0;
            i < res.customerCreate.customerUserErrors.length;
            i++
          ) {
            let error = res.customerCreate.customerUserErrors[i]

            if (error.message === "Email has already been taken") {
              errors.push({
                field: "email",
                message: nuxtApp.$utils.t("Email has already been taken"),
              })
            } else if (error.message === "Phone has already been taken") {
              errors.push({
                field: "phone",
                message: nuxtApp.$utils.t("Phone has already been taken"),
              })
            }
          }

          errorData.error = errors
        }
      }

      return errorData
    }
  }
  const logout = async () => {
    // localStorage.removeItem("cartId")
    localStorage.removeItem("accessToken")

    const store = useAuthStore()

    store.set("userLoggedIn", false)
    store.set("user", false)
  }

  // Auth State - Check Token Expiry
  const authState = async () => {
    if (import.meta.client) {
      // console.log("[Plugins] ::: [Shopify] ::: Auth State Initialized!")

      const store = useAuthStore()
      const userData = localStorage.getItem("accessToken")

      if (userData) {
        const tokenData = JSON.parse(userData)

        if (isTokenExpired(tokenData)) {
          console.log("[Plugins] ::: [Shopify] ::: Token Expired Logged Out!")
        } else {
          await store.set("userLoggedIn", true)

          if (useRuntimeConfig().public.features.log) {
            console.log("[Plugins] ::: [Shopify] ::: Logged In!")
          }
        }
      } else {
        if (useRuntimeConfig().public.features.log) {
          console.log("[Plugins] ::: [Shopify] ::: Logged Out!")
        }
      }
    }
  }

  const customer = async (params) => {
    const res = await fetchData({
      graphql: true,
      params: params,
      type: "customer",
    })

    if (res && res.customer) {
      return res.customer
    } else {
      let errorData = {
        error: nuxtApp.$utils.t("Error occurred"),
        data: res,
      }
      return errorData
    }
  }
  const customerByEmail = async (params) => {
    return new Promise(async (resolve) => {
      const res = await fetchData({
        graphqlAdmin: true,
        type: "customerByEmail",
        params: params,
      })

      if (res && res.customers) {
        const customers = res.customers.edges.map((i) => i.node)
        if (customers) {
          if (customers.length > 0) {
            resolve(customers[0])
          }
        }
        resolve(null)
      } else {
        resolve(null)
      }
    })
  }
  const updateCustomer = async (params) => {
    const res = await fetchData({
      graphqlAdmin: true,
      type: "updateCustomer",
      params: params,
    })

    if (res && res.customerUpdate && res.customerUpdate.customer) {
      return res.customerUpdate.customer
    } else {
      let errorData = {
        error: nuxtApp.$utils.t("Error occurred"),
        data: res,
      }
      return errorData
    }
  }
  const createCustomerAddress = async (dataInput) => {
    let addressData = {
      address1: dataInput.address1 ? dataInput.address1 : null,
      city: dataInput.city ? dataInput.city : null,
      country: dataInput.country ? dataInput.country : null,
      province: dataInput.province ? dataInput.province : null,
      zip: dataInput.zip ? dataInput.zip : null,
      firstName: dataInput.firstName ? dataInput.firstName : null,
      lastName: dataInput.lastName ? dataInput.lastName : null,
      phone: dataInput.phone ? dataInput.phone : null,
    }
    if (dataInput.address2) {
      if (dataInput.address2 !== "undefined") {
        addressData.address2 = dataInput.address2
      }
    }

    let dataInput2 = {
      customerAccessToken: dataInput.access_token,
      address: addressData,
    }

    return await fetchData({
      graphql: true,
      type: "createCustomerAddress",
      rawInput: dataInput2,
    })
  }
  const updateCustomerAddress = async (dataInput) => {
    let addressData = {
      address1: dataInput.address1 ? dataInput.address1 : null,
      city: dataInput.city ? dataInput.city : null,
      country: dataInput.country ? dataInput.country : null,
      province: dataInput.province ? dataInput.province : null,
      zip: dataInput.zip ? dataInput.zip : null,
      firstName: dataInput.firstName ? dataInput.firstName : null,
      lastName: dataInput.lastName ? dataInput.lastName : null,
      phone: dataInput.phone ? dataInput.phone : null,
    }
    if (dataInput.address2) {
      if (dataInput.address2 !== "undefined") {
        addressData.address2 = dataInput.address2
      }
    }

    let dataInput2 = {
      customerAccessToken: dataInput.access_token,
      id: dataInput.id,
      address: addressData,
    }

    return await fetchData({
      graphql: true,
      type: "updateCustomerAddress",
      rawInput: dataInput2,
    })
  }
  const deleteCustomerAddress = async (params) => {
    return await fetchData({
      graphql: true,
      params: params,
      type: "deleteCustomerAddress",
    })
  }
  const updateCustomerDefaultAddress = async (params) => {
    return await fetchData({
      graphql: true,
      params: params,
      type: "updateCustomerDefaultAddress",
    })
  }
  const updateCustomerSmsConsent = async (params) => {
    return await fetchData({
      graphqlAdmin: true,
      params: params,
      type: "updateCustomerSmsConsent",
    })
  }

  /**
   * Locations
   */

  // REST - deprecated
  const locations = async (params) => {
    return await fetchData({
      method: "get",
      params: params,
      type: "locations",
    })
  }
  const locationsV2 = async (params) => {
    const locationsData = await fetchData({
      graphqlAdmin: true,
      params: params,
      type: "locations",
    })

    if (locationsData) {
      if (locationsData.locations) {
        return locationsData.locations.edges.map((i) => mapLocation(i.node))
      }
    }

    return locationsData
  }
  const location = async (params) => {
    const locationData = await fetchData({
      graphqlAdmin: true,
      params: params,
      type: "location",
    })

    if (locationData && locationData.location) {
      return mapLocation(locationData.location)
    }

    return locationData
  }

  /**
   * Orders
   */

  // REST - deprecated
  const orders = async (params) => {
    return await fetchData({
      method: "get",
      params: params,
      type: "orders",
    })
  }
  const ordersV2 = async (params) => {
    const ordersData = await fetchData({
      graphqlAdmin: true,
      params: params,
      type: "orders",
    })

    if (ordersData) {
      if (ordersData.orders) {
        return {
          items: ordersData.orders.edges.map((i) => mapOrder(i.node)),
          meta: ordersData.orders.pageInfo,
        }
      }
    }

    return ordersData
  }
  const order = async (params) => {
    return await fetchData({
      graphqlAdmin: true,
      params: params,
      type: "order",
    })
  }
  const ordersCount = async (params) => {
    const allOrdersCount = await fetchData({
      graphqlAdmin: true,
      params: params,
      type: "ordersCount",
    })

    if (allOrdersCount) {
      if (allOrdersCount.ordersCount) {
        return allOrdersCount.ordersCount.count
      }
    }

    return
  }
  const createDraftOrder = async (dataInput) => {
    return await fetchData({
      graphqlAdmin: true,
      type: "createDraftOrder",
      dataInput: dataInput,
    })
  }
  const completeDraftOrder = async (params) => {
    return await fetchData({
      graphqlAdmin: true,
      type: "completeDraftOrder",
      params: params,
    })
  }

  /**
   * Cart
   */

  const cartItems = async (params) => {
    const cartItemsData = await fetchData({
      graphql: true,
      params: params,
      type: "cartItems",
    })

    // console.log("Cart Items Data ::: ", cartItemsData)

    if (cartItemsData) {
      let returnData = cartItemsData.cart

      if (returnData && returnData.lines) {
        returnData.items = returnData.lines.edges.map((i) => mapProduct(i.node))
        delete returnData.lines
      }

      return returnData
    }

    return cartItemsData
  }
  const addItem = async (params) => {
    return await fetchData({
      graphql: true,
      params: params,
      type: "addItem",
    })
  }
  const updateItem = async (params) => {
    return await fetchData({
      graphql: true,
      params: params,
      type: "updateItem",
    })
  }
  const removeItem = async (params) => {
    return await fetchData({
      graphql: true,
      params: params,
      type: "removeItem",
    })
  }
  const createCart = async (params) => {
    return await fetchData({
      graphql: true,
      params: params,
      type: "createCart",
    })
  }
  const updateDiscountCodes = async (rawInput) => {
    return await fetchData({
      graphql: true,
      type: "updateDiscountCodes",
      rawInput: rawInput,
    })
  }
  const updateGiftCardCodes = async (rawInput) => {
    return await fetchData({
      graphql: true,
      type: "updateGiftCardCodes",
      rawInput: rawInput,
    })
  }

  authState()

  return {
    provide: {
      shopify: {
        // Products
        products,
        productsV2,
        product,
        createProduct,
        createProductVariant,
        publishProduct,
        productsCount,

        // Orders
        orders,
        ordersV2,
        order,
        ordersCount,
        createDraftOrder,
        completeDraftOrder,

        // Customer
        getUserToken,
        login,
        resetPassword,
        resetPasswordUrl,
        signUp,
        logout,
        customer,
        customerByEmail,
        updateCustomer,
        createCustomerAddress,
        updateCustomerAddress,
        deleteCustomerAddress,
        updateCustomerDefaultAddress,
        updateCustomerSmsConsent,

        // Locations
        locations,
        locationsV2,
        location,

        // Collections
        collections,
        collection,
        collectionsCount,

        // Cart
        cartItems,
        addItem,
        updateItem,
        removeItem,
        createCart,
        updateDiscountCodes,
        updateGiftCardCodes,
      },
    },
  }
})
