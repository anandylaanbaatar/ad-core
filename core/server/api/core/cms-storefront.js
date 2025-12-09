/**
 * Directus Storefront CMS API Proxy
 *
 * Routes requests to store.adcommerce.mn (storefront CMS)
 * Uses NUXT_DIRECTUS_STOREFRONT_TOKEN for authentication
 *
 * Separate from /api/core/cms which handles admin/commerce operations
 */

import { defineEventHandler, readBody } from "h3"

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody(event)

  // Get storefront API URL and token
  // This API is for storefront.adcommerce.mn Directus instance
  // Uses NUXT_STOREFRONT_TOKEN for ALL operations (read and write)
  const apiUrl =
    config.public.features?.directus?.storefront?.apiUrl ||
    "https://storefront.adcommerce.mn"
  const token = config.storefrontToken || process.env.NUXT_STOREFRONT_TOKEN

  if (!token) {
    console.error("[CMS Storefront API] Missing NUXT_STOREFRONT_TOKEN")
    return {
      error: true,
      message: "Storefront API token not configured",
    }
  }

  // Build query string from params
  // Directus expects nested query params like filter[field][operator]=value
  const buildQueryString = (params) => {
    const parts = []

    const addParam = (key, value, prefix = "") => {
      const fullKey = prefix ? `${prefix}[${key}]` : key

      if (value === null || value === undefined) return

      if (typeof value === "object" && !Array.isArray(value)) {
        // Recursively handle nested objects (for filters)
        Object.keys(value).forEach((nestedKey) => {
          addParam(nestedKey, value[nestedKey], fullKey)
        })
      } else if (Array.isArray(value)) {
        // Handle arrays - for fields, convert to comma-separated
        if (key === "fields") {
          parts.push(`${fullKey}=${encodeURIComponent(value.join(","))}`)
        } else if (key === "sort") {
          parts.push(`${fullKey}=${encodeURIComponent(value.join(","))}`)
        } else {
          value.forEach((item, index) => {
            if (typeof item === "object") {
              Object.keys(item).forEach((itemKey) => {
                addParam(itemKey, item[itemKey], `${fullKey}[${index}]`)
              })
            } else {
              parts.push(`${fullKey}[]=${encodeURIComponent(item)}`)
            }
          })
        }
      } else {
        parts.push(`${fullKey}=${encodeURIComponent(value)}`)
      }
    }

    Object.keys(params).forEach((key) => {
      addParam(key, params[key])
    })

    return parts.join("&")
  }

  let queryString = ""
  if (body.params && body.method === "GET") {
    queryString = buildQueryString(body.params)
  }

  const url = `${apiUrl}/${body.path}${queryString ? `?${queryString}` : ""}`

  // console.log(`[CMS Storefront API] ${body.method} ${url}`)

  try {
    const response = await fetch(url, {
      method: body.method || "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body:
        body.method === "POST" ||
        body.method === "PATCH" ||
        body.method === "PUT"
          ? JSON.stringify(body.params)
          : undefined,
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(
        `[CMS Storefront API] Request failed: ${response.status} ${response.statusText}`,
        errorBody
      )
      return {
        error: true,
        status: response.status,
        message: `${response.statusText}: ${errorBody}`,
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("[CMS Storefront API] Error:", error)
    return {
      error: true,
      message: error.message,
    }
  }
})
