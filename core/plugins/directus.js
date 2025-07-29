import moment from "moment-timezone"

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
    return new Promise(async (resolve) => {
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

  /**
   * Products
   */

  const productList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/products`,
      params: {
        ...params,
        fields: `
          *,
          collections.id,
          collections.sort,
          collections.collection_id.*,
          featured_image.id,
          featured_image.file_id,
          featured_image.url,
          images.id,
          images.sort,
          images.files_id.id,
          images.files_id.file_id,
          images.files_id.url,
          variants.*
        `,
      },
    })

    return res
  }
  const productCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/products",
      params: params,
    })

    return res
  }
  const productUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/products/${params.id}`,
      params: params,
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
      path: `items/collection`,
      params: {
        ...params,
        fields: `
          *,
          image.*,
          sub_collection.*
        `,
      },
    })

    return res
  }
  const collectionCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/collection",
      params: params,
    })

    return res
  }
  const collectionUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/collection/${params.id}`,
      params: params,
    })

    return res
  }
  const collectionDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: `items/collection/${params.id}`,
    })

    console.log("Delete ::: ", res)

    return res
  }

  /**
   * Orders
   */

  const orderList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/orders`,
      params: {
        ...params,
        fields: `
          *,
          line_items.*
        `,
      },
    })

    return res
  }
  const orderCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/orders",
      params: params,
    })

    return res
  }
  const orderUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/orders/${params.id}`,
      params: params,
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
   * Customers
   */

  const customerList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/customers`,
      params: {
        ...params,
        fields: `
          *
        `,
      },
    })

    return res
  }
  const customerCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/customers",
      params: params,
    })

    return res
  }
  const customerUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/customers/${params.id}`,
      params: params,
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

  /**
   * Files
   */

  const fileList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/files`,
      params: {
        ...params,
        fields: `
          *
        `,
      },
    })

    return res
  }
  const fileCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/files",
      params: params,
    })

    return res
  }
  const fileUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/files/${params.id}`,
      params: params,
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
      params: {
        ...params,
        fields: `
          *
        `,
      },
    })

    return res
  }
  const locationCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/locations",
      params: params,
    })

    return res
  }
  const locationUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/locations/${params.id}`,
      params: params,
    })

    return res
  }
  const locationDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: `items/locations/${params.id}`,
    })

    return res
  }

  /**
   * Tax Rates
   */

  const taxRateList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/tax_rates`,
      params: {
        ...params,
        fields: `
          *
        `,
      },
    })

    return res
  }
  const taxRateCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/tax_rates",
      params: params,
    })

    return res
  }
  const taxRateUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/tax_rates/${params.id}`,
      params: params,
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
   * Tenants
   */

  const tenant = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/global_settings`,
      params: {
        tenantId: params.tenantId,
        fields: `
          *
        `,
      },
    })

    return res
  }
  const tenantCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/global_settings",
      params: params,
    })

    return res
  }
  const tenantUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/global_settings/${params.id}`,
      params: params,
    })

    return res
  }
  const tenantDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: `items/global_settings/${params.id}`,
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
        product: {
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
          list: fileList,
          create: fileCreate,
          update: fileUpdate,
          delete: fileDelete,
        },
        order: {
          list: orderList,
          create: orderCreate,
          update: orderUpdate,
          delete: orderDelete,
        },
        customer: {
          list: customerList,
          create: customerCreate,
          update: customerUpdate,
          delete: customerDelete,
        },
        location: {
          list: locationList,
          create: locationCreate,
          update: locationUpdate,
          delete: locationDelete,
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
