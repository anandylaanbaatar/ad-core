import { defineEventHandler, readBody } from "h3"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig(event)
  const URL =
    config.public.features.directus?.apiUrl || "https://api.adcommerce.mn"
  const TOKEN = process.env.NUXT_DIRECTUS_ADMIN_TOKEN

  if (!TOKEN) {
    return {
      success: false,
      error: "No Auth Token Found!",
    }
  }

  try {
    let options = {
      method: body.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
    }
    let path = body.path
    let filters = ``

    const getQueryKey = () => {
      if (filters.length === 0) {
        return "?"
      } else {
        return "&"
      }
    }

    // Set Method
    if (body.method !== "GET" && body.method !== "DELETE") {
      options.body = JSON.stringify(body.params)
    } else {
      // Filters
      if (body.params) {
        // Tenant Id
        if (body.params.tenantId) {
          filters += `${getQueryKey()}filter[tenant_id][_eq]=${body.params.tenantId}`
        }

        // Pagination
        if (body.params.page) {
          filters += `${getQueryKey()}page=${body.params.page}`
        }
        if (body.params.limit) {
          filters += `${getQueryKey()}limit=${body.params.limit}`
        }
        if (body.params.counts) {
          filters += `${getQueryKey()}meta=total_count,filter_count`
        }

        // Fields
        if (body.params.fields) {
          filters += `${getQueryKey()}fields=${body.params.fields}`
        }

        // Sort
        if (body.params.sort) {
          filters += `${getQueryKey()}sort=${body.params.sort}`
        }
      }
    }

    const res = await fetch(`${URL}/${path}${filters}`, options)

    // Delete Response
    if (body.method === "DELETE") {
      console.log("Delete ::: ", res)

      if (res.status === 204) {
        return { success: true }
      } else if (res.status === 404) {
        return { success: false, error: "Not Found" }
      } else {
        const errorData = await res.json().catch(() => ({}))
        return { success: false, error: errorData }
      }
    } else {
      const data = await res.json()

      let result = {
        success: true,
        ...data,
      }
      return result
    }
  } catch (err) {
    return {
      success: false,
      error: err.message,
    }
  }
})
