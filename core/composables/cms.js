/**
 * CMS Abstraction Layer
 *
 * Provides a unified interface for fetching content from either Prismic or Directus
 * based on the configured CMS provider in site.config.json
 *
 * Usage:
 *   const cms = useCMS()
 *   const page = await cms.getPage('about')
 *   const settings = await cms.getSettings()
 */

export const useCMS = () => {
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig()

  // Determine which CMS provider to use
  const provider = config.public.features?.cms?.provider || "prismic"

  /**
   * Transform Directus image object to Prismic-compatible format
   */
  const transformImage = (image) => {
    if (!image) return null

    // If already in Prismic format
    if (image.url && image.alt !== undefined) {
      return image
    }

    // Transform Directus file object
    if (image.id) {
      // Use storefront API URL for CMS images
      const baseUrl =
        config.public.features?.directus?.storefront?.apiUrl ||
        "https://store.adcommerce.mn"
      return {
        id: image.id,
        url: `${baseUrl}/assets/${image.id}`,
        alt: image.title || image.filename_download || "",
        width: image.width || null,
        height: image.height || null,
        dimensions: {
          width: image.width || null,
          height: image.height || null,
        },
        filename: image.filename_download || "",
      }
    }

    return image
  }

  /**
   * Transform Directus link object to Prismic-compatible format
   */
  const transformLink = (link) => {
    if (!link) return null

    // If already in Prismic format
    if (link.link_type) {
      return link
    }

    // Transform simple Directus link
    if (typeof link === "string") {
      return {
        link_type: "Web",
        url: link,
        target: "_self",
      }
    }

    // Transform Directus link object
    return {
      link_type: link.type || "Web",
      url: link.url || link.href || "",
      target: link.target || "_self",
      text: link.text || "",
      variant: link.variant || "primary",
    }
  }

  /**
   * Transform rich text from Directus to Prismic format
   */
  const transformRichText = (text) => {
    if (!text) return null

    // If it's already HTML string, return as is
    if (typeof text === "string") {
      return text
    }

    // If it's Prismic StructuredText, use asHTML
    if (Array.isArray(text)) {
      const prismic = require("@prismicio/client")
      return prismic.asHTML(text)
    }

    return text
  }

  /**
   * Transform Directus slice data to Prismic format
   */
  const transformSlice = (slice) => {
    if (!slice) return null

    const transformed = {
      slice_type: slice.type,
      variation: slice.variation || "default",
      primary: {},
      items: [],
    }

    // Transform data.primary fields
    if (slice.data && slice.data.primary) {
      const primary = slice.data.primary

      Object.keys(primary).forEach((key) => {
        const value = primary[key]

        // Transform based on field type
        if (key.includes("image") || key.includes("logo")) {
          transformed.primary[key] = transformImage(value)
        } else if (key.includes("link")) {
          transformed.primary[key] = transformLink(value)
        } else if (key.includes("description") || key.includes("text")) {
          transformed.primary[key] = transformRichText(value)
        } else {
          transformed.primary[key] = value
        }
      })
    }

    // Transform data.items array
    if (slice.data && slice.data.items) {
      transformed.items = slice.data.items.map((item) => {
        const transformedItem = {}

        Object.keys(item).forEach((key) => {
          const value = item[key]

          if (key.includes("image") || key.includes("logo")) {
            transformedItem[key] = transformImage(value)
          } else if (key.includes("link")) {
            transformedItem[key] = transformLink(value)
          } else if (key.includes("description") || key.includes("text")) {
            transformedItem[key] = transformRichText(value)
          } else {
            transformedItem[key] = value
          }
        })

        return transformedItem
      })
    }

    return transformed
  }

  /**
   * Prismic Provider Methods
   */
  const prismicProvider = {
    async getPage(uid) {
      try {
        const page = await nuxtApp.$prismicClient.getByUID("page", uid)
        return {
          uid: page.uid,
          type: page.type,
          data: {
            page_type: page.data.page_type,
            slices: page.data.slices || [],
            meta_title: page.data.meta_title,
            meta_description: page.data.meta_description,
            meta_image: page.data.meta_image,
          },
        }
      } catch (error) {
        console.error("[useCMS] Prismic getPage error:", error)
        return null
      }
    },

    async getSettings() {
      try {
        const settings =
          await nuxtApp.$prismicClient.getSingle("website_settings")
        return settings.data
      } catch (error) {
        console.error("[useCMS] Prismic getSettings error:", error)
        return null
      }
    },

    async getHeader() {
      try {
        const header = await nuxtApp.$prismicClient.getSingle("header")
        return header.data
      } catch (error) {
        console.error("[useCMS] Prismic getHeader error:", error)
        return null
      }
    },

    async getFooter() {
      try {
        const footer = await nuxtApp.$prismicClient.getSingle("footer")
        return footer.data
      } catch (error) {
        console.error("[useCMS] Prismic getFooter error:", error)
        return null
      }
    },

    async getTestimonials() {
      try {
        const testimonials =
          await nuxtApp.$prismicClient.getSingle("testimonials")
        return testimonials.data
      } catch (error) {
        console.error("[useCMS] Prismic getTestimonials error:", error)
        return null
      }
    },
  }

  /**
   * Directus Provider Methods (uses storefront client)
   */
  const directusProvider = {
    async getPage(slug) {
      try {
        const response = await nuxtApp.$directusStorefront.pages.list({
          filter: { slug: { _eq: slug }, status: { _eq: "published" } },
          fields: ["*", "meta_image.*"],
          limit: 1,
        })

        if (!response.data || response.data.length === 0) {
          return null
        }

        const page = response.data[0]

        // Transform slices if they exist
        const slices = page.slices ? page.slices.map(transformSlice) : []

        return {
          uid: page.slug,
          type: "page",
          data: {
            page_type: page.page_type,
            slices: slices,
            meta_title: page.meta_title,
            meta_description: page.meta_description,
            meta_image: transformImage(page.meta_image),
          },
        }
      } catch (error) {
        console.error("[useCMS] Directus getPage error:", error)
        return null
      }
    },

    async getSettings() {
      try {
        const response = await nuxtApp.$directusStorefront.store_settings.get({
          fields: [
            "*",
            "site_logo.*",
            "site_logo_dark.*",
            "site_mobile_logo.*",
            "site_mobile_logo_dark.*",
            "site_splash.*",
          ],
        })

        if (!response.data) {
          return null
        }

        const settings = response.data

        // Transform image fields
        return {
          site_id: settings.site_id,
          site_type: settings.site_type,
          site_name: settings.site_name,
          site_name_short: settings.site_name_short,
          site_slogan: settings.site_slogan,
          site_description: settings.site_description,
          site_url: settings.site_url,
          site_logo: transformImage(settings.site_logo),
          site_logo_dark: transformImage(settings.site_logo_dark),
          site_mobile_logo: transformImage(settings.site_mobile_logo),
          site_mobile_logo_dark: transformImage(settings.site_mobile_logo_dark),
          site_splash: transformImage(settings.site_splash),
          site_language: settings.site_language,
          site_country: settings.site_country,
          site_currency: settings.site_currency,
          site_timezone: settings.site_timezone,
          site_maintenance_mode: settings.site_maintenance_mode,
          site_light_dark_mode: settings.site_light_dark_mode,
          contact_email: settings.contact_email,
          contact_phone: settings.contact_phone,
        }
      } catch (error) {
        console.error("[useCMS] Directus getSettings error:", error)
        return null
      }
    },

    async getHeader() {
      try {
        const response = await nuxtApp.$directusStorefront.headers.list()

        if (!response.data) {
          return null
        }

        const header = response.data

        // Return slices array with single header slice
        return {
          slices: [
            {
              slice_type: "header",
              variation: header.variation || "default",
              primary: header.data || {},
              items: [],
            },
          ],
        }
      } catch (error) {
        console.error("[useCMS] Directus getHeader error:", error)
        return null
      }
    },

    async getFooter() {
      try {
        const response = await nuxtApp.$directusStorefront.footers.list()

        if (!response.data) {
          return null
        }

        const footer = response.data

        // Return slices array with single footer slice
        return {
          slices: [
            {
              slice_type: "footer",
              variation: footer.variation || "default",
              primary: footer.data || {},
              items: [],
            },
          ],
        }
      } catch (error) {
        console.error("[useCMS] Directus getFooter error:", error)
        return null
      }
    },

    async getTestimonials() {
      try {
        const response = null // testimonials collection removed from storefront

        if (!response.data) {
          return null
        }

        const testimonials = response.data

        // Transform items if they exist
        const items = testimonials.items
          ? testimonials.items.map((item) => ({
              ...item,
              image: transformImage(item.image),
            }))
          : []

        return {
          use_rating: testimonials.use_rating,
          data_type: testimonials.data_type,
          static_data: items,
        }
      } catch (error) {
        console.error("[useCMS] Directus getTestimonials error:", error)
        return null
      }
    },

    /**
     * Get navigation menus for a tenant
     * @param {string} tenantId - Tenant identifier
     * @param {string} [location] - Optional location filter (header, footer, mobile, sidebar)
     */
    async getMenus(tenantId, location = null) {
      try {
        const filter = {
          tenant_id: { _eq: tenantId },
          status: { _eq: "published" },
        }
        if (location) {
          filter.location = { _eq: location }
        }

        const response = await nuxtApp.$directusStorefront.ad_menus.list({
          filter,
          sort: ["sort"],
        })

        if (!response.data) {
          return []
        }

        return response.data.map((menu) => ({
          id: menu.id,
          name: menu.name,
          location: menu.location,
          items: menu.items || [],
        }))
      } catch (error) {
        console.error("[useCMS] Directus getMenus error:", error)
        return []
      }
    },

    /**
     * Get extended settings for a tenant
     * @param {string} tenantId - Tenant identifier
     */
    async getExtendedSettings(tenantId) {
      try {
        const response = await nuxtApp.$directusStorefront.ad_settings.get({
          filter: { tenant_id: { _eq: tenantId } },
        })

        if (!response.data || response.data.length === 0) {
          return null
        }

        const settings = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        return {
          google_analytics_id: settings.google_analytics_id,
          google_tag_manager_id: settings.google_tag_manager_id,
          facebook_pixel_id: settings.facebook_pixel_id,
          tiktok_pixel_id: settings.tiktok_pixel_id,
          custom_scripts_head: settings.custom_scripts_head,
          custom_scripts_body: settings.custom_scripts_body,
          custom_css: settings.custom_css,
          default_meta_title: settings.default_meta_title,
          default_meta_description: settings.default_meta_description,
          default_meta_image: transformImage(settings.default_meta_image),
          page_404_title: settings.page_404_title,
          page_404_description: settings.page_404_description,
          page_404_image: transformImage(settings.page_404_image),
        }
      } catch (error) {
        console.error("[useCMS] Directus getExtendedSettings error:", error)
        return null
      }
    },

    /**
     * Get all slice templates (global, not per-tenant)
     * @param {string} [category] - Optional category filter
     */
    async getSliceTemplates(category = null) {
      try {
        const filter = { status: { _eq: "active" } }
        if (category) {
          filter.category = { _eq: category }
        }

        const response =
          await nuxtApp.$directusStorefront.ad_slice_templates.list({
            filter,
            sort: ["sort", "name"],
          })

        if (!response.data) {
          return []
        }

        return response.data.map((template) => ({
          id: template.id,
          name: template.name,
          display_name: template.display_name,
          category: template.category,
          description: template.description,
          thumbnail: transformImage(template.thumbnail),
          schema: template.schema,
          variations: template.variations,
          default_data: template.default_data,
          ai_prompt: template.ai_prompt,
          ai_examples: template.ai_examples,
        }))
      } catch (error) {
        console.error("[useCMS] Directus getSliceTemplates error:", error)
        return []
      }
    },

    /**
     * Get a single slice template by name
     * @param {string} name - Template name/ID
     */
    async getSliceTemplate(name) {
      try {
        const response =
          await nuxtApp.$directusStorefront.ad_slice_templates.list({
            filter: { name: { _eq: name }, status: { _eq: "active" } },
            limit: 1,
          })

        if (!response.data || response.data.length === 0) {
          return null
        }

        const template = response.data[0]
        return {
          id: template.id,
          name: template.name,
          display_name: template.display_name,
          category: template.category,
          description: template.description,
          thumbnail: transformImage(template.thumbnail),
          schema: template.schema,
          variations: template.variations,
          default_data: template.default_data,
          ai_prompt: template.ai_prompt,
          ai_examples: template.ai_examples,
        }
      } catch (error) {
        console.error("[useCMS] Directus getSliceTemplate error:", error)
        return null
      }
    },

    /**
     * Get all wireframe templates (global, not per-tenant)
     * @param {string} [category] - Optional category filter
     */
    async getWireframes(category = null) {
      try {
        const filter = { status: { _eq: "active" } }
        if (category) {
          filter.category = { _eq: category }
        }

        const response = await nuxtApp.$directusStorefront.ad_wireframes.list({
          filter,
          sort: ["sort", "name"],
        })

        if (!response.data) {
          return []
        }

        return response.data.map((wireframe) => ({
          id: wireframe.id,
          name: wireframe.name,
          display_name: wireframe.display_name,
          description: wireframe.description,
          preview_image: transformImage(wireframe.preview_image),
          category: wireframe.category,
          industry_tags: wireframe.industry_tags,
          default_pages: wireframe.default_pages,
          header_template: wireframe.header_template,
          footer_template: wireframe.footer_template,
          menu_template: wireframe.menu_template,
          color_palette: wireframe.color_palette,
          font_pairing: wireframe.font_pairing,
          ai_system_prompt: wireframe.ai_system_prompt,
          generation_rules: wireframe.generation_rules,
        }))
      } catch (error) {
        console.error("[useCMS] Directus getWireframes error:", error)
        return []
      }
    },

    /**
     * Get a single wireframe by name
     * @param {string} name - Wireframe name/ID
     */
    async getWireframe(name) {
      try {
        const response = await nuxtApp.$directusStorefront.ad_wireframes.list({
          filter: { name: { _eq: name }, status: { _eq: "active" } },
          limit: 1,
        })

        if (!response.data || response.data.length === 0) {
          return null
        }

        const wireframe = response.data[0]
        return {
          id: wireframe.id,
          name: wireframe.name,
          display_name: wireframe.display_name,
          description: wireframe.description,
          preview_image: transformImage(wireframe.preview_image),
          category: wireframe.category,
          industry_tags: wireframe.industry_tags,
          default_pages: wireframe.default_pages,
          header_template: wireframe.header_template,
          footer_template: wireframe.footer_template,
          menu_template: wireframe.menu_template,
          color_palette: wireframe.color_palette,
          font_pairing: wireframe.font_pairing,
          ai_system_prompt: wireframe.ai_system_prompt,
          generation_rules: wireframe.generation_rules,
        }
      } catch (error) {
        console.error("[useCMS] Directus getWireframe error:", error)
        return null
      }
    },

    /**
     * Create an AI generation job
     * @param {Object} jobData - Job data
     */
    async createAiJob(jobData) {
      try {
        const response = await nuxtApp.$directusStorefront.ad_ai_jobs.create({
          tenant_id: jobData.tenant_id,
          wireframe_id: jobData.wireframe_id,
          status: "pending",
          input_prompt: jobData.input_prompt,
          input_assets: jobData.input_assets,
        })

        return response.data
      } catch (error) {
        console.error("[useCMS] Directus createAiJob error:", error)
        return null
      }
    },

    /**
     * Get AI job status
     * @param {string} jobId - Job ID
     */
    async getAiJob(jobId) {
      try {
        const response = await nuxtApp.$directusStorefront.ad_ai_jobs.item({
          id: jobId,
        })
        return response.data
      } catch (error) {
        console.error("[useCMS] Directus getAiJob error:", error)
        return null
      }
    },

    /**
     * Update AI job
     * @param {string} jobId - Job ID
     * @param {Object} updateData - Data to update
     */
    async updateAiJob(jobId, updateData) {
      try {
        const response = await nuxtApp.$directusStorefront.ad_ai_jobs.update({
          id: jobId,
          ...updateData,
        })
        return response.data
      } catch (error) {
        console.error("[useCMS] Directus updateAiJob error:", error)
        return null
      }
    },

    /**
     * List AI jobs for a tenant
     * @param {string} tenantId - Tenant identifier
     */
    async listAiJobs(tenantId) {
      try {
        const response = await nuxtApp.$directusStorefront.ad_ai_jobs.list({
          filter: { tenant_id: { _eq: tenantId } },
          sort: ["-date_created"],
        })

        return response.data || []
      } catch (error) {
        console.error("[useCMS] Directus listAiJobs error:", error)
        return []
      }
    },
  }

  /**
   * Hybrid Provider (tries Directus first, falls back to Prismic)
   */
  const hybridProvider = {
    async getPage(uid) {
      const directusPage = await directusProvider.getPage(uid)
      if (directusPage) return directusPage

      console.log("[useCMS] Directus page not found, falling back to Prismic")
      return await prismicProvider.getPage(uid)
    },

    async getSettings() {
      const directusSettings = await directusProvider.getSettings()
      if (directusSettings) return directusSettings

      console.log(
        "[useCMS] Directus settings not found, falling back to Prismic"
      )
      return await prismicProvider.getSettings()
    },

    async getHeader() {
      const directusHeader = await directusProvider.getHeader()
      if (directusHeader) return directusHeader

      console.log("[useCMS] Directus header not found, falling back to Prismic")
      return await prismicProvider.getHeader()
    },

    async getFooter() {
      const directusFooter = await directusProvider.getFooter()
      if (directusFooter) return directusFooter

      console.log("[useCMS] Directus footer not found, falling back to Prismic")
      return await prismicProvider.getFooter()
    },

    async getTestimonials() {
      const directusTestimonials = await directusProvider.getTestimonials()
      if (directusTestimonials) return directusTestimonials

      console.log(
        "[useCMS] Directus testimonials not found, falling back to Prismic"
      )
      return await prismicProvider.getTestimonials()
    },
  }

  // Select provider based on config
  let selectedProvider

  switch (provider) {
    case "directus":
      selectedProvider = directusProvider
      break
    case "hybrid":
      selectedProvider = hybridProvider
      break
    case "prismic":
    default:
      selectedProvider = prismicProvider
      break
  }

  // Return unified CMS interface
  return {
    provider,
    // Core content methods
    getPage: selectedProvider.getPage,
    getSettings: selectedProvider.getSettings,
    getHeader: selectedProvider.getHeader,
    getFooter: selectedProvider.getFooter,
    getTestimonials: selectedProvider.getTestimonials,

    // New storefront CMS methods (Directus only)
    getMenus: directusProvider.getMenus,
    getExtendedSettings: directusProvider.getExtendedSettings,

    // Slice templates (global)
    getSliceTemplates: directusProvider.getSliceTemplates,
    getSliceTemplate: directusProvider.getSliceTemplate,

    // Wireframes (global)
    getWireframes: directusProvider.getWireframes,
    getWireframe: directusProvider.getWireframe,

    // AI job management
    createAiJob: directusProvider.createAiJob,
    getAiJob: directusProvider.getAiJob,
    updateAiJob: directusProvider.updateAiJob,
    listAiJobs: directusProvider.listAiJobs,

    // Transform utilities
    transformImage,
    transformLink,
    transformRichText,
    transformSlice,
  }
}
