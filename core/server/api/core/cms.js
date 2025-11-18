import { defineEventHandler, readBody } from "h3"

const getQuery = (params) => {
  let query = ``

  const getQueryKey = () => {
    if (query.length === 0) {
      return "?"
    } else {
      return "&"
    }
  }

  // Filters
  if (params) {
    // Tenant Id
    if (params.tenantId) {
      query += `${getQueryKey()}filter[tenant_id][_eq]=${params.tenantId}`
    }
    // External Id
    if (params.externalId) {
      query += `${getQueryKey()}filter[external_id][_eq]=${params.externalId}`
    }
    // Source Id
    if (params.sourceId) {
      query += `${getQueryKey()}filter[source_id][_contains]=${params.sourceId}`
    }
    // Source Ids
    if (params.sourceIds) {
      query += `${getQueryKey()}filter[source_id][_in]=${params.sourceIds}`
    }
    // User Uid
    if (params.uid) {
      query += `${getQueryKey()}filter[uid][_eq]=${params.uid}`
    }
    // User Tenants
    if (params.tenantIds) {
      query += `${getQueryKey()}filter[tenants][_contains]=${params.tenantIds}`
    }
    // Payment Type
    if (params.paymentType) {
      query += `${getQueryKey()}filter[type][_eq]=${params.paymentType}`
    }

    // Query
    if (params.query) {
      query += `${getQueryKey()}filter[title][_icontains]=${params.query}`
    }
    if (params.customer_query) {
      query += `${getQueryKey()}filter[_or][0][first_name][_icontains]=${params.customer_query}&filter[_or][1][last_name][_icontains]=${params.customer_query}`
    }

    // Pagination
    if (params.page) {
      query += `${getQueryKey()}page=${params.page}`
    }
    if (params.limit) {
      query += `${getQueryKey()}limit=${params.limit}`
    }
    if (params.counts) {
      query += `${getQueryKey()}meta=total_count,filter_count`
    }

    // Fields
    if (params.fields) {
      query += `${getQueryKey()}fields=${params.fields}`
    }

    // Sort
    if (params.sort) {
      query += `${getQueryKey()}sort=${params.sort}`
    }

    // Generic Filters (Directus filter object)
    if (params.filter) {
      const buildFilter = (filterObj, prefix = "filter") => {
        let filterQuery = ""
        for (const key in filterObj) {
          const value = filterObj[key]
          if (typeof value === "object" && !Array.isArray(value)) {
            filterQuery += buildFilter(value, `${prefix}[${key}]`)
          } else {
            filterQuery += `${getQueryKey()}${prefix}[${key}]=${value}`
          }
        }
        return filterQuery
      }
      query += buildFilter(params.filter)
    }
  }

  return query
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig(event)
  const URL =
    config.public.features.directus?.apiUrl || "https://cms.adcommerce.mn"
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
    // Set Body Params
    if (body.method === "POST" || body.method === "PATCH") {
      options.body = JSON.stringify(body.params)
    }

    const queryString = getQuery(body.params)
    const fullUrl = `${URL}/${body.path}${queryString}`

    // Debug log for filters
    if (body.params?.filter) {
      console.log("Filter Query String:", queryString)
      console.log("Full URL:", fullUrl)
    }

    const res = await fetch(fullUrl, options)

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
      // const errors = data.errors || null

      // console.log("Directus ::: ", data)

      // if (errors) {
      //   return {
      //     success: false,
      //     errors: errors,
      //   }
      // }

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
