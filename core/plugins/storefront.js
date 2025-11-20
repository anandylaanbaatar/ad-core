/**
 * Storefront CMS Plugin
 *
 * Separate Directus client for public storefront content (CMS)
 * Uses NUXT_DIRECTUS_STOREFRONT_TOKEN and store.adcommerce.mn endpoint
 *
 * This is different from the main directus.js plugin which handles
 * admin/commerce operations (products, orders, customers, etc.)
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
   * CMS - Website Settings
   */

  const cmsWebsiteSettingsGet = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/cms_website_settings`,
      params: {
        ...params,
        fields: `
          *,
          site_logo.*,
          site_logo_dark.*,
          site_mobile_logo.*,
          site_mobile_logo_dark.*,
          site_splash.*
        `
      }
    })

    return res
  }

  const cmsWebsiteSettingsUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/cms_website_settings/${params.id}`,
      params: params
    })

    return res
  }

  /**
   * CMS - Pages
   */

  const cmsPageItem = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/cms_pages/${params.id}`,
      params: {
        ...params,
        fields: `
          *,
          meta_image.*
        `
      }
    })

    return res
  }

  const cmsPageList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/cms_pages`,
      params: {
        ...params,
        fields: `
          *,
          meta_image.*
        `
      }
    })

    return res
  }

  const cmsPageCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/cms_pages",
      params: params
    })

    return res
  }

  const cmsPageUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/cms_pages/${params.id}`,
      params: params
    })

    return res
  }

  const cmsPageDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: `items/cms_pages/${params.id}`
    })

    return res
  }

  /**
   * CMS - Header
   */

  const cmsHeaderGet = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/cms_header`,
      params: params
    })

    return res
  }

  const cmsHeaderUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/cms_header/${params.id}`,
      params: params
    })

    return res
  }

  /**
   * CMS - Footer
   */

  const cmsFooterGet = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/cms_footer`,
      params: params
    })

    return res
  }

  const cmsFooterUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/cms_footer/${params.id}`,
      params: params
    })

    return res
  }

  /**
   * CMS - Testimonials
   */

  const cmsTestimonialsGet = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/cms_testimonials`,
      params: params
    })

    return res
  }

  const cmsTestimonialsUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/cms_testimonials/${params.id}`,
      params: params
    })

    return res
  }

  /**
   * CMS - Header Banner
   */

  const cmsHeaderBannerGet = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/cms_header_banner`,
      params: params
    })

    return res
  }

  const cmsHeaderBannerUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/cms_header_banner/${params.id}`,
      params: params
    })

    return res
  }

  return {
    provide: {
      directusStorefront: {
        cms_website_settings: {
          get: cmsWebsiteSettingsGet,
          update: cmsWebsiteSettingsUpdate,
        },
        cms_page: {
          item: cmsPageItem,
          list: cmsPageList,
          create: cmsPageCreate,
          update: cmsPageUpdate,
          delete: cmsPageDelete,
        },
        cms_header: {
          get: cmsHeaderGet,
          update: cmsHeaderUpdate,
        },
        cms_footer: {
          get: cmsFooterGet,
          update: cmsFooterUpdate,
        },
        cms_testimonials: {
          get: cmsTestimonialsGet,
          update: cmsTestimonialsUpdate,
        },
        cms_header_banner: {
          get: cmsHeaderBannerGet,
          update: cmsHeaderBannerUpdate,
        },
      },
    },
  }
})
