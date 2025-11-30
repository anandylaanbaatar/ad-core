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

  /**
   * AD - Menus (Navigation menus per tenant)
   */

  const adMenusItem = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/ad_menus/${params.id}`,
      params: params
    })

    return res
  }

  const adMenusList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/ad_menus`,
      params: params
    })

    return res
  }

  const adMenusCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/ad_menus",
      params: params
    })

    return res
  }

  const adMenusUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/ad_menus/${params.id}`,
      params: params
    })

    return res
  }

  const adMenusDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: `items/ad_menus/${params.id}`
    })

    return res
  }

  /**
   * AD - Settings (Extended settings per tenant)
   */

  const adSettingsGet = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/ad_settings`,
      params: {
        ...params,
        fields: `
          *,
          default_meta_image.*,
          page_404_image.*
        `
      }
    })

    return res
  }

  const adSettingsUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/ad_settings/${params.id}`,
      params: params
    })

    return res
  }

  const adSettingsCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/ad_settings",
      params: params
    })

    return res
  }

  /**
   * AD - Slice Templates (Global - for page builder and AI)
   */

  const adSliceTemplatesItem = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/ad_slice_templates/${params.id}`,
      params: {
        ...params,
        fields: `*, thumbnail.*`
      }
    })

    return res
  }

  const adSliceTemplatesList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/ad_slice_templates`,
      params: {
        ...params,
        fields: `*, thumbnail.*`
      }
    })

    return res
  }

  const adSliceTemplatesCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/ad_slice_templates",
      params: params
    })

    return res
  }

  const adSliceTemplatesUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/ad_slice_templates/${params.id}`,
      params: params
    })

    return res
  }

  const adSliceTemplatesDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: `items/ad_slice_templates/${params.id}`
    })

    return res
  }

  /**
   * AD - Wireframes (Global - AI store generation templates)
   */

  const adWireframesItem = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/ad_wireframes/${params.id}`,
      params: {
        ...params,
        fields: `*, preview_image.*`
      }
    })

    return res
  }

  const adWireframesList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/ad_wireframes`,
      params: {
        ...params,
        fields: `*, preview_image.*`
      }
    })

    return res
  }

  const adWireframesCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/ad_wireframes",
      params: params
    })

    return res
  }

  const adWireframesUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/ad_wireframes/${params.id}`,
      params: params
    })

    return res
  }

  const adWireframesDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: `items/ad_wireframes/${params.id}`
    })

    return res
  }

  /**
   * AD - AI Jobs (AI generation job tracking)
   */

  const adAiJobsItem = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/ad_ai_jobs/${params.id}`,
      params: params
    })

    return res
  }

  const adAiJobsList = async (params) => {
    const res = await fetchData({
      method: "GET",
      path: `items/ad_ai_jobs`,
      params: params
    })

    return res
  }

  const adAiJobsCreate = async (params) => {
    const res = await fetchData({
      method: "POST",
      path: "items/ad_ai_jobs",
      params: params
    })

    return res
  }

  const adAiJobsUpdate = async (params) => {
    const res = await fetchData({
      method: "PATCH",
      path: `items/ad_ai_jobs/${params.id}`,
      params: params
    })

    return res
  }

  const adAiJobsDelete = async (params) => {
    const res = await fetchData({
      method: "DELETE",
      path: `items/ad_ai_jobs/${params.id}`
    })

    return res
  }

  return {
    provide: {
      directusStorefront: {
        // Legacy CMS collections (cms_ prefix)
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

        // New AD collections (ad_ prefix)
        ad_menus: {
          item: adMenusItem,
          list: adMenusList,
          create: adMenusCreate,
          update: adMenusUpdate,
          delete: adMenusDelete,
        },
        ad_settings: {
          get: adSettingsGet,
          create: adSettingsCreate,
          update: adSettingsUpdate,
        },
        ad_slice_templates: {
          item: adSliceTemplatesItem,
          list: adSliceTemplatesList,
          create: adSliceTemplatesCreate,
          update: adSliceTemplatesUpdate,
          delete: adSliceTemplatesDelete,
        },
        ad_wireframes: {
          item: adWireframesItem,
          list: adWireframesList,
          create: adWireframesCreate,
          update: adWireframesUpdate,
          delete: adWireframesDelete,
        },
        ad_ai_jobs: {
          item: adAiJobsItem,
          list: adAiJobsList,
          create: adAiJobsCreate,
          update: adAiJobsUpdate,
          delete: adAiJobsDelete,
        },
      },
    },
  }
})
