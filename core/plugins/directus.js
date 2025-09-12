export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) {
    if (!useRuntimeConfig().public.integrations.directus) {
      return
    }
    if (useRuntimeConfig().public.features.log) {
      console.log("[Plugins] ::: [Directus] ::: Initialized!")
    }
  }

  /**
   * Utils
   */

  const fetchData = async (data) => {
    return new Promise(async (resolve, reject) => {
      await $fetch("/api/core/cms", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      })
        .then((resData) => {
          resolve(resData)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
  const getFields = (id, params) => {
    let options = {
      ...params,
    }

    /**
     * Query
     */

    // Tenants
    if (id === "tenants") {
      options.fields = `
        *,
        store_sales_channels.sales_channels_id.*,
        tax_rates.tax_rates_id.*,
        locations.locations_id.*
      `
    }
    // Products
    else if (id === "products") {
      options.fields = `
        *,
        sales_channels.sales_channels_id.*,
        collections.collections_id.*,
        collections.collections_id.image.*,
        featured_image.*,
        images.files_id.*,
        variants.*,
        variants.image.*
      `
    }
    // Collections
    else if (id === "collections") {
      options.fields = `
        *,
        image.*
      `
    }
    // Orders
    else if (id === "orders") {
      options.fields = `
        *,
        customer.*,
        shipping_address.*,
        payment.*,
        line_items.line_items_id.*,
        line_items.line_items_id.product.*,
        line_items.line_items_id.product.featured_image.*,
        line_items.line_items_id.product_variant.*
      `
    }
    // Payments
    else if (id === "payments") {
      options.fields = `
        *,
        payment.*
      `
    }
    // Customers
    else if (id === "customers") {
      options.fields = `
        *,
        addresses.*,
        addresses.shipping_address.*,
        orders.*,
        orders.line_items.line_items_id.*,
        orders.line_items.line_items_id.payment.*
      `
    }
    // Files
    else if (id === "files") {
      options.fields = `
        *
      `
    }
    // Locations
    else if (id === "locations") {
      options.fields = `
        *,
        address.*
      `
    }
    // Tax Rates
    else if (id === "tax_rates") {
      options.fields = `
        *
      `
    }
    // Sales Channels
    else if (id === "sales_channels") {
      options.fields = `
        *
      `
    }

    /**
     * Override
     */

    if (params.fields) {
      options.fields = params.fields.replace(/[\s\b]/g, "")
    } else if (options.fields) {
      options.fields = options.fields.replace(/[\s\b]/g, "")
    }

    return options
  }

  /**
   * Tenants
   */

  const tenant = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/tenants`,
      params: getFields("tenants", params),
    })

    return res
  }
  const tenantCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/tenants",
      params: getFields("tenants", params),
    })

    return res
  }
  const tenantUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/tenants/${params.tenant_id}`,
      params: getFields("tenants", params),
    })

    return res
  }
  const tenantDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: `items/tenants/${params.tenant_id}`,
    })

    return res
  }

  /**
   * Products
   */

  const productItem = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/products`,
      params: getFields("products", params),
    })

    return res
  }
  const productList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/products`,
      params: getFields("products", params),
    })

    return res
  }
  const productCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/products",
      params: getFields("products", params),
    })

    return res
  }
  const productUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/products/${params.id}`,
      params: getFields("products", params),
    })

    return res
  }
  const productDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: `items/products/${params.id}`,
    })

    return res
  }

  /**
   * Collections
   */

  const collectionList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/collections`,
      params: getFields("collections", params),
    })

    return res
  }
  const collectionCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/collections",
      params: getFields("collections", params),
    })

    return res
  }
  const collectionUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/collections/${params.id}`,
      params: getFields("collections", params),
    })

    return res
  }
  const collectionDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: `items/collections/${params.id}`,
    })

    return res
  }

  /**
   * Orders
   */

  const orderItem = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/orders/${params.id}`,
      params: getFields("orders", params),
    })

    return res
  }
  const orderList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/orders`,
      params: getFields("orders", params),
    })

    return res
  }
  const orderCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/orders",
      params: getFields("orders", params),
    })

    return res
  }
  const orderUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/orders/${params.id}`,
      params: getFields("orders", params),
    })

    return res
  }
  const orderDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: `items/orders/${params.id}`,
    })

    return res
  }

  /**
   * Payments
   */

  const paymentItem = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/payments/${params.id}`,
      params: getFields("payments", params),
    })

    return res
  }
  const paymentList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/payments`,
      params: getFields("payments", params),
    })

    return res
  }
  const paymentCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/payments",
      params: getFields("payments", params),
    })

    return res
  }

  /**
   * Customers
   */

  const customerItem = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/customers`,
      params: getFields("customers", params),
    })

    return res
  }
  const customerList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/customers`,
      params: getFields("customers", params),
    })

    return res
  }
  const customerCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/customers",
      params: getFields("customers", params),
    })

    return res
  }
  const customerUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/customers/${params.id}`,
      params: getFields("customers", params),
    })

    return res
  }
  const customerDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: `items/customers/${params.id}`,
    })

    return res
  }
  const customerAddressDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: `items/addresses/${params.id}`,
    })
    if (params.cid) {
      await fetchData({
        method: "DELETE",
        path: `items/customer_addresses/${params.cid}`,
      })
    }

    return res
  }

  /**
   * Files
   */

  const fileItem = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/files`,
      params: getFields("files", params),
    })

    return res
  }
  const fileList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/files`,
      params: getFields("files", params),
    })

    return res
  }
  const fileCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/files",
      params: getFields("files", params),
    })

    return res
  }
  const fileUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/files/${params.id}`,
      params: getFields("files", params),
    })

    return res
  }
  const fileDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: `items/files/${params.id}`,
    })

    return res
  }

  /**
   * Locations
   */

  const locationList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/locations`,
      params: getFields("locations", params),
    })

    return res
  }
  const locationCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/locations",
      params: getFields("locations", params),
    })

    return res
  }
  const locationUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/locations/${params.id}`,
      params: getFields("locations", params),
    })

    return res
  }
  const locationDelete = async (params) => {
    let result = {}

    if (params.addressId) {
      result.address = await fetchData({
        method: "DELETE",
        path: `items/addresses/${params.addressId}`,
      })
    }

    result.location = await fetchData({
      method: "DELETE",
      path: `items/locations/${params.id}`,
    })

    return result
  }

  /**
   * Tax Rates
   */

  const taxRateList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/tax_rates`,
      params: getFields("tax_rates", params),
    })

    return res
  }
  const taxRateCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/tax_rates",
      params: getFields("tax_rates", params),
    })

    return res
  }
  const taxRateUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/tax_rates/${params.id}`,
      params: getFields("tax_rates", params),
    })

    return res
  }
  const taxRateDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: `items/tax_rates/${params.id}`,
    })

    return res
  }

  /**
   * Channels
   */

  const salesChannelList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/sales_channels`,
      params: getFields("sales_channels", params),
    })

    return res
  }

  /**
   * Shipping
   */

  const shippingList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/shipping`,
      params: {
        ...params,
        fields: `
          *
        `,
      },
    })

    return res
  }
  const shippingCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/shipping",
      params: params,
    })

    return res
  }
  const shippingUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/shipping/${params.id}`,
      params: params,
    })

    return res
  }
  const shippingDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: `items/shipping/${params.id}`,
    })

    return res
  }

  return {
    provide: {
      directus: {
        tenant: {
          item: tenant,
          create: tenantCreate,
          update: tenantUpdate,
          delete: tenantDelete,
        },
        channel: {
          list: salesChannelList,
        },
        product: {
          item: productItem,
          list: productList,
          create: productCreate,
          update: productUpdate,
          delete: productDelete,
        },
        collection: {
          list: collectionList,
          create: collectionCreate,
          update: collectionUpdate,
          delete: collectionDelete,
        },
        file: {
          item: fileItem,
          list: fileList,
          create: fileCreate,
          update: fileUpdate,
          delete: fileDelete,
        },
        order: {
          item: orderItem,
          list: orderList,
          create: orderCreate,
          update: orderUpdate,
          delete: orderDelete,
        },
        payment: {
          item: paymentItem,
          list: paymentList,
          create: paymentCreate,
        },
        customer: {
          item: customerItem,
          list: customerList,
          create: customerCreate,
          update: customerUpdate,
          delete: customerDelete,
          address: {
            delete: customerAddressDelete,
          },
        },
        location: {
          list: locationList,
          create: locationCreate,
          update: locationUpdate,
          delete: locationDelete,
        },
        shipping: {
          list: shippingList,
          create: shippingCreate,
          update: shippingUpdate,
          delete: shippingDelete,
        },
        taxRate: {
          list: taxRateList,
          create: taxRateCreate,
          update: taxRateUpdate,
          delete: taxRateDelete,
        },
      },
    },
  }
})
