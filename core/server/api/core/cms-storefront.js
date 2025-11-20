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
  const apiUrl = config.public.features?.directus?.storefront?.apiUrl || "https://store.adcommerce.mn"
  const token = config.NUXT_DIRECTUS_STOREFRONT_TOKEN

  if (!token) {
    console.error("[CMS Storefront API] Missing NUXT_DIRECTUS_STOREFRONT_TOKEN")
    return {
      error: true,
      message: "Storefront API token not configured"
    }
  }

  // Build query string from params
  let queryString = ""
  if (body.params) {
    const params = new URLSearchParams()

    Object.keys(body.params).forEach((key) => {
      if (body.params[key] !== undefined && body.params[key] !== null) {
        if (key === "filter" || key === "fields" || key === "sort") {
          // Handle complex query params
          if (typeof body.params[key] === "object") {
            params.append(key, JSON.stringify(body.params[key]))
          } else {
            params.append(key, body.params[key])
          }
        } else {
          params.append(key, body.params[key])
        }
      }
    })

    queryString = params.toString()
  }

  const url = `${apiUrl}/${body.path}${queryString ? `?${queryString}` : ""}`

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
      console.error(
        `[CMS Storefront API] Request failed: ${response.status} ${response.statusText}`
      )
      return {
        error: true,
        status: response.status,
        message: response.statusText,
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
