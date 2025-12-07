/**
 * Storefront CMS Plugin
 *
 * Separate Directus client for storefront.adcommerce.mn
 * Uses NUXT_STOREFRONT_TOKEN for authentication
 *
 * Collections:
 * - store_settings (with design_tokens)
 * - headers
 * - footers
 * - menus (with menu_items)
 * - pages (with sections)
 * - themes
 * - wireframes
 */

export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) {
    if (!useRuntimeConfig().public.integrations.directus) {
      return
    }
    if (useRuntimeConfig().public.features.log) {
      console.log("[Plugins] ::: [Directus Storefront] ::: Initialized!")
    }
  }

  /**
   * Utils
   */

  const fetchData = async (data) => {
    return new Promise(async (resolve, reject) => {
      await $fetch("/api/core/cms-storefront", {
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
   * Store Settings
   */

  const storeSettingsGet = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: "items/store_settings",
      params: {
        ...params,
        fields: params?.fields || "*",
      },
    })
    return res
  }

  const storeSettingsItem = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: "items/store_settings/" + params.id,
      params: {
        ...params,
        fields: params?.fields || "*",
      },
    })
    return res
  }

  const storeSettingsUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: "items/store_settings/" + params.id,
      params: params,
    })
    return res
  }

  const storeSettingsCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/store_settings",
      params: params,
    })
    return res
  }

  /**
   * Design Tokens (child of store_settings)
   */

  const designTokensList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: "items/design_tokens",
      params: {
        ...params,
        fields: params?.fields || "*",
      },
    })
    return res
  }

  const designTokensItem = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: "items/design_tokens/" + params.id,
      params: params,
    })
    return res
  }

  const designTokensCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/design_tokens",
      params: params,
    })
    return res
  }

  const designTokensUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: "items/design_tokens/" + params.id,
      params: params,
    })
    return res
  }

  const designTokensDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: "items/design_tokens/" + params.id,
    })
    return res
  }

  /**
   * Headers
   */

  const headersList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: "items/headers",
      params: {
        ...params,
        fields: params?.fields || "*",
      },
    })
    return res
  }

  const headersItem = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: "items/headers/" + params.id,
      params: params,
    })
    return res
  }

  const headersCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/headers",
      params: params,
    })
    return res
  }

  const headersUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: "items/headers/" + params.id,
      params: params,
    })
    return res
  }

  const headersDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: "items/headers/" + params.id,
    })
    return res
  }

  /**
   * Footers
   */

  const footersList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: "items/footers",
      params: {
        ...params,
        fields: params?.fields || "*",
      },
    })
    return res
  }

  const footersItem = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: "items/footers/" + params.id,
      params: params,
    })
    return res
  }

  const footersCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/footers",
      params: params,
    })
    return res
  }

  const footersUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: "items/footers/" + params.id,
      params: params,
    })
    return res
  }

  const footersDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: "items/footers/" + params.id,
    })
    return res
  }

  /**
   * Menus
   */

  const menusList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: "items/menus",
      params: {
        ...params,
        fields: params?.fields || "*",
      },
    })
    return res
  }

  const menusItem = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: "items/menus/" + params.id,
      params: {
        ...params,
        fields: params?.fields || "*, menu_items.*",
      },
    })
    return res
  }

  const menusCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/menus",
      params: params,
    })
    return res
  }

  const menusUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: "items/menus/" + params.id,
      params: params,
    })
    return res
  }

  const menusDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: "items/menus/" + params.id,
    })
    return res
  }

  /**
   * Menu Items (child of menus)
   */

  const menuItemsList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: "items/menu_items",
      params: {
        ...params,
        fields: params?.fields || "*",
      },
    })
    return res
  }

  const menuItemsItem = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: "items/menu_items/" + params.id,
      params: params,
    })
    return res
  }

  const menuItemsCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/menu_items",
      params: params,
    })
    return res
  }

  const menuItemsUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: "items/menu_items/" + params.id,
      params: params,
    })
    return res
  }

  const menuItemsDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: "items/menu_items/" + params.id,
    })
    return res
  }

  /**
   * Pages
   */

  const pagesList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: "items/pages",
      params: {
        ...params,
        fields: params?.fields || "*",
      },
    })
    return res
  }

  const pagesItem = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: "items/pages/" + params.id,
      params: {
        ...params,
        fields: params?.fields || "*, sections.*",
      },
    })
    return res
  }

  const pagesCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/pages",
      params: params,
    })
    return res
  }

  const pagesUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: "items/pages/" + params.id,
      params: params,
    })
    return res
  }

  const pagesDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: "items/pages/" + params.id,
    })
    return res
  }

  /**
   * Sections (child of pages)
   */

  const sectionsList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: "items/sections",
      params: {
        ...params,
        fields: params?.fields || "*",
      },
    })
    return res
  }

  const sectionsItem = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: "items/sections/" + params.id,
      params: params,
    })
    return res
  }

  const sectionsCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/sections",
      params: params,
    })
    return res
  }

  const sectionsUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: "items/sections/" + params.id,
      params: params,
    })
    return res
  }

  const sectionsDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: "items/sections/" + params.id,
    })
    return res
  }

  /**
   * Themes
   */

  const themesList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: "items/themes",
      params: {
        ...params,
        fields: params?.fields || "*",
      },
    })
    return res
  }

  const themesItem = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: "items/themes/" + params.id,
      params: params,
    })
    return res
  }

  const themesCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/themes",
      params: params,
    })
    return res
  }

  const themesUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: "items/themes/" + params.id,
      params: params,
    })
    return res
  }

  const themesDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: "items/themes/" + params.id,
    })
    return res
  }

  /**
   * Wireframes
   */

  const wireframesList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: "items/wireframes",
      params: {
        ...params,
        fields: params?.fields || "*",
      },
    })
    return res
  }

  const wireframesItem = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: "items/wireframes/" + params.id,
      params: params,
    })
    return res
  }

  const wireframesCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/wireframes",
      params: params,
    })
    return res
  }

  const wireframesUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: "items/wireframes/" + params.id,
      params: params,
    })
    return res
  }

  const wireframesDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: "items/wireframes/" + params.id,
    })
    return res
  }

  return {
    provide: {
      directusStorefront: {
        // Store Settings
        store_settings: {
          get: storeSettingsGet,
          item: storeSettingsItem,
          create: storeSettingsCreate,
          update: storeSettingsUpdate,
        },

        // Design Tokens (child of store_settings)
        design_tokens: {
          list: designTokensList,
          item: designTokensItem,
          create: designTokensCreate,
          update: designTokensUpdate,
          delete: designTokensDelete,
        },

        // Headers
        headers: {
          list: headersList,
          item: headersItem,
          create: headersCreate,
          update: headersUpdate,
          delete: headersDelete,
        },

        // Footers
        footers: {
          list: footersList,
          item: footersItem,
          create: footersCreate,
          update: footersUpdate,
          delete: footersDelete,
        },

        // Menus
        menus: {
          list: menusList,
          item: menusItem,
          create: menusCreate,
          update: menusUpdate,
          delete: menusDelete,
        },

        // Menu Items (child of menus)
        menu_items: {
          list: menuItemsList,
          item: menuItemsItem,
          create: menuItemsCreate,
          update: menuItemsUpdate,
          delete: menuItemsDelete,
        },

        // Pages
        pages: {
          list: pagesList,
          item: pagesItem,
          create: pagesCreate,
          update: pagesUpdate,
          delete: pagesDelete,
        },

        // Sections (child of pages)
        sections: {
          list: sectionsList,
          item: sectionsItem,
          create: sectionsCreate,
          update: sectionsUpdate,
          delete: sectionsDelete,
        },

        // Themes
        themes: {
          list: themesList,
          item: themesItem,
          create: themesCreate,
          update: themesUpdate,
          delete: themesDelete,
        },

        // Wireframes
        wireframes: {
          list: wireframesList,
          item: wireframesItem,
          create: wireframesCreate,
          update: wireframesUpdate,
          delete: wireframesDelete,
        },
      },
    },
  }
})
